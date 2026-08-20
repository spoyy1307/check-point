import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/colors";

export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  text: { color: COLORS.text, fontSize: 16, fontWeight: "900" }
});
