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

/*export interface ILaunches_old{
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
}*/

export interface ILaunches {
    id: string;
    name: string;
    status: number;
    net: number;
    launch_service_provider_id: number;
    launch_service_provider_name: string;
    rocket_configuration_id: number; // new in API 1.0
    rocket_configuration_name: string;
    mission_name: string;
    mission_description: string;
    mission_type: string;
    mission_orbit_name: string;
    pad_id: number;
    pad_name: string;
    pad_latitude: number;
    pad_longitude: number;
    location_name: string;
    location_country_code: string;
    webcast_url: string;
    image_url: string;
    agency: {
        type: string; // new in API 1.0
        country_code: string; // new in API 1.0
        abbrev: string; // new in API 1.0
        description: string; // new in API 1.0
        info_url: string;
        wiki_url: string;
        logo_url: string;
    };
    rocket: { // new in API 1.0
        description: string;
        info_url: string;
        wiki_url: string;
        image_url: string;
    }
    weather: IWeatherData;
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

export interface IWeatherData {
    period: number;
    weather: string;
    description: string;
    icon: string;
    temp: number;
    pressure: number;
    humidity: number;
    clouds: number;
    wind_speed: number;
    wind_direction: number;
    rain: number;
    snow: number;
}

export interface ILaunchContext {
    refreshLaunchList () : void;
    launchData : IAllLaunches;
    refreshingData: boolean;
  };
  
  