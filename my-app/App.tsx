// App.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import Main from "./components/screens/Main";
import Orders from "./components/screens/Orders";
import Earnings from "./components/screens/Earnings";
import Profile from "./components/screens/Profile";
import NavButtons from "./components/common/NavButtons";

export type Screen = "main" | "orders" | "earnings" | "profile";

export default function App() {
  const [active, setActive] = useState<Screen>("main");

  const renderScreen = () => {
    switch (active) {
      case "main":
        return <Main />;
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
      <View style={styles.content}>{renderScreen()}</View>
      <NavButtons active={active} onNavigate={setActive} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
