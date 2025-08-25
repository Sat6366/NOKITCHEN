import React from "react";
import { TextInput, StyleSheet, TextInputProps, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

type InputFieldProps = TextInputProps;

export default function InputField(props: InputFieldProps) {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]}
      placeholderTextColor="#a4a4aaff" // subtle placeholder color
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "60%",            // full width of parent
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: Math.min(width * 0.11, 44), 
    fontSize: Math.min(width * 0.042, 16),
    marginTop: 6,              // reduced spacing
    color: "#111827",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,       // soft shadow
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    textAlign: "left",         // left-aligned text
  },
});
