import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text, View, StatusBar, Animated, } from 'react-native';
import { SafeAreaProvider} from 'react-native-safe-area-context';
import {askForData} from './askingForData';
import {IAllLaunches} from './Interfaces';
import {LaunchList} from './LaunchList';

interface IHeaderScroll {
  setPaddingValues (bottomPadding: number) : void;
};

export let HeaderScrollContext = React.createContext<IHeaderScroll>({/* setScrollValues: (headerTopPadding) => {},  */setPaddingValues: (bottomPadding) => {}});

let initialLaunchData: IAllLaunches = {info: 'Connecting...'};
export let LaunchContext = React.createContext(initialLaunchData);

interface IState {
  launchURL: string;
  launchData: IAllLaunches;
  scrollY: any;
  animatedBottomPadding: any;
}

export default class App extends React.Component<{}, IState> {
  constructor(props: {}){
    super(props);

    this.updateBottomPadding = this.updateBottomPadding.bind(this);

    this.state = {launchURL: 'https://launchlibrary.net/1.4/launch/next/15',
                  launchData: initialLaunchData,
                  scrollY: new Animated.Value(0.1),
                  animatedBottomPadding: new Animated.Value(0),
                  };
  }

  public async componentDidMount() {
    this.setState({launchData: await askForData(this.state.launchURL)});
  }

  updateBottomPadding = (bottomPadding: number) => {
    if (parseInt(JSON.stringify(this.state.animatedBottomPadding)) != bottomPadding) {
      Animated.timing(this.state.animatedBottomPadding,
        {toValue: bottomPadding,
          isInteraction: false,
        duration: 20,}).start();
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
          <View style={styles.container}>
            <Animated.View style={{flex: 1, width: '100%', marginBottom: this.state.animatedBottomPadding, }}>
              <HeaderScrollContext.Provider value = {{setPaddingValues: this.updateBottomPadding}}>
                <LaunchContext.Provider value = {this.state.launchData}>
                  <LaunchList />
                </LaunchContext.Provider>
              </HeaderScrollContext.Provider>
            </Animated.View>
          </View>
        )
      }
    }

    function LaunchDetail({navigation, route}) {
      const { id } = route.params;
      const detailsTitle = JSON.stringify(id);
      navigation.setOptions({ title: detailsTitle });
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' } }>
          <Text>{detailsTitle}</Text>
        </View>
      );
    }

    const Stack = createStackNavigator();

    return (
      <NavigationContainer>
        <SafeAreaProvider>
          <StatusBar barStyle = 'dark-content' />
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
                name="Home"
                component={Home}
                options={{
                    title: 'versXplorer',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                      color: 'darkblue',
                      fontSize: 20,
                    },
                }} />
            <Stack.Screen name="Details" component={LaunchDetail} options={{headerBackTitleVisible: false}} />
          </Stack.Navigator>
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
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#03A9F4',
    overflow: 'hidden',
  },
});

