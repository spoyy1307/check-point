import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

type Tone = "red" | "orange" | "yellow" | "blue" | "purple" | "gray";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  tone: Tone;
  title: string;
  subtitle: string;
  onPress: () => void;
};

const toneColor: Record<Tone, string> = {
  red: COLORS.red,
  orange: "#F57B0A",
  yellow: COLORS.yellow,
  blue: "#2F6FDE",
  purple: COLORS.purple,
  gray: COLORS.gray
};

export default function EmergencyOption({ icon, tone, title, subtitle, onPress }: Props) {
  const color = toneColor[tone];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
    >
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Ionicons name={icon} size={32} color="white" />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={26} color="#52627A" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 78,
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: { flex: 1 },
  title: { fontSize: 17, fontWeight: "900", color: COLORS.text },
  subtitle: { fontSize: 12, color: "#68768B", marginTop: 2 }
});
