import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import TopBar from "../components/TopBar";
import { useUserStore, UserProfile } from "../lib/userStore";
import { useCheckpointMobileStore } from "../lib/checkpointMobileStore";
import { apiClient } from "../lib/api";
import { SmartVisitorGuardAccount } from "../types/checkpointMobile";

const avatarEmojis = ["👮‍♂️", "👮", "👮‍♀️", "👨‍✈️", "🛡️"];

export const PREDEFINED_ROLES = [
  "รปภ. ประจำกะดึก",
  "รปภ. ประจำกะเช้า",
  "รปภ. ประจำกะบ่าย",
  "รปภ. ประจำจุดคัดกรอง",
  "หัวหน้าชุด รปภ. เวรตรวจ",
  "รปภ. ประจำห้องควบคุม (CCTV)",
  "รปภ. สายตรวจเดินเท้า",
  "ทุกโซนพื้นที่ส่วนกลาง"
];

export const PREDEFINED_SHIFTS = [
  "กะดึก (20:00 - 08:00 น.)",
  "กะเช้า (08:00 - 20:00 น.)",
  "กะบ่าย (14:00 - 22:00 น.)",
  "กะพิเศษ (เวรตรวจความปลอดภัย 24 ชม.)"
];

export const PREDEFINED_ZONES = [
  "อาคาร A และลานจอดรถส่วนกลาง",
  "ประตูทางเข้าหลัก และป้อมยามหน้า",
  "ล็อบบี้ตึกอำนวยการ",
  "ทุกโซนพื้นที่ส่วนกลาง"
];

