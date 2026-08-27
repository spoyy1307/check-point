import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

type Props = { title: string; back?: boolean; onBack?: () => void };

export default function TopBar({ title, back = false, onBack }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)");
    }
  };

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: insets.top > 0 ? insets.top + 8 : 16,
          paddingLeft: Math.max(insets.left, 12),
          paddingRight: Math.max(insets.right, 12),
          minHeight: (insets.top > 0 ? insets.top : 20) + 54
        }
      ]}
    >
      <View style={styles.side}>
        {back && (
          <Pressable onPress={handleBack} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={COLORS.white} />
          </Pressable>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.blue,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    paddingHorizontal: 12
  },
  side: { width: 44, alignItems: "flex-start", justifyContent: "center" },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  title: { flex: 1, color: "white", fontSize: 20, fontWeight: "900", textAlign: "center" }
});

