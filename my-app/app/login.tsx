import React from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import BrandLogo from "@/components/login/BrandLogo";
import LoginForm from "@/components/login/LoginForm";
import SocialLogins from "@/components/login/SocialLogins";
import AppHeader from "@/components/common/AppHeader";

export default function Login() {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* App Header */}
      <AppHeader title="NoKitchen" />

      <View style={styles.content}>
        <BrandLogo />
        <View style={styles.formWrapper}>
          <LoginForm />
          <SocialLogins />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  formWrapper: { marginTop: 20, alignItems: "center" },
});
