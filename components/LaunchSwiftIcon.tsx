import React from "react";
import { Image, StyleSheet, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

interface LaunchSwiftIconProps {
  size?: number;
  style?: object;
}

const logoSource: ImageSourcePropType = require("@/assets/images/84c8bbe6-9684-499d-a21b-af66c880f25e.jpeg");

export function LaunchSwiftIcon({ size = 48, style }: LaunchSwiftIconProps) {
  const borderRadius = size * 0.22;
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius }, style]}>
      <Image
        source={logoSource}
        style={{ width: size, height: size, borderRadius }}
        resizeMode="cover"
      />
    </View>
  );
}

export default LaunchSwiftIcon;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
