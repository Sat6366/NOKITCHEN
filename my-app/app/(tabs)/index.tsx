import React, { useRef } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { onboardingSlides } from "@/constants/onboardingSlides";
import SlideView from "@/components/onboarding/Slide";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const flatListRef = useRef<FlatList<any>>(null);
  const router = useRouter();

  // ✅ Navigate to login
  const handleGetStarted = () => {
    console.log("➡️ Button pressed, navigating...");
    router.push("/login"); // use push (safer than replace for onboarding)
  };

  return (
    <View style={styles.container}>
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <SlideView {...item} />}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.heading}>Welcome to No Kitchen Captain</Text>
        <Text style={styles.subHeading}>
          Fresh meals delivered at your doorstep
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleGetStarted}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  footer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 6,
    textAlign: "center",
  },
  subHeading: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: "#faa403",
    paddingVertical: 16,
    paddingHorizontal: 70,
    borderRadius: 40,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  primaryBtnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
  },
});
