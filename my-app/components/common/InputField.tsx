import React from "react";
import { TextInput, StyleSheet, TextInputProps, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

type InputFieldProps = TextInputProps;

export default function InputField(props: InputFieldProps) {
  return (
    <TextInput
      {...props}
      style={styles.input}
      placeholderTextColor="#9ca3af"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: width * 0.8,       // 80% width
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: Math.min(width * 0.11, 44), // ✅ slightly shorter
    fontSize: Math.min(width * 0.042, 16),
    marginTop: 10,             // ✅ less spacing between fields
    color: "#111827",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
});
