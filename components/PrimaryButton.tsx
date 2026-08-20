import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import { COLORS } from "../constants/colors";

type Props = {
  title: string;
  onPress: () => void;
  tone?: "blue" | "green" | "red";
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function PrimaryButton({ title, onPress, tone = "blue", icon }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: tone === "red" ? COLORS.red : tone === "green" ? COLORS.green : COLORS.blue },
        pressed && { opacity: 0.85 }
      ]}
    >
      {icon && <Ionicons name={icon} size={28} color="white" />}
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 62,
    marginHorizontal: 14,
    marginVertical: 8,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16
  },
  text: { color: "white", fontSize: 18, fontWeight: "900" }
});
