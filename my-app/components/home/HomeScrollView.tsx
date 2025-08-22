import React from 'react';
import { ScrollView, View } from 'react-native';
import Carousel from '@/components/home/Carousel';
import HowToJoin from '@/components/home/HowToJoin';

export default function HomeScrollView() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Your scrollable sections */}
      <View className="mt-4">
        <Carousel />
      </View>

      <View className="mt-6">
        <HowToJoin />
      </View>

      {/* More sections can go here */}
    </ScrollView>
  );
}
