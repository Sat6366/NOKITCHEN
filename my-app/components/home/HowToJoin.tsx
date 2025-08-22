import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export default function HowToJoin() {
  const scheme = useColorScheme();
  const theme = Colors[scheme || 'light'];

  return (
    <View className="px-5 mt-5">
      <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>
        How to join us
      </Text>

      <View className="mt-3">
        <Step index={1} title="Sign up in minutes" desc="Create your account with your mobile number." />
        <Step index={2} title="Choose your plan" desc="Pick flexible, home-style meal subscriptions." />
        <Step index={3} title="Start receiving meals" desc="We deliver fresh, on-time to your location." />
      </View>
    </View>
  );
}

function Step({ index, title, desc }: { index: number; title: string; desc: string }) {
  return (
    <View className="flex-row items-start mb-3">
      <View
        style={{
          height: 28,
          width: 28,
          borderRadius: 999,
          backgroundColor: '#fa9b0d',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
      >
        <Text style={{ fontWeight: '800' }}>{index}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: '#6b7280', marginTop: 2 }}>{desc}</Text>
      </View>
    </View>
  );
}
