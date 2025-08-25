// components/ImageCarousel.js
import React, { useRef, useState } from "react";
import {
  View,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
} from "react-native";

const { width } = Dimensions.get("window");

const images = [
  require("../assets/images/img1.jpg"),
  require("../assets/images/img2.jpg"),
  require("../assets/images/img3.jpg"),
  require("../assets/images/img4.jpg"),
];

const ImageCarousel = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Images */}
      <Animated.FlatList
        data={images}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item }) => (
          <Image source={item} style={styles.image} resizeMode="cover" />
        )}
      />

      {/* Dots Indicator */}
      <View style={styles.dotContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { opacity: activeIndex === index ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default ImageCarousel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: width,
    height: 250, // you can make it full screen with Dimensions.get("window").height
    borderRadius: 10,
  },
  dotContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 15,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    margin: 5,
  },
});
