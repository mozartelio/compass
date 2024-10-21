import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, Alert, View} from 'react-native';

import {
    magnetometer,
    setUpdateIntervalForType,
    SensorTypes,
} from 'react-native-sensors';

import LPF from 'lpf';
import RNExitApp from 'react-native-exit-app';
import {LogBox} from 'react-native';

export default function App() {
    LogBox.ignoreLogs(['new NativeEventEmitter']);
    LPF.init([]);
    LPF.smoothing = 0.1;

    const [magnometerState, setMagnometerState] = useState('0');
    const [subscription, setSubscription] = useState(null);

    function angler(magnetometer_y) {
        let ang = 0;
        if (magnetometer_y) {
            let {x, y} = magnetometer_y;
            if (Math.atan2(y, x) >= 0) {
                ang = Math.atan2(y, x) * (180 / Math.PI);
            } else {
                ang = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
            }
        }
        return Math.round(LPF.next(ang));
    }


    const subscribe = async () => {
        setUpdateIntervalForType(SensorTypes.magnetometer, 15);
        setSubscription(
            magnetometer.subscribe((sensorData, error) => {
                setMagnometerState(angler(sensorData));
                console.log(
                    'Data were delivered at ' +
                    new Date(sensorData.timestamp).toLocaleString(),
                );
                if (error !== undefined) {
                    Alert.alert(
                        'Missing magnetometer sensor!',
                        'Your device does not have magnetometer sensor.',
                        [
                            {
                                text: 'Quit',
                                onPress: function () {
                                    RNExitApp.exitApp();
                                },
                            },
                        ],
                    );
                    console.log('The sensor is not available!');
                }
            }),
        );
    };


    // did mount
    useEffect(function () {
        subscribe();
    }, []);


    function degree(magnetometer_x) {
        let degree_val =
            magnetometer_x - 90 >= 0 ? magnetometer_x - 90 : magnetometer_x + 271;
        return degree_val === 360 ? 359 : degree_val;
    }

    return (
        <View>
            <View style={styles.topBar}>
                <Text style={styles.topBarText}>Compass</Text>
            </View>

            <View style={styles.container}>
                <Image
                    style={{
                        width: 340,
                        height: 340,
                        transform: [{rotate: 360 - magnometerState + 'deg'}],
                    }}
                    source={require("./assets/compass.png")}
                />

                <Text style={styles.degreeText}>{degree(magnometerState) + '°'}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        backgroundColor: '#008577',
        height: '10%',
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    container: {
        height: `${100 - 10}%`,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    topBarText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 25,
        marginLeft: 20,
    },
    degreeText: {
        fontSize: 40,
        marginTop: 20,
    },
});
