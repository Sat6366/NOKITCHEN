// components/common/NavButtons.tsx
import React, { useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigationState } from "@react-navigation/native";
import { navigate } from "./RootNavigation";

const tabs = [
  { name: "Main", icon: "home-variant-outline" },
  { name: "Orders", icon: "file-document-outline" },
  { name: "Earnings", icon: "chart-line-variant" },
  { name: "Profile", icon: "account-outline" },
];

export default function NavButtons() {
  const state = useNavigationState((s) => s);
  const activeRoute = state?.routes[state.index]?.name;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeRoute === tab.name;
        const scaleAnim = useRef(new Animated.Value(1)).current;

        const handlePress = () => {
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: 120,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 3,
              useNativeDriver: true,
            }),
          ]).start();

          navigate(tab.name as any);
        };

        return (
          <Pressable key={tab.name} style={styles.tab} onPress={handlePress}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={26}
                color={isActive ? "#de7932" : "#888"}
              />
            </Animated.View>
            <Text
              style={[styles.label, { color: isActive ? "#de7932" : "#888" }]}
            >
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    elevation: 10,
  },
  tab: { alignItems: "center", flex: 1 },
  label: { marginTop: 4, fontSize: 12, fontWeight: "600" },
});
