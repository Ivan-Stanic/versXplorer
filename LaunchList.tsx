import * as React from 'react';
import { StyleSheet, Text, FlatList, Platform, UIManager, LayoutAnimation } from 'react-native'
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import {LaunchContext, HeaderScrollContext, } from './App';
import { paddingCorrection } from './Constants';

export class LaunchList extends React.Component<any, any> {
    constructor(props: {}){
        super(props);
        this.state = {scrollPosition: 0,
                      };
      }
    
    public render() {
        return(
          <HeaderScrollContext.Consumer>
            {({setScrollValues, setPaddingValues}) => 
                (<LaunchContext.Consumer>
                  {(LaunchData) => 
                      (<SafeAreaConsumer>{insets => 
                          <FlatList style={[
                                          styles.container, 
                                          { paddingRight: insets.right + paddingCorrection,
                                              paddingLeft: insets.left + paddingCorrection }]}
                              data={LaunchData.launches}
                              renderItem={({ item }) => <Text style={styles.text}>{item.name}</Text>}
                              onScroll={event => {
                                  let scrollSensingStep: number = 10;
                                  if (event.nativeEvent.contentOffset.y > this.state.scrollPosition && this.state.scrollPosition >= 0) {
                                      // User scrolls up: 
                                      let negativeMarginValue: number;
                                      if (insets.top == 0) {
                                        negativeMarginValue = -9999; // Signalling non existing insets 
                                      } else {
                                        negativeMarginValue = -insets.top;
                                      }
                                      setScrollValues(negativeMarginValue);
                                  } else if (event.nativeEvent.contentOffset.y < this.state.scrollPosition && event.nativeEvent.contentOffset.y < event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height - 50) {
                                    //insets.bottom added because event.nativeEvent.layoutMeasurement.height decreases by that value when parent margin changes below.
                                    // User scrolls down: 
                                    setScrollValues(0);
                                    setPaddingValues(0);
                                  }
                                  // insets.bottom > 0 check added as layout animation reports error when starting and ending position are the same
                                  if (insets.bottom > 0 && event.nativeEvent.contentOffset.y >= event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height) {
                                      // FlatList just reached bottom: animate bottom margin apperance
                                    setPaddingValues(insets.bottom);
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