// components/screens/Main.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Main() {
  return (
    <View style={styles.page}>
      <Text style={styles.text}>🏠 Main Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "700" },
});
