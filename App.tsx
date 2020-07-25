import 'react-native-gesture-handler'; // Without this line on the very top of the entry file, when react-navigation is used, app may crash in production even if it works fine in development
import React, { Component } from 'react';
import { NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, StatusBar, Animated } from 'react-native';
import { SafeAreaProvider} from 'react-native-safe-area-context';
import {askForData} from './askingForData';
import {IAllLaunches} from './Interfaces';
import {LaunchList} from './LaunchList';
import {LaunchDetails} from './LaunchDetails';

let initialLaunchData: IAllLaunches = {info: 'Connecting...'};
export let LaunchContext = React.createContext(initialLaunchData);

interface IState {
  launchURL: string;
  launchData: IAllLaunches;
}

export default class App extends React.Component<{}, IState> {
  constructor(props: {}){
    super(props);

    //this.updateBottomPadding = this.updateBottomPadding.bind(this);

    this.state = {launchURL: 'https://launchlibrary.net/1.4/launch/next/30',
                  launchData: initialLaunchData,
                  };
  }

  public async componentDidMount() {
    // introducing the temp variable and calculation if the launch date below is needed to exclude past launches if any
    // (sometimes Lounch library API returns past launches from the very recent past, like couple of hours ago)
    // Assumption is that next launches are sorted chronologicaly from the earliest to the latest as they are at this moment.
    let launchDataTemp: IAllLaunches = await askForData(this.state.launchURL);
    if (!('info' in launchDataTemp)) {
      let x: number = 0;
      let todayDate: Date = new Date();
      let launchDate: Date = new Date(launchDataTemp.launches[x].windowstart);
      while (launchDate < todayDate) {
        launchDataTemp.launches.shift();
        x++;
        launchDate = new Date(launchDataTemp.launches[x].windowstart);
      }
    }
    this.setState({launchData: launchDataTemp});
    // this.setState({launchData: await askForData(this.state.launchURL)});
  }
  
  public render() {

    const Stack = createStackNavigator();

    return (
      <NavigationContainer>
        <SafeAreaProvider>
          <StatusBar barStyle = 'dark-content' />
          <LaunchContext.Provider value = {this.state.launchData}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    /* flexDirection: 'column', */
    backgroundColor: 'white',
  },
  text: {
    color: 'darkblue',
    fontSize: 40,
  },
});

