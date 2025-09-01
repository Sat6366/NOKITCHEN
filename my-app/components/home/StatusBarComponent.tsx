// components/common/StatusBarComponent.tsx
import React from "react";
import { StatusBar, Platform, View, StyleSheet } from "react-native";

const STATUS_BAR_COLOR = "#f88838ff"; // <-- use start or darker color if you prefer
const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24;

export default function StatusBarComponent() {
  return (
    <View style={[styles.statusBarBackground]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={STATUS_BAR_COLOR}
        translucent={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statusBarBackground: {
    height: STATUSBAR_HEIGHT,
    backgroundColor: STATUS_BAR_COLOR,
  },
});
