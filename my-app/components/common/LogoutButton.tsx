// components/common/LogoutButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LogoutButtonProps {
  onPress: () => void;
}

export default function LogoutButton({ onPress }: LogoutButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <Ionicons name="log-out-outline" size={24} color="#FF5733" />
        <Text style={styles.label}>Logout</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginTop: 12,
    elevation: 2, // shadow for android
    shadowColor: "#000", // shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    color: "#FF5733",
  },
});
