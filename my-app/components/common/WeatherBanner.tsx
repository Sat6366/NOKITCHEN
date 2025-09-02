// components/WeatherBanner.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ImageBackground,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const WeatherBanner = () => {
  const [temp, setTemp] = useState(28);
  const [condition, setCondition] = useState("Sunny");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-width));

  useEffect(() => {
    // Fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Sliding banner entrance
    Animated.spring(slideAnim, {
      toValue: 0,
      speed: 2,
      bounciness: 12,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={["#1e3c72", "#2a5298"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Weather Icon with Glow */}
        <ImageBackground
          source={{
            uri:
              condition === "Sunny"
                ? "https://cdn-icons-png.flaticon.com/512/869/869869.png"
                : "https://cdn-icons-png.flaticon.com/512/1163/1163624.png",
          }}
          style={styles.icon}
          imageStyle={{ tintColor: "#fff" }}
        />

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.temp}>{temp}°C</Text>
          <Text style={styles.condition}>{condition}</Text>
        </View>

        {/* Animated Glow Line */}
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.glowLine}
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
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#00f",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 10,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  icon: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  temp: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  condition: {
    fontSize: 16,
    color: "#f0f0f0",
    opacity: 0.9,
  },
  glowLine: {
    position: "absolute",
    bottom: 0,
    left: -50,
    width: "200%",
    height: 3,
  },
});

export default WeatherBanner;
