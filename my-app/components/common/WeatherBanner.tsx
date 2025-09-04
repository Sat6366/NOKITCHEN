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
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    // Banner slide-in + fade
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 2,
        bounciness: 12,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing weather icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Moving glow line
    Animated.loop(
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const glowTranslateX = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

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
        {/* Weather Icon with Pulse */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
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
        </Animated.View>

        {/* Weather Info */}
        <View style={styles.info}>
          <Text style={styles.temp}>{temp}°C</Text>
          <Text style={styles.condition}>{condition}</Text>
          <Text style={styles.date}>{dateString}</Text>
        </View>

        {/* Animated Moving Glow Line */}
        <Animated.View
          style={[
            styles.glowLine,
            { transform: [{ translateX: glowTranslateX }] },
          ]}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "92%",
    alignSelf: "center",
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#00f",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    minHeight: 80, // reduced height
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  temp: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  condition: {
    fontSize: 15,
    color: "#f0f0f0",
    opacity: 0.9,
  },
  date: {
    fontSize: 13,
    color: "#ccc",
    marginTop: 2,
  },
  glowLine: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "50%",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 2,
  },
});

export default WeatherBanner;
