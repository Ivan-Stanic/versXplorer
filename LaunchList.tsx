import * as React from 'react';
import { StyleSheet, Text, FlatList, Platform, UIManager, LayoutAnimation } from 'react-native'
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import {LaunchContext, HeaderScrollContext, } from './App';
import { paddingCorrection } from './Constants';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  
export class LaunchList extends React.Component<any, any> {
    constructor(props: {}){
        super(props);
        this.state = {scrollPosition: 0,
                        noMargin: true,
                        marginSize: 0,
                      };
      }
    
    public render() {
        return(
          <HeaderScrollContext.Consumer>
            {({setScrollValues}) => 
                (<LaunchContext.Consumer>
                  {(LaunchData) => 
                      (<SafeAreaConsumer>{insets => 
                          <FlatList style={[
                                          styles.container, 
                                          {marginBottom: this.state.marginSize}, 
                                          { paddingBottom: insets.bottom, 
                                            paddingRight: insets.right + paddingCorrection,
                                              paddingLeft: insets.left + paddingCorrection }]}
                              data={LaunchData.launches}
                              renderItem={({ item }) => <Text style={styles.text}>{item.name}</Text>}
                              onScroll={event => {
                                  let scrollSensingStep: number = 10;
                                  if (event.nativeEvent.contentOffset.y > this.state.scrollPosition && this.state.scrollPosition >= 0) {
                                      // User scrolls up: 
                                      setScrollValues(-insets.top, 'up');
                                  } else if (event.nativeEvent.contentOffset.y < this.state.scrollPosition && event.nativeEvent.contentOffset.y < event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height) {
                                    // User scrolls down: 
                                    setScrollValues(0, 'down');
                                    if (!(this.state.noMargin && event.nativeEvent.contentOffset.y < this.state.scrollPosition - scrollSensingStep)) {
                                      // Flat List is at the bottom and user scrolls up: remove margin
                                      LayoutAnimation.configureNext(
                                        LayoutAnimation.create(
                                          100,
                                          LayoutAnimation.Types.linear,
                                        ),
                                      );
                                      this.setState({noMargin: true,
                                                      marginSize: 0,
                                                        });
                                    }
                                  }
                                  // insets.bottom > 0 check added as layout animation reports error when starting and ending position are the same
                                  if (insets.bottom > 0 && event.nativeEvent.contentOffset.y >= event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height) {
                                      // FlatList just reached bottom: animate bottom margin apperance
                                      LayoutAnimation.configureNext(
                                          LayoutAnimation.create(
                                            100,
                                            LayoutAnimation.Types.linear,
                                          ),
                                        );
                                        this.setState({noMargin: false,
                                                      marginSize: insets.bottom,
                                                      });
                                  }
                                  this.setState({scrollPosition: event.nativeEvent.contentOffset.y})
                              }}
                          />
                          }
                      </SafeAreaConsumer>
                      )}
              </LaunchContext.Consumer>)}
          </HeaderScrollContext.Consumer>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
      backgroundColor: 'white',
    },
    text: {
      color: 'darkblue',
      fontSize: 40,
    }
});