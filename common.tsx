import React from 'react';
import {IAllLaunches, ILaunchContext} from './Interfaces';
import AsyncStorage from '@react-native-community/async-storage';
import * as Cellular from 'expo-cellular';
import * as Localization from 'expo-localization';


// Common Constants

export const paddingCorrection: number = 10;
export const defaultUnits: string = 'metric';


// Common Variables

export let initialLaunchData: IAllLaunches = {info: 'Connecting...'};
export let LaunchContext = React.createContext<ILaunchContext>({refreshLaunchList: () => {}, launchData: initialLaunchData, refreshingData: false});


// Common Functions

export async function askForData(url: string) {
    //alert(url);
    try {
        //alert('trying...');
        const response = await fetch(url);
        let responseJson = await response.json();
        return responseJson;
      } catch (error) {
        //alert('error :(');
        return {info: `No data available at this moment. Please restart application and try again. We apologize for the inconvenience.`};
      }
}

export async function storeValue(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
    return 'OK';
  } catch (e) {
    return 'saving error';
  }
}

export async function getStoredValue (key: string) {
  try {
    const value = await AsyncStorage.getItem(key)
    return value;
  } catch(e) {
    return 'reading error'
  }
}

export async function removeItem (key: string) {
  try {
    const value = await AsyncStorage.removeItem(key)
    return "OK";
  } catch(e) {
    return 'remove error'
  }
}

export function checkRegionUnits() {
  let country: string = Cellular.isoCountryCode;
  // I noticed that country was empty on iOS, that's why Localization is used that works fine on iOS
  if (!(country)) {country = Localization.region;} 
  // but Localization returns country code in all caps
  const imperialUnitsCountries: Array<string> = ['us', 'lr', 'mm', 'US', 'LR', 'MM'];
  let units: string = defaultUnits;
  if (imperialUnitsCountries.includes(country)) {
    units = 'imperial';
  }
  return units;
}