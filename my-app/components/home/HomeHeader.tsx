// components/home/HomeHeader.tsx
import React, { useState } from "react";
import { View, Text, Image, Switch, StyleSheet } from "react-native";

export default function HomeHeader() {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <View style={styles.container}>
      {/* Left Side: Circular User Image */}
      <Image
        source={{ uri: "https://via.placeholder.com/80" }} // replace with real user/store image
        style={styles.avatar}
      />

      {/* Store Name */}
      <Text style={styles.storeName}>My Store</Text>

      {/* Right Side: Online/Offline Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={[styles.statusText, { color: isOnline ? "#4CAF50" : "#f44336" }]}>
          {isOnline ? "Online" : "Offline"}
        </Text>
        <Switch
          value={isOnline}
          onValueChange={setIsOnline}
          thumbColor={isOnline ? "#4CAF50" : "#f44336"}
          trackColor={{ false: "#d3d3d3", true: "#a5d6a7" }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent", // ✅ no separate background
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24, // circular
  },
  storeName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff", // ✅ white text on gradient
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    marginRight: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#fff", // ✅ white text
  },
});
