export interface searchConfig {
    area: {
        regionCode: string | undefined,
        radius: number | undefined
    },
    parameters: {
        searchType: string | undefined,
        regionCode: string | undefined,
        radius: number | undefined,
        minPrice: number | undefined,
        maxPrice: number | undefined,
        minBedrooms: number | undefined,
        maxBedrooms: number | undefined,
        maxDaysSinceAdded: number | undefined,
        onlyAuction: boolean | undefined,
        includeSSTC: boolean | undefined,
        exclude: Array<string | undefined> | undefined,
        mustHave: Array<string | undefined> | undefined
    }
};
