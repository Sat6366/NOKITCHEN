// components/screens/Profile.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import ProfileCard from "../common/ProfileCard";
import LogoutButton from "../common/LogoutButton";
import NavButtons from "../common/NavButtons"; 
import RatingsButton from "../common/RatingsButton";
import ProfileOption from "../common/ProfileOption";
import { Screen } from "../../App"; 

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileCard />
        <Text style={styles.text}></Text>
        <ProfileOption onPress={() => onNavigate("personaldetails")} /> 
        <RatingsButton />
        <LogoutButton />
      </ScrollView>

      <View style={styles.navbarWrapper}>
        <NavButtons active="profile" onNavigate={onNavigate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1, padding: 16, paddingBottom: 90 },
  text: { fontSize: 20, fontWeight: "700", marginTop: 20 },
  navbarWrapper: {
    height: 70,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    justifyContent: "center",
  },
});
