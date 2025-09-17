// components/screens/Main.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import GradientBackground from "../home/GradientBackground";
import CustomHeaderOptions from "../common/CustomHeaderOptions";
import DeliveryBenefitsBanner from "../common/DeliveryBenefitsBanner";
import ProfileWithToggle from "../common/ProfileToggle";
import NavButtons from "../common/NavButtons";
import WeatherBanner from "../common/WeatherBanner";

export default function Main() {
  return (
    <GradientBackground style={styles.gradient}>
      {/* Fixed Header with Back Arrow */}
      <CustomHeaderOptions title="Home" showBack />

      {/* Fixed top content */}
      

      {/* Scrollable middle content only */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileWithToggle />
      
        <WeatherBanner />
        <View style={styles.page}>
          <Text style={styles.text}></Text>
          <DeliveryBenefitsBanner />

          {/* Example scrollable items */}
          <View style={styles.box} />
          <View style={styles.box} />
          <View style={styles.box} />
          <View style={styles.box} />
          <View style={styles.box} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <NavButtons />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // space for bottom nav
    alignItems: "center",
  },
  page: {
    width: "100%",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  box: {
    height: 150,
    width: "90%",
    marginVertical: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
});
