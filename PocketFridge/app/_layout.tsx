// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

import { FridgeProvider } from '../contexts/FridgeContext'; // Arielle's Brain
import { useColorScheme } from '@/hooks/use-color-scheme';

// Keep splash visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    // NOTE: These paths must match your actual filenames exactly.
    // If you renamed the Helvetica file to remove spaces, update this require accordingly.
    "Helvetica-Light": require("../assets/fonts/HelveticaNeueLT45LightRegular.ttf"),
    "Offbit-DotBold": require("../assets/fonts/OffBit-DotBold.ttf"),
    "Offbit-Regular": require("../assets/fonts/OffBit-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  // Hide splash once fonts are ready
  SplashScreen.hideAsync();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      
      {/* 3. WRAP EVERYTHING IN THE BRAIN */}
      <FridgeProvider>
        <Stack>
          {/* Welcome Screen (Kai's new screen) */}
          <Stack.Screen name="index" options={{ headerShown: false }} />

          {/* Main App Tabs */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Confirm Modal (Your screen) */}
          <Stack.Screen 
            name="confirm" 
            options={{ 
              presentation: "modal", 
              headerShown: false 
            }} 
          />
        </Stack>
        <StatusBar style="auto" />
      </FridgeProvider>
      
    </ThemeProvider>
  );
}