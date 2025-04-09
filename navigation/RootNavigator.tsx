// navigation/RootNavigator.tsx
import React, { useContext } from 'react';
import { Button } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen'; 
import AddEntryScreen from '../screens/AddEntryScreen'; 
import { ThemeContext } from '../context/ThemeContext';

export type RootStackParamList = {
  Home: undefined;
  AddEntry: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { toggleTheme } = useContext(ThemeContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => <Button title="Toggle Theme" onPress={toggleTheme} />,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Travel Diary' }} />
      <Stack.Screen name="AddEntry" component={AddEntryScreen} options={{ title: 'Add Entry' }} />
    </Stack.Navigator>
  );
}