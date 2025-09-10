// components/common/ProfileOption.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProfileOptionProps {
  onPress: () => void;
}

export default function ProfileOption({ onPress }: ProfileOptionProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <Ionicons name="person-circle-outline" size={24} color="#FF5733" />
        <Text style={styles.label}>Profile</Text>
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
