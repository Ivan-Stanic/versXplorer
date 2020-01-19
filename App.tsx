import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, LayoutAnimation, Animated, } from 'react-native';
import { SafeAreaProvider, SafeAreaConsumer} from 'react-native-safe-area-context';
import {TopSafeAreaBar} from './TopSafeAreaBar';
import {NavBar} from './NavBar';
import {BottomMenu} from './BottomMenu';
import {askForData} from './askingForData';
import {IParams, IAllLaunches} from './Interfaces';
import {LaunchList} from './LaunchList';
import { paddingCorrection } from './Constants';

let initialLaunchData: IAllLaunches = {info: 'Connencting...'};
export let LaunchContext = React.createContext(initialLaunchData);

interface IState {
  launchURL: string;
  launchData: IAllLaunches;
}

export default class App extends React.Component<{}, IState> {
  constructor(props: {}){
    super(props);

    this.state = {launchURL: 'https://launchlibrary.net/1.4/launch/next/15',
                  launchData: initialLaunchData,
                  };
  }

  public async componentDidMount() {
    this.setState({launchData: await askForData(this.state.launchURL)});
  }

  public render() {

    const Home = () => {
      if ('info' in this.state.launchData) {
        return(
            <Text style={styles.text}>{this.state.launchData.info}</Text>
        )
      } else {
        
        return (
          <LaunchContext.Provider value = {this.state.launchData}>
            <LaunchList />
          </LaunchContext.Provider>
        )
      }
    }

    return (
      <SafeAreaProvider>
        <StatusBar barStyle = 'dark-content' />
        <View style={styles.container}>
          <NavBar />
          <Home />
          {/* <BottomMenu /> */}
        </View>
        <TopSafeAreaBar />
      </SafeAreaProvider>
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
  }
});
