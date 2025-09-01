// components/common/NavButtons.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ Premium icons

type Props = {
  onPress: (screen: string) => void;
};

const tabs = [
  { name: "Home", icon: "home-variant-outline" as const },
  { name: "Orders", icon: "file-document-outline" as const },
  { name: "Earnings", icon: "chart-line-variant" as const },
  { name: "Profile", icon: "account-outline" as const },
];

export default function NavButtons({ onPress }: Props) {
  const [active, setActive] = useState("Home");
  const { width } = useWindowDimensions();

  // Animation values
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorScale = useRef(new Animated.Value(0)).current;

  // Responsive sizes
  const tabWidth = width / tabs.length;
  const iconSize = width < 360 ? 22 : width < 768 ? 28 : 32;
  const fontSize = width < 360 ? 10 : width < 768 ? 12 : 14;

  useEffect(() => {
    const index = tabs.findIndex((t) => t.name === active);

    Animated.parallel([
      Animated.spring(indicatorX, {
        toValue: index * tabWidth,
        useNativeDriver: true,
      }),
      Animated.spring(indicatorScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active]);

  return (
    <View className="bg-white border-t border-gray-100 shadow-lg rounded-t-2xl">
      <View className="flex-row justify-around items-center relative">
        {/* Floating yellow indicator (premium touch) */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: tabWidth * 0.6, // smaller pill width for elegance
            height: 3,
            backgroundColor: "#facc15",
            borderRadius: 50,
            transform: [
              { translateX: Animated.add(indicatorX, new Animated.Value(tabWidth * 0.2)) }, // center the pill
              { scaleX: indicatorScale },
            ],
          }}
        />

        {tabs.map((tab) => {
          const isActive = active === tab.name;

          return (
            <Pressable
              key={tab.name}
              onPress={() => {
                setActive(tab.name);
                onPress(tab.name);
              }}
              className="flex-1 items-center py-3"
            >
              {({ pressed }) => (
                <Animated.View
                  style={{
                    transform: [
                      { translateY: isActive ? -5 : pressed ? -3 : 0 },
                      { scale: isActive ? 1.1 : 1 },
                    ],
                  }}
                  className="items-center"
                >
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={iconSize}
                    color={
                      isActive
                        ? "#de7932ff" // black for active
                        : pressed
                        ? "#fbad04ff" // yellow on press
                        : "#0b0b0bff" // neutral gray
                    }
                  />
                  <Text
                    style={{ fontSize }}
                    className={`mt-1 ${
                      isActive
                        ? "text-black font-semibold"
                        : pressed
                        ? "text-yellow-500"
                        : "text-gray-600"
                    }`}
                  >
                    {tab.name}
                  </Text>
                </Animated.View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
