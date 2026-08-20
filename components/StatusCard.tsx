import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

type Props = {
  tone?: "success" | "warning" | "danger" | "blue";
  title: string;
  text?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function StatusCard({ tone="blue", title, text, icon="information-circle-outline" }: Props) {
  const color =
    tone === "success" ? COLORS.green :
    tone === "warning" ? COLORS.orange :
    tone === "danger" ? COLORS.red : COLORS.blue;

  const bg =
    tone === "success" ? COLORS.greenSoft :
    tone === "warning" ? COLORS.orangeSoft :
    tone === "danger" ? COLORS.redSoft : COLORS.blueSoft;

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor: `${color}44` }]}>
      <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color }]}>{title}</Text>
        {!!text && <Text style={styles.text}>{text}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  title: { fontSize: 16, fontWeight: "900" },
  text: { marginTop: 3, color: COLORS.text, fontSize: 13 }
});
