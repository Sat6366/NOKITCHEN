// components/common/LogoutButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext"; // ✅ import hook

export default function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout(); // ✅ clears session & flips back to login automatically
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleLogout} activeOpacity={0.7}>
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
    elevation: 2,
    shadowColor: "#000",
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
