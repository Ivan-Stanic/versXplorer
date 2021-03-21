import React, { useRef, useState, useContext } from 'react';
import { StyleSheet, View, Image, Text, FlatList, TouchableOpacity, Animated, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import {ILaunchContext} from './Interfaces';
import { useNavigation } from '@react-navigation/native';
import {LaunchContext, paddingCorrection} from './common';

function ImageSelection ({launchItem}) {
  const localImage = './assets/versXplorerLogo_square_indigo.png';
  if (launchItem.image_url && (launchItem.image_url.includes('https'))) {
    return (<Image style={styles.imageStyle} source={{uri: `${launchItem.image_url}`}} resizeMethod = 'resize' resizeMode='cover'/>)
  } else {
    return (<Image style={styles.imageStyle} source={require(`${localImage}`)} resizeMethod = 'resize' resizeMode='cover'/>)
  }
}

function LaunchItem({launchItem}) {
  const dateArray = new Date(launchItem.item.net * 1000).toString().split(' ');
  const date: string = dateArray[1] + ' ' + dateArray[2] + ', ' + dateArray[3];
  const navigation = useNavigation();
  return(
    <TouchableOpacity onPress={() => navigation.navigate('Details', {index: launchItem.index})}>
      <View style={{flexDirection: 'row', paddingBottom: 5, paddingTop: 5, }}>
        <ImageSelection launchItem = {launchItem.item}/>
        <View style={{paddingLeft: 10, paddingRight: 10, width: 0, flexGrow: 1,}}>
          <Text style={[styles.text, styles.textbold, styles.textblue]}>{date}</Text>
          <Text style={[styles.text, styles.textbold]}>{launchItem.item.name}</Text>
          <Text style={[styles.text]}>{launchItem.item.location_name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
// {width: 0, flexGrow: 1} makes sure that <View component takes 100% of the remaining space, at least in this settings. Not sure how it works

export function LaunchList () {
  
  const LaunchCtx: ILaunchContext = useContext(LaunchContext);

  if ('info' in LaunchCtx.launchData) {
    if (LaunchCtx.launchData.info == 'Connecting...') {
      return (
        <ActivityIndicator size="large" />
      )
    } else {
      return(
          <Text style={styles.text}>{LaunchCtx.launchData.info}</Text>
      )
    }
  } else {
    
    return (
      <SafeAreaConsumer>{insets => 
                          <FlatList style={[
                                      styles.container, 
                                      { paddingRight: insets.right + paddingCorrection,
                                          paddingLeft: insets.left + paddingCorrection }]}
                                data={LaunchCtx.launchData.launches}
                                renderItem={({ item, index }) => <LaunchItem launchItem = {{item: item, index: index}} />}
                                ListFooterComponent={<View style={{height: insets.bottom,}}></View>}
                                refreshing={LaunchCtx.refreshingData}
                                onRefresh={LaunchCtx.refreshLaunchList}
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