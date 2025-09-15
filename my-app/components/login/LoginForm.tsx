import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
const BASE_URL = "http://192.168.0.9:8000/api"; // replace with your PC LAN IP

export default function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  const handleLogin = async () => {
    if (phone.length !== 10) {
      Alert.alert("Invalid Number", "Please enter a valid 10-digit phone number");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone }),
      });

      if (!res.ok) throw new Error("Failed to send request");
      const data = await res.json();

      if (data.success) {
        router.push({ pathname: "/otp", params: { sessionId: data.session_id, mobile: phone } });
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network Error", "Could not connect to server");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.inputWrapper}>
        <Text style={styles.prefix}>+91</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Phone Number"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={10}
        />
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")} style={{ marginTop: 18 }}>
        <Text style={styles.signupText}>
          New user? <Text style={styles.signupLink}>Sign up here</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: height * 0.05, alignItems: "center", width: "100%" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#f9fafb",
    height: 48,
    width: "80%",
  },
  prefix: { fontSize: Math.min(width * 0.045, 16), fontWeight: "600", color: "#374151", marginRight: 6 },
  input: { flex: 1, fontSize: 16, color: "#111827" },
  primaryBtn: { backgroundColor: "#faa403", paddingVertical: 13, borderRadius: 26, alignItems: "center", marginTop: 24, width: "65%" },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  signupText: { fontSize: 14, color: "#4b5563", textAlign: "center" },
  signupLink: { color: "#faa403", fontWeight: "600", textDecorationLine: "underline" },
});
