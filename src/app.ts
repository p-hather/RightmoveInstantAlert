import fs from 'fs'
import { load } from 'js-yaml'
import { searchConfig } from './interfaces/searchConfig';
import axios from 'axios';
import cheerio from 'cheerio';


export class RightmoveInstantAlert {
    configFP: string;

    constructor(configFP: string = './config.yaml') {
        this.configFP = configFP;
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
        return searchURL
    }

    async scrapeRightmove() {
        const searchURL = await this.buildURL();
        const axiosClient = axios.create();
        const site = await axiosClient.get(searchURL);
        const html = site.data;
        const $ = cheerio.load(html);
        var pageProperties = $('div[data-test^="propertyCard-"]').get().map(x => $(x).attr('id')); // exclude property-0
        console.log(pageProperties);
    }
}

const ria = new RightmoveInstantAlert();
ria.scrapeRightmove();
