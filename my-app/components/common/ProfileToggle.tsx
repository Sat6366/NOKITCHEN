// components/common/ProfileWithToggle.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Image,
} from "react-native";

export default function ProfileWithToggle() {
  const [isOnline, setIsOnline] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isOnline ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOnline]);

  // Knob sliding movement
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 90 - 22],
  });

  // Background & Glow color change
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFA500", "#4CAF50"],
  });

  const glowColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFA50088", "#4CAF5088"], // semi-transparent glow
  });

  const toggleText = isOnline ? "Online" : "Offline";

  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <Image
        source={{ uri: "https://i.pravatar.cc/100" }}
        style={styles.profile}
      />

      {/* Toggle */}
      <TouchableWithoutFeedback onPress={() => setIsOnline(!isOnline)}>
        <Animated.View
          style={[
            styles.switchBackground,
            { backgroundColor, shadowColor: glowColor },
          ]}
        >
          {/* Centered text */}
          <Text style={styles.text}>{toggleText}</Text>

          {/* Small knob */}
          <Animated.View
            style={[styles.slider, { transform: [{ translateX }] }]}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  profile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },
  switchBackground: {
    width: 90,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    paddingHorizontal: 4,
    elevation: 8, // stronger shadow for glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    position: "relative",
  },
  slider: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    top: 10,
    elevation: 6,
    shadowColor: "#fff",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
  },
  text: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
});
