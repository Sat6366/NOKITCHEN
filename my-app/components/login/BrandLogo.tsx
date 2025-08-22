import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView,
} from "react-native";

const { width, height } = Dimensions.get("window");

const images = [
  require("@/assets/images/welcome2.png"),
  require("@/assets/images/welcome1.png"),
  require("@/assets/images/welcome2.png"),
];

export default function BrandLogo() {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(nextIndex);

      scrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    }, 3000); // ⏱️ auto-scroll every 3s

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      {/* ✅ Horizontal auto-scroll */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollWrapper}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      >
        {images.map((img, idx) => (
          <Image key={idx} source={img} style={styles.logo} resizeMode="contain" />
        ))}
      </ScrollView>

      {/* ✅ Dots indicator */}
      <View style={styles.dotsWrapper}>
        {images.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              currentIndex === idx && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* ✅ Titles */}
      <Text style={styles.title}>Welcome Captain</Text>
      <Text style={styles.subtitle}>Let’s login & Start your Duty</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: height * 0.05,
    paddingHorizontal: 20,
    width: "100%",
  },
  scrollWrapper: {
    width: "100%",
    maxHeight: height * 0.35,
  },
  logo: {
    width: width,
    height: height * 0.3,
    maxHeight: 280,
  },
  dotsWrapper: {
    flexDirection: "row",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#faa403",
    width: 10,
    height: 10,
  },
  title: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: "bold",
    color: "#000",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Math.min(width * 0.045, 16),
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});
