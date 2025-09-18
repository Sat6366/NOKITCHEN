// components/ProfileWithToggle.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Image,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import * as Location from "expo-location";
import { useAuth } from "../context/AuthContext";

const BACKEND = "http://192.168.0.6:8000"; // <- change if your PC IP is different
const TOAST_DURATION = 3000;
const LIVE_UPDATE_INTERVAL_MS = 15000; // 15s

type ToastType = "success" | "warning" | "error" | "offline";

export default function ProfileWithToggle() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const animatedValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isOnline ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();

    if (isOnline) startLiveUpdates();
    else stopLiveUpdates();

    return () => stopLiveUpdates();
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

  const profileImage = user?.profile_image
    ? user.profile_image.startsWith("http")
      ? user.profile_image
      : `${BACKEND}${user.profile_image}`
    : null;

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = (setTimeout(
      () => setToast(null),
      TOAST_DURATION
    ) as unknown) as number;
  };

  async function sendToggleRequest(agent_code: string, lat: number, lon: number) {
    try {
      const res = await fetch(`${BACKEND}/api/delivery/toggle-online/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_code, latitude: lat, longitude: lon }),
      });
      return await res.json();
    } catch (err) {
      console.error("toggle request failed", err);
      return { success: false, allowed: false, message: "Network error" };
    }
  }

  async function toggleDuty() {
    if (!user?.agent_code) {
      setModalMessage("User agent code missing");
      return;
    }

    if (!isOnline) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setModalMessage("Please allow location access to go Online.");
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;

        const data = await sendToggleRequest(user.agent_code, lat, lon);

        // Show backend message in modal
        setModalMessage(data.message || (data.allowed ? "You are now Online!" : "Cannot go Online."));

        if (data && data.allowed) {
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch (err) {
        console.error("location error", err);
        setModalMessage("Unable to get location. Try again.");
      }
    } else {
      // Go offline
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
        });
        await sendToggleRequest(user.agent_code, location.coords.latitude, location.coords.longitude);
      } catch (err) {
        // ignore
      }
      setIsOnline(false);
      setModalMessage("You are now Offline.");
    }
  }

  // Live updates
  async function startLiveUpdates() {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await fetch(`${BACKEND}/api/delivery/update-live-location/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_code: user.agent_code,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }),
      });
    } catch (err) {
      console.warn("initial live update failed", err);
    }

    stopLiveUpdates();
    intervalRef.current = (setInterval(async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
        await fetch(`${BACKEND}/api/delivery/update-live-location/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent_code: user.agent_code,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          }),
        });
      } catch (err) {
        console.warn("live update failed", err);
      }
    }, LIVE_UPDATE_INTERVAL_MS) as unknown) as number;
  }

  function stopLiveUpdates() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const getToastStyle = () => {
    if (!toast) return {};
    switch (toast.type) {
      case "success":
        return { backgroundColor: "#4CAF50" };
      case "warning":
        return { backgroundColor: "#FFA500" };
      case "error":
        return { backgroundColor: "#555" };
      case "offline":
        return { backgroundColor: "#E53935" };
      default:
        return { backgroundColor: "rgba(0,0,0,0.85)" };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileWrapper}>
        {profileImage && (
          <View style={[styles.glowWrapper, { shadowColor: glowColor as any }]}>
            <Image source={{ uri: profileImage }} style={styles.profile} />
          </View>
        )}
        {user?.agent_code && <Text style={styles.agentCode}>#{user.agent_code}</Text>}
      </View>

      <TouchableWithoutFeedback onPress={toggleDuty}>
        <Animated.View style={[styles.switchBackground, { backgroundColor: backgroundColor as any }]}>
          <Text style={styles.text}>{toggleText}</Text>
          <Animated.View style={[styles.slider, { transform: [{ translateX }] }]} />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Existing toast */}
      {toast && (
        <View style={[styles.toast, getToastStyle()]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}

      {/* Modal to show backend message */}
      <Modal
        visible={!!modalMessage}
        transparent
        animationType="fade"
        onRequestClose={() => setModalMessage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <Pressable style={styles.modalButton} onPress={() => setModalMessage(null)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  profileWrapper: { alignItems: "center" },
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
  profile: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: "#fff" },
  agentCode: { marginTop: 4, fontSize: 12, fontWeight: "700", color: "#fff" },
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
  slider: { position: "absolute", width: 14, height: 14, borderRadius: 7, backgroundColor: "#fff", top: 9, elevation: 4 },
  text: { position: "absolute", width: "100%", textAlign: "center", color: "#fff", fontWeight: "600", fontSize: 11 },
  toast: { position: "absolute", left: 20, right: 20, bottom: Platform.OS === "ios" ? 80 : 72, padding: 10, borderRadius: 8, alignItems: "center" },
  toastText: { color: "#fff", fontSize: 13, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "80%", backgroundColor: "#fff", padding: 20, borderRadius: 12, alignItems: "center" },
  modalText: { fontSize: 16, fontWeight: "600", textAlign: "center", marginBottom: 20 },
  modalButton: { backgroundColor: "#4CAF50", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
