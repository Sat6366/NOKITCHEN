// components/common/ProfileActions.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Action {
  label: string;
  icon: string;
  onPress: () => void;
}

interface ProfileActionsProps {
  actions: Action[];
}

export default function ProfileActions({ actions }: ProfileActionsProps) {
  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          <Ionicons name={action.icon as any} size={22} color="#FF914D" style={styles.icon} />
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    marginVertical: 10,
    alignSelf: "center",
    paddingVertical: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  icon: {
    marginRight: 14,
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
