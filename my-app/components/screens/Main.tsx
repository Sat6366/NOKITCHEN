// components/screens/Main.tsx
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import GradientBackground from "../home/GradientBackground";
import CustomHeaderOptions from "../common/CustomHeaderOptions";
import DeliveryBenefitsBanner from "../common/DeliveryBenefitsBanner";
import ProfileWithToggle from "../common/ProfileToggle";
import NavButtons from "../common/NavButtons";
import WeatherBanner from "../common/WeatherBanner";

export default function Main() {
  const dummyData = [1, 2];

  return (
    <GradientBackground style={styles.gradient}>
      {/* Fixed Header */}
      <CustomHeaderOptions title="Home" showBack />

      {/* Scrollable content */}
      <FlatList
        data={dummyData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={() => <View style={styles.box} />}
        ListHeaderComponent={
          <View style={styles.page}>
            {/* ✅ Safe: never mutate props inside ProfileWithToggle */}
            <ProfileWithToggle />
            <WeatherBanner />
            <Text style={styles.text}></Text>
            {/* ✅ Safe: never mutate props inside DeliveryBenefitsBanner */}
            <DeliveryBenefitsBanner />
          </View>
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Fixed Bottom Navigation */}
      <NavButtons />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
