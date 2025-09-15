// components/screens/Profile.tsx
import React from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import NavButtons from "../common/NavButtons";
import ProfileBanner from "../common/ProfileCard"; // make sure this is ProfileBanner
import LogoutButton from "../common/LogoutButton";
import RatingsButton from "../common/RatingsButton";
import ProfileOption from "../common/ProfileOption";
import { useAuth } from "../context/AuthContext";
import { Screen } from "../../App";


interface ProfileProps {
  onNavigate: (screen: Screen) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading user details...</Text>
      </View>
    );
  }

  return (
    
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Banner */}
        <ProfileBanner
          name={user.name || "No Name"}
          email={user.mobile || "No Mobile"}
          userId={user.agent_code || "N/A"}
          imageUri={user.profile_image || "https://via.placeholder.com/150"}
          moreDetails={{
            phone: user.mobile || "N/A",
            joined: user.joined || "N/A",
            pan_number: user.pan_number || "N/A",
            aadhar_number: user.aadhar_number || "N/A",
            store: user.store || "N/A",
          }}
          onEdit={() => onNavigate("editprofile")}
        />

        {/* Profile options */}
        <View style={styles.optionsWrapper}>
          
          <RatingsButton />
          <LogoutButton />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navbarWrapper}>
        <NavButtons active="profile" onNavigate={onNavigate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  scrollContent: { flexGrow: 1, padding: 16, paddingBottom: 90 },
  navbarWrapper: {
    height: 70,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    justifyContent: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: "#555" },
  optionsWrapper: { marginTop: 20 },
});
