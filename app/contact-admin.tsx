import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
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
import TopBar from "../components/TopBar";

export default function ContactAdminScreen() {
  const insets = useSafeAreaInsets();
  const [showReportModal, setShowReportModal] = useState(false);
  const [issueType, setIssueType] = useState("ปัญหาการสแกน QR Code");
  const [issueDetail, setIssueDetail] = useState("");

  const handleCall = (phone: string, name: string) => {
    Alert.alert(
      "โทรติดต่อ",
      `ต้องการโทรติดต่อคุณ ${name} (${phone}) ใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "โทรออก",
          onPress: () => {
            Linking.openURL(`tel:${phone.replace(/-/g, "")}`).catch(() => {
              Alert.alert("โทรออก", `เบอร์โทรศัพท์: ${phone}`);
            });
          }
        }
      ]
    );
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}?subject=แจ้งปัญหาการใช้งาน Check Point Mobile`).catch(
      () => {
        Alert.alert("ส่งอีเมล", `อีเมล: ${email}`);
      }
    );
  };

  const handleSubmitIssue = () => {
    if (!issueDetail.trim()) {
      Alert.alert("กรุณาระบุข้อมูล", "โปรดระบุรายละเอียดปัญหาที่ท่านพบเพื่อให้ทีมงานช่วยเหลือได้ตรงจุด");
      return;
    }

    const typeToSubmit = issueType;
    const detailToSubmit = issueDetail;
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const time =
      new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.";
    const date = new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    setShowReportModal(false);
    setIssueDetail("");

    router.replace({
      pathname: "/support-summary",
      params: {
        type: typeToSubmit,
        detail: detailToSubmit,
        ticketId,
        time,
        date
      }
    });
  };

  return (
    <View style={styles.screen}>
      <TopBar title="ติดต่อผู้ดูแลระบบ" back />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 36 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero Card: เราพร้อมช่วยเหลือคุณ */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            {/* 3D Customer Support Headset Illustration Badge */}
            <View style={styles.headsetIconWrap}>
              <View style={styles.headsetOuterCircle}>
                <Ionicons name="headset" size={42} color="#0C4A94" />
                <View style={styles.chatBubbleBadge}>
                  <Ionicons name="chatbubble-ellipses" size={16} color="white" />
                </View>
              </View>
            </View>

            {/* Text details */}
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>เราพร้อมช่วยเหลือคุณ</Text>
              <Text style={styles.heroSub}>
                หากพบปัญหาการใช้งาน หรือต้องการความช่วยเหลือ ทีมงานยินดีให้บริการ
              </Text>

              {/* Working Hours Pill */}
              <View style={styles.workingHoursPill}>
                <Ionicons name="time-outline" size={14} color="#0C4A94" />
                <Text style={styles.workingHoursText}>
                  เวลาทำการ 08:00 - 20:00 น. (ทุกวัน)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Section Header: ผู้รับผิดชอบและทีมสนับสนุน */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIconWrap}>
            <Ionicons name="people" size={18} color="#0C4A94" />
          </View>
          <Text style={styles.sectionHeaderTitle}>ผู้รับผิดชอบและทีมสนับสนุน</Text>
        </View>

        {/* 3. Contact List Cards */}
        <View style={styles.contactList}>
          {/* Contact 1: สมศักดิ์ มั่นคงดี */}
          <View style={styles.contactCard}>
            <View style={styles.contactAvatarWrap}>
              <Text style={styles.contactEmoji}>👨‍✈️</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>สมศักดิ์ มั่นคงดี</Text>
              <View style={styles.roleBadgeIndigo}>
                <Text style={styles.roleBadgeIndigoText}>
                  หัวหน้าชุด รปภ. ประจำกะดึก
                </Text>
              </View>
              <View style={styles.phoneRow}>
                <Ionicons name="call" size={13} color="#0C4A94" />
                <Text style={styles.phoneText}>089-111-2233</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.btnCallCircle, pressed && styles.btnPressed]}
              onPress={() => handleCall("089-111-2233", "สมศักดิ์ มั่นคงดี")}
            >
              <Ionicons name="call" size={18} color="#0C4A94" />
            </Pressable>
          </View>

          {/* Contact 2: วิชัย รักษ์สถาน */}
          <View style={styles.contactCard}>
            <View style={styles.contactAvatarWrap}>
              <Text style={styles.contactEmoji}>🧑‍💼</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>วิชัย รักษ์สถาน</Text>
              <View style={styles.roleBadgeGray}>
                <Text style={styles.roleBadgeGrayText}>
                  ผู้จัดการฝ่ายเอกสารและสถานที่
                </Text>
              </View>
              <View style={styles.phoneRow}>
                <Ionicons name="call" size={13} color="#0C4A94" />
                <Text style={styles.phoneText}>081-444-5566</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.btnCallCircle, pressed && styles.btnPressed]}
              onPress={() => handleCall("081-444-5566", "วิชัย รักษ์สถาน")}
            >
              <Ionicons name="call" size={18} color="#0C4A94" />
            </Pressable>
          </View>

          {/* Contact 3: ทีมเทคนิค & ระบบแอปพลิเคชัน */}
          <View style={styles.contactCard}>
            <View style={[styles.contactAvatarWrap, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="code-slash" size={24} color="#0C4A94" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>ทีมเทคนิค & ระบบแอปพลิเคชัน</Text>
              <View style={styles.roleBadgeBlue}>
                <Text style={styles.roleBadgeBlueText}>
                  ฝ่ายดูแลระบบ Check Point
                </Text>
              </View>
              <View style={styles.phoneRow}>
                <Ionicons name="mail" size={13} color="#0C4A94" />
                <Text style={styles.phoneText}>support@checkpoint.com</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.btnCallCircle, pressed && styles.btnPressed]}
              onPress={() => handleEmail("support@checkpoint.com")}
            >
              <Ionicons name="mail" size={18} color="#0C4A94" />
            </Pressable>
          </View>
        </View>

        {/* 4. Tips & Guidelines Card: ก่อนติดต่อขอความช่วยเหลือ */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsIconCircle}>
            <Ionicons name="bulb" size={24} color="#D97706" />
          </View>
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>ก่อนติดต่อขอความช่วยเหลือ</Text>
            <Text style={styles.tipsBody}>
              กรุณาอธิบายปัญหาให้ละเอียด เช่น หน้าจอที่เกิดปัญหา ข้อความแจ้งเตือน และขั้นตอนที่ทำ เพื่อให้ทีมงานช่วยคุณได้รวดเร็วยิ่งขึ้น
            </Text>
          </View>
        </View>

        {/* 5. Bottom Action: แจ้งปัญหาการใช้งานแอปพลิเคชัน */}
        <Pressable
          style={({ pressed }) => [styles.reportButton, pressed && styles.btnPressed]}
          onPress={() => setShowReportModal(true)}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#0C4A94" />
          <Text style={styles.reportButtonText}>แจ้งปัญหาการใช้งานแอปพลิเคชัน</Text>
          <Ionicons name="chevron-forward" size={20} color="#0C4A94" />
        </Pressable>
      </ScrollView>

      {/* REPORT ISSUE MODAL (หน้าต่างส่งรายงานปัญหาไปยังทีมงาน พร้อมระบบดันกล่องข้อความหนีแป้นพิมพ์) */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoiding}
        >
          <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderIconWrap}>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#0C4A94" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>แจ้งปัญหาการใช้งาน</Text>
                  <Text style={styles.modalSub}>ส่งข้อมูลปัญหาถึงทีมเทคนิค Check Point</Text>
                </View>
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowReportModal(false);
                  }}
                  hitSlop={10}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={false}
                style={{ maxHeight: 340 }}
              >
                {/* Issue Category Selector */}
                <Text style={styles.inputLabel}>ประเภทปัญหาที่พบ:</Text>
                <View style={styles.categoryPillWrap}>
                  {[
                    "ปัญหาการสแกน QR Code",
                    "พิกัด GPS ไม่ตรง",
                    "การลงเวลาเข้า-ออกกะ",
                    "ถ่ายรูปหลักฐานไม่ได้",
                    "ปัญหาอื่นๆ"
                  ].map((cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.categoryPill,
                        issueType === cat && styles.categoryPillActive
                      ]}
                      onPress={() => setIssueType(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          issueType === cat && styles.categoryPillTextActive
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Detail Text Input */}
                <Text style={styles.inputLabel}>รายละเอียดปัญหา:</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  placeholder="อธิบายอาการที่พบ เช่น สแกนแล้วไม่ติด, ขึ้นข้อความแจ้งเตือนสีแดง..."
                  placeholderTextColor="#94A3B8"
                  value={issueDetail}
                  onChangeText={setIssueDetail}
                  textAlignVertical="top"
                />
              </ScrollView>

              {/* Modal Bottom Actions */}
              <View style={styles.modalActionRow}>
                <Pressable
                  style={({ pressed }) => [styles.btnSubmitReport, pressed && styles.btnPressed]}
                  onPress={handleSubmitIssue}
                >
                  <Ionicons name="send" size={18} color="white" />
                  <Text style={styles.btnSubmitReportText}>ส่งรายงานปัญหา</Text>
                </Pressable>

                <Pressable
                  style={styles.btnCancelReport}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowReportModal(false);
                  }}
                >
                  <Text style={styles.btnCancelReportText}>ยกเลิก</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FB"
  },
  scroll: {
    flex: 1
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14
  },

  // 1. Hero Card
  heroCard: {
    backgroundColor: "#F0F6FF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#D0E2FF",
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 18
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  headsetIconWrap: {
    alignItems: "center",
    justifyContent: "center"
  },
  headsetOuterCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#CCE0FA",
    position: "relative"
  },
  chatBubbleBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#0C4A94",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white"
  },
  heroTextWrap: {
    flex: 1
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 3
  },
  heroSub: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18
  },
  workingHoursPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#D0E2FF"
  },
  workingHoursText: {
    fontSize: 11,
    color: "#0C4A94",
    fontWeight: "800"
  },

  // 2. Section Header
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 2
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center"
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A"
  },

  // 3. Contact Cards
  contactList: {
    gap: 10,
    marginBottom: 16
  },
  contactCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1
  },
  contactAvatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0"
  },
  contactEmoji: {
    fontSize: 28
  },
  contactInfo: {
    flex: 1
  },
  contactName: {
    fontSize: 15.5,
    fontWeight: "900",
    color: COLORS.text
  },
  roleBadgeIndigo: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginVertical: 4
  },
  roleBadgeIndigoText: {
    color: "#3730A3",
    fontSize: 11,
    fontWeight: "800"
  },
  roleBadgeGray: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginVertical: 4
  },
  roleBadgeGrayText: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "800"
  },
  roleBadgeBlue: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginVertical: 4
  },
  roleBadgeBlueText: {
    color: "#0C4A94",
    fontSize: 11,
    fontWeight: "800"
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  phoneText: {
    fontSize: 12.5,
    color: "#0C4A94",
    fontWeight: "800"
  },
  btnCallCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#D0E2FF"
  },

  // 4. Tips Card
  tipsCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16
  },
  tipsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  tipsContent: {
    flex: 1
  },
  tipsTitle: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#92400E",
    marginBottom: 3
  },
  tipsBody: {
    fontSize: 12,
    color: "#78350F",
    lineHeight: 18
  },

  // 5. Bottom Report Button
  reportButton: {
    backgroundColor: "white",
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#0C4A94",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1
  },
  reportButtonText: {
    color: "#0C4A94",
    fontSize: 15,
    fontWeight: "900",
    flex: 1,
    marginLeft: 10
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  },

  // MODAL STYLES
  keyboardAvoiding: {
    flex: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.7)",
    justifyContent: "flex-end"
  },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  modalHeaderIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center"
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
  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 8,
    marginTop: 4
  },
  categoryPillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14
  },
  categoryPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  categoryPillActive: {
    backgroundColor: "#0C4A94",
    borderColor: "#0C4A94"
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B"
  },
  categoryPillTextActive: {
    color: "white",
    fontWeight: "800"
  },
  textArea: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    fontSize: 13.5,
    color: COLORS.text,
    minHeight: 90,
    marginBottom: 14
  },
  modalActionRow: {
    marginTop: 8,
    gap: 8
  },
  btnSubmitReport: {
    backgroundColor: "#0C4A94",
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  btnSubmitReportText: {
    color: "white",
    fontSize: 15.5,
    fontWeight: "900"
  },
  btnCancelReport: {
    backgroundColor: "#F1F5F9",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  btnCancelReportText: {
    color: "#475569",
    fontSize: 13.5,
    fontWeight: "800"
  }
});