type PickerType = "role" | "shift" | "zone" | null;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const userStore = useUserStore();
  const profile = userStore.getProfile();
  const cpStore = useCheckpointMobileStore();
  const factory = cpStore.getFactory();
  const [guards, setGuards] = useState<SmartVisitorGuardAccount[]>(cpStore.getGuardsForCurrentFactory());

  useEffect(() => {
    cpStore.fetchGuardsForFactory(factory.id).then((res) => {
      if (res && res.length > 0) {
        setGuards(res);
      }
    });
  }, [factory.id]);

  // Mode: "view" vs "edit"
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [role, setRole] = useState(profile.role);
  const [shift, setShift] = useState(profile.shift);
  const [zone, setZone] = useState(profile.zone);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(profile.avatarUri);
  const [avatarEmoji, setAvatarEmoji] = useState(profile.avatarEmoji || "👮‍♂️");

  // Switch Account Modal State & Step
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switchStep, setSwitchStep] = useState<"list" | "pin">("list");
  const [targetGuard, setTargetGuard] = useState<SmartVisitorGuardAccount | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Dropdown Picker Modal State
  const [activePicker, setActivePicker] = useState<PickerType>(null);

  const syncFormWithProfile = () => {
    setName(profile.name);
    setPhone(profile.phone);
    setRole(profile.role);
    setShift(profile.shift);
    setZone(profile.zone);
    setAvatarUri(profile.avatarUri);
    setAvatarEmoji(profile.avatarEmoji || "👮‍♂️");
  };

  const handleChangePhoto = () => {
    Alert.alert("เปลี่ยนรูปโปรไฟล์", "เลือกวิธีการเปลี่ยนรูปภาพโปรไฟล์", [
      {
        text: "เลือกจากแกลเลอรี",
        onPress: async () => {
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8
          });
          if (!res.canceled && res.assets[0]?.uri) {
            setAvatarUri(res.assets[0].uri);
          }
        }
      },
      {
        text: "ถ่ายรูปใหม่",
        onPress: async () => {
          const res = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8
          });
          if (!res.canceled && res.assets[0]?.uri) {
            setAvatarUri(res.assets[0].uri);
          }
        }
      },
      {
        text: "ใช้อิโมจิตัวแทน",
        onPress: () => {
          setAvatarUri(undefined);
        }
      },
      { text: "ยกเลิก", style: "cancel" }
    ]);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("กรุณากรอกชื่อ", "โปรดระบุชื่อ-นามสกุล");
      return;
    }

    userStore.updateProfile({
      name,
      phone,
      role,
      shift,
      zone,
      avatarUri,
      avatarEmoji
    });

    setIsEditing(false);
    Alert.alert("✓ บันทึกสำเร็จ", "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว");
  };

  const handleCancelEdit = () => {
    syncFormWithProfile();
    setIsEditing(false);
  };

  const handlePressGuard = (g: SmartVisitorGuardAccount) => {
    if (g.employeeId === profile.employeeId) {
      setShowSwitchModal(false);
      return;
    }
    setTargetGuard(g);
    setEnteredPin("");
    setPinError(null);
    setSwitchStep("pin");
  };

  const handlePinDigit = (digit: string) => {
    if (enteredPin.length < 6) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setPinError(null);

      const targetPin = targetGuard?.pin || "123456";
      const requiredLength = targetPin.length === 4 ? 4 : 6;

      if (nextPin.length === requiredLength && targetGuard) {
        const cleanAccount = targetGuard.username?.replace("@", "") || targetGuard.employeeId;

        apiClient
          .post("/auth/login-pin", {
            accountName: cleanAccount,
            pin: nextPin
          })
          .then((res) => {
            if (res && res.success && res.data?.token) {
              apiClient.setToken(res.data.token);
              userStore.setProfileFromGuard(targetGuard);
              cpStore.switchGuardAccount(targetGuard);
              setName(targetGuard.name);
              setPhone(targetGuard.phone);
              setRole(targetGuard.role);
              setShift(targetGuard.shift);
              setZone(targetGuard.assignedZone);
              setAvatarUri(targetGuard.avatarUri);
              setAvatarEmoji(targetGuard.avatarEmoji || "👮‍♂️");
              setShowSwitchModal(false);
              setSwitchStep("list");
              setEnteredPin("");
              setIsEditing(false);
              Alert.alert(
                "✓ สลับบัญชีสำเร็จ",
                `เข้าสู่ระบบในชื่อ ${targetGuard.name} (${targetGuard.role}) สำหรับกะนี้แล้ว`
              );
            } else {
              setPinError(
                res?.message || (res?.data as any)?.error || "รหัส PIN ไม่ถูกต้อง (ตรวจสอบจากฐานข้อมูลจริง)"
              );
              setTimeout(() => {
                setEnteredPin("");
              }, 800);
            }
          })
          .catch((err) => {
            setPinError(err?.message || "รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
            setTimeout(() => {
              setEnteredPin("");
            }, 800);
          });
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

  const handleCloseSwitchModal = () => {
    setShowSwitchModal(false);
    setSwitchStep("list");
    setEnteredPin("");
    setPinError(null);
  };

  const handleSelectGuard = (empId: string) => {
    const switched = userStore.switchUser(empId);
    setName(switched.name);
    setPhone(switched.phone);
    setRole(switched.role);
    setShift(switched.shift);
    setZone(switched.zone);
    setAvatarUri(switched.avatarUri);
    setAvatarEmoji(switched.avatarEmoji || "👮‍♂️");
    setShowSwitchModal(false);
    setIsEditing(false);

    Alert.alert(
      "✓ สลับบัญชีสำเร็จ",
      `เข้าสู่ระบบในชื่อ ${switched.name} (${switched.role}) สำหรับกะนี้แล้ว`
    );
  };

  const getPickerTitle = () => {
    switch (activePicker) {
      case "role":
        return "เลือกตำแหน่งหน้าที่";
      case "shift":
        return "เลือกกะปฏิบัติงานประจำ";
      case "zone":
        return "เลือกพื้นที่รับผิดชอบ";
      default:
        return "";
    }
  };

  const getPickerOptions = () => {
    switch (activePicker) {
      case "role":
        return PREDEFINED_ROLES;
      case "shift":
        return PREDEFINED_SHIFTS;
      case "zone":
        return PREDEFINED_ZONES;
      default:
        return [];
    }
  };

  const getSelectedValue = () => {
    switch (activePicker) {
      case "role":
        return role;
      case "shift":
        return shift;
      case "zone":
        return zone;
      default:
        return "";
    }
  };

  const handleSelectOption = (opt: string) => {
    if (activePicker === "role") setRole(opt);
    if (activePicker === "shift") setShift(opt);
    if (activePicker === "zone") setZone(opt);
    setActivePicker(null);
  };

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <TopBar title="ข้อมูลส่วนตัว" back />

        {/* 1. Quick Guard Account Switcher Card */}
        <View style={styles.switchCard}>
          <View style={styles.switchHeaderRow}>
            <View style={styles.switchIconWrap}>
              <Ionicons name="people" size={20} color="#0C4A94" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>สลับบัญชี รปภ. ในผลัด/สาขานี้</Text>
              <Text style={styles.switchSub}>
                เลือกบัญชี รปภ. อื่น เพื่อเข้าปฏิบัติงานกะถัดไป
              </Text>
            </View>
          </View>

          {/* Current Active Account Selector Bar */}
          <Pressable
            style={({ pressed }) => [styles.activeAccountBar, pressed && styles.btnPressed]}
            onPress={() => {
              setSwitchStep("list");
              setTargetGuard(null);
              setEnteredPin("");
              setPinError(null);
              setShowSwitchModal(true);
            }}
          >
            <View style={styles.accountAvatarSmall}>
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.smallAvatarImg} />
              ) : (
                <Text style={{ fontSize: 20 }}>{profile.avatarEmoji || "👮‍♂️"}</Text>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.activeAccountName}>{profile.name}</Text>
              <Text style={styles.activeAccountTag}>
                รหัส: {profile.employeeId} • บัญชีปัจจุบัน
              </Text>
            </View>
            <View style={styles.chevronWrap}>
              <Ionicons name="chevron-down" size={18} color="#0C4A94" />
            </View>
          </Pressable>
        </View>

        {/* 2. Main Profile Info Card */}
        <View style={styles.profileCard}>
          {/* Avatar Section */}
          <View style={styles.avatarWrap}>
            {isEditing ? (
              avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarEmojiCircle}>
                  <Text style={styles.avatarEmojiText}>{avatarEmoji}</Text>
                </View>
              )
            ) : profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarEmojiCircle}>
                <Text style={styles.avatarEmojiText}>{profile.avatarEmoji || "👮‍♂️"}</Text>
              </View>
            )}

            {isEditing && (
              <Pressable style={styles.cameraIconBadge} onPress={handleChangePhoto}>
                <Ionicons name="camera" size={18} color="white" />
              </Pressable>
            )}
          </View>

          {/* Guard Name and Code */}
          <Text style={styles.guardName}>{isEditing ? name || "ชื่อ รปภ." : profile.name}</Text>
          <View style={styles.empBadge}>
            <Text style={styles.empBadgeText}>รหัสพนักงาน: {profile.employeeId}</Text>
          </View>

          {/* Emoji selector in Edit Mode */}
          {isEditing && (
            <View style={styles.emojiRow}>
              {avatarEmojis.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={[
                    styles.emojiBtn,
                    !avatarUri && avatarEmoji === emoji && styles.emojiBtnActive
                  ]}
                  onPress={() => {
                    setAvatarUri(undefined);
                    setAvatarEmoji(emoji);
                  }}
                >
                  <Text style={styles.emojiBtnText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.cardDivider} />

          {/* View Mode: Clean Corporate Information List */}
          {!isEditing ? (
            <View style={styles.infoList}>
              {/* Row 1: สังกัดโรงงาน */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="business" size={20} color="#0C4A94" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>สังกัดโรงงาน</Text>
                  <Text style={[styles.infoValue, { color: "#0C4A94", fontWeight: "900" }]}>
                    {factory.name} ({factory.code})
                  </Text>
                  <Text style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
                    {factory.address}
                  </Text>
                </View>
              </View>

              {/* Row 2: ตำแหน่ง */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#0C4A94" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>ตำแหน่งหน้าที่</Text>
                  <Text style={styles.infoValue}>{profile.role}</Text>
                </View>
              </View>

              {/* Row 3: พื้นที่รับผิดชอบ */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="map-outline" size={20} color="#0C4A94" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>พื้นที่ / โซนรับผิดชอบ</Text>
                  <Text style={styles.infoValue}>{profile.zone}</Text>
                </View>
              </View>

              {/* Row 3: กะปฏิบัติงาน */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="time-outline" size={20} color="#0C4A94" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>กะปฏิบัติงานประจำ</Text>
                  <Text style={styles.infoValue}>{profile.shift}</Text>
                </View>
              </View>

              {/* Row 4: เบอร์โทร */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="call-outline" size={20} color="#0C4A94" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>เบอร์โทรศัพท์</Text>
                  <Text style={styles.infoValue}>{profile.phone}</Text>
                </View>
              </View>

              {/* Row 5: วันเริ่มงาน */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="calendar-outline" size={20} color="#0C4A94" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>วันที่เริ่มงาน</Text>
                  <Text style={styles.infoValue}>{profile.startDate}</Text>
                </View>
              </View>

              {/* Edit Trigger Button at Bottom */}
              <Pressable
                style={({ pressed }) => [styles.editProfileBtn, pressed && styles.btnPressed]}
                onPress={() => {
                  syncFormWithProfile();
                  setIsEditing(true);
                }}
              >
                <Ionicons name="create-outline" size={20} color="#0C4A94" />
                <Text style={styles.editProfileBtnText}>แก้ไขข้อมูลโปรไฟล์</Text>
              </Pressable>
            </View>
          ) : (
            /* Edit Mode Form Inputs with Dropdown Pickers */
            <View style={styles.editForm}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ชื่อ - นามสกุล</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="ชื่อ - นามสกุล"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="08X-XXX-XXXX"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Role Dropdown Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ตำแหน่งหน้าที่ (เลือกจากรายการ)</Text>
                <Pressable
                  style={({ pressed }) => [styles.dropdownField, pressed && styles.btnPressed]}
                  onPress={() => setActivePicker("role")}
                >
                  <Text style={[styles.dropdownValue, !role && styles.dropdownPlaceholder]}>
                    {role || "แตะเพื่อเลือกตำแหน่ง"}
                  </Text>
                  <View style={styles.dropdownIconBox}>
                    <Ionicons name="chevron-down" size={18} color="#0C4A94" />
                  </View>
                </Pressable>
              </View>

              {/* Shift Dropdown Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>กะปฏิบัติงานประจำ (เลือกจากรายการ)</Text>
                <Pressable
                  style={({ pressed }) => [styles.dropdownField, pressed && styles.btnPressed]}
                  onPress={() => setActivePicker("shift")}
                >
                  <Text style={[styles.dropdownValue, !shift && styles.dropdownPlaceholder]}>
                    {shift || "แตะเพื่อเลือกกะปฏิบัติงาน"}
                  </Text>
                  <View style={styles.dropdownIconBox}>
                    <Ionicons name="chevron-down" size={18} color="#0C4A94" />
                  </View>
                </Pressable>
              </View>

              {/* Zone Dropdown Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>พื้นที่รับผิดชอบ (เลือกจากรายการ)</Text>
                <Pressable
                  style={({ pressed }) => [styles.dropdownField, pressed && styles.btnPressed]}
                  onPress={() => setActivePicker("zone")}
                >
                  <Text style={[styles.dropdownValue, !zone && styles.dropdownPlaceholder]}>
                    {zone || "แตะเพื่อเลือกพื้นที่รับผิดชอบ"}
                  </Text>
                  <View style={styles.dropdownIconBox}>
                    <Ionicons name="chevron-down" size={18} color="#0C4A94" />
                  </View>
                </Pressable>
              </View>

              {/* Action Buttons in Edit Form */}
              <View style={styles.formButtonRow}>
                <Pressable
                  style={({ pressed }) => [styles.cancelBtn, pressed && styles.btnPressed]}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.cancelBtnText}>ยกเลิก</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.saveBtn, pressed && styles.btnPressed]}
                  onPress={handleSave}
                >
                  <Ionicons name="save-outline" size={18} color="white" />
                  <Text style={styles.saveBtnText}>บันทึกข้อมูล</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Dropdown Options Picker Modal */}
      <Modal visible={activePicker !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{getPickerTitle()}</Text>
                <Text style={styles.modalSub}>แตะเลือกตัวเลือกที่ต้องการ</Text>
              </View>
              <Pressable style={styles.modalCloseBtn} onPress={() => setActivePicker(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={styles.pickerListScroll} showsVerticalScrollIndicator={false}>
              {getPickerOptions().map((opt) => {
                const isSelected = opt === getSelectedValue();
                return (
                  <Pressable
                    key={opt}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    onPress={() => handleSelectOption(opt)}
                  >
                    <Text
                      style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}
                    >
                      {opt}
                    </Text>
                    <View
                      style={[styles.switchRadio, isSelected && styles.switchRadioActive]}
                    >
                      {isSelected && <View style={styles.switchRadioInner} />}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Quick Guard Switcher & PIN Identity Verification Modal (Single Modal Architecture - Zero Freezing) */}
      <Modal visible={showSwitchModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          {switchStep === "list" ? (
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>สลับบัญชี รปภ. ประจำกะ</Text>
                  <Text style={styles.modalSub}>
                    เลือกเจ้าหน้าที่ รปภ. ที่จะเข้าปฏิบัติงานสำหรับผลัดนี้
                  </Text>
                </View>
                <Pressable style={styles.modalCloseBtn} onPress={handleCloseSwitchModal}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </Pressable>
              </View>

              <ScrollView style={styles.guardListScroll} showsVerticalScrollIndicator={false}>
                {guards.map((g) => {
                  const isActive = g.employeeId === profile.employeeId;
                  return (
                    <Pressable
                      key={g.employeeId}
                      style={[styles.guardItem, isActive && styles.guardItemActive]}
                      onPress={() => handlePressGuard(g)}
                    >
                      <View style={styles.guardItemAvatar}>
                        {g.avatarUri ? (
                          <Image source={{ uri: g.avatarUri }} style={styles.smallAvatarImg} />
                        ) : (
                          <Text style={{ fontSize: 24 }}>{g.avatarEmoji || "👮‍♂️"}</Text>
                        )}
                      </View>

                      <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                        <Text style={styles.guardItemName} numberOfLines={1}>
                          {g.name}
                        </Text>
                        <Text style={styles.guardItemRole}>{g.role}</Text>
                        <Text style={styles.guardItemShift}>{g.shift}</Text>
                      </View>

                      {/* Right-aligned Status Badge (Perfect Alignment) */}
                      <View style={styles.guardItemRightAction}>
                        {isActive ? (
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>ปัจจุบัน</Text>
                          </View>
                        ) : (
                          <View style={styles.lockPill}>
                            <Ionicons name="lock-closed" size={11} color="#475569" />
                            <Text style={styles.lockPillText}>PIN ล็อก</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.pinModalCard}>
              {/* Header with Back to List */}
              <View style={styles.pinHeader}>
                <Pressable
                  style={styles.pinBackBtn}
                  onPress={() => {
                    setSwitchStep("list");
                    setEnteredPin("");
                    setPinError(null);
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color="#0C4A94" />
                  <Text style={styles.pinBackText}>รายชื่อ</Text>
                </Pressable>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="shield-checkmark" size={18} color="#0C4A94" />
                  <Text style={styles.pinHeaderTitle}>ยืนยันรหัส PIN</Text>
                </View>

                <Pressable style={styles.modalCloseBtn} onPress={handleCloseSwitchModal}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </Pressable>
              </View>

              {/* Target Guard Info Banner */}
              {targetGuard && (
                <View style={styles.pinTargetCard}>
                  <View style={styles.pinTargetAvatarWrap}>
                    {targetGuard.avatarUri ? (
                      <Image source={{ uri: targetGuard.avatarUri }} style={styles.smallAvatarImg} />
                    ) : (
                      <Text style={{ fontSize: 28 }}>{targetGuard.avatarEmoji || "👮"}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pinTargetName}>{targetGuard.name}</Text>
                    <Text style={styles.pinTargetRole}>{targetGuard.role}</Text>
                    <Text style={styles.pinTargetId}>
                      {targetGuard.username || `รหัสพนักงาน: ${targetGuard.employeeId}`}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={styles.pinPromptText}>
                กรุณากรอกรหัส PIN ประจำตัวเพื่อเข้าใช้งาน
              </Text>

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

              {/* Error or Hint Text */}
              {pinError ? (
                <Text style={styles.pinErrorText}>{pinError}</Text>
              ) : (
                <Text style={styles.pinHintText}>
                  * รหัสผ่าน PIN 6 หลักที่บันทึกในฐานข้อมูลระบบ
                </Text>
              )}

              {/* Numeric Keypad Grid (1-9, ล้าง, 0, ⌫) */}
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

                {/* Clear Button */}
                <Pressable
                  style={({ pressed }) => [styles.keypadBtn, styles.keypadBtnAction, pressed && styles.keypadBtnPressed]}
                  onPress={handlePinClear}
                >
                  <Text style={styles.keypadActionText}>ล้าง</Text>
                </Pressable>

                {/* 0 Button */}
                <Pressable
                  style={({ pressed }) => [styles.keypadBtn, pressed && styles.keypadBtnPressed]}
                  onPress={() => handlePinDigit("0")}
                >
                  <Text style={styles.keypadNum}>0</Text>
                </Pressable>

                {/* Backspace Delete Button */}
                <Pressable
                  style={({ pressed }) => [styles.keypadBtn, styles.keypadBtnAction, pressed && styles.keypadBtnPressed]}
                  onPress={handlePinDelete}
                >
                  <Ionicons name="backspace-outline" size={22} color="#0C4A94" />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FB"
  },
  content: {
    paddingBottom: 24
  },

  // Switch Card
  switchCard: {
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  switchHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12
  },
  switchIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center"
  },
  switchTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.text
  },
  switchSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2
  },
  activeAccountBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#CCE0FA",
    borderRadius: 14,
    padding: 10
  },
  accountAvatarSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  smallAvatarImg: {
    width: "100%",
    height: "100%"
  },
  activeAccountName: {
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.text
  },
  activeAccountTag: {
    fontSize: 11.5,
    color: "#0C4A94",
    fontWeight: "600",
    marginTop: 2
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center"
  },

  // Profile Card
  profileCard: {
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: "center",
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 10
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#CCE0FA"
  },
  avatarEmojiCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F1F5F9",
    borderWidth: 3,
    borderColor: "#DCE8F7",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarEmojiText: {
    fontSize: 52
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#0C4A94",
    borderWidth: 2.5,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },
  guardName: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text
  },
  empBadge: {
    marginTop: 4,
    backgroundColor: "#EAF2FF",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12
  },
  empBadgeText: {
    color: "#0C4A94",
    fontSize: 12,
    fontWeight: "800"
  },
  emojiRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center"
  },
  emojiBtnActive: {
    borderColor: "#0C4A94",
    backgroundColor: "#EAF2FF"
  },
  emojiBtnText: {
    fontSize: 20
  },
  cardDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 18
  },

  // Info List (View Mode)
  infoList: {
    width: "100%",
    gap: 14
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F6FF",
    alignItems: "center",
    justifyContent: "center"
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "600"
  },
  infoValue: {
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 2
  },
  editProfileBtn: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#0C4A94",
    backgroundColor: "#F0F6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  editProfileBtnText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0C4A94"
  },

  // Edit Form
  editForm: {
    width: "100%",
    gap: 12
  },
  inputGroup: {
    marginBottom: 4
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14.5,
    color: COLORS.text
  },

  // Dropdown Field
  dropdownField: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#CCE0FA",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dropdownValue: {
    fontSize: 14.5,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
    marginRight: 8
  },
  dropdownPlaceholder: {
    color: "#94A3B8",
    fontWeight: "500"
  },
  dropdownIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center"
  },

  formButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#64748B"
  },
  saveBtn: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#0C4A94",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  saveBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900"
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  modalCard: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },
  pickerListScroll: {
    marginTop: 4
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginBottom: 8
  },
  pickerItemActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#0C4A94"
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    flex: 1,
    paddingRight: 8
  },
  pickerItemTextActive: {
    color: "#0C4A94",
    fontWeight: "900"
  },
  guardListScroll: {
    marginTop: 6
  },
  guardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginBottom: 10
  },
  guardItemActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#0C4A94"
  },
  guardItemAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  guardItemName: {
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.text
  },
  guardItemRightAction: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 80
  },
  activePill: {
    backgroundColor: "#0C4A94",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  activePillText: {
    color: "white",
    fontSize: 11,
    fontWeight: "800"
  },
  guardItemRole: {
    fontSize: 12,
    color: "#0C4A94",
    fontWeight: "700",
    marginTop: 1
  },
  guardItemShift: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2
  },
  switchRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center"
  },
  switchRadioActive: {
    borderColor: "#0C4A94"
  },
  switchRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0C4A94"
  },
  lockPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1"
  },
  lockPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569"
  },

  // 🔐 PIN Lock Modal Styles
  pinModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  pinModalCard: {
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
  pinHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  pinBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "#EFF6FF"
  },
  pinBackText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0C4A94"
  },
  pinHeaderTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#0F172A"
  },
  pinTargetCard: {
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
  pinTargetAvatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center"
  },
  pinTargetName: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#0F172A"
  },
  pinTargetRole: {
    fontSize: 12,
    color: "#0C4A94",
    fontWeight: "700",
    marginTop: 1
  },
  pinTargetId: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1
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
    gap: 16,
    marginVertical: 12
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
