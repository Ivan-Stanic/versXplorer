import React, { useRef, useContext, useLayoutEffect, useEffect, useState } from 'react';
import {LaunchContext} from './App';
import { StyleSheet, View, Image, Text, PanResponder, Animated, TouchableOpacity, Dimensions, ScrollView, Button, Alert, Linking } from 'react-native'
import {askForData} from './askingForData';
import {IWeatherData} from './Interfaces';
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import { paddingCorrection } from './Constants';
import { FontAwesome, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { TransitionPresets } from '@react-navigation/stack';

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
                      padId: 9999
        };
        this.fetchData = this.fetchData.bind(this);
    }
    
    public componentDidMount() {
        this.fetchData();
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
    
    render() {
        let imageURL: string = 'https://openweathermap.org/img/wn/02d.png';
        let windDirections: Array<string> = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N']
        let windString: string = 'none';
        if (!('info' in this.state.weatherData)) {
            imageURL = 'https://openweathermap.org/img/wn/' + this.state.weatherData.data.icon + '.png';
            if (this.state.weatherData.data.windSpeed) {
                windString = 'Wind: ' +  this.state.weatherData.data.windSpeed + ' m/s';
                if (this.state.weatherData.data.windDirection) {
                    windString = windString + "  " + windDirections[Math.floor(((this.state.weatherData.data.windDirection % 360) + 11.25)/22.5)];
                }
            }
        }
        return(
            <View >
                <Image style={[styles.imageStyle]} source={{uri: `${imageURL}`}} resizeMethod = 'resize' resizeMode='contain'/>
                    {(this.state.weatherData.info) ?
                        (<View>
                            <Text style={{margin: 'auto'}}>{this.state.weatherData.info}</Text>
                        </View>)
                    :
                        (<View>
                            <Text>{((this.state.weatherData.data.description).slice(0, 1)).toUpperCase() + (this.state.weatherData.data.description.slice(1))}</Text>
                            <Text>{'Temperature: ' + (Math.round(this.state.weatherData.data.temp - 273.15)) + ' C'}</Text>
                            <Text>{'Pressure: ' + this.state.weatherData.data.pressure + ' hPa(mbar)'}</Text>
                            <Text>{'Humidity: ' + this.state.weatherData.data.humidity + '%'}</Text>
                            <Text>{windString}</Text>
                            {!(this.state.weatherData.info) && <Text style={{position: 'relative', bottom: 0}} >Weather data by openweathermap.org</Text>}
                        </View>)
                    }
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
            <Text style={[styles.missionDetailsText, {color: 'orange', fontWeight: 'bold',}]}>{missionType}</Text>
            <Text style={{paddingTop: 10, paddingBottom: 0}}>{'Agency'}</Text>
            <Text style={[styles.missionDetailsText, {fontWeight: 'bold',}]}>{launchItem.lsp.name}</Text>
            <View style={[{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }]}>
                <TouchableOpacity style={{borderWidth: 1, borderRadius: 3, borderColor: 'blue', padding: 3}} onPress={() => {Linking.openURL(launchItem.lsp.wikiURL);}}>
                    <FontAwesome name="wikipedia-w" size={20} color="blue" />
                </TouchableOpacity>
                {(launchItem.vidURLs[0]) && <View style={{width: 20}}/>}
                {(launchItem.vidURLs[0]) && <TouchableOpacity onPress={() => {Linking.openURL(launchItem.vidURLs[0]);}}><MaterialIcons name="live-tv" size={32} color="blue" /></TouchableOpacity>}
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 10, paddingBottom: 10,}}>
                <SimpleLineIcons style={{paddingRight: 10,}} name="location-pin" size={32} color="black" />
                <Text style={[styles.missionDetailsText, {width: '80%'}]}>{launchItem.location.pads[0].name + ", " + launchItem.location.name}</Text>
            </View>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 10, paddingBottom: 10, width: '100%'}}>
                <SimpleLineIcons name="rocket" size={24} color="black" />
                <Text style={[styles.missionDetailsText, {fontWeight: 'bold', maxWidth: '60%', paddingLeft: 10, paddingRight: 10,}]}>{launchItem.rocket.name}</Text>
                <TouchableOpacity style={{borderWidth: 1, borderRadius: 3, borderColor: 'blue', padding: 3}} onPress={() => {Linking.openURL(launchItem.rocket.wikiURL);}}>
                    <FontAwesome name="wikipedia-w" size={20} color="blue" />
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
        Image.getSize(imageURL, (width, height) => {setIAR(imageAspectRatio => imageAspectRatio = width / height)}, () => {setIAR(imageAspectRatio => imageAspectRatio = 1)});
    })
    
    if (launchItem.rocket.imageURL && !(launchItem.rocket.imageURL.includes('placeholder'))) {
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
            if (launchItem.rocket.imageURL && !(launchItem.rocket.imageURL.includes('placeholder'))) {
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

    const LaunchData = useContext(LaunchContext);

    const { index } = route.params;
    const { direction }  = route.params;
    const detailsIndex: number = parseInt(JSON.stringify(index));

    let nextIndex: number = (detailsIndex + 1) % (LaunchData.launches.length);
    let previousIndex: number = ((detailsIndex - 1) < 0) ? (LaunchData.launches.length - 1) : (detailsIndex - 1);
    
    let swipeDirection: number = 1;
    if (direction) {
        swipeDirection = parseInt(JSON.stringify(direction));
    }

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const swipe = new Animated.Value(swipeDirection * windowWidth);
    const animBorder = new Animated.Value(1);

    useLayoutEffect(() => {
        Animated.sequence([
            Animated.timing(swipe,
                {toValue: 0.5,
                  isInteraction: false,
                duration: 300,}),
            Animated.timing(animBorder,
                {toValue: 0,
                    isInteraction: false,
                duration: 1,})
        ]).start()
      });

    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                /* pan.setOffset({
                    x: pan.x._value,
                    y: pan.y._value
                  }); */
            },
            onPanResponderMove: Animated.event(
                [
                    null,
                    { dx: pan.x, dy: pan.y }
                ]
            ),
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: () => {
                if (pan.x._value > 50) {
                    navigation.push('Details', {index: previousIndex, direction: -1});
                } else if (pan.x._value < -50) {
                    navigation.push('Details', {index: nextIndex, direction: 1});
                }
                /* pan.flattenOffset(); */
            }
        })
    ).current;

    if ('info' in LaunchData) {
          return(
              <Text>{LaunchData.info}</Text>
          )
        } else if (!(LaunchData)) {
          return(
              <Text>No Data</Text>
          )
        } else {
            const localImage = './assets/versXplorerLogo_square_indigo.png';
            navigation.setOptions({ title: LaunchData.launches[detailsIndex].name,
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
            for (const val of LaunchData.launches[detailsIndex].missions) {
                launchDescription = launchDescription + val.description + ' ';
            }
            const d = new Date(LaunchData.launches[detailsIndex].windowstart);
            const weatherDate: string = (d.toISOString()).slice(0, 10);
            let weatherHourN: number = parseInt((d.toISOString()).slice(11, 13)) - (parseInt((d.toISOString()).slice(11, 13)) % 3);
            let weatherHour: string = weatherHourN.toString();
            if (weatherHourN < 10) {weatherHour = '0' + weatherHour}
            const weatherTimeInterval: string = weatherDate + ' ' + weatherHour + ':00:00';
            const weatherInput: IWeatherInput = {
                padId: LaunchData.launches[detailsIndex].location.pads[0].id,
                windowstart: LaunchData.launches[detailsIndex].windowstart,
                weatherTimeInterval: weatherTimeInterval
            }
            return (
                <View style={styles.container}>
                    <SafeAreaConsumer>{insets => 
                        <Animated.View
                            style={[{flex: 1,
                                    width: '100%', 
                                    left: swipe, 
                                    borderLeftColor: 'black', 
                                    borderRightColor: 'black', 
                                    borderLeftWidth: animBorder, 
                                    borderRightWidth: animBorder}]}>
                            <ScrollView style={[
                                { paddingRight: insets.right + paddingCorrection,
                                    paddingLeft: insets.left + paddingCorrection,
                                    flex: 1, flexDirection: 'column'}]} 
                                    {...panResponder.panHandlers}>
                                <Text style={styles.title}>{LaunchData.launches[detailsIndex].name}</Text>
                                <Text style={styles.date}>{(new Date(LaunchData.launches[detailsIndex].windowstart)).toString()}</Text>
                                <Text style={styles.detailContainerStyle}>{launchDescription}</Text>
                                <Countdown windowStart = {LaunchData.launches[detailsIndex].windowstart}/>
                                <ImageDetailsContainer launchItem = {LaunchData.launches[detailsIndex]}/>
                                <WeatherContainer weatherInput = {weatherInput}/>
                                <View style={{height: insets.bottom,}}></View>
                            </ScrollView>
                        </Animated.View>}
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