import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

const images = [
  require('@/assets/images/welcome1.png'),
  require('@/assets/images/welcome2.png'),
];

export default function Carousel() {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  // Auto-scroll every 3s
  useEffect(() => {
    const id = setInterval(() => {
      const next = (index + 1) % images.length;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setIndex(next);
    }, 3000);
    return () => clearInterval(id);
  }, [index]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onEnd}
      >
        {images.map((img, i) => (
          <Image key={i} source={img} style={styles.image} />
        ))}
      </ScrollView>

      {/* dots */}
      <View style={styles.dots}>
        {images.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: i === index ? 1 : 0.35, width: i === index ? 18 : 8 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: Colors.light.bg },
  image: { width, height: 250, resizeMode: 'cover' },
  dots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.light.brand,
  },
});
