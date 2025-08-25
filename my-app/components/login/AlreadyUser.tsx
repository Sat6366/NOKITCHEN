import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function AlreadyUser() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Already have an account?</Text>
      <TouchableOpacity
        onPress={() => router.replace("/login")}
        activeOpacity={0.7}
      >
        <Text style={styles.link}>Login here</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  text: {
    fontSize: 14,
    color: "#6b7280",
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FAA403",
    marginLeft: 6,
  },
});
