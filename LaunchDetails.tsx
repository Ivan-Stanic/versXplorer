import React, { useRef, useContext, useLayoutEffect, useEffect, useState } from 'react';
import {LaunchContext, ILaunchContext} from './App';
import { StyleSheet, View, Image, Text, PanResponder, Animated, TouchableOpacity, Dimensions, ScrollView, Button, Alert, Linking, Platform, Modal, Picker } from 'react-native'
import {askForData, getStoredValue, storeValue, removeItem, checkRegionUnits} from './commonFunctions';
import {IWeatherData} from './Interfaces';
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import { paddingCorrection, defaultUnits } from './Constants';
import { FontAwesome, MaterialIcons, SimpleLineIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import {PanGestureHandler} from 'react-native-gesture-handler';

function ShowMap ({launchItem}) {

    return(
        <View style={{height: 300, margin: 10, borderRadius: 10, overflow: 'hidden'}}>
            <MapView
                style={{height: '100%'}}
                region={{
                    latitude: launchItem.location.pads[0].latitude,
                    longitude: launchItem.location.pads[0].longitude,
                    latitudeDelta: 1.5,
                    longitudeDelta: 1.5,
                }}>
                <Marker
                    coordinate={{
                        latitude: launchItem.location.pads[0].latitude,
                        longitude: launchItem.location.pads[0].longitude,}}>
                    <View style={{padding: 10,}}>
                        <Image style={{width: 35, height: 35}} source={require('./assets/versXplorerLogo_square_indigo.png')} resizeMethod = 'resize' resizeMode='cover'/>
                    </View>
                </Marker>

            </MapView>
        </View>
    )
}

interface IWeatherInput {
    padId: number;
    windowstart: Date;
    weatherTimeInterval: string;
}

interface IWeatherProps {
    weatherInput: IWeatherInput;
}

let initialWeatherData: IWeatherData = {info: 'Connencting...'};

class WeatherContainer extends React.Component<IWeatherProps, any> {
    constructor(props: IWeatherProps){
        super(props);
        this.state = {weatherData: initialWeatherData,
                      padId: 9999,
                      showUnitsSettingsModal: false,
                      userUnits: defaultUnits,
        };
        this.fetchData = this.fetchData.bind(this);
        this.readStoredUserUnits = this.readStoredUserUnits.bind(this);
    }
    
    public componentDidMount() {
        this.fetchData();
        this.readStoredUserUnits();
    }

    public componentDidUpdate() {
        if (this.props.weatherInput.padId !== this.state.padId) {this.fetchData();}
    }

    public componentWillUnmount() {
        this.setState({weatherData: initialWeatherData, padId: 9999});
    }

    public async fetchData() {
        const hoursToLaunch: number = ((new Date(this.props.weatherInput.windowstart)).getTime() - (new Date()).getTime())/1000/60/60;
        if (hoursToLaunch < 117 && hoursToLaunch > 0) {
            this.setState({weatherData: await askForData('https://www.versxplorer.com/weather.php?padId=' + this.props.weatherInput.padId + '&period=' + this.props.weatherInput.weatherTimeInterval),
                padId: this.props.weatherInput.padId});
        } else if (hoursToLaunch >= 117) {
            this.setState({weatherData: {info: 'Weather data is only available up to approximately 5 days before launch window.'},
                padId: this.props.weatherInput.padId});
        } else {
            this.setState({weatherData: {info: 'No data'},
                padId: this.props.weatherInput.padId});
        }
    }

    async readStoredUserUnits() {
        const uUnits = await getStoredValue('units');
        if (uUnits) {
            this.setState({userUnits: uUnits})
        } else {
            this.setState({userUnits: checkRegionUnits()});
        }
        return uUnits;
    }

    render() {
        // Calculating temperature values demending on measurement system, providing weather data exists
        let weatherTitle: string = "Weather Data"
        let temperature: number = 0;
        let windSpeed: number = 0;
        let windString: string = windSpeed.toString();
        let pressure: number = 1000;
        let pressureString: string = pressure.toString();
        if (!(this.state.weatherData.info)) {
            weatherTitle = ((this.state.weatherData.data.description).slice(0, 1)).toUpperCase() + (this.state.weatherData.data.description.slice(1));
            temperature = this.state.weatherData.data.temp;
            windSpeed = this.state.weatherData.data.windSpeed;
            pressure = this.state.weatherData.data.pressure;
            if (this.state.userUnits == 'metric') {
                temperature = temperature - 273.15; //Converting to Celsius degrees for metic system
                windSpeed = windSpeed * 3.6; // Converting to km/h from m/s
                windString = Math.round(windSpeed) + ' km/h';
                pressureString = Math.round(pressure) + ' mbar';
            } else if (this.state.userUnits == 'imperial') {
                temperature = (temperature - 273.15) * 1.8 + 32; // Converting to Fahrenheit degrees for imperial system
                windSpeed = windSpeed * 3.6 / 1.609; // Converting to mph from m/s
                windString = Math.round(windSpeed) + ' mph';
                pressureString = (Math.round((pressure * 0.0145038) * 100) / 100) + ' psi';
            }
        }

        let imageURL: string = 'https://openweathermap.org/img/wn/02d.png';
        let windDirections: Array<string> = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N']
        if (!('info' in this.state.weatherData)) {
            imageURL = 'https://openweathermap.org/img/wn/' + this.state.weatherData.data.icon + '.png';
            if (this.state.weatherData.data.windSpeed) {
                if (this.state.weatherData.data.windDirection) {
                    windString = windString + "  " + windDirections[Math.floor(((this.state.weatherData.data.windDirection % 360) + 11.25)/22.5)];
                }
            }
        }
        const imageWidth: number = 25;
        let tempTextFont: string = 'DIN Condensed';
        let tempTextSize: number = 40;
        if (Platform.OS === 'android') {
            tempTextFont = 'sans-serif-condensed';
            tempTextSize = 35;
          }
        
        return(
            <View style={{flexDirection: 'column', padding: 10, margin: 10, borderRadius: 10, borderColor: 'lightblue', borderWidth: 3}}>
                <Modal
                    visible={this.state.showUnitsSettingsModal}
                    transparent={false}>
                        <View style={{  flexDirection: 'column',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        height: '100%'}}>
                            <View style={{  paddingTop: 150,
                                            flexDirection: 'column',
                                            alignContent: 'center',
                                            alignItems: 'center'}}>
                                <MaterialCommunityIcons name="settings-outline" size={40} color="gray" />
                                <Text
                                    style={{fontSize: 20,
                                            fontWeight: 'bold',
                                            paddingTop: 10,
                                            paddingBottom: 10}}>
                                    Units
                                </Text>
                                <Picker
                                    selectedValue={this.state.userUnits}
                                    style={{width: 150, marginBottom: 30,}}
                                    onValueChange={(itemValue, itemIndex) => {
                                                    storeValue('units', itemValue.toString());
                                                    this.setState({userUnits: itemValue.toString()});
                                                    }}>
                                    <Picker.Item label="metric" value="metric" />
                                    <Picker.Item label="imperial" value="imperial" />
                                </Picker>
                                <Button
                                    onPress={() => {
                                        this.setState({showUnitsSettingsModal: false});
                                    }}
                                    title="OK"
                                    color="blue"
                                />
                            </View>
                            <View style={{  position: 'absolute',
                                            bottom: 50,
                                            alignContent: 'center',
                                            alignItems: 'center'}}>
                                <Button
                                    onPress={() => {
                                        removeItem('showSwipeModalOnDetailsPage');
                                        removeItem('units');
                                        removeItem('expoPushToken');
                                        removeItem('tokenStored');
                                        this.setState({showUnitsSettingsModal: false});
                                    }}
                                    title="Clear All Settings"
                                    color="blue"
                                />
                            </View>
                        </View>
                </Modal>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{fontSize: 20, textAlign: 'center', marginBottom: 10, fontWeight: 'bold',}}>
                        {weatherTitle}
                    </Text>
                    <TouchableOpacity onPress={() => {this.setState({showUnitsSettingsModal: true});}}>
                        <MaterialCommunityIcons name="settings-outline" size={24} color="gray" />
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection: 'row', }}>
                    <Image style={{width: imageWidth.toString() + '%', }} source={{uri: `${imageURL}`}} resizeMethod = 'resize' resizeMode='contain'/>
                    {(this.state.weatherData.info) ?
                        (<View style={{width: (100 - imageWidth).toString() + '%', }}>
                            <Text style={{margin: 'auto',}}>{this.state.weatherData.info}</Text>
                        </View>)
                    :
                        (<View style={{width: (100 - imageWidth).toString() + '%', flexDirection: 'row', alignItems: 'center'}}>
                            <View style={{width: (100 - (imageWidth / (1 - (imageWidth / 100)))).toString() + '%', alignItems: 'center'}}>
                                <View style={{flexDirection: 'row', }}>
                                    <MaterialCommunityIcons name="weather-windy" size={24} color="black" />
                                    <Text style={{fontSize: 20, paddingLeft: 10 }}>{windString}</Text>
                                </View>
                                <Text>{'Pressure: ' + pressureString}</Text>
                                <Text>{'Humidity: ' + this.state.weatherData.data.humidity + '%'}</Text>
                            </View>
                            <View style={{  width: (imageWidth / (1 - (imageWidth / 100))).toString() + '%',
                                            alignSelf: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center'}}>
                                <Text style={{  fontSize: tempTextSize,
                                                fontWeight: 'bold',
                                                padding: 10,
                                                textAlign: 'center',
                                                textAlignVertical: 'center',
                                                fontFamily: tempTextFont,}}>
                                    {(Math.round(temperature)) + '\u00b0'}
                                </Text>
                            </View>
                        </View>)
                    }
                </View>
                {!(this.state.weatherData.info) && <TouchableOpacity onPress={() => {Linking.openURL('https://openweathermap.org');}}>
                                                        <Text style={{width: '100%', fontSize: 12, textAlign: 'center', marginTop: 10, color: 'blue', textDecorationLine: 'underline'}} >openweathermap.org</Text>
                                                    </TouchableOpacity>}
            </View>
        )
    }
}

