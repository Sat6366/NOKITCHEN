import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Platform, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({
  title = 'NO KITCHEN',
  subtitle = 'Daily meal subscriptions • Home-style • On-time',
}: HeaderProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme || 'light'];

  return (
    <SafeAreaView
      style={[
        { backgroundColor: theme.bg },
        Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 4 },
          },
          android: { elevation: 3 },
        }),
      ]}
    >
      <View style={{ alignItems: 'center', paddingVertical: 12 }}>
        <Text
          accessibilityRole="header"
          style={{
            fontSize: 20,
            fontWeight: '900',
            letterSpacing: 1.2,
            color: theme.brand,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            marginTop: 4,
            fontSize: 12,
            color: theme.subtitle,
            letterSpacing: 0.4,
          }}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>
    </SafeAreaView>
  );
}
