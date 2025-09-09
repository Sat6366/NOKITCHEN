// components/screens/Main.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import GradientBackground from "../home/GradientBackground";
import CustomHeaderOptions from "../common/CustomHeaderOptions";
import DeliveryBenefitsBanner from "../common/DeliveryBenefitsBanner";
import ProfileWithToggle from "../common/ProfileToggle";


export default function Main() {
  return (
    <GradientBackground style={styles.gradient}>
      <CustomHeaderOptions title="Home" /> 
      <ProfileWithToggle/>
      <View style={styles.page}>
        <Text style={styles.text}>🏠 Main Screen</Text>
        <DeliveryBenefitsBanner/>
      </View>
      
    </GradientBackground>
    
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    borderTopLeftRadius: 0, 
    borderTopRightRadius: 0,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
});
