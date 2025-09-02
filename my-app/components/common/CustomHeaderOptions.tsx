// components/common/CustomHeaderOptions.tsx
import { Stack } from "expo-router";
import React from "react";

export default function CustomHeaderOptions() {
  return (
    <Stack.Screen
      options={{
        title: "NO KITCHEN",
        headerStyle: {
          backgroundColor: "#FF914D", // orange
        },
        headerTintColor: "#000", // black text/icons
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 20,
        },
      }}
    />
  );
}
