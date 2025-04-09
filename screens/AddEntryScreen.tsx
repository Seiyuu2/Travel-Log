import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelEntry } from '../types/TravelEntry';
import uuid from 'react-native-uuid';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useNavigation } from '@react-navigation/native';

type AddEntryScreenProp = StackNavigationProp<RootStackParamList, 'AddEntry'>;

export default function AddEntryScreen() {
  const navigation = useNavigation<AddEntryScreenProp>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        Alert.alert('Permission Error', 'Camera permission is required.');
      }

      const locationStatus = await Location.requestForegroundPermissionsAsync();
      if (locationStatus.status !== 'granted') {
        Alert.alert('Permission Error', 'Location permission is required.');
      }

      const { status: notifStatus } = await Notifications.getPermissionsAsync();
      if (notifStatus !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);

  // Take a picture
  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error taking picture: ', error);
    }
  };

  // Get current location and format address
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = locationData.coords;
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocode && geocode.length > 0) {
        const addr = formatAddress(geocode[0], longitude, latitude);
        setAddress(addr);
      }
    } catch (error) {
      console.error('Error fetching location: ', error);
      Alert.alert('Location Error', 'Unable to fetch location.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Format address as (street) (City) (region) (longitude latitude) (Postal code)
  const formatAddress = (loc: Location.LocationGeocodedAddress, longitude: number, latitude: number): string => {
    const street = loc.street ?? 'Unknown Street';
    const city = loc.city ?? 'Unknown City';
    const region = loc.region ?? 'Unknown Region';
    const postalCode = loc.postalCode ?? 'Unknown Postal Code';
    const formattedCoords = `${longitude.toFixed(6)} ${latitude.toFixed(6)}`;
    return `(${street}) (${city}) (${region}) (${formattedCoords}) (${postalCode})`;
  };

  // Save entry to AsyncStorage
  const saveEntry = async () => {
    if (!imageUri) {
      Alert.alert('Validation', 'Please take a picture before saving.');
      return;
    }
    if (!address) {
      Alert.alert('Validation', 'Address is not available yet.');
      return;
    }

    const newEntry: TravelEntry = {
      id: uuid.v4().toString(),
      imageUri,
      address,
      timestamp: Date.now(),
    };

    try {
      const storedEntries = await AsyncStorage.getItem('travelEntries');
      const entries: TravelEntry[] = storedEntries ? JSON.parse(storedEntries) : [];
      const updatedEntries = [newEntry, ...entries];
      await AsyncStorage.setItem('travelEntries', JSON.stringify(updatedEntries));

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Travel Entry Saved!',
          body: 'Your travel entry has been added successfully.',
          sound: 'default',
        },
        trigger: null,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving travel entry: ', error);
      Alert.alert('Save Error', 'Failed to save the travel entry.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Take a Picture" onPress={takePicture} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {locationLoading && <ActivityIndicator size="small" style={{ marginTop: 10 }} />}
      {address ? <Text style={styles.addressText}>Address: {address}</Text> : null}
      <View style={styles.buttonContainer}>
        <Button title="Save Entry" onPress={saveEntry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 300,
    marginVertical: 16,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 10,
  },
});