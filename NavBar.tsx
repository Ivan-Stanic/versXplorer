import * as React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native'
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import { paddingCorrection } from './Constants';

 // Placeholder for settings or menu icon or avatar
const MenuBar = () => {
    return(
        <View style={styles.dummyView} />
    )
}

class NavBar extends React.Component<any, any> {
    
    public render() {
        return(
            <SafeAreaConsumer>{insets => 
                <View style={[
                        styles.navBar, 
                        { paddingTop: insets.top + 2 * paddingCorrection,
                        paddingRight: insets.right + paddingCorrection, 
                        paddingLeft: insets.left + paddingCorrection }]} >
                    <MenuBar />
                    <Text style={styles.brand} >versXplorer</Text>
                    <MenuBar />
                </View>}
            </SafeAreaConsumer>
        )
    }
}

const styles = StyleSheet.create({
    navBar: {
        textAlign: 'center',
        backgroundColor: 'white',
        /* flex: 1, */
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: 'blue',
        borderBottomWidth: 2,
        width: '100%',
        paddingBottom: 2 * paddingCorrection,
        height: 30
    },
    brand: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'blue',
        marginVertical: 0,
        height: 30
    },
    dummyView: {
        width: '10%',
        maxWidth: 30,
        height: '50%',
    },
  });

export {NavBar};