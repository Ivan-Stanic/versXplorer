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
    this.setState({launchData: await askForData(this.state.launchURL)});
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

