// components/ThemedButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ViewStyle, TextStyle } from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

type ThemedButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
};

export const ThemedButton = ({ title, onPress, containerStyle, textStyle }: ThemedButtonProps) => {
  const { isDarkMode } = useContext(ThemeContext);


  const buttonStyles = StyleSheet.create({
    button: {
      backgroundColor: isDarkMode ? 'yellow' : 'lightblue',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: isDarkMode ? 'black' : 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <TouchableOpacity style={[buttonStyles.button, containerStyle]} onPress={onPress}>
      <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};