function DetailsContainer ({launchItem}) {
    let missionType: string = '';
    let missionName: string = '';
    for (const val of launchItem.missions) {
        missionType = missionType + val.typeName + ', ';
        missionName = missionName + val.name + ' | ';
    }
    missionType = missionType.slice(0, missionType.length - 2);
    missionName = missionName.slice(0, missionName.length - 3);
    
    return (
        <View style={[styles.detailContainerStyle, {
                                                        flex: 1,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }]}>
            <Text style={{paddingTop: 10, paddingBottom: 0}}>{'Mission'}</Text>
            <Text style={[styles.missionDetailsText, {fontWeight: 'bold',}]}>{missionName}</Text>
            <Text style={{paddingTop: 10, paddingBottom: 0}}>{'Type'}</Text>
            <Text style={[styles.missionDetailsText, {color: 'orange', fontWeight: 'bold',}]}>{missionType}</Text>
            <Text style={{paddingTop: 10, paddingBottom: 0}}>{'Agency'}</Text>
            <Text style={[styles.missionDetailsText, {fontWeight: 'bold',}]}>{(launchItem.lsp) ? launchItem.lsp.name : launchItem.rocket.agencies[0].name}</Text>
            <View style={[{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }]}>
                <TouchableOpacity style={{padding: 3}} onPress={() => {Linking.openURL((launchItem.lsp) ? launchItem.lsp.wikiURL : launchItem.rocket.agencies[0].wikiURL);}}>
                    <FontAwesome name="wikipedia-w" size={20} color="black" />
                </TouchableOpacity>
                {(launchItem.vidURLs[0]) && <View style={{width: 20}}/>}
                {(launchItem.vidURLs[0]) && <TouchableOpacity onPress={() => {Linking.openURL(launchItem.vidURLs[0]);}}><MaterialIcons name="live-tv" size={32} color="black" /></TouchableOpacity>}
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 10, paddingBottom: 10,}}>
                <SimpleLineIcons style={{paddingRight: 10,}} name="location-pin" size={32} color="black" />
                <Text style={[styles.missionDetailsText, {width: '80%'}]}>{launchItem.location.pads[0].name + ", " + launchItem.location.name}</Text>
            </View>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 10, paddingBottom: 10, width: '100%'}}>
                <SimpleLineIcons name="rocket" size={24} color="black" />
                <Text style={[styles.missionDetailsText, {fontWeight: 'bold', maxWidth: '60%', paddingLeft: 10, paddingRight: 10,}]}>{launchItem.rocket.name}</Text>
                <TouchableOpacity style={{padding: 3}} onPress={() => {Linking.openURL(launchItem.rocket.wikiURL);}}>
                    <FontAwesome name="wikipedia-w" size={20} color="black" />
                </TouchableOpacity>
            </View>
        </View>
        )
  }

