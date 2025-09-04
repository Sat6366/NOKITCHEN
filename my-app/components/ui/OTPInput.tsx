import React, { useRef, useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text, Keyboard } from "react-native";

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
}

export default function OTPInput({ length = 6, onComplete }: OTPInputProps) {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputs = useRef<(TextInput | null)[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return; // allow only numbers

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // auto-focus next
    if (text && index < length - 1) inputs.current[index + 1]?.focus();

    // if all filled and not already completed
    if (newOtp.every(d => d !== "") && !completed) {
      setCompleted(true);
      onComplete && onComplete(newOtp.join(""));
      Keyboard.dismiss(); // hide keyboard
    } else if (newOtp.some(d => d === "")) {
      setCompleted(false);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={el => (inputs.current[index] = el)}
          value={digit}
          onChangeText={t => handleChange(t, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          keyboardType="numeric"
          maxLength={1}
          style={styles.input}
          autoFocus={index === 0}
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "center", marginVertical: 20 },
  input: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 5,
    borderRadius: 8,
    fontSize: 22,
    color: "#000",
  },
});
