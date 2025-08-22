import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

type AppHeaderProps = {
  title?: string;
  onMenuPress?: () => void;
};

export default function AppHeader({ title = "NoKitchen", onMenuPress }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Left: Logo + Title together */}
      <View style={styles.leftWrapper}>
        <View style={styles.logoWrapper}>
          <Image
            source={require("@/assets/images/food-icon.png")}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.brandName} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right: Menu/Profile */}
      <TouchableOpacity style={styles.menuBtn} onPress={onMenuPress}>
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },

  // Left group (logo + text)
  leftWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  logo: {
    width: "100%",
    height: "100%",
  },

  // Brand text beside logo
  brandName: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "900",
    color: "#ff8c00",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  menuBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#444",
  },
});
