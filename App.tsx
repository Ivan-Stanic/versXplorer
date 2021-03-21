import 'react-native-gesture-handler'; // Without this line on the very top of the entry file, when react-navigation is used, app may crash in production even if it works fine in development
import React, { Component } from 'react';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, StatusBar, Animated, Alert, Platform } from 'react-native';
import { SafeAreaProvider} from 'react-native-safe-area-context';
import {askForData, storeValue, checkRegionUnits, initialLaunchData, LaunchContext, defaultUnits} from './common';
import {IAllLaunches} from './Interfaces';
import {LaunchList} from './LaunchList';
import {LaunchDetails} from './LaunchDetails';
import AsyncStorage from '@react-native-community/async-storage';


interface IStoredData {
  showSwipeModalOnDetailsPage?: string;
  units?: string;
  expoPushToken?: Notifications.ExpoPushToken;
}

interface IState {
  launchURL: string;
  launchData: IAllLaunches;
  refreshingData: boolean;
  storedData: IStoredData;
}

// storeToke API response format
interface IdbMessage {
  message?: string;
}

// unwantedData API response format
interface IUnwantedData {
  data?: [{
    launchId: number;
    name: string;
  }];
  message?: string;
}

export default class App extends React.Component<{}, IState> {
  constructor(props: {}){
    super(props);

    this.updateLaunchList = this.updateLaunchList.bind(this);
    this.initializeStorage = this.initializeStorage.bind(this);
    this.registerForPushNotificationsAsync = this.registerForPushNotificationsAsync.bind(this);
    
    this.state = {launchURL: 'https://versxplorer.com/api/1.0/', // this is the API address to load 30 next launches
                  launchData: initialLaunchData, // This is where the launch data will be stored, or error message
                  refreshingData: false, // This indicates that data is bein refreshed. Used in Flat List in LauchList Component.
                  storedData: { showSwipeModalOnDetailsPage: 'true',
                                units: defaultUnits}
                  };
  }

  public componentDidMount() {
    this.updateLaunchList();
    this.setState({storedData: {units: checkRegionUnits()}});
    this.initializeStorage();
    this.registerForPushNotificationsAsync().then(token => this.storeNotificationsToken(token));
  }

  async updateLaunchList() {
    // introducing the temp variable and calculation if the launch date below is needed to exclude past launches if any
    // (sometimes Lounch library API returns past launches from the very recent past, like couple of hours ago)
    // Also adding ability to remove unwanted data to appear in the list.
    // When launchlibrary.org was moving to another library they added info about it as a part of the API response.
    // Therefore my database contains manually filled table with the list of unwanted data to be removed from the list, if any.
    // Unwanted data info is fetched with unwantedData API
    this.setState({refreshingData: true});
    let launchDataTemp: IAllLaunches = await askForData(this.state.launchURL);
    let unwantedData: IUnwantedData = await askForData('https://versxplorer.com/unwantedData.php');
    if ('launches' in launchDataTemp) {
      for (let x: number = 0; x < launchDataTemp.launches!.length; x++) {
      const miliSecDiff = (new Date(launchDataTemp.launches![x].net * 1000)).getTime() - (new Date()).getTime();
        if (miliSecDiff < 0) {
          launchDataTemp.launches!.splice(x, 1);
        } else {
          if ('data' in unwantedData) {
            let wantedFlag: boolean = true;
            let y: number = 0;
            while (wantedFlag && y <  unwantedData.data!.length) {
              if (launchDataTemp.launches![x].name === unwantedData.data![y].name || launchDataTemp.launches![x].name === unwantedData.data![y].name) {
                launchDataTemp.launches!.splice(x, 1);
                wantedFlag = false;
              }
              y++;
            }
          }
        }
      }
    }
    this.setState({launchData: launchDataTemp, refreshingData: false});
  }

  async initializeStorage() {
    for (let key in this.state.storedData) {
      try {
        const existingValue: string = await AsyncStorage.getItem("key");
        if (existingValue) {
          this.setState({storedData: {[`${key}`]: existingValue}});
        } else {
          storeValue(key, this.state.storedData[key]);
        }
      } catch(e) {
        return 'error reading value';
      }
    }
  }

  // function to store token in the database. This is needed to use token to send notifications from the back end
  async storeTokenDB(token) {
    const dbResponse: IdbMessage = await askForData('https://www.versxplorer.com/storeToken.php?token=' + token);
        console.log(dbResponse);
        if (dbResponse && dbResponse.message == 'Success') {
          storeValue('tokenStored', 'true');
        } else {
          storeValue('tokenStored', 'false');
        }
  }
  // After the token value is retreived by registerForPushNotificationsAsync() function:
  // 1. Check if the token already exists in the local storage.
  // 2. If token exists in the local storage, check if it is the same as the one retreived right now
  // 3. If it is the same, check if the token was already successfully sent and stored in the database.
  // 4. If not, send it and store it in the database.
  // 5. If the token is different or it does not exists in the local storage, replace it with the new one in the local storage and send and store it in the database
  // (question is what to do with the old one. It think there is the procedure done by Apple or Google that sends response
  // to delete old and unused tokens)
  async storeNotificationsToken(token) {
    try {
      const existingValue: string = await AsyncStorage.getItem('expoPushToken');
      if (existingValue && existingValue == token) {
        try {
          const existingTokenStored: string = await AsyncStorage.getItem('tokenStored');
          if (!(existingTokenStored) || existingTokenStored != 'true') {
            // Store token. API to the database
            this.storeTokenDB(token);
            console.log('Same token present, not stored in DB');
          }
        } catch(e) {
          return 'error reading value';
        }
      } else {
        console.log('No or different token in local storage');
        this.setState({storedData: {expoPushToken: token}});
        storeValue('expoPushToken', token);
        // Store token. API to the database
        this.storeTokenDB(token);
      }
    } catch(e) {
      return 'error reading value';
    }
  }

  async registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
    token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    return token;
  }
  
  public render() {

    const Stack = createStackNavigator();

    return (
      <NavigationContainer>
        <SafeAreaProvider>
          <StatusBar barStyle = 'dark-content' />
          <LaunchContext.Provider value = {{refreshLaunchList: this.updateLaunchList, launchData: this.state.launchData, refreshingData: this.state.refreshingData}}>
            <Stack.Navigator initialRouteName="Home" screenOptions={() => ({gestureEnabled: true,})}>
              <Stack.Screen
                  name="Home"
                  component={LaunchList}
                  options={{
                      title: 'versXplorer',
                      headerTitleStyle: {
                        fontWeight: 'bold',
                        color: 'darkblue',
                        fontSize: 20,
                      },
                  }} />
              <Stack.Screen
                  name="Details"
                  component={LaunchDetails}
                  options={{
                    headerBackTitleVisible: false,
                    headerTitleContainerStyle: {
                      width: '70%',
                    },
                    animationEnabled: false,
                  }} />
              </Stack.Navigator>
            </LaunchContext.Provider>
        </SafeAreaProvider>
      </NavigationContainer>
    );
    
    
  }
}

