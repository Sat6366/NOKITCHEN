import React from "react";
import { StatusBar, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={["#FF914D", "#AB003E"]}
      style={styles.container}
    >
      {/* ✅ System StatusBar control */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content" // white icons for signal/battery
      />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
