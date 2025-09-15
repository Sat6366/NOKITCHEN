// components/common/ProfileBanner.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProfileBannerProps {
  name: string;
  email: string;
  userId?: string;
  imageUri: string;
  onEdit?: () => void;
  moreDetails?: {
    phone?: string;
    joined?: string;
    pan_number?: string;
    aadhar_number?: string;
    store?: string;
  };
}

export default function ProfileBanner({
  name,
  email,
  userId,
  imageUri,
  onEdit,
  moreDetails,
}: ProfileBannerProps) {
  const [showMore, setShowMore] = useState(false);

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowMore(!showMore);
  };

  return (
    <View style={styles.cardWrapper}>
      {/* Profile Image */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUri }} style={styles.profileImage} />

        {onEdit && (
          <TouchableOpacity style={styles.editBtn} >
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Always Visible Info */}
      <Text style={styles.name}>{name}</Text>
      {userId && <Text style={styles.userId}>ID: {userId}</Text>}
      <Text style={styles.email}>{email}</Text>

      {/* More Details */}
      {showMore && moreDetails && (
        <View style={styles.moreDetails}>
          {moreDetails.phone && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{moreDetails.phone}</Text>
            </View>
          )}
          {moreDetails.joined && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Joined</Text>
              <Text style={styles.value}>{moreDetails.joined}</Text>
            </View>
          )}
          {moreDetails.pan_number && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>PAN</Text>
              <Text style={styles.value}>{moreDetails.pan_number}</Text>
            </View>
          )}
          {moreDetails.aadhar_number && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Aadhar</Text>
              <Text style={styles.value}>{moreDetails.aadhar_number}</Text>
            </View>
          )}
          {moreDetails.store && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Store</Text>
              <Text style={styles.value}>{moreDetails.store}</Text>
            </View>
          )}
        </View>
      )}

      {/* Toggle Button */}
      <TouchableOpacity style={styles.moreBtn} onPress={handleToggle}>
        <Text style={styles.moreText}>{showMore ? "Less" : "More"}</Text>
        <Ionicons
          name={showMore ? "chevron-up" : "chevron-down"}
          size={18}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    backgroundColor: "#7b7676ff",
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    marginBottom: 20,
  },
  imageWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#fff",
    overflow: "hidden",
    marginBottom: 12,
    elevation: 8,
    shadowColor: "#FF914D",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
  },
  profileImage: { width: "100%", height: "100%", borderRadius: 55 },
  name: { fontSize: 20, fontWeight: "700", color: "#fff", marginTop: 4 },
  userId: { fontSize: 14, color: "#FF914D", marginTop: 2 },
  email: { fontSize: 14, color: "#ccc", marginTop: 2 },
  editBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF914D",
    borderRadius: 20,
    padding: 6,
    elevation: 5,
  },
  moreBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#FF914D",
  },
  moreText: { fontSize: 14, fontWeight: "600", color: "#fff", marginRight: 6 },
  moreDetails: { marginTop: 12, width: "90%" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#555",
  },
  label: { color: "#FF914D", fontSize: 14, fontWeight: "600" },
  value: { color: "#fff", fontSize: 14 },
});
