// components/common/ProfileWithToggle.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
} from "react-native";

export default function ProfileWithToggle() {
  const [isOnline, setIsOnline] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const toggleSwitch = () => {
    setIsOnline(!isOnline);

    Animated.timing(animatedValue, {
      toValue: isOnline ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.circle),
      useNativeDriver: false,
    }).start();
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 28], // movement of slider
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#222", "#4CAF50"], // black when offline, green when online
  });

  return (
    <View style={styles.container}>
      {/* Profile on Left */}
      <Image
        source={{ uri: "https://i.pravatar.cc/100" }} // sample profile image
        style={styles.profile}
      />

      {/* Toggle Button with Text */}
      <TouchableOpacity onPress={toggleSwitch} activeOpacity={0.9}>
        <Animated.View style={[styles.switchBackground, { backgroundColor }]}>
          {/* ✅ Text inside the toggle */}
          <Text style={styles.toggleText}>
            {isOnline ? "Online" : "Offline"}
          </Text>

          <Animated.View
            style={[styles.slider, { transform: [{ translateX }] }]}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // profile left, toggle right
    paddingHorizontal: 16,
    marginTop: 20,
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  switchBackground: {
    width: 80, // made wider to fit text
    height: 34,
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 8,
    elevation: 5, // 3D shadow
    flexDirection: "row",
    alignItems: "center",
  },
  toggleText: {
    flex: 1,
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  slider: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    elevation: 3, // 3D effect
  },
});
