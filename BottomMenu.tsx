import * as React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native'
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import { paddingCorrection } from './Constants';

class BottomMenu extends React.Component<any, any> {
    
    public render() {
        return(
            <SafeAreaConsumer>{insets => <View style={{ paddingBottom: insets.bottom, paddingRight: insets.right + paddingCorrection, paddingLeft: insets.left + paddingCorrection }} >
                {/* <Text style={{fontSize: 50,}}>Bottom</Text> */}
            </View>}</SafeAreaConsumer>
        )
    }
}


export {BottomMenu};