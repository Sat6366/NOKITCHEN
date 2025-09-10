import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ProfileWithToggle() {
  const { user } = useAuth(); 
  const [isOnline, setIsOnline] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isOnline ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOnline]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 70 - 18],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFA500", "#4CAF50"],
  });

  const glowColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFA50066", "#4CAF5066"],
  });

  const toggleText = isOnline ? "Online" : "Offline";

  const profileImage =
    user?.profile_image
      ? user.profile_image.startsWith("http")
        ? user.profile_image
        : `http://192.168.0.9:8000${user.profile_image}`
      : null;

  return (
    <View style={styles.container}>
      {/* Profile + Glow */}
      <View style={styles.profileWrapper}>
        {profileImage && (
          <View style={[styles.glowWrapper, { shadowColor: glowColor }]}>
            <Image source={{ uri: profileImage }} style={styles.profile} />
          </View>
        )}
        {user?.agent_code && <Text style={styles.agentCode}>#{user.agent_code}</Text>}
      </View>

      {/* Toggle */}
      <TouchableWithoutFeedback onPress={() => setIsOnline(!isOnline)}>
        <Animated.View
          style={[styles.switchBackground, { backgroundColor, shadowColor: glowColor }]}
        >
          <Text style={styles.text}>{toggleText}</Text>
          <Animated.View style={[styles.slider, { transform: [{ translateX }] }]} />
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
    marginTop: 15,
  },
  profileWrapper: {
    alignItems: "center",
  },
  glowWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    backgroundColor: "#fff",
  },
  profile: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#fff",
  },
  agentCode: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#fff", // white agent code
  },
  switchBackground: {
    width: 70,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 4,
    elevation: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    position: "relative",
  },
  slider: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
    top: 9,
    elevation: 4,
    shadowColor: "#fff",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
  },
  text: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
  },
});
