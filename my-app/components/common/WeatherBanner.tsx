// components/WeatherBanner.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const WeatherBanner = () => {
  const [temp] = useState(25);
  const [condition] = useState("Cloudy");

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-width));

  // Multiple cloud animations
  const [cloudAnim1] = useState(new Animated.Value(0));
  const [cloudAnim2] = useState(new Animated.Value(0));
  const [cloudAnim3] = useState(new Animated.Value(0));

  useEffect(() => {
    // card animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 2,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // cloud animations (different speeds for realism)
    const animateCloud = (anim: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateCloud(cloudAnim1, 12000); // slow big cloud
    animateCloud(cloudAnim2, 9000); // medium
    animateCloud(cloudAnim3, 6000); // faster small
  }, []);

  const cloudTranslate = (anim: Animated.Value, offset: number) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [-50 - offset, width + offset],
    });

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {/* Animated Clouds (layered, soft, realistic) */}
      <Animated.Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/414/414825.png" }}
        style={[
          styles.cloud,
          {
            top: 5,
            width: 60,
            height: 35,
            opacity: 0.5,
            transform: [{ translateX: cloudTranslate(cloudAnim1, 0) }],
          },
        ]}
      />
      <Animated.Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/414/414825.png" }}
        style={[
          styles.cloud,
          {
            top: 20,
            width: 45,
            height: 28,
            opacity: 0.7,
            transform: [{ translateX: cloudTranslate(cloudAnim2, 40) }],
          },
        ]}
      />
      <Animated.Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/414/414825.png" }}
        style={[
          styles.cloud,
          {
            top: 30,
            width: 35,
            height: 20,
            opacity: 0.9,
            transform: [{ translateX: cloudTranslate(cloudAnim3, 80) }],
          },
        ]}
      />

      {/* Weather Info */}
      <View style={styles.content}>
        <Image
          source={{
            uri:
              condition === "Sunny"
                ? "https://cdn-icons-png.flaticon.com/512/869/869869.png"
                : "https://cdn-icons-png.flaticon.com/512/414/414825.png", // cloud icon
          }}
          style={styles.icon}
        />
        <View style={styles.info}>
          <Text style={styles.temp}>{temp}°C</Text>
          <Text style={styles.condition}>{condition}</Text>
          <Text style={styles.date}>{dateString}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    overflow: "hidden",
    minHeight: 60, // compact
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 5,
  },
  icon: {
    width: 26,
    height: 26,
    marginRight: 8,
  },
  info: {
    flex: 1,
  },
  temp: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  condition: {
    fontSize: 12,
    color: "#666",
  },
  date: {
    fontSize: 10,
    color: "#999",
  },
  cloud: {
    position: "absolute",
    resizeMode: "contain",
  },
});

export default WeatherBanner;
