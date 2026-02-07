// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Text } from 'react-native';  // ← Add this import
import React from 'react';
import { Ionicons } from '@expo/vector-icons'; // <--- Standard Icons, no custom component needed

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0a7ea4', // Blue color for active tab
      }}>
      
      {/* Tab 1: Home/Fridge */}
      <Tabs.Screen
        name="index" // Matches index.tsx
        options={{
          title: 'Fridge',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
        }}
      />

      {/* Tab 2: Camera */}
      <Tabs.Screen
        name="camera" // Matches camera.tsx
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="camera" color={color} />,
        }}
      />

      {/* Tab 3: Recipes */}
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Cook',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="restaurant" color={color} />,
        }}
      />
      <Tabs.Screen 
        name="test" 
        options={{ 
          title: "Tests",
          tabBarIcon: ({ color }) => <Text>🧪</Text>
        }} 
      />
    </Tabs>
  );
}