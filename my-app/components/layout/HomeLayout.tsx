// components/layout/HomeLayout.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import Main from "../screens/Main";
import Orders from "../screens/Orders";
import Earnings from "../screens/Earnings";
import Profile from "../screens/Profile";
import NavButtons from "../common/NavButtons";

export type Screen = "main" | "orders" | "earnings" | "profile";

export default function HomeLayout() {
  const [active, setActive] = useState<Screen>("main");

  const renderScreen = () => {
    switch (active) {
      case "orders":
        return <Orders />;
      case "earnings":
        return <Earnings />;
      case "profile":
        return <Profile />;
      default:
        return <Main />;
    }
  };

  return (
    <View style={styles.container}>
      {/* content area takes all remaining space */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* bottom nav — always visible */}
      <NavButtons active={active} onNavigate={(s) => setActive(s)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1 },
});
