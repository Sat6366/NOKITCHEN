import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface FooterProps {
  text?: string;
}

export default function Footer({ text = "© NO KITCHEN" }: FooterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    position: "absolute", // keeps it at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  text: {
    color: "#6b7280",
    fontSize: 12,
  },
});
