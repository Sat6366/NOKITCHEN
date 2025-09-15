// components/DeliveryBenefitsBanner.tsx
import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const DeliveryBenefitsBanner = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        bounciness: 12,
        speed: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const benefits = [
    { id: "1", text: "Earn flexible income per delivery", icon: "cash-outline" },
    { id: "2", text: "Weekly bonuses & incentives", icon: "gift-outline" },
    { id: "3", text: "Work on your own schedule", icon: "time-outline" },
    { id: "4", text: "Fuel allowance & extra perks", icon: "car-outline" },
  ];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Delivery Partner Benefits 🚴</Text>

        <FlatList
          data={benefits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.benefitItem}>
              <Ionicons
                name={item.icon as any}
                size={18} // smaller icon
                color="#FF6F00" // premium orange
                style={styles.icon}
              />
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          )}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignSelf: "center",
    marginTop: 16,
  },
  card: {
    backgroundColor: "#F8F9FA", // light card
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0", // subtle border
  },
  title: {
    fontSize: 16, // smaller
    fontWeight: "600",
    color: "#333", // dark grey
    marginBottom: 10,
    textAlign: "left",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  icon: {
    marginRight: 8,
  },
  benefitText: {
    fontSize: width < 380 ? 13 : 14, // smaller text
    color: "#444",
    flexShrink: 1,
    lineHeight: 20,
  },
});

export default DeliveryBenefitsBanner;
