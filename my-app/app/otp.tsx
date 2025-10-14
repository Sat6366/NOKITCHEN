// app/otp.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
  TextInput,
  Keyboard,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AppHeader from "@/components/common/AppHeader";
import CustomHeaderOptions from "@/components/common/CustomHeaderOptions";
import { useAuth } from "@/components/context/AuthContext";

const BASE_URL = "http://192.168.0.7:8000/api"; // replace with your server IP

// ================= OTP INPUT COMPONENT =================
const OTPInput = ({
  length = 6,
  onComplete,
}: {
  length?: number;
  onComplete?: (otp: string) => void;
}) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputs = useRef<(TextInput | null)[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return; // only numbers
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < length - 1) inputs.current[index + 1]?.focus();

    if (newOtp.every((d) => d !== "") && !completed) {
      setCompleted(true);
      onComplete && onComplete(newOtp.join(""));
      Keyboard.dismiss();
    } else if (newOtp.some((d) => d === "")) {
      setCompleted(false);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpContainer}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          value={digit}
          onChangeText={(t) => handleChange(t, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="numeric"
          maxLength={1}
          style={styles.otpInput}
          autoFocus={index === 0}
          textAlign="center"
        />
      ))}
    </View>
  );
};

// ================= OTP PAGE =================
export default function OTPPage() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { sessionId = "", mobile = "" } =
    useLocalSearchParams<{ sessionId?: string; mobile?: string }>();

  const { login } = useAuth(); // use login() instead of setUser

  // fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // resend timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // handle OTP verification
  const handleContinue = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert("Error", "Enter full 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      console.log("Verify OTP response:", data);

      if (data.success && data.partner) {
        Alert.alert("Success", "OTP Verified ✅");

        // ✅ store logged-in user globally via AuthContext
        await login(data);

        router.replace("/home"); // redirect to home screen
      } else {
        Alert.alert("Error", data.message || "Invalid OTP");
      }
    } catch (err) {
      console.log("Error in handleContinue:", err);
      Alert.alert("Error", "Server not reachable. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // handle resend
  const handleResend = async () => {
    if (timer !== 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobile.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTimer(30);
        Alert.alert("OTP Sent", "New OTP sent successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to resend OTP");
      }
    } catch {
      Alert.alert("Error", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FF914D", "#AB003E"]} style={styles.container}>
      <CustomHeaderOptions />
      <AppHeader />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Code sent to <Text style={{ fontWeight: "600" }}>{mobile}</Text>
          </Text>

          <OTPInput length={6} onComplete={setOtp} />

          <TouchableOpacity
            style={[styles.buttonContainer, (!otp || loading) && { opacity: 0.6 }]}
            disabled={!otp || loading}
            onPress={handleContinue}
          >
            <LinearGradient colors={["#FF914D", "#FF5722"]} style={styles.button}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.timerText}>
            {timer > 0 ? `Resend OTP in ${timer}s` : "Didn't get OTP?"}
          </Text>
          {timer === 0 && !loading && (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  card: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    alignItems: "center",
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#222", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 25, textAlign: "center" },
  buttonContainer: { width: "100%", marginTop: 30 },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold", letterSpacing: 1 },
  timerText: { marginTop: 20, fontSize: 14, color: "#999" },
  resendText: { marginTop: 10, fontSize: 16, color: "#FF5722", fontWeight: "600" },
  otpContainer: { flexDirection: "row", justifyContent: "center", marginVertical: 20 },
  otpInput: { width: 45, height: 55, borderWidth: 1, borderColor: "#ccc", marginHorizontal: 5, borderRadius: 8, fontSize: 22, color: "#000" },
});
