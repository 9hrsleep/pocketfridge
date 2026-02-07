// app/index.tsx
import React from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

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
      colors={["#F9FF83", "#1A7900"]}
      start={start}
      end={end}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleWrapper}>
            <Text style={styles.welcomeTo}>Welcome to</Text>
            <Text style={styles.title}>Pocket Fridge</Text>
          </View>

          {/* Continue Button */}
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
    gap: 28,
  },

  titleWrapper: {
    alignItems: "center",
  },

  welcomeTo: {
    fontFamily: "Offbit-Regular",
    fontSize: 48,
    letterSpacing: 0.5,
    color: "#FCFEEF",
    marginBottom: 6,

    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  title: {
    fontFamily: "Offbit-DotBold",
    fontSize: 48,
    letterSpacing: -0.2,
    color: "#FCFEEF",

    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  button: {
    height: 70,
    minWidth: 175,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#93C247",

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