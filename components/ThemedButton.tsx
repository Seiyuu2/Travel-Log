import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ViewStyle, TextStyle } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

type ThemedButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
};

export const ThemedButton = ({ title, onPress, containerStyle, textStyle }: ThemedButtonProps) => {
  const { isDarkMode } = useContext(ThemeContext);

  const baseButtonStyle: ViewStyle = {
    backgroundColor: isDarkMode ? 'yellow' : 'lightblue',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const baseTextStyle: TextStyle = {
    color: isDarkMode ? 'black' : 'white',
    fontSize: 16,
    fontWeight: 'bold',
  };

  return (
    <TouchableOpacity style={[baseButtonStyle, containerStyle]} onPress={onPress}>
      <Text style={[baseTextStyle, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};
