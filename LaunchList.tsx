import * as React from 'react';
import { StyleSheet, View, Image, Text, FlatList, Platform, UIManager, LayoutAnimation } from 'react-native'
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import {LaunchContext, HeaderScrollContext, } from './App';
import { paddingCorrection } from './Constants';
import {IRocket, ILaunches, IAllLaunches} from './Interfaces';

function LaunchItem({launchItem}) {
  const genericRocketImage = 'https://versxplorer.com/Images/versXplorerLogo.351ca8c3.png'
  const imageSizes = launchItem.rocket.imageSizes;
  const minRocketImageSize = imageSizes[0] ? String(imageSizes[0]) : null;
  const maxRocketImageSize = imageSizes[0] ? String(imageSizes[imageSizes.length - 1]) : null;
  const imageURL = (launchItem.rocket.imageURL && launchItem.rocket.imageURL!== 'https://s3.amazonaws.com/launchlibrary/RocketImages/placeholder_1920.png') ?
                                    (maxRocketImageSize ? 
                                      launchItem.rocket.imageURL.replace(maxRocketImageSize + '.', minRocketImageSize +'.') : 
                                      launchItem.rocket.imageURL) :
                                    genericRocketImage;
  /* imageURL = require(imageURL); */
  return(
    <View style={{flexDirection: 'row'}}>
      <Image style={{height: 80, width: 80}} source={{uri: `${imageURL}`}} resizeMethod = 'resize' resizeMode='contain'/>
      <Text style={styles.text}>{launchItem.name}</Text>
    </View>
  )
}

export class LaunchList extends React.Component<any, any> {
    constructor(props: {}){
        super(props);
        /* this.imageSelector = this.imageSelector.bind(this); */
        this.state = {scrollPosition: 0,
                      };
      }
    
    /* _renderItem = ({item}) => (
      <LaunchItem value={item} />
    ); */

    public render() {
        return(
          <HeaderScrollContext.Consumer>
            {({setScrollValues, setPaddingValues}) => 
                (<LaunchContext.Consumer>
                  {(LaunchData: IAllLaunches) => 
                      (<SafeAreaConsumer>{insets => 
                          <FlatList style={[
                                          styles.container, 
                                          { paddingRight: insets.right + paddingCorrection,
                                              paddingLeft: insets.left + paddingCorrection }]}
                              data={LaunchData.launches}
                              renderItem={({ item }) => <LaunchItem launchItem = {item} />}
                                          /* {({ item }) => <View style={{flexDirection: 'row'}}>
                                                          <Image style={{height: 80, width: 80}} source={require('./assets/versXplorerLogo.png')} resizeMethod = 'resize' resizeMode='contain'/>
                                                          <Text style={styles.text}>{item.name}</Text>
                                                        </View>} */
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

    /* imageSelector(rocket: IRocket) :string {
      const genericRocketImage = './assets/versXplorerLogo.png'
      const imageSizes = rocket.imageSizes;
      const minRocketImageSize = imageSizes[0] ? String(imageSizes[0]) : null;
      const maxRocketImageSize = imageSizes[0] ? String(imageSizes[imageSizes.length - 1]) : null;
      const imageURL = (rocket.imageURL && rocket.imageURL!== 'https://s3.amazonaws.com/launchlibrary/RocketImages/placeholder_1920.png') ?
                                        (maxRocketImageSize ? 
                                          rocket.imageURL.replace(maxRocketImageSize + '.', minRocketImageSize +'.') : 
                                          rocket.imageURL) :
                                        genericRocketImage;
      return require(imageURL);
    } */
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
      backgroundColor: 'white',
    },
    text: {
      color: 'darkblue',
      fontSize: 20,
    }
});