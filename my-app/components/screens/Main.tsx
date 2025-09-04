// components/screens/Main.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import NavButtons from "../common/NavButtons";
import GradientBackground from "../home/GradientBackground";
import CustomHeaderOptions from "../common/CustomHeaderOptions";
import ProfileToggle from "../common/ProfileToggle";
import WeatherBanner from "../common/WeatherBanner";
import DeliveryBenefitsBanner from "../common/DeliveryBenefitsBanner";


export default function Main() {
  const handleNav = (screen: string) => {
    console.log("Pressed:", screen);
  };

  return (
    <GradientBackground>
      {/* ✅ Full screen gradient, no header */}
      <CustomHeaderOptions />
       <ProfileToggle />
       <WeatherBanner/>




      
      <View style={styles.container}>
        <DeliveryBenefitsBanner/>
        
        <Text style={styles.text}> </Text>
        
        {/* ✅ Bottom Nav */}
        <View style={styles.navContainer}>
          <NavButtons onPress={handleNav} />
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  navContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    paddingHorizontal: 20,
  },
});
