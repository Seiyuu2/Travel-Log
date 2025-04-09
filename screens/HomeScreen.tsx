// screens/HomeScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelEntry } from '../types/TravelEntry';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ThemedButton } from '../components/ThemedButton';

type HomeScreenProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const navigation = useNavigation<HomeScreenProp>();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const storedEntries = await AsyncStorage.getItem('travelEntries');
          if (storedEntries) {
            setEntries(JSON.parse(storedEntries));
          } else {
            setEntries([]);
          }
        } catch (error) {
          console.error('Error loading travel entries: ', error);
        }
      })();
    }, [])
  );

  const removeEntry = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this entry?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Remove',
        onPress: async () => {
          try {
            const updatedEntries = entries.filter((entry) => entry.id !== id);
            await AsyncStorage.setItem('travelEntries', JSON.stringify(updatedEntries));
            setEntries(updatedEntries);
          } catch (error) {
            console.error('Error removing entry: ', error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const renderItem = ({ item }: { item: TravelEntry }) => (
    <View style={styles.entryContainer}>
      <Image source={{ uri: item.imageUri }} style={styles.entryImage} />
      <View style={styles.entryDetails}>
        {item.coordinates && (
          <Text style={styles.entryCoordinates}>
            Coordinates: {item.coordinates}
          </Text>
        )}
        {item.plusCode && (
          <Text style={styles.entryPlusCode}>Plus Code: {item.plusCode}</Text>
        )}
        <Text style={styles.entryAddress}>Address: {item.address}</Text>
        <Text style={styles.entryTimestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeEntry(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedButton
        title="Add New Entry"
        onPress={() => navigation.navigate('AddEntry')}
      />
      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Entries yet</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
  },
  listContent: {
    marginTop: 16,
  },
  entryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    marginBottom: 12,
    borderRadius: 8,
    padding: 10,
  },
  entryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  entryDetails: {
    flex: 1,
    marginLeft: 10,
  },
  entryCoordinates: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  entryPlusCode: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  entryAddress: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  entryTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  removeButton: {
    backgroundColor: '#ff6666',
    padding: 8,
    borderRadius: 8,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
