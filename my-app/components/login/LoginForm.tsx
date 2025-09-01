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
} from "react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  const handleLogin = () => {
    if (phone.length >= 10) {
       router.push("/otp");
;
    } else {
      alert("Please enter a valid phone number");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Phone Input */}
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

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleLogin}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Continue</Text>
      </TouchableOpacity>

      {/* Signup Redirect */}
      <TouchableOpacity
        onPress={() => router.push("/signup")}
        activeOpacity={0.7}
        style={{ marginTop: 18 }}
      >
        <Text style={styles.signupText}>
          New user? <Text style={styles.signupLink}>Sign up here</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: height * 0.05,
    alignItems: "center", // ✅ center all children
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#f9fafb",
    height: 48,
    width: "80%", // ✅ reduced width
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  prefix: {
    fontSize: Math.min(width * 0.045, 16),
    fontWeight: "600",
    color: "#374151",
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: Math.min(width * 0.045, 16),
    color: "#111827",
  },
  primaryBtn: {
    backgroundColor: "#faa403",
    paddingVertical: 13,
    borderRadius: 26,
    alignItems: "center",
    marginTop: 24,
    width: "65%", // ✅ reduced width
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: Math.min(width * 0.045, 16),
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.4,
  },
  signupText: {
    fontSize: Math.min(width * 0.038, 14),
    color: "#4b5563",
    textAlign: "center",
  },
  signupLink: {
    color: "#faa403",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