function ShowImage ({launchItem}) {
    const imageURL = (launchItem.rocket.imageURL && !(launchItem.rocket.imageURL.includes('placeholder'))) ? // The existance of the word 'placeholder' may change in the future. It is wise to have database of your own pictures.
                                      launchItem.rocket.imageURL
                                      : 
                                      "https://versxplorer.com/Images/versXplorerLogo_square_indigo.png";
    //const localImage = './assets/versXplorerLogo_square_indigo.png';
    const [imageAspectRatio, setIAR] = useState(1);

    useEffect(() => {
        Image.getSize(imageURL, (width, height) => {setIAR(width / height)}, () => {setIAR(1)});
    })
    
    if (launchItem.rocket.imageURL && !(launchItem.rocket.imageURL.includes('placeholder')) && (launchItem.rocket.imageURL.includes('https'))) {
      return (<Image style={[styles.imageStyle, {aspectRatio: imageAspectRatio}]} source={{uri: `${imageURL}`}} resizeMethod = 'resize' resizeMode='contain'/>)
    } else {
      return (<View></View>)
    }
  }

function ImageDetailsContainer ({launchItem}) {

    function onOrientationChange() {
        const windowWidth = Dimensions.get('window').width;
        const windowHeight = Dimensions.get('window').height;
        if (windowWidth > windowHeight) {
            setFlexDir(0);
            //imageWidth set to !=0 only if there specific image to show. Otherwise image container should not take up any space.
            if (launchItem.rocket.imageURL && !(launchItem.rocket.imageURL.includes('placeholder')) && (launchItem.rocket.imageURL.includes('https'))) {
                setImageWidth(30);
            } else {
                setImageWidth(0);
            }
        } else {
            setFlexDir(2);
            setImageWidth(100);
        }
    }
    
    type flexDirType = "row" | "row-reverse" | "column" | "column-reverse"
    const flexDirections: Array<flexDirType> = ['row', 'row-reverse', 'column', 'column-reverse'];
    const [flexDir, setFlexDir] = useState(2);
    const [imageWidth, setImageWidth] = useState(100);
    
    return (
        <View style={{flexDirection: flexDirections[flexDir], justifyContent: 'center', padding: 10, }}>
            <View style={{width: imageWidth.toString() + '%'}} onLayout={() => {onOrientationChange()}}>
                <ShowImage launchItem = {launchItem}/>
            </View>
            <View style={{width: (imageWidth != 100) ? (100 - imageWidth).toString() + '%' : '100%'}}>
                <DetailsContainer launchItem = {launchItem}/>
            </View>
        </View>
    )

}

