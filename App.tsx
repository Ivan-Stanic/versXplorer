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

interface IHeaderScroll {
  setScrollValues (headerTopPadding: number, scrollDirection: string) : void;
};

export let HeaderScrollContext = React.createContext<IHeaderScroll>({setScrollValues: (headerTopPadding, scrollDirection) => {}});

let initialLaunchData: IAllLaunches = {info: 'Connencting...'};
export let LaunchContext = React.createContext(initialLaunchData);

interface IState {
  launchURL: string;
  launchData: IAllLaunches;
  scrollY: any;
  headerHeight: any;
}

export default class App extends React.Component<{}, IState> {
  constructor(props: {}){
    super(props);

    this.findHeaderDimensions = this.findHeaderDimensions.bind(this);
    this.updateHeaderVisibility = this.updateHeaderVisibility.bind(this);

    this.state = {launchURL: 'https://launchlibrary.net/1.4/launch/next/15',
                  launchData: initialLaunchData,
                  scrollY: new Animated.Value(0),
                  headerHeight: new Animated.Value(0),
                  };
  }

  public async componentDidMount() {
    this.setState({launchData: await askForData(this.state.launchURL)});
  }

 updateHeaderVisibility = (headerTopPadding: number, scrollDirection: string) => {
    if (parseInt(JSON.stringify(this.state.scrollY)) != headerTopPadding) {
      Animated.timing(this.state.scrollY,
        {toValue: headerTopPadding,
        duration: 100,}).start();
    }
  }

  findHeaderDimensions = (layout: any) => {
    const {x, y, width, height} = layout;
    Animated.timing(this.state.headerHeight,
      {toValue: parseInt(JSON.stringify(this.state.scrollY)) + height,
      duration: 1,}).start();
    /* this.setState({headerHeight: height}); */
  }

  
  
  public render() {

    const Home = () => {
      if ('info' in this.state.launchData) {
        return(
            <Text style={styles.text}>{this.state.launchData.info}</Text>
        )
      } else {
        
        return (
          <HeaderScrollContext.Provider value = {{setScrollValues: this.updateHeaderVisibility}}>
            <LaunchContext.Provider value = {this.state.launchData}>
              <LaunchList />
            </LaunchContext.Provider>
          </HeaderScrollContext.Provider>
        )
      }
    }

    return (
      <SafeAreaProvider>
        <StatusBar barStyle = 'dark-content' />
        <View style={styles.container}>
          <Animated.View style={{marginTop: this.state.headerHeight, flex: 1,}}>
            <Home />
          </Animated.View>
          <Animated.View 
            onLayout={event => { this.findHeaderDimensions(event.nativeEvent.layout) }}
            style={[styles.header, {top: this.state.scrollY}]}>
            <NavBar />
          </Animated.View>
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
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#03A9F4',
    overflow: 'hidden',
  },
});

{/* <SafeAreaConsumer>{insets => 
            <View
              style = {{flex: 1, paddingTop: insets.top + 2 * paddingCorrection,}}
              onResponderMove={event => {
                if (this.state.headerVisible && event.nativeEvent.locationY > this.state.scrollPosition && this.state.scrollPosition >= 0) {
                  // Header is visble and user scrolls up: animate header dissapearance
                  Animated.timing(this.state.scrollY,
                    {toValue: -insets.top,
                    duration: 200,}).start();
                    this.setState({headerVisible: false});
                } else if (!this.state.headerVisible && event.nativeEvent.locationY < this.state.scrollPosition && event.nativeEvent.locationY < event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height) {
                  // Header is not visible, user scrolls down, ignore top and bottom bounces: animate header appearance
                  Animated.timing(this.state.scrollY,
                    {toValue: 0,
                    duration: 200,}).start();
                    this.setState({headerVisible: true});
                }
                this.setState({scrollPosition: event.nativeEvent.locationY});
              }}
            >
              <Home />
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollPosition)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollPosition)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.headerVisible)}</Text>
              <Text style={styles.text}>{JSON.stringify(insets.top)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
              <Text style={styles.text}>{JSON.stringify(this.state.scrollY)}</Text>
            </View>}
          </SafeAreaConsumer> */}