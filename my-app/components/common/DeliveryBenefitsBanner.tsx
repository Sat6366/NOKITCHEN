// components/DeliveryBenefitsBanner.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const DeliveryBenefitsBanner = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        bounciness: 12,
        speed: 2,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const benefits = [
    {
      id: "1",
      text: "Earn flexible income per delivery",
      icon: "cash-outline",
    },
    {
      id: "2",
      text: "Weekly bonuses & incentives",
      icon: "gift-outline",
    },
    {
      id: "3",
      text: "Work on your own schedule",
      icon: "time-outline",
    },
    {
      id: "4",
      text: "Fuel allowance & extra perks",
      icon: "car-outline",
    },
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
      <LinearGradient
        colors={["#FF914D", "#AB003E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.title}>Delivery Partner Benefits 🚴</Text>

        <FlatList
          data={benefits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.benefitItem}>
              <Ionicons
                name={item.icon as any}
                size={22}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          )}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "92%",
    alignSelf: "center",
    marginTop: 20,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
  },
  gradient: {
    padding: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  icon: {
    marginRight: 10,
  },
  benefitText: {
    fontSize: 16,
    color: "#fff",
    flexShrink: 1,
  },
});

export default DeliveryBenefitsBanner;
