// screens/PersonalDetails.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function PersonalDetails() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Personal Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>John Doe</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>john.doe@example.com</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>+91 9876543210</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>123 Main Street, City, Country</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Joined:</Text>
        <Text style={styles.value}>Jan 2025</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#FF5733",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  value: {
    fontSize: 16,
    marginTop: 4,
    color: "#222",
  },
});
