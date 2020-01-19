import * as React from 'react';
import { View } from 'react-native'
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import { paddingCorrection } from './Constants';

export class TopSafeAreaBar extends React.Component<any, any> {
    
    public render() {
        return(
            <SafeAreaConsumer>
                {insets => 
                    <View style={{ 
                        position: 'absolute',
                        top: 0,
                        backgroundColor: 'white', 
                        paddingTop: insets.top, 
                        paddingRight: insets.right + paddingCorrection, 
                        paddingLeft: insets.left + paddingCorrection,
                        width: '100%',
                    }} >
                    </View>
                }
            </SafeAreaConsumer>
        )
    }
}

