// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

import { useColorScheme } from "@/hooks/use-color-scheme";

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
      <Stack screenOptions={{ headerShown: false }}>
        {/* Welcome / entry */}
        <Stack.Screen name="index" />

        {/* Main app tabs */}
        <Stack.Screen name="(tabs)" />

        {/* Modal */}
        <Stack.Screen name="confirm" options={{ presentation: "modal" }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}