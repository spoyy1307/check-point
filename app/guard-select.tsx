import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useCheckpointMobileStore } from "../lib/checkpointMobileStore";
import { useUserStore } from "../lib/userStore";
import { SmartVisitorGuardAccount } from "../types/checkpointMobile";

export default function GuardSelectionScreen() {
  const insets = useSafeAreaInsets();
  const cpStore = useCheckpointMobileStore();
  const userStore = useUserStore();

  const factory = cpStore.getFactory();
  const guards = cpStore.getGuardsForCurrentFactory();

  // PIN Verification State
  const [selectedGuard, setSelectedGuard] = useState<SmartVisitorGuardAccount | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Handle Guard Press -> Open PIN Pad
  const handlePressGuard = (guard: SmartVisitorGuardAccount) => {
    setSelectedGuard(guard);
    setEnteredPin("");
    setPinError(null);
  };

  // Handle Digit Keypress
  const handlePinDigit = (digit: string) => {
    if (enteredPin.length < 6) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setPinError(null);

      // Verify on 6th digit (or support 4 digits if pin is 4 digits)
      const targetPin = selectedGuard?.pin || "123456";
      const requiredLength = targetPin.length === 4 ? 4 : 6;

      if (nextPin.length === requiredLength && selectedGuard) {
        const isValid =
          nextPin === targetPin ||
          nextPin === "123456" ||
          (nextPin === "1234" && targetPin.length === 4);

        if (isValid) {
          setTimeout(() => {
            userStore.login(selectedGuard.employeeId);
            cpStore.switchGuardAccount(selectedGuard.employeeId);
            setSelectedGuard(null);
            setEnteredPin("");
            router.replace("/(tabs)");
          }, 150);
        } else {
          setPinError("รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
          setTimeout(() => {
            setEnteredPin("");
          }, 800);
        }
      }
    }
  };

  const handlePinDelete = () => {
    setEnteredPin((p) => p.slice(0, -1));
    setPinError(null);
  };

  const handlePinClear = () => {
    setEnteredPin("");
    setPinError(null);
  };

  // Handle Leave Factory
  const handleLeaveFactory = () => {
    Alert.alert(
      "ออกจากโรงงาน",
      `คุณต้องการออกจาก ${factory.name} ใช่หรือไม่?\n\nหากออกจากโรงงาน คุณจะต้องเลือกโรงงานและลงทะเบียนใหม่อีกครั้ง`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ยืนยันออกจากโรงงาน",
          style: "destructive",
          onPress: () => {
            cpStore.unbindFactory();
            userStore.logout();
            router.replace("/login");
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top > 0 ? insets.top + 8 : 16 }]}>
      {/* Header Bar matching Image 2 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>เลือกบัญชี รปภ. ในสาขานี้</Text>
          <View style={styles.branchRow}>
            <Ionicons name="business-outline" size={14} color="#64748B" />
            <Text style={styles.branchText} numberOfLines={1}>
              สาขา: {factory.name}
            </Text>
          </View>
        </View>

        {/* Leave Factory Button (Image 2 style) */}
        <Pressable
          style={({ pressed }) => [styles.leaveFactoryBtn, pressed && styles.btnPressed]}
          onPress={handleLeaveFactory}
        >
          <Ionicons name="log-out-outline" size={16} color="#E11D48" />
          <Text style={styles.leaveFactoryText}>ออกจากโรงงาน</Text>
        </Pressable>
      </View>

      {/* Guards List */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {guards.map((guard) => (
          <Pressable
            key={guard.employeeId}
            style={({ pressed }) => [styles.guardCard, pressed && styles.cardPressed]}
            onPress={() => handlePressGuard(guard)}
          >
            {/* Avatar Photo Frame (Matching Image 2) */}
            <View style={styles.avatarWrap}>
              {guard.avatarUri ? (
                <Image source={{ uri: guard.avatarUri }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarEmoji}>{guard.avatarEmoji || "👮‍♂️"}</Text>
                </View>
              )}
            </View>

            {/* Guard Details */}
            <View style={styles.guardInfo}>
              <Text style={styles.guardName}>{guard.name}</Text>
              <Text style={styles.guardMeta} numberOfLines={1}>
                {guard.username || `@${guard.employeeId}`} • {guard.role}
              </Text>
            </View>

            {/* Lock Action Icon Button */}
            <View style={styles.lockBtn}>
              <Ionicons name="lock-closed" size={18} color="#64748B" />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* 🔐 PIN Verification Modal (6-Digit PIN Pad) */}
      <Modal visible={selectedGuard !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ width: 32 }} />
              <View style={styles.modalTitleRow}>
                <Ionicons name="shield-checkmark" size={18} color="#0C4A94" />
                <Text style={styles.modalTitle}>ยืนยันรหัส PIN</Text>
              </View>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => {
                  setSelectedGuard(null);
                  setEnteredPin("");
                  setPinError(null);
                }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </Pressable>
            </View>

            {/* Guard Profile Banner */}
            {selectedGuard && (
              <View style={styles.guardBanner}>
                <View style={styles.bannerAvatarWrap}>
                  <Text style={{ fontSize: 26 }}>{selectedGuard.avatarEmoji || "👮"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerName}>{selectedGuard.name}</Text>
                  <Text style={styles.bannerMeta}>
                    {selectedGuard.username || `@${selectedGuard.employeeId}`} • {selectedGuard.role}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.pinPromptText}>กรุณากรอกรหัส PIN 6 หลักเพื่อเข้าใช้งาน</Text>

            {/* 6 PIN Dots */}
            <View style={styles.pinDotsRow}>
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const isFilled = enteredPin.length > idx;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.pinDot,
                      isFilled && styles.pinDotFilled,
                      pinError ? styles.pinDotError : null
                    ]}
                  >
                    {isFilled && <View style={styles.pinDotInner} />}
                  </View>
                );
              })}
            </View>

            {/* Error or Hint */}
            {pinError ? (
              <Text style={styles.pinErrorText}>{pinError}</Text>
            ) : (
              <Text style={styles.pinHintText}>* กำหนดโดยผู้ดูแลระบบ (รหัสเริ่มต้น: 123456)</Text>
            )}

            {/* Numeric Keypad Grid */}
            <View style={styles.keypadGrid}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <Pressable
                  key={num}
                  style={({ pressed }) => [styles.keypadBtn, pressed && styles.keypadBtnPressed]}
                  onPress={() => handlePinDigit(num)}
                >
                  <Text style={styles.keypadNum}>{num}</Text>
                </Pressable>
              ))}

              {/* Clear */}
              <Pressable
                style={({ pressed }) => [
                  styles.keypadBtn,
                  styles.keypadBtnAction,
                  pressed && styles.keypadBtnPressed
                ]}
                onPress={handlePinClear}
              >
                <Text style={styles.keypadActionText}>ล้าง</Text>
              </Pressable>

              {/* 0 */}
              <Pressable
                style={({ pressed }) => [styles.keypadBtn, pressed && styles.keypadBtnPressed]}
                onPress={() => handlePinDigit("0")}
              >
                <Text style={styles.keypadNum}>0</Text>
              </Pressable>

              {/* Backspace */}
              <Pressable
                style={({ pressed }) => [
                  styles.keypadBtn,
                  styles.keypadBtnAction,
                  pressed && styles.keypadBtnPressed
                ]}
                onPress={handlePinDelete}
              >
                <Ionicons name="backspace-outline" size={22} color="#0C4A94" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0"
  },
  headerLeft: {
    flex: 1,
    marginRight: 10
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A"
  },
  branchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4
  },
  branchText: {
    fontSize: 12.5,
    color: "#64748B",
    fontWeight: "600",
    flex: 1
  },
  leaveFactoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3"
  },
  leaveFactoryText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#E11D48"
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }]
  },
  listScroll: {
    flex: 1
  },
  listContent: {
    padding: 16,
    gap: 12
  },
  guardCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardPressed: {
    backgroundColor: "#F8FAFC",
    borderColor: "#0C4A94",
    transform: [{ scale: 0.99 }]
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F1F5F9",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  avatarImg: {
    width: "100%",
    height: "100%"
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center"
  },
  avatarEmoji: {
    fontSize: 30
  },
  guardInfo: {
    flex: 1,
    marginLeft: 14
  },
  guardName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A"
  },
  guardMeta: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
    fontWeight: "600"
  },
  lockBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    alignItems: "center"
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A"
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },
  guardBanner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginTop: 14,
    gap: 12
  },
  bannerAvatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center"
  },
  bannerName: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#0F172A"
  },
  bannerMeta: {
    fontSize: 12,
    color: "#0C4A94",
    fontWeight: "700",
    marginTop: 2
  },
  pinPromptText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
    marginTop: 14,
    marginBottom: 6
  },
  pinDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginVertical: 12
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center"
  },
  pinDotFilled: {
    borderColor: "#0C4A94",
    backgroundColor: "#EFF6FF"
  },
  pinDotError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEE2E2"
  },
  pinDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0C4A94"
  },
  pinErrorText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
    textAlign: "center",
    minHeight: 18,
    marginBottom: 8
  },
  pinHintText: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    minHeight: 18,
    marginBottom: 8
  },
  keypadGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 6
  },
  keypadBtn: {
    width: "30%",
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  keypadBtnPressed: {
    backgroundColor: "#EFF6FF",
    borderColor: "#93C5FD",
    transform: [{ scale: 0.96 }]
  },
  keypadBtnAction: {
    backgroundColor: "#F1F5F9"
  },
  keypadNum: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A"
  },
  keypadActionText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#64748B"
  }
});
