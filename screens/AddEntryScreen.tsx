// screens/AddEntryScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelEntry } from '../types/TravelEntry';
import uuid from 'react-native-uuid';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useNavigation } from '@react-navigation/native';
import { ThemedButton } from '../components/ThemedButton';

type AddEntryScreenProp = StackNavigationProp<RootStackParamList, 'AddEntry'>;

export default function AddEntryScreen() {
  const navigation = useNavigation<AddEntryScreenProp>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<string>('');
  const [plusCode, setPlusCode] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

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

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = locationData.coords;
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocode && geocode.length > 0) {
        const { coordinates, plusCode, address } = formatAddress(geocode[0], longitude, latitude);
        setCoordinates(coordinates);
        setPlusCode(plusCode);
        setAddress(address);
      }
    } catch (error) {
      console.error('Error fetching location: ', error);
      Alert.alert('Location Error', 'Unable to fetch location.');
    } finally {
      setLocationLoading(false);
    }
  };

  const formatAddress = (
    loc: Location.LocationGeocodedAddress,
    longitude: number,
    latitude: number
  ): { coordinates: string; plusCode: string; address: string } => {
    const street = loc.street ?? '';
    const city = loc.city ?? '';
    const region = loc.region ?? '';
    const postalCode = loc.postalCode ?? '';
    const name = loc.name ?? '';

    const plusCode = name.includes('+') ? name : '';
    const addressParts = [street, city, region, postalCode].filter(
      part => part !== '' && part !== plusCode
    );
    const address = addressParts.join(', ');
    const coordinates = `(${longitude.toFixed(6)}, ${latitude.toFixed(6)})`;

    return { coordinates, plusCode, address };
  };

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
      coordinates,
      plusCode,
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
      <ThemedButton title="Take a Picture" onPress={takePicture} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {locationLoading && <ActivityIndicator size="small" style={{ marginTop: 10 }} />}
      {coordinates !== '' && <Text style={styles.coordinatesText}>Coordinates: {coordinates}</Text>}
      {plusCode !== '' && <Text style={styles.plusCodeText}>Plus Code: {plusCode}</Text>}
      {address ? <Text style={styles.addressText}>Address: {address}</Text> : null}
      <View style={styles.buttonContainer}>
        <ThemedButton title="Save Entry" onPress={saveEntry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  image: { width: '100%', height: 300, marginVertical: 16, borderRadius: 8 },
  coordinatesText: { fontSize: 14, color: '#666', marginBottom: 5 },
  plusCodeText: { fontSize: 14, color: '#666', marginBottom: 5 },
  addressText: { fontSize: 16, color: '#333', marginBottom: 20 },
  buttonContainer: { marginTop: 10 },
});
