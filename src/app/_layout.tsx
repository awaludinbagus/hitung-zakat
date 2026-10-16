import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Brand } from '@/constants/theme';
import { SettingsProvider } from '@/lib/settings';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: Brand.green,
      background: baseTheme.colors.background,
    },
  };

  return (
    <ThemeProvider value={theme}>
      <SettingsProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="kalkulator/[jenis]" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </SettingsProvider>
    </ThemeProvider>
  );
}
