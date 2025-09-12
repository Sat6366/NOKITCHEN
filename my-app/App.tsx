// App.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";

import Main from "./components/screens/Main";
import Orders from "./components/screens/Orders";
import Earnings from "./components/screens/Earnings";
import Profile from "./components/screens/Profile";
import NavButtons from "./components/common/NavButtons";
import Login from "./components/login/Login";

import { AuthProvider, useAuth } from "./components/context/AuthContext";

export type Screen = "main" | "orders" | "earnings" | "profile";

function AppContent() {
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

function Root() {
  const { user } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);

  // 🔹 Only wait for the initial AsyncStorage restore
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // 🔹 Show loader only during initial app load
  if (initialLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2293b0" />
      </View>
    );
  }

  // 🔹 Immediately redirect to Login if user is null
  if (!user) {
    return <Login />;
  }

  // 🔹 If logged in → show main app
  return <AppContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
