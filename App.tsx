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
  setScrollValues (headerTopPadding: number) : void;
  setPaddingValues (bottomPadding: number) : void;
};

export let HeaderScrollContext = React.createContext<IHeaderScroll>({setScrollValues: (headerTopPadding) => {}, setPaddingValues: (bottomPadding) => {}});

let initialLaunchData: IAllLaunches = {info: 'Connencting...'};
export let LaunchContext = React.createContext(initialLaunchData);

interface IState {
  launchURL: string;
  launchData: IAllLaunches;
  scrollY: any;
  headerHeight: any;
  animatedTopMargin: any;
  animatedBottomPadding: any;
}

export default class App extends React.Component<{}, IState> {
  constructor(props: {}){
    super(props);

    this.findHeaderDimensions = this.findHeaderDimensions.bind(this);
    this.updateHeaderVisibility = this.updateHeaderVisibility.bind(this);
    this.updateBottomPadding = this.updateBottomPadding.bind(this);

    this.state = {launchURL: 'https://launchlibrary.net/1.4/launch/next/15',
                  launchData: initialLaunchData,
                  scrollY: new Animated.Value(0.1),
                  headerHeight: new Animated.Value(0),
                  animatedTopMargin: new Animated.Value(0.1),
                  animatedBottomPadding: new Animated.Value(0),
                  };
  }

  public async componentDidMount() {
    this.setState({launchData: await askForData(this.state.launchURL)});
  }

 updateHeaderVisibility = (headerTopPadding: number) => {
    if (parseInt(JSON.stringify(this.state.scrollY)) != headerTopPadding) {
      let newValue: number;
      if (headerTopPadding == -9999) {
        newValue = -parseInt(JSON.stringify(this.state.headerHeight));
      } else {
        newValue = headerTopPadding;
      }
      Animated.parallel([
        Animated.timing(this.state.scrollY,
          {toValue: newValue,
            isInteraction: false,
          duration: 80,}),
        Animated.timing(this.state.animatedTopMargin,
          {toValue: newValue + parseInt(JSON.stringify(this.state.headerHeight)),
            isInteraction: false,
          duration: 0,}),
      ]).start();
    }
  }

  updateBottomPadding = (bottomPadding: number) => {
    if (parseInt(JSON.stringify(this.state.animatedBottomPadding)) != bottomPadding) {
      Animated.timing(this.state.animatedBottomPadding,
        {toValue: bottomPadding,
          isInteraction: false,
        duration: 20,}).start();
    }
  }

  findHeaderDimensions = (layout: any) => {
    const {x, y, width, height} = layout;
    const currentScrollY: number = parseInt(JSON.stringify(this.state.scrollY));
    if (currentScrollY != height) {
      Animated.sequence([
        Animated.timing(this.state.headerHeight,
          {toValue: height,
            isInteraction: false,
          duration: 0,}),
        Animated.timing(this.state.animatedTopMargin,
          {toValue: currentScrollY + height,
            isInteraction: false,
          duration: 0,}),
      ]).start();
    }
  }

  
  
  public render() {

    const Home = () => {
      if ('info' in this.state.launchData) {
        return(
            <Text style={styles.text}>{this.state.launchData.info}</Text>
        )
      } else {
        
        return (
          <HeaderScrollContext.Provider value = {{setScrollValues: this.updateHeaderVisibility, setPaddingValues: this.updateBottomPadding}}>
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
          <Animated.View style={{marginTop: this.state.animatedTopMargin, flex: 1, width: '100%', marginBottom: this.state.animatedBottomPadding, }}>
            <Home />
          </Animated.View>
          <Animated.View 
            onLayout={event => { this.findHeaderDimensions(event.nativeEvent.layout) }}
            style={[styles.header, {top: this.state.scrollY, width: '100%', }]}>
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