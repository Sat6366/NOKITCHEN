// components/common/NavButtons.tsx
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

type Screen = "main" | "orders" | "earnings" | "profile";

type Props = {
  onNavigate: (screen: Screen) => void;
  active: Screen;
};

export default function NavButtons({ onNavigate, active }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onNavigate("main")} style={styles.tab}>
        <Text style={active === "main" ? styles.activeText : styles.inactiveText}>🏠</Text>
        <Text style={active === "main" ? styles.activeLabel : styles.inactiveLabel}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onNavigate("orders")} style={styles.tab}>
        <Text style={active === "orders" ? styles.activeText : styles.inactiveText}>📦</Text>
        <Text style={active === "orders" ? styles.activeLabel : styles.inactiveLabel}>Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onNavigate("earnings")} style={styles.tab}>
        <Text style={active === "earnings" ? styles.activeText : styles.inactiveText}>💰</Text>
        <Text style={active === "earnings" ? styles.activeLabel : styles.inactiveLabel}>Earnings</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onNavigate("profile")} style={styles.tab}>
        <Text style={active === "profile" ? styles.activeText : styles.inactiveText}>👤</Text>
        <Text style={active === "profile" ? styles.activeLabel : styles.inactiveLabel}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#ff9800",
  },
  tab: { alignItems: "center", flex: 1 },
  activeText: { fontSize: 20, color: "#fff" },
  inactiveText: { fontSize: 20, color: "#333" },
  activeLabel: { fontSize: 12, color: "#fff", fontWeight: "700", marginTop: 2 },
  inactiveLabel: { fontSize: 12, color: "#333", marginTop: 2 },
});
