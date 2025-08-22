import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
  StyleSheet,
} from "react-native";

const { width } = Dimensions.get("window");

export default function SocialLogins() {
  return (
    <View style={styles.container}>
      {/* Divider with OR */}
      <View style={styles.dividerWrapper}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      {/* Social Buttons */}
      <View style={styles.socialWrapper}>
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
          <Image
            source={require("@/assets/images/welcome1.png")}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
          <Text style={styles.moreText}>⋮</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  dividerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5, // ⬆️ Pushed up a bit
    marginBottom: 40, // ⬆️ more gap before social buttons
    width: "85%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#d1d5db",
  },
  orText: {
    marginHorizontal: 12,
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
  },
  socialWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialButton: {
    width: Math.min(width * 0.16, 65),
    height: Math.min(width * 0.16, 65),
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    width: "55%",
    height: "55%",
  },
  moreText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#374151",
  },
});
