export interface IItems{
    id: number;
    imageURL: string;
    date: string;
    title: string;
    location: string;
    description: string;
}

export interface IList{
    items?: IItems[];
    powered?: string;
    linkto?: string;
    containerType?: string;
    info?: string;
}

export interface IParams{
    id: string;
}

// launch data structure is below

export interface IAgencies{
    id: number;
    name: string;
    abbrev: string;
    countryCode: string;
    type: number;
    infoURL: string;
    wikiURL: string;
    changed: Date;
    infoURLs: Array<string>;
}

export interface IPads{
    id: number;
    name: string;
    infoURL: string;
    wikiURL: string;
    mapURL: string;
    latitude: number;
    longitude: number;
    agencies: IAgencies[];
}

export interface ILocation{
    pads: IPads[];
    id: number;
    name: string;
    infoURL: string;
    wikiURL: string;
    countryCode: string;
}

export interface IRocket{
    id: number;
    name: string;
    configuration: string;
    familyname: string;
    agencies: IAgencies[];
    wikiURL: string;
    infoURLs: Array<string>;
    imageURL: string;
    imageSizes: Array<number>;
}

export interface IMissions{
    id: number;
    name: string;
    description: string;
    type: string;
    wikiURL: string;
    typeName: string;
    agencies: IAgencies[];
    payloads: Array<string>;
}

export interface ILaunches{
    id: number;
    name: string;
    windowstart: Date;
    windowend: Date;
    net: Date;
    wsstamp: number;
    westamp: number;
    netstamp: number;
    isostart: string;
    isoend: string;
    isonet: string;
    status: number;
    inhold: number;
    tbdtime: number;
    vidURLs: string[];
    vidURL: string;
    infoURLs: Array<string>;
    infoURL: string;
    holdreason: string;
    failreason: string;
    tbddate: string;
    probability: number;
    hashtag: string;
    changed: Date;
    location: ILocation;
    rocket: IRocket;
    missions: IMissions[];
    lsp: IAgencies;
}

export interface IOneLaunch{
    data?: ILaunches;
    info: string;
}

export interface IAllLaunches{
    launches?: ILaunches[];
    total?: number;
    offset?: number;
    count?: number;
    info?: string;
}

export interface IAllLaunchesExists{
    launches: ILaunches[];
    total: number;
    offset: number;
    count: number;
}


// Weather Data Structure:

export interface IWeatherApiData {
    id: number;
    period: string;
    weather: string;
    description: string;
    icon: string;
    temp: number;
    pressure: number;
    humidity: number;
    clouds: number;
    windSpeed: number;
    windDirection: number;
    rain: number;
    snow: number;
}

export interface IWeatherData {
    data?: IWeatherApiData;
    info?: string;
}