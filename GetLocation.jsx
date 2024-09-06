import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const GeoFenceShop = () => {
  const [coordinates, setCoordinates] = useState([]);
  const [step, setStep] = useState(1);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs to access your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Location permission denied');
        return false;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getCoordinate = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates((prev) => [...prev, { latitude, longitude }]);
        setStep(step + 1);
      },
      (error) => {
        Alert.alert('Error', 'Could not get location');
        console.log(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handlePress = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;
    if (step <= 4) {
      getCoordinate();
    } else {
      Alert.alert('GeoFence Complete', 'All 4 coordinates have been captured');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Step {step}: Press the button to capture coordinate {step}</Text>
      <Button title="Capture Coordinate" onPress={handlePress} />
      {coordinates.length > 0 && (
        <View style={{ marginTop: 20 }}>
          {coordinates.map((coord, index) => (
            <Text key={index}>
              Coordinate {index + 1}: {coord.latitude}, {coord.longitude}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default GeoFenceShop;
