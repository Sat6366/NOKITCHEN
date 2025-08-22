import React from "react";
import { View } from "react-native";
import BrandLogo from "@/components/login/BrandLogo";
import LoginForm from "@/components/login/LoginForm";
import SocialLogins from "@/components/login/SocialLogins";
import AppHeader from "@/components/common/AppHeader";

export default function Login() {
  return (
    <View className="flex-1 bg-white">
      {/* ✅ App Header at the top */}
      <AppHeader title="NoKitchen" />

      {/* ✅ Login flow content */}
      <View className="flex-1 px-6">
        <BrandLogo />
        <LoginForm />
        <SocialLogins />
      </View>
    </View>
  );
}
