import React from "react";
import { Pressable, Text, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";

export default function GetStartedButton() {
  const router = useRouter();

  const handlePress = (e: any) => {
    // ✅ On web: blur the button before navigating (prevents aria-hidden warning)
    if (Platform.OS === "web") {
      e.currentTarget?.blur?.();
    }

    // ✅ Navigate to login (replace so onboarding isn’t in history)
    router.replace("/login");
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.primaryBtn,
        pressed && styles.pressedBtn, // ✅ visual feedback
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Get Started"
    >
      <Text style={styles.primaryBtnText}>Get Started</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryBtn: {
    backgroundColor: "#faa403",
    paddingVertical: 16,
    paddingHorizontal: 70,
    borderRadius: 40,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  pressedBtn: {
    opacity: 0.85, // ✅ feedback for iOS/Android
  },
  primaryBtnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
    textAlign: "center",
  },
});
