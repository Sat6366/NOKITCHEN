import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import NavButtons from "../common/NavButtons";
import ProfileBanner from "../common/ProfileCard";
import LogoutButton from "../common/LogoutButton";
import RatingsButton from "../common/RatingsButton";
import { useAuth } from "../context/AuthContext";
import { Screen } from "../../App";

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
}

type PartnerDetails = {
  first_name?: string;
  last_name?: string;
  mobile?: string;
  agent_code?: string;
  selfie?: string | null;
  pan_number?: string;
  aadhar_number?: string;
  store?: string;
  joined?: string;
};

export default function Profile({ onNavigate }: ProfileProps) {
  const { user, getAccessToken } = useAuth();
  const [partnerDetails, setPartnerDetails] = useState<PartnerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://192.168.0.5:8000/api";

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      const token = await getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/delivery-partner/profile/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // send JWT token
          },
        });

        const data = await res.json();
        if (res.ok && data.success) {
          const partner = data.partner;
          setPartnerDetails({
            first_name: partner.first_name,
            last_name: partner.last_name,
            mobile: partner.mobile,
            agent_code: partner.agent_code,
            selfie: partner.selfie,
            pan_number: partner.pan_number,
            aadhar_number: partner.aadhar_number,
            store: partner.selected_store?.name || "N/A",
            joined: partner.registered_on?.split("T")[0] || "N/A", // format date
          });
        } else {
          console.log("Error fetching partner:", data.message);
        }
      } catch (err) {
        console.log("Failed to fetch partner details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerDetails();
  }, [getAccessToken]);

  if (!user || loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading user details...</Text>
      </View>
    );
  }

  const details = partnerDetails || {};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileBanner
          name={`${details.first_name || ""} ${details.last_name || ""}`.trim() || "No Name"}
          email={details.mobile || "No Mobile"}
          userId={details.agent_code || "N/A"}
          imageUri={details.selfie || "https://via.placeholder.com/150"}
          moreDetails={{
            phone: details.mobile || "N/A",
            joined: details.joined || "N/A",
            pan_number: details.pan_number || "N/A",
            aadhar_number: details.aadhar_number || "N/A",
            store: details.store || "N/A",
          }}
          onEdit={() => onNavigate("editprofile")}
        />

        <View style={styles.optionsWrapper}>
          <RatingsButton />
          <LogoutButton />
        </View>
      </ScrollView>

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
