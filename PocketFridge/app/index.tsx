// app/index.tsx
import React from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

// SVG as a React component (requires react-native-svg + react-native-svg-transformer)
import ArrowForward from "../assets/icons/arrow_forward.svg";

function gradientPointsFromAngle(deg: number) {
  const rad = (deg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);

  return {
    start: { x: clamp01(0.5 - dx / 2), y: clamp01(0.5 - dy / 2) },
    end: { x: clamp01(0.5 + dx / 2), y: clamp01(0.5 + dy / 2) },
  };
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export default function Welcome() {
  const router = useRouter();
  const { start, end } = gradientPointsFromAngle(156);

  return (
    <LinearGradient
      // flipped gradient (swap colors)
      colors={["#F9FF83", "#1A7900"]}
      start={start}
      end={end}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Pocket Fridge</Text>

          <Pressable
            onPress={() => router.replace("/(tabs)")}
            accessibilityRole="button"
            accessibilityLabel="Continue"
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <ArrowForward width={22} height={22} fill="#FCFEEF" />
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 22,
  },

  title: {
    fontSize: 32,
    lineHeight: 38,
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: -0.3,
    color: "#FCFEEF",
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  button: {
    height: 56,
    minWidth: 120,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#93C247",

    // drop shadow
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    shadowOpacity: 0.15,
    elevation: 4,
  },
});