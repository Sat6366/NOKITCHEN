import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router"; // ✅ navigation
import OTPInput from "@/components/ui/OTPInput";
import AppHeader from "@/components/common/AppHeader";

export default function OTPPage() {
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handleContinue = () => {
    // ✅ For flow only: if otp has any value, redirect to home
    if (otp.length > 0) {
      router.replace("/home"); // move to Home
    } else {
      alert("Please enter OTP");
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader />

      <View style={styles.content}>
        <Text style={styles.title}>Enter OTP</Text>

        {/* OTP Input */}
        <OTPInput
          length={6}
          onComplete={(value: string) => setOtp(value)}
        />

        {/* Continue button */}
        <TouchableOpacity
          style={[styles.button, otp.length === 0 && styles.buttonDisabled]}
          disabled={otp.length === 0}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    marginTop: 30,
    backgroundColor: "#fa9b0d",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
