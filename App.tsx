// App.tsx
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AppContainer />
    </ThemeProvider>
  );
}

function AppContainer() {
  const { theme } = useContext(ThemeContext);
  return (
    <NavigationContainer theme={theme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
