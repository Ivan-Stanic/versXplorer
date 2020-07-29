import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import * as Cellular from 'expo-cellular';
import { defaultUnits } from './Constants';

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
  const country = Cellular.isoCountryCode;
  const imperialUnitsCountries: Array<string> = ['us', 'lr', 'mm'];
  let units: string = defaultUnits;
  if (imperialUnitsCountries.includes(country)) {
    units = 'imperial';
  }
  return units;
}