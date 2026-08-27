import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import EmergencyControlCenterModal from "./EmergencyControlCenterModal";

export default function EmergencyCallButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setShowModal(true)}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityRole="button"
      >
        <View style={styles.iconCircle}>
          <Ionicons name="call" size={30} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>ติดต่อศูนย์ควบคุมทันที</Text>
          <Text style={styles.sub}>ขอความช่วยเหลือกรณีเร่งด่วน</Text>
        </View>
        <Ionicons name="chevron-forward" size={28} color="white" />
      </Pressable>

      <EmergencyControlCenterModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 74,
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 15,
    backgroundColor: COLORS.red,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  title: { color: "white", fontSize: 16, fontWeight: "900" },
  sub: { color: "white", opacity: 0.9, marginTop: 2, fontSize: 12 },
  buttonPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] }
});
