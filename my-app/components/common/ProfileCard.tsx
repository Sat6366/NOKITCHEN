// components/common/ProfileBanner.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProfileBannerProps {
  name: string;
  email: string;
  userId?: string; // 👈 added ID
  imageUri: string;
  onEdit?: () => void;
  moreDetails?: {
    phone?: string;
    address?: string;
    joined?: string;
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

        {/* Edit Button */}
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <Ionicons name="pencil" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Default Info (always visible) */}
      <Text style={styles.name}>{name}</Text>
      {userId && <Text style={styles.userId}>ID: {userId}</Text>}
      <Text style={styles.email}>{email}</Text>

      {/* Extra Details (above More button when expanded) */}
      {showMore && (
        <View style={styles.moreDetails}>
          {moreDetails?.phone && (
            <Text style={styles.detail}>📞 {moreDetails.phone}</Text>
          )}
          {moreDetails?.address && (
            <Text style={styles.detail}>🏠 {moreDetails.address}</Text>
          )}
          {moreDetails?.joined && (
            <Text style={styles.detail}>📅 Joined: {moreDetails.joined}</Text>
          )}
        </View>
      )}

      {/* More Button */}
      <TouchableOpacity style={styles.moreBtn} onPress={handleToggle}>
        <Text style={styles.moreText}>
          {showMore ? "Less" : "More"}
        </Text>
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
    backgroundColor: "#b8b8b8ff",
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 25, // 👈 reduced height
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
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 55,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginTop: 4,
  },
  userId: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
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
    backgroundColor: "#FF914D", // orange button
  },
  moreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff", // white text
    marginRight: 6,
  },
  moreDetails: {
    marginTop: 12,
    alignItems: "center",
  },
  detail: {
    fontSize: 14,
    color: "#444",
    marginTop: 4,
  },
});
