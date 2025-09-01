// components/screens/Main.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import NavButtons from "../common/NavButtons"; // adjust path if needed

export default function Main() {
  const handleNav = (screen: string) => {
    // For now just log it
    console.log("Pressed:", screen);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Main Screen 🎉</Text>

      {/* ✅ Bottom Nav */}
      <View style={styles.navContainer}>
        <NavButtons onPress={handleNav} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  navContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
  },
});
