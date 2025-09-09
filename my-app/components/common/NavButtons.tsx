// components/common/NavButtons.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BlurView } from "expo-blur"; // Glassy premium effect

type Screen = "main" | "orders" | "earnings" | "profile";

type Props = {
  onNavigate: (screen: Screen) => void;
  active: Screen;
};

export default function NavButtons({ onNavigate, active }: Props) {
  return (
    <View style={styles.wrapper}>
      <BlurView intensity={70} tint="dark" style={styles.container}>
        <TouchableOpacity onPress={() => onNavigate("main")} style={styles.tab}>
          <View style={[styles.iconWrapper, active === "main" && styles.activeIconBg]}>
            <Ionicons
              name={active === "main" ? "home" : "home-outline"}
              size={24}
              color={active === "main" ? "#fff" : "#bbb"}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onNavigate("orders")} style={styles.tab}>
          <View style={[styles.iconWrapper, active === "orders" && styles.activeIconBg]}>
            <Ionicons
              name={active === "orders" ? "cube" : "cube-outline"}
              size={24}
              color={active === "orders" ? "#fff" : "#bbb"}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onNavigate("earnings")} style={styles.tab}>
          <View style={[styles.iconWrapper, active === "earnings" && styles.activeIconBg]}>
            <Ionicons
              name={active === "earnings" ? "wallet" : "wallet-outline"}
              size={24}
              color={active === "earnings" ? "#fff" : "#bbb"}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onNavigate("profile")} style={styles.tab}>
          <View style={[styles.iconWrapper, active === "profile" && styles.activeIconBg]}>
            <Ionicons
              name={active === "profile" ? "person" : "person-outline"}
              size={24}
              color={active === "profile" ? "#fff" : "#bbb"}
            />
          </View>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "rgba(20,20,20,0.7)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  tab: {
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconBg: {
    backgroundColor: "#ff9800",
    shadowColor: "#ff9800",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
});
