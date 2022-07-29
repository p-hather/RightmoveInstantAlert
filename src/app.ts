import fs from 'fs'
import { load } from 'js-yaml'
import { searchConfig } from './interfaces/searchConfig';
import axios from 'axios';  // todo use fetch?
import cheerio from 'cheerio';
import 'dotenv/config'
import fetch from "node-fetch";


function sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

export class RightmoveInstantAlert {
    configFP: string;
    searchURL?: string;
    webhookURL?: string;

    constructor(configFP: string = './config.yaml') {
        this.configFP = configFP;
        this.webhookURL = process.env.DISCORD_WEBHOOK;  // todo move load to up here?
    }

    async getConfig() {
        const file = fs.readFileSync(this.configFP, 'utf8');
        const config = await load(file) as searchConfig;
        console.log(`Config is: \n${JSON.stringify(config, null, 4)}`);
        return config;
    }

    async buildURL() {
        const config: searchConfig = await this.getConfig();
        const baseURL: string =
            `https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%${config.area.regionCode}&sortType=6&radius=${config.area.radius}&`;
        
        // Map config object to an array of formatted parameter strings
        const params: Array<string|undefined> = Object.keys(config.parameters).map(function(param: any) {
            const paramElement = config.parameters[param as keyof typeof config.parameters];
            if (paramElement === null) {
                return
            }
            if (Array.isArray(paramElement)) {
                return `${param}=${paramElement.join('%2C')}`  // Join arrays with hex comma
            }
            return `${param}=${paramElement}`
        });

        const paramsFiltered = params.filter(param => param != null);  // Remove null values
        const searchURL = `${baseURL}${paramsFiltered.join('&')}`;
        console.log(`URL to search is: ${searchURL}`);
        return searchURL;
    }

    async getProperties(searchURL: string) {
        const axiosClient = axios.create();
        const site = await axiosClient.get(searchURL);
        const html = site.data;
        const $ = cheerio.load(html);
        var pageProperties: string[] = $('div[data-test^="propertyCard-"]')
                                        .not('div[data-test="propertyCard-0"]')  // exclude featured property (0)
                                        .get()
                                        .map(x => $(x)
                                        .attr('id')!
                                        .match('property-(.*)')![1]);
        return pageProperties;
    }

    async sendMessage(content: string) {
        if (!this.webhookURL) {
            throw new Error('No environment variable with the key DISCORD_WEBHOOK could be found');
        }

        const body = {"content": content};
        let response = await fetch(this.webhookURL, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {"Content-Type": "application/json"},
        });
        if (response.ok) {
            console.log('Discord message sent');
        }
        else {
            console.log('Discord message failed');
            throw new Error(JSON.stringify(response));
        }
    }

    async compileMessage(properties: string[]) {
        for (let property of properties) {
            var propertyLink = `https://www.rightmove.co.uk/properties/${property}`
            await this.sendMessage(`[](${propertyLink})`)
        }
    }

    async runProcess() {
        this.searchURL = await this.buildURL();
        let propertiesA = await this.getProperties(this.searchURL);
        console.log('Beginning search...')
        while(true) {
            await sleep(30000);  // TODO make this configurable
            let propertiesB = await this.getProperties(this.searchURL);
            let newProperties: string[] = propertiesB.filter(x => !propertiesA.includes(x));
            if (newProperties.length > 0) {
                console.log(`${newProperties.length} new properties detected`);
                this.compileMessage(newProperties);
            }
            propertiesA = propertiesB;
        }
    }
}

const ria = new RightmoveInstantAlert();
ria.runProcess();
