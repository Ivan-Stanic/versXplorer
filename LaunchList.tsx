import * as React from 'react';
import { StyleSheet, View, Image, Text, FlatList, TouchableOpacity } from 'react-native'
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import {LaunchContext, HeaderScrollContext, } from './App';
import { paddingCorrection } from './Constants';
import {IAllLaunches} from './Interfaces';
import { useNavigation } from '@react-navigation/native';

function ImageSelection ({launchItem}) {
  const imageSizes = launchItem.rocket.imageSizes;
  const minRocketImageSize = imageSizes[0] ? String(imageSizes[0]) : null;
  const maxRocketImageSize = imageSizes[0] ? String(imageSizes[imageSizes.length - 1]) : null;
  const imageURL = (launchItem.rocket.imageURL && !(launchItem.rocket.imageURL.includes('placeholder'))) ? // The existance of the word 'placeholder' may change in the future. It is wise to have database of your own pictures.
                                    (maxRocketImageSize ? 
                                      launchItem.rocket.imageURL.replace(maxRocketImageSize + '.', minRocketImageSize +'.')
                                      : 
                                      launchItem.rocket.imageURL)
                                    : 
                                    null;
  const localImage = './assets/versXplorerLogo_square_indigo.png';
  // The existance of the word 'placeholder' may change in the future. It is wise to have database of your own pictures.
  if (launchItem.rocket.imageURL && !(launchItem.rocket.imageURL.includes('placeholder'))) {
    return (<Image style={styles.imageStyle} source={{uri: `${imageURL}`}} resizeMethod = 'resize' resizeMode='cover'/>)
  } else {
    return (<Image style={styles.imageStyle} source={require(`${localImage}`)} resizeMethod = 'resize' resizeMode='cover'/>)
  }
}

function LaunchItem({launchItem}) {
  const dateArray = new Date(launchItem.windowstart).toString().split(' ');
  const date: string = dateArray[1] + ' ' + dateArray[2] + ', ' + dateArray[3];
  const navigation = useNavigation();
  return(
    <TouchableOpacity onPress={() => navigation.navigate('Details', {id: launchItem.id})}>
      <View style={{flexDirection: 'row', paddingBottom: 5, paddingTop: 5, }}>
        <ImageSelection launchItem = {launchItem}/>
        <View style={{paddingLeft: 10, paddingRight: 10, width: 0, flexGrow: 1,}}>
          <Text style={[styles.text, styles.textbold, styles.textblue]}>{date}</Text>
          <Text style={[styles.text, styles.textbold]}>{launchItem.name}</Text>
          <Text style={[styles.text]}>{launchItem.location.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
    
  )
}
// {width: 0, flexGrow: 1} makes sure that <View component takes 100% of the remaining space, at least in this settings. Not sure how it works

export class LaunchList extends React.Component<any, any> {
    constructor(props: {}){
        super(props);
        this.state = {scrollPosition: 0,
                      };
      }

    public render() {
        return(
          <HeaderScrollContext.Consumer>
            {({setPaddingValues}) => 
                (<LaunchContext.Consumer>
                  {(LaunchData: IAllLaunches) => 
                      (<SafeAreaConsumer>{insets => 
                          <FlatList style={[
                                          styles.container, 
                                          { paddingRight: insets.right + paddingCorrection,
                                              paddingLeft: insets.left + paddingCorrection }]}
                              data={LaunchData.launches}
                              renderItem={({ item }) => <LaunchItem launchItem = {item} />}
                              onScroll={event => {
                                  if (event.nativeEvent.contentOffset.y < this.state.scrollPosition && event.nativeEvent.contentOffset.y < event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height - 50) {
                                    //insets.bottom added because event.nativeEvent.layoutMeasurement.height decreases by that value when parent margin changes below.
                                    // User scrolls down: 
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
    textblue: {
      color: 'darkblue',
    },
    textbold: {
      fontWeight: 'bold',
    },
    text: {
      fontSize: 15,
    },
    imageStyle: {
      height: '100%',
      minHeight: 80,
      width: 80,
      borderRadius: 10
    }
});