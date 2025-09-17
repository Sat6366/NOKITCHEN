// components/common/CustomHeaderOptions.tsx
import { Stack } from "expo-router";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
};

export default function CustomHeaderOptions({ title }: Props) {
  return (
    <Stack.Screen
      options={{
        title,
        headerBackground: () => (
          <LinearGradient
            colors={["#FFE0CC", "#FF914D", "#AB003E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: "hidden",
            }}
          />
        ),
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "500",
          fontSize: 15,
          letterSpacing: 0.5,
        },
        headerTitleAlign: "left",
        headerTitleContainerStyle: {
          marginLeft: 4,
        },
        // ✅ Back button setup
        headerBackTitleVisible: false, // hides the "Back" text on iOS
        headerBackVisible: true,
        headerBackImage: ({ tintColor }) => (
          <Ionicons name="arrow-back" size={22} color={tintColor} style={{ marginLeft: 10 }} />
        ),
      }}
    />
  );
}