interface ICtDwnProps {
    windowStart: Date;
}

interface ICtDwnValues {
    days: number;
    hours: number;
    mins: number;
    secs: number;
}

function Countdown (props: ICtDwnProps) {

    const initialCtDwnValues: ICtDwnValues = setCtDwn();
    const [ctDwnValues, setCtDwnValues] = useState(initialCtDwnValues)
    
    useEffect(() => {
        setCtDwn;
        let timerID = setInterval(intervalFunction, 1000);
        return () => {
            clearInterval(timerID);
        };
      });

    function intervalFunction() {
        setCtDwnValues(setCtDwn); // Had to setup this function because this line was not working inside setInterval()
    }

    function setCtDwn () {
        const miliSecDiff = (new Date(props.windowStart)).getTime() - (new Date()).getTime();
        const days = Math.floor(miliSecDiff/1000/60/60/24);
        const hours = Math.floor(miliSecDiff/1000/60/60) - (days * 24);
        const mins = Math.floor(miliSecDiff/1000/60) - (days * 24 * 60) - (hours * 60);
        const secs = Math.floor(miliSecDiff/1000) - (days * 24 * 60 * 60) - (hours * 60 * 60) - (mins * 60);
        return {days, hours, mins, secs};
    }

    return(
        <View style={styles.countDownRows}>
            <View style={styles.countDownColumns}>
                <Text style={[styles.countDownItems, styles.countDownText]}>DAYS</Text>
                <Text style={[styles.countDownItems, styles.countDownNumbers]}>{ctDwnValues.days}</Text>
            </View>
            <View>
                <Text style={[styles.countDownNumbers]}>:</Text>
                <Text></Text>
            </View>
            <View style={styles.countDownColumns}>
                <Text style={[styles.countDownItems, styles.countDownText]}>HOURS</Text>
                <Text style={[styles.countDownItems, styles.countDownNumbers]}>{ctDwnValues.hours}</Text>
            </View>
            <View>
                <Text style={styles.countDownNumbers}>:</Text>
                <Text></Text>
            </View>
            <View style={styles.countDownColumns}>
                <Text style={[styles.countDownItems, styles.countDownText]}>MINS</Text>
                <Text style={[styles.countDownItems, styles.countDownNumbers]}>{ctDwnValues.mins}</Text>
            </View>
            <View>
                <Text style={styles.countDownNumbers}>:</Text>
                <Text></Text>
            </View>
            <View style={styles.countDownColumns}>
                <Text style={[styles.countDownItems, styles.countDownText]}>SECS</Text>
                <Text style={[styles.countDownItems, styles.countDownNumbers]}>{ctDwnValues.secs}</Text>
            </View>
        </View>
    )

}

