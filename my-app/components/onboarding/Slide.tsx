import React from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";

const { width, height } = Dimensions.get("window");

type SlideProps = {
  title: string;
  subtitle: string;
  image: any;
};

export default function SlideView({ title, subtitle, image }: SlideProps) {
  return (
    <View style={styles.container}>
      {/* Image */}
      <Image source={image} style={styles.image} resizeMode="contain" />

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  image: {
    height: height * 0.75, // 75% of screen height
    width: width * 0.9, // responsive
  },
  textContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
});
