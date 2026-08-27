import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useUserStore } from "../lib/userStore";
import { useCheckpointMobileStore } from "../lib/checkpointMobileStore";
import { SMART_VISITOR_FACTORIES } from "../types/checkpointMobile";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const userStore = useUserStore();
  const cpStore = useCheckpointMobileStore();
  const currentFactory = cpStore.getFactory();

  const [selectedFactoryId, setSelectedFactoryId] = useState(currentFactory.id);
  const [showFactoryModal, setShowFactoryModal] = useState(false);

  const [employeeId, setEmployeeId] = useState("00123");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const activeFactory =
    SMART_VISITOR_FACTORIES.find((f) => f.id === selectedFactoryId) || currentFactory;

  const handleLogin = () => {
    if (!employeeId.trim() || !password.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "โปรดระบุรหัสพนักงาน/รหัสแอดมิน และรหัสผ่าน");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      cpStore.bindFactory(selectedFactoryId);
      router.replace("/guard-select");
    }, 350);
  };

  const handleQuickDemo = (empId: string = "00123") => {
    setEmployeeId(empId);
    setPassword("123456");
    cpStore.setFactory(selectedFactoryId);
    userStore.login(empId);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top > 0 ? insets.top + 20 : 36,
            paddingBottom: insets.bottom + 24
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <View style={styles.logoBadge}>
              <Ionicons name="shield-checkmark" size={42} color="#0C4A94" />
            </View>
          </View>
          <Text style={styles.appName}>CHECK POINT</Text>
          <Text style={styles.appSub}>ระบบลงเวลาและตรวจจุด รปภ.</Text>
        </View>

        {/* Factory Selector Card */}
        <Pressable
          style={({ pressed }) => [styles.factorySelectorCard, pressed && styles.btnPressed]}
          onPress={() => setShowFactoryModal(true)}
        >
          <View style={styles.factoryIconBox}>
            <Ionicons name="business" size={20} color="#0C4A94" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.factoryCardLabel}>โรงงานที่เข้าปฏิบัติหน้าที่</Text>
            <Text style={styles.factoryCardName} numberOfLines={1}>
              {activeFactory.name}
            </Text>
            <Text style={styles.factoryCardSub}>{activeFactory.branchName}</Text>
          </View>
          <View style={styles.changeFactoryPill}>
            <Text style={styles.changeFactoryPillText}>เลือกโรงงาน</Text>
            <Ionicons name="chevron-forward" size={14} color="#0C4A94" />
          </View>
        </Pressable>

        {/* Login Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>เข้าสู่ระบบปฏิบัติงาน รปภ.</Text>
          <Text style={styles.cardSub}>
            กรุณากรอกรหัสพนักงานเพื่อเริ่มงานประจำกะ
          </Text>

          {/* Employee ID Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>รหัสพนักงาน รปภ. (Employee ID)</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="เช่น 00123"
                placeholderTextColor="#94A3B8"
                value={employeeId}
                onChangeText={setEmployeeId}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>รหัสผ่าน (Password)</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="กรอกรหัสผ่าน"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#64748B"
                />
              </Pressable>
            </View>
          </View>

          {/* Options Row */}
          <View style={styles.optionsRow}>
            <Pressable
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
              <Text style={styles.rememberText}>จดจำรหัสผ่าน</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "ลืมรหัสผ่าน",
                  "กรุณาติดต่อหัวหน้าชุด รปภ. หรือผู้ดูแลระบบ Check Point เพื่อขอรหัสผ่านใหม่"
                )
              }
            >
              <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
            </Pressable>
          </View>

          {/* Login Button */}
          <Pressable
            style={({ pressed }) => [styles.loginButton, pressed && styles.btnPressed]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Ionicons name="log-in-outline" size={22} color="white" />
            <Text style={styles.loginButtonText}>
              {loading ? "กำลังดำเนินการ..." : "ลงทะเบียนและเลือกบัญชี รปภ."}
            </Text>
          </Pressable>
        </View>

        {/* Footer info (Matching Settings Screen Style) */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={20} color="#0C4A94" />
          <Text style={styles.versionTitle}>Check Point Mobile</Text>
          <Text style={styles.versionSub}>เวอร์ชัน 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Factory Selector Modal */}
      <Modal visible={showFactoryModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>เลือกโรงงาน / โครงการ</Text>
                <Text style={styles.modalSub}>
                  ระบบจะแสดงข้อมูลเฉพาะของโรงงานที่เลือก
                </Text>
              </View>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setShowFactoryModal(false)}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.factoryList}>
              {SMART_VISITOR_FACTORIES.map((f) => {
                const isSelected = f.id === selectedFactoryId;
                return (
                  <Pressable
                    key={f.id}
                    style={[styles.factoryItem, isSelected && styles.factoryItemActive]}
                    onPress={() => {
                      setSelectedFactoryId(f.id);
                      setShowFactoryModal(false);
                    }}
                  >
                    <View style={styles.factoryItemIcon}>
                      <Ionicons
                        name="business"
                        size={22}
                        color={isSelected ? "#0C4A94" : "#64748B"}
                      />
                    </View>
                    <View style={{ flex: 1, paddingRight: 6 }}>
                      <Text
                        style={[
                          styles.factoryItemTitle,
                          isSelected && styles.factoryItemTitleActive
                        ]}
                        numberOfLines={1}
                      >
                        {f.name}
                      </Text>
                      <Text style={styles.factoryItemSub}>
                        {f.branchName} • {f.totalCheckpoints} จุดตรวจ
                      </Text>
                    </View>
                    <View style={[styles.switchRadio, isSelected && styles.switchRadioActive]}>
                      {isSelected && <View style={styles.switchRadioInner} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FB"
  },
  content: {
    paddingHorizontal: 16,
    justifyContent: "center"
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 16
  },
  logoWrap: {
    marginBottom: 10
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#EAF2FF",
    borderWidth: 3,
    borderColor: "#CCE0FA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3
  },
  appName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0C4A94",
    letterSpacing: 1
  },
  appSub: {
    fontSize: 12.5,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "700"
  },

  // Factory Selector Card
  factorySelectorCard: {
    backgroundColor: "#F0F6FF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#CCE0FA",
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  factoryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  factoryCardLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700"
  },
  factoryCardName: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#0C4A94",
    marginTop: 1
  },
  factoryCardSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1
  },
  changeFactoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D0E2FF"
  },
  changeFactoryPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0C4A94"
  },

  // Card
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4
  },
  cardTitle: {
    fontSize: 17.5,
    fontWeight: "900",
    color: COLORS.text
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
    marginBottom: 18
  },

  // Inputs
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: COLORS.text,
    height: "100%"
  },
  eyeBtn: {
    padding: 4
  },

  // Options
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 18
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white"
  },
  checkboxActive: {
    backgroundColor: "#0C4A94",
    borderColor: "#0C4A94"
  },
  rememberText: {
    fontSize: 12.5,
    color: "#475569",
    fontWeight: "600"
  },
  forgotText: {
    fontSize: 12.5,
    color: "#0C4A94",
    fontWeight: "700"
  },

  // Buttons
  loginButton: {
    backgroundColor: "#0C4A94",
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  loginButtonText: {
    color: "white",
    fontSize: 15.5,
    fontWeight: "900"
  },
  demoButton: {
    marginTop: 10,
    backgroundColor: "#F1F5F9",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  demoButtonText: {
    color: "#475569",
    fontSize: 12.5,
    fontWeight: "800"
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  },

  // Footer
  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 10,
    gap: 3
  },
  versionTitle: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 2
  },
  versionSub: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "600"
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2
  },
  modalCloseBtn: {
    padding: 4
  },
  factoryList: {
    gap: 10
  },
  factoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 10
  },
  factoryItemActive: {
    backgroundColor: "#F0F6FF",
    borderColor: "#0C4A94"
  },
  factoryItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },
  factoryItemTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.text
  },
  factoryItemTitleActive: {
    color: "#0C4A94"
  },
  badgeCode: {
    backgroundColor: "#0C4A94",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  badgeCodeText: {
    color: "white",
    fontSize: 9.5,
    fontWeight: "800"
  },
  factoryItemSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2
  },
  switchRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center"
  },
  switchRadioActive: {
    borderColor: "#0C4A94"
  },
  switchRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0C4A94"
  }
});
