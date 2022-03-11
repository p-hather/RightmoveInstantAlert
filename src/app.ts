import fs from 'fs'
import { load } from 'js-yaml'
import { searchConfig } from './interfaces/searchConfig';


export class RightmoveInstantAlert {
    configFP: string;
    searchURL: string|null;

    constructor(configFP: string = './config.yaml') {
        this.configFP = configFP;
        this.searchURL = null;
    }

    async getConfig() {
        const file = fs.readFileSync(this.configFP, 'utf8');
        const config = await load(file) as searchConfig;
        console.log(`Config is: \n${config}`);
        return config;
    }

    async buildURL() {
        const config: searchConfig = await this.getConfig();
        const baseURL: string =
            `https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%${config.area.regionCode}&radius=${config.area.radius}&`;
        
        const params: Array<string|undefined> = Object.keys(config.parameters).map(function(param: any) {
            const paramElement = config.parameters[param as keyof typeof config.parameters];
            if (paramElement === null) {
                return
            }
            if (Array.isArray(paramElement)) {
                return `${param}=${paramElement.join('%2C')}`
            }
            return `${param}=${paramElement}`
        });

        const paramsFiltered = params.filter(param => param != null);
        this.searchURL = `${baseURL}${paramsFiltered.join('&')}`;
        console.log(`URL to search is: ${this.searchURL}`);
    }
}

const ria = new RightmoveInstantAlert();
ria.getConfig();
