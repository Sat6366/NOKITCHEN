// components/screens/Main.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import GradientBackground from "../home/GradientBackground";
import CustomHeaderOptions from "../common/CustomHeaderOptions";
import DeliveryBenefitsBanner from "../common/DeliveryBenefitsBanner";
import ProfileWithToggle from "../common/ProfileToggle";
import NavButtons from "../common/NavButtons";

export default function Main() {
  return (
    <GradientBackground style={styles.gradient}>
      {/* Fixed Header with Back Arrow */}
      <CustomHeaderOptions title="Home" showBack />

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileWithToggle />
        <View style={styles.page}>
          <Text style={styles.text}></Text>
          <DeliveryBenefitsBanner />

          {/* Example scrollable items */}
          <View style={styles.box} />
          <View style={styles.box} />
          <View style={styles.box} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <NavButtons/>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // space for bottom nav
  },
  page: {
    flexGrow: 1,
    justifyContent: "center",
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