export function LaunchDetails ({navigation, route}) {

    const LaunchCtx: ILaunchContext = useContext(LaunchContext);

    const { index } = route.params;
    const { direction }  = route.params;
    const detailsIndex: number = parseInt(JSON.stringify(index));

    // Calculation of the previous and next index for pan gesture to work. Excludes past launches if any
    // (sometimes Lounch library API returns past launches from the very recent past, like couple of hours ago)
    /* const nextLaunchDate: Date = new Date (LaunchData.launches[(detailsIndex + 1) % (LaunchData.launches.length)].windowstart);
    const previousLaunchDate: Date = new Date (LaunchData.launches[((detailsIndex - 1) < 0) ? (LaunchData.launches.length - 1) : (detailsIndex - 1)].windowstart);
    const today: Date = new Date();
    let nextIndex: number = (detailsIndex + 1) % (LaunchData.launches.length);
    while (today > nextLaunchDate) {
        nextIndex = (nextIndex + 1) % (LaunchData.launches.length);
    }
    let previousIndex: number = (((detailsIndex - 1) < 0) || (today > previousLaunchDate)) ? (LaunchData.launches.length - 1) : (detailsIndex - 1); */

    let nextIndex: number = (detailsIndex + 1) % (LaunchCtx.launchData.launches.length);
    let previousIndex: number = ((detailsIndex - 1) < 0) ? (LaunchCtx.launchData.launches.length - 1) : (detailsIndex - 1);
    
    let swipeDirection: number = 1;
    if (direction) {
        swipeDirection = parseInt(JSON.stringify(direction));
    }

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const swipe = new Animated.Value(swipeDirection * windowWidth);
    const animBorder = new Animated.Value(1);

    const [showSwipeInstructionsModal, setSwipeInstructionsModalState] = useState(false);

    // Swipe animation
    useLayoutEffect(() => {
        Animated.sequence([
            Animated.timing(swipe,
                {toValue: 0.5,
                  isInteraction: false,
                duration: 300,
                useNativeDriver: false}),
            Animated.timing(animBorder,
                {toValue: 0,
                    isInteraction: false,
                duration: 1,
                useNativeDriver: false})
        ]).start();
      });

      // Checks done on Component Did Mount event
      useEffect(() => {
        
        // Check should Instructions Modal be visible or not
        async function readStoredModalVisibilityData(key) {
            const flagStr = await getStoredValue(key);
            if (flagStr !== 'false') {
                setSwipeInstructionsModalState(true);
            }
        }
        readStoredModalVisibilityData('showSwipeModalOnDetailsPage');

      });

    const [scrollEnabler, setScrollEnabler] = useState(true);

    const pan = useRef(new Animated.ValueXY()).current;
  
    const panResponder = useRef(
        PanResponder.create({
            /* onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) =>
                true, */
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                setScrollEnabler(false);
                /* if (pan._value > 50) {
                    navigation.push('Details', {index: previousIndex, direction: -1});
                } else if (pan._value < -50) {
                    navigation.push('Details', {index: nextIndex, direction: 1});
                } */
                return true;
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) =>
                true,
            onPanResponderGrant: () => {
            },
            onPanResponderMove: Animated.event(
                [
                    null,
                    { dx: pan.x, dy: pan.y }
                ]
            ),
            /* onPanResponderTerminationRequest: (evt, gestureState) => true, */
            onPanResponderEnd: () => {
                if (pan.x._value > 50) {
                    navigation.push('Details', {index: previousIndex, direction: -1});
                } else if (pan.x._value < -50) {
                    navigation.push('Details', {index: nextIndex, direction: 1});
                }
                setScrollEnabler(true);
            },
            /* onShouldBlockNativeResponder: (evt, gestureState) => {
                // Returns whether this component should block native components from becoming the JS
                // responder. Returns true by default. Is currently only supported on android.
                return true;
            }, */
        })
    ).current;
    
    if ('info' in LaunchCtx.launchData) {
          return(
              <Text>{LaunchCtx.launchData.info}</Text>
          )
        } else if (!(LaunchCtx.launchData)) {
          return(
              <Text>No Data</Text>
          )
        } else {
            const localImage = './assets/versXplorerLogo_square_indigo.png';
            navigation.setOptions({ title: LaunchCtx.launchData.launches[detailsIndex].name,
                                    headerLeft: () => (
                                        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                                            <View style={{paddingLeft: 20, height: '100%', paddingTop: '10%'}}>
                                                <Image style={{
                                                        height: '80%',
                                                        minHeight: 20,
                                                        width: 20,
                                                        }}
                                                        source={require(`${localImage}`)}
                                                        resizeMethod = 'resize'
                                                        resizeMode='cover'/>
                                            </View>
                                        </TouchableOpacity>
                                    ),
                                    });
            let launchDescription: string = '';
            for (const val of LaunchCtx.launchData.launches[detailsIndex].missions) {
                launchDescription = launchDescription + val.description + ' ';
            }
            const d = new Date(LaunchCtx.launchData.launches[detailsIndex].windowstart);
            const weatherDate: string = (d.toISOString()).slice(0, 10);
            let weatherHourN: number = parseInt((d.toISOString()).slice(11, 13)) - (parseInt((d.toISOString()).slice(11, 13)) % 3);
            let weatherHour: string = weatherHourN.toString();
            if (weatherHourN < 10) {weatherHour = '0' + weatherHour}
            const weatherTimeInterval: string = weatherDate + ' ' + weatherHour + ':00:00';
            const weatherInput: IWeatherInput = {
                padId: LaunchCtx.launchData.launches[detailsIndex].location.pads[0].id,
                windowstart: LaunchCtx.launchData.launches[detailsIndex].windowstart,
                weatherTimeInterval: weatherTimeInterval
            }
            return (
                <View style={styles.container}>
                    <SafeAreaConsumer>{insets => 
                            <Animated.ScrollView style={[
                                { paddingRight: insets.right + paddingCorrection,
                                    paddingLeft: insets.left + paddingCorrection,
                                    flex: 1, flexDirection: 'column',
                                    width: '100%', 
                                    left: swipe, 
                                    borderLeftColor: 'black', 
                                    borderRightColor: 'black', 
                                    borderLeftWidth: animBorder, 
                                    borderRightWidth: animBorder
                                    }]} 
                                {...panResponder.panHandlers}
                                scrollEnabled={scrollEnabler}
                                disableScrollViewPanResponder={false}>
                                <Modal
                                    visible={showSwipeInstructionsModal}
                                    transparent={true}>
                                    <View style={{  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    width: '100%',
                                                    height: '100%',
                                                    flexDirection: "column",
                                                    alignItems: 'center',
                                                    paddingTop: '40%'
                                                    }}>
                                        <Text style={{  fontSize: 20,
                                                        fontWeight: 'bold',
                                                        textAlign: 'center',
                                                        paddingTop: 10,
                                                        paddingBottom: 5}}>Instructions:</Text>
                                        <Text style={{  textAlign: 'center',
                                                        paddingTop: 5,
                                                        paddingBottom: 5}}>Swipe left or right to browse through the launches</Text>
                                        <MaterialCommunityIcons style={{paddingTop: 20, paddingBottom: 30}} name="gesture-swipe-horizontal" size={100} color="black" />
                                        <Button
                                            onPress={() => {
                                                setSwipeInstructionsModalState(false);
                                                storeValue('showSwipeModalOnDetailsPage', 'false');
                                            }}
                                            title="Got It"
                                            color="blue"
                                        />
                                    </View>
                                </Modal>
                                <Text style={styles.title}>{LaunchCtx.launchData.launches[detailsIndex].name}</Text>
                                <Text style={styles.date}>{(new Date(LaunchCtx.launchData.launches[detailsIndex].windowstart)).toString()}</Text>
                                <Text style={styles.detailContainerStyle}>{launchDescription}</Text>
                                <Countdown windowStart = {LaunchCtx.launchData.launches[detailsIndex].windowstart}/>
                                <ImageDetailsContainer launchItem = {LaunchCtx.launchData.launches[detailsIndex]}/>
                                <WeatherContainer weatherInput = {weatherInput}/>
                                <ShowMap launchItem = {LaunchCtx.launchData.launches[detailsIndex]}/>
                                <View style={{height: insets.bottom,}}></View>
                            </Animated.ScrollView>}
                    </SafeAreaConsumer>
                </View>
            );
        }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    countDownNumbers: {
        color: 'darkblue',
        fontSize: 25,
      },    
    countDownText: {
        fontSize: 7,
      },    
    countDownRows: {
        textAlign: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 5,
        paddingBottom: 5,
    },
    countDownItems: {
        textAlign: 'center',
        paddingLeft: 5,
        paddingRight: 5,
    },
    countDownColumns: {
        width: '15%',
        paddingBottom: 10,
    },
    title: {
        textAlign: 'center',
        fontSize: 25,
        fontWeight: 'bold',
        paddingTop: 10,
        paddingBottom: 5,
    },
    date: {
        textAlign: 'center',
        color: 'darkblue',
        fontSize: 15,
        fontWeight: 'bold',paddingTop: 10,
        paddingBottom: 5,
    },
    detailContainerStyle: {
        padding: 10,
    },
    missionDetailsText: {
        paddingTop: 5,
        paddingBottom: 5,
        fontSize: 15,
    },
    imageStyle: {
        /* height: 800, */
        /* minHeight: 100, */
        width: "100%",
        borderRadius: 10,
        backgroundColor: 'lightgray',
        padding: 10,
    },
});