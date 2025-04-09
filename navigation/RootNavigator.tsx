// navigation/RootNavigator.tsx
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AddEntryScreen from '../screens/AddEntryScreen';
import { ThemeContext } from '../context/ThemeContext';
import { ThemedButton } from '../components/ThemedButton';

export type RootStackParamList = {
  Home: undefined;
  AddEntry: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { toggleTheme, isDarkMode } = useContext(ThemeContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => (
          // For header we override the default background by setting it transparent.
          <ThemedButton 
            title="Change Theme" 
            onPress={toggleTheme} 
            containerStyle={styles.headerButton} 
            textStyle={{ color: isDarkMode ? 'yellow' : 'black', fontSize: 16 }}
          />
        ),
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Travel Diary' }} />
      <Stack.Screen name="AddEntry" component={AddEntryScreen} options={{ title: 'Add Entry' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    backgroundColor: 'transparent',
    marginRight: 10,
  },
});
