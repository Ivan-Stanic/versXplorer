import React, { useRef, useState, useContext } from 'react';
import { StyleSheet, View, Image, Text, FlatList, TouchableOpacity, Animated, ScrollView } from 'react-native'
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import {LaunchContext } from './App';
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
  const dateArray = new Date(launchItem.item.windowstart).toString().split(' ');
  const date: string = dateArray[1] + ' ' + dateArray[2] + ', ' + dateArray[3];
  const navigation = useNavigation();
  // Calculation of the launch date below is needed to exclude past launches if any
  // (sometimes Lounch library API returns past launches from the very recent past, like couple of hours ago)  
  const launchDate: Date = new Date (launchItem.item.windowstart);
  const today: Date = new Date();
  if (today < launchDate) {
    return(
      <TouchableOpacity onPress={() => navigation.navigate('Details', {index: launchItem.index})}>
        <View style={{flexDirection: 'row', paddingBottom: 5, paddingTop: 5, }}>
          <ImageSelection launchItem = {launchItem.item}/>
          <View style={{paddingLeft: 10, paddingRight: 10, width: 0, flexGrow: 1,}}>
            <Text style={[styles.text, styles.textbold, styles.textblue]}>{date}</Text>
            <Text style={[styles.text, styles.textbold]}>{launchItem.item.name}</Text>
            <Text style={[styles.text]}>{launchItem.item.location.name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  } else {
    return null;
  }
}
// {width: 0, flexGrow: 1} makes sure that <View component takes 100% of the remaining space, at least in this settings. Not sure how it works

export function LaunchList () {
  
  const LaunchData = useContext(LaunchContext);

  if ('info' in LaunchData) {
    return(
        <Text style={styles.text}>{LaunchData.info}</Text>
    )
  } else {
    
    return (
      <SafeAreaConsumer>{insets => 
                          <FlatList style={[
                                      styles.container, 
                                      { paddingRight: insets.right + paddingCorrection,
                                          paddingLeft: insets.left + paddingCorrection }]}
                                data={LaunchData.launches}
                                renderItem={({ item, index }) => <LaunchItem launchItem = {{item: item, index: index}} />}
                                ListFooterComponent={<View style={{height: insets.bottom,}}></View>}
                            />
                          }
          </SafeAreaConsumer>
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