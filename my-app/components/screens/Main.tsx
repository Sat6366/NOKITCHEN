// components/screens/Main.tsx
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native"; // ⬅️ swapped ScrollView -> FlatList
import GradientBackground from "../home/GradientBackground";
import CustomHeaderOptions from "../common/CustomHeaderOptions";
import DeliveryBenefitsBanner from "../common/DeliveryBenefitsBanner";
import ProfileWithToggle from "../common/ProfileToggle";
import NavButtons from "../common/NavButtons";
import WeatherBanner from "../common/WeatherBanner";

export default function Main() {
  // dummy list items just to render your <View style={styles.box} />
  const dummyData = [1, 2];

  return (
    <GradientBackground style={styles.gradient}>
      {/* Fixed Header with Back Arrow */}
      <CustomHeaderOptions title="Home" showBack />

      {/* Scrollable middle content only */}
      <FlatList
        data={dummyData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={() => <View style={styles.box} />}
        ListHeaderComponent={
          <View style={styles.page}>
            <ProfileWithToggle />
            <WeatherBanner />
            <Text style={styles.text}></Text>
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
