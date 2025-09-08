// components/screens/Profile.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Profile() {
  return (
    <View style={styles.page}>
      <Text style={styles.text}>👤 Profile Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "700" },
});
