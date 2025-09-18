// components/common/NavButtons.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BlurView } from "expo-blur"; // Glassy premium effect

type Screen = "main" | "orders" | "earnings" | "profile";

type Props = {
  onNavigate: (screen: Screen) => void;
  active: Screen;
};

export default function NavButtons({ onNavigate, active }: Props) {
  const tabs: { key: Screen; icon: string; outline: string }[] = [
    { key: "main", icon: "home", outline: "home-outline" },
    { key: "orders", icon: "cube", outline: "cube-outline" },
    { key: "earnings", icon: "wallet", outline: "wallet-outline" },
    { key: "profile", icon: "person", outline: "person-outline" },
  ];

  return (
    <View style={styles.wrapper}>
      <BlurView intensity={70} tint="dark" style={styles.container}>
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          const scaleAnim = new Animated.Value(isActive ? 1.1 : 1);

          if (isActive) {
            Animated.spring(scaleAnim, {
              toValue: 1.2,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onNavigate(tab.key)}
              style={styles.tab}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  isActive && styles.activeIconBg,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <Ionicons
                  name={isActive ? tab.icon : tab.outline}
                  size={26}
                  color={isActive ? "#fff" : "#bbb"}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
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
    paddingVertical: 14,
    paddingHorizontal: 6,
    backgroundColor: "rgba(18,18,18,0.8)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  tab: {
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)", // subtle base for inactive
  },
  activeIconBg: {
    backgroundColor: "#ff9800",
    shadowColor: "#ff9800",
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
});
