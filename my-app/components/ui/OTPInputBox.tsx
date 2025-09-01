import React, { forwardRef, useState } from "react";
import { TextInput, StyleSheet, View, TextInputProps } from "react-native";

interface OTPInputBoxProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onKeyPress?: (event: any) => void;
}

const OTPInputBox = forwardRef<TextInput, OTPInputBoxProps>(
  ({ value, onChangeText, onKeyPress, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={[styles.container, isFocused && styles.focusedContainer]}>
        <TextInput
          ref={ref}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onKeyPress={onKeyPress}
          maxLength={1}
          keyboardType="number-pad"
          textAlign="center"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
      </View>
    );
  }
);

export default OTPInputBox;

const styles = StyleSheet.create({
  container: {
    width: 55,
    height: 55,
    borderWidth: 1.5,
    borderColor: "#d1d5db", // light gray default
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2, // for Android
  },
  focusedContainer: {
    borderColor: "#fa9b0d", // highlight color (brand orange)
    shadowOpacity: 0.2,
    elevation: 4,
  },
  input: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827", // dark text
    width: "100%",
    height: "100%",
  },
});
