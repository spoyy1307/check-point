import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  Vibration,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { COLORS } from "../constants/colors";
import TopBar from "../components/TopBar";
import { SoundOption, DEFAULT_SOUNDS, soundHelper } from "../lib/soundHelper";
import { useCheckpointMobileStore } from "../lib/checkpointMobileStore";
import { useUserStore } from "../lib/userStore";
import { patrolReminderEngine } from "../lib/patrolReminderEngine";

export const REMINDER_OPTIONS = [
  "เตือนล่วงหน้า 5 นาที (แนะนำ)",
  "เตือนล่วงหน้า 10 นาที",
  "เตือนล่วงหน้า 15 นาที",
  "เตือนตรงเวลาพอดี"
];

export const VOLUME_OPTIONS = [
  { val: 1.0, label: "100% (ดังชัดเจนที่สุด)", icon: "volume-high-outline" },
  { val: 0.8, label: "80% (ระดับดังปานกลาง-สูง)", icon: "volume-medium-outline" },
  { val: 0.6, label: "60% (ระดับปานกลาง)", icon: "volume-medium-outline" },
  { val: 0.4, label: "40% (ระดับเบา)", icon: "volume-low-outline" }
];

export default function AppSettingsScreen() {
  const insets = useSafeAreaInsets();
  const cpStore = useCheckpointMobileStore();
  const globalSettings = cpStore.getSettings();

  // Sounds List state
  const [soundsList, setSoundsList] = useState<SoundOption[]>(() =>
    soundHelper && typeof soundHelper.getSounds === "function"
      ? soundHelper.getSounds()
      : DEFAULT_SOUNDS
  );
  const [selectedSoundId, setSelectedSoundId] = useState<string>(
    globalSettings.selectedSoundId || "beep"
  );
  const [selectedSoundName, setSelectedSoundName] = useState<string>(
    globalSettings.selectedSoundName || "เสียงบี๊บมาตรฐาน (Loud Beep)"
  );
  const [selectedVolume, setSelectedVolume] = useState<number>(
    globalSettings.soundVolume ?? 1.0
  );

  // Settings State (Initialized from global reactive store)
  const [soundEnabled, setSoundEnabled] = useState(globalSettings.soundEnabled ?? true);
  const [selectedReminder, setSelectedReminder] = useState(
    globalSettings.reminderTime || REMINDER_OPTIONS[0]
  );
  const [vibrationEnabled, setVibrationEnabled] = useState(
    globalSettings.vibrationEnabled ?? true
  );

  // Camera & Evidence Watermark Settings
  const [watermarkEnabled, setWatermarkEnabled] = useState(
    globalSettings.watermarkEnabled ?? true
  );
  const [autoFlashNight, setAutoFlashNight] = useState(
    globalSettings.autoFlashNight ?? true
  );

  // Modal Pickers
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showAddSoundModal, setShowAddSoundModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const [customSoundName, setCustomSoundName] = useState("");
  const userStore = useUserStore();
  const profile = userStore.getProfile();

  useEffect(() => {
    if (profile?.employeeId) {
      soundHelper.loadSoundsForGuard(profile.employeeId);
    }
  }, [profile?.employeeId]);

  useEffect(() => {
    return soundHelper.subscribe(() => {
      setSoundsList(soundHelper.getSounds());
    });
  }, []);

  // Timer for voice recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleTestSound = (soundIdOrUri: string, overrideVol?: number) => {
    soundHelper.playSound(soundIdOrUri, overrideVol ?? selectedVolume);
  };

  const handlePickAudioFile = () => {
    setShowAddSoundModal(false);
    // Delay opening picker slightly so iOS modal dismiss animation finishes completely
    setTimeout(async () => {
      try {
        let res;
        try {
          res = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            copyToCacheDirectory: true
          });
        } catch {
          res = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true
          });
        }

        if (res && !res.canceled && res.assets && res.assets.length > 0) {
          const file = res.assets[0];
          const defaultName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "เสียงไฟล์กำหนดเอง";
          const newSound = soundHelper.addCustomSound(defaultName, file.uri);
          setSelectedSoundId(newSound.id);
          setSelectedSoundName(newSound.name);
          cpStore.updateSettings({
            selectedSoundId: newSound.id,
            selectedSoundName: newSound.name
          });
          handleTestSound(newSound.uri!);

          Alert.alert(
            "✓ เพิ่มเสียงสำเร็จ",
            `เพิ่มและเลือกใช้ไฟล์เสียง "${newSound.name}" สำหรับแจ้งเตือนตรวจจุดเรียบร้อยแล้ว`
          );
        }
      } catch (err) {
        console.log("Error picking audio file:", err);
      }
    }, 450);
  };

  const handlePickFromGallery = () => {
    setShowAddSoundModal(false);
    setTimeout(async () => {
      try {
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["videos", "images"],
          quality: 0.8,
          allowsEditing: false
        });

        if (!res.canceled && res.assets && res.assets.length > 0) {
          const asset = res.assets[0];
          const defaultName = asset.fileName
            ? asset.fileName.replace(/\.[^/.]+$/, "")
            : `เสียงจากแกลเลอรี ${new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`;
          const newSound = soundHelper.addCustomSound(defaultName, asset.uri);
          setSelectedSoundId(newSound.id);
          setSelectedSoundName(newSound.name);
          cpStore.updateSettings({
            selectedSoundId: newSound.id,
            selectedSoundName: newSound.name
          });
          handleTestSound(newSound.uri!);

          Alert.alert(
            "✓ เพิ่มเสียงสำเร็จ",
            `เพิ่มและเลือกใช้ไฟล์เสียง "${newSound.name}" เรียบร้อยแล้ว`
          );
        }
      } catch (err) {
        console.log("Error picking from gallery:", err);
      }
    }, 450);
  };

  const handleStartRecord = async () => {
    const ok = await soundHelper.startRecording();
    if (!ok) {
      Alert.alert("ไม่สามารถเข้าถึงไมค์", "โปรดอนุญาตสิทธิ์การใช้ไมโครโฟนเพื่ออัดเสียง");
      return;
    }
    setRecordedUri(null);
    setIsRecording(true);
  };

  const handleStopRecord = async () => {
    setIsRecording(false);
    const uri = await soundHelper.stopRecording();
    if (uri) {
      setRecordedUri(uri);
      setCustomSoundName(`เสียงอัด รปภ. ${new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`);
      handleTestSound(uri);
    } else {
      Alert.alert("ผิดพลาด", "การอัดเสียงไม่สมบูรณ์ โปรดลองใหม่อีกครั้ง");
    }
  };

  const handleSaveRecordedSound = () => {
    if (!recordedUri) return;
    const soundName = customSoundName.trim() || "เสียงอัดส่วนตัว";
    const newSound = soundHelper.addCustomSound(soundName, recordedUri);
    setSelectedSoundId(newSound.id);
    setSelectedSoundName(newSound.name);
    cpStore.updateSettings({
      selectedSoundId: newSound.id,
      selectedSoundName: newSound.name
    });
    setShowRecordModal(false);
    setRecordedUri(null);

    Alert.alert(
      "✓ บันทึกเสียงสำเร็จ",
      `ตั้งค่าเสียง "${newSound.name}" เป็นเสียงแจ้งเตือนตรวจจุดเรียบร้อยแล้ว`
    );
  };

  const handleDeleteSound = (sound: SoundOption) => {
    Alert.alert("ลบเสียง", `คุณต้องการลบเสียง "${sound.name}" หรือไม่?`, [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () => {
          soundHelper.removeCustomSound(sound.id);
          if (selectedSoundId === sound.id) {
            const first = soundHelper.getSounds()[0];
            setSelectedSoundId(first.id);
            setSelectedSoundName(first.name);
            cpStore.updateSettings({
              selectedSoundId: first.id,
              selectedSoundName: first.name
            });
          }
        }
      }
    ]);
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <TopBar title="ตั้งค่าแอปพลิเคชัน" back />

        {/* หมวด 1: ระบบเสียงและการแจ้งเตือน */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ระบบเสียงและการแจ้งเตือนรอบตรวจ</Text>
          <View style={styles.card}>
            {/* เสียงแจ้งเตือนตรวจจุด */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="volume-high-outline" size={22} color="#0C4A94" />
                <View>
                  <Text style={styles.settingLabel}>เสียงแจ้งเตือนเมื่อตรวจจุด</Text>
                  <Text style={styles.settingSub}>เล่นเสียงยืนยันเมื่อบันทึกจุดสำเร็จ</Text>
                </View>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={(val) => {
                  setSoundEnabled(val);
                  cpStore.updateSettings({ soundEnabled: val });
                  if (val) {
                    soundHelper.playSound(selectedSoundId);
                  }
                }}
                trackColor={{ false: "#CBD5E1", true: "#0C4A94" }}
                thumbColor="white"
              />
            </View>

            {/* รูปแบบเสียง (เลือกได้ + เพิ่มเสียงเองได้) */}
            {soundEnabled && (
              <>
                <View style={styles.divider} />
                <Pressable
                  style={({ pressed }) => [styles.actionRow, pressed && styles.btnPressed]}
                  onPress={() => setShowSoundModal(true)}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name="musical-notes-outline" size={22} color="#0C4A94" />
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.settingLabel}>รูปแบบเสียงแจ้งเตือน</Text>
                      <Text style={styles.settingSelectedValue} numberOfLines={1}>
                        {selectedSoundName}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.pillSelector}>
                    <Text style={styles.pillSelectorText}>เลือก / เพิ่มเสียง</Text>
                    <Ionicons name="chevron-forward" size={16} color="#0C4A94" />
                  </View>
                </Pressable>

                <View style={styles.divider} />

                {/* ระดับความดังเสียง (Dropdown Picker) */}
                <Pressable
                  style={({ pressed }) => [styles.actionRow, pressed && styles.btnPressed]}
                  onPress={() => setShowVolumeModal(true)}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name="volume-medium-outline" size={22} color="#0C4A94" />
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.settingLabel}>ระดับความดังเสียง</Text>
                      <Text style={styles.settingSelectedValue}>
                        {VOLUME_OPTIONS.find((v) => Math.abs(v.val - selectedVolume) < 0.05)?.label ||
                          `${Math.round(selectedVolume * 100)}%`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.pillSelector}>
                    <Text style={styles.pillSelectorText}>ปรับความดัง</Text>
                    <Ionicons name="chevron-forward" size={16} color="#0C4A94" />
                  </View>
                </Pressable>
              </>
            )}

            <View style={styles.divider} />

            {/* เตือนก่อนถึงรอบตรวจ */}
            <Pressable
              style={({ pressed }) => [styles.actionRow, pressed && styles.btnPressed]}
              onPress={() => setShowReminderModal(true)}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="alarm-outline" size={22} color="#0C4A94" />
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.settingLabel}>แจ้งเตือนก่อนถึงรอบตรวจ</Text>
                  <Text style={styles.settingSelectedValue}>{selectedReminder}</Text>
                </View>
              </View>
              <View style={styles.pillSelector}>
                <Text style={styles.pillSelectorText}>เลือกเวลา</Text>
                <Ionicons name="chevron-forward" size={16} color="#0C4A94" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* หมวด 2: ระบบกล้องและภาพถ่ายหลักฐาน */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ระบบกล้องและภาพถ่ายหลักฐาน</Text>
          <View style={styles.card}>
            {/* ประทับเวลาและพิกัดลงบนภาพถ่าย */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="camera-reverse-outline" size={22} color="#0C4A94" />
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.settingLabel}>ประทับเวลา & พิกัดบนรูปถ่าย</Text>
                  <Text style={styles.settingSub}>ใส่ลายน้ำวันที่ เวลา และ GPS บนภาพหลักฐาน</Text>
                </View>
              </View>
              <Switch
                value={watermarkEnabled}
                onValueChange={(val) => {
                  setWatermarkEnabled(val);
                  cpStore.updateSettings({ watermarkEnabled: val });
                }}
                trackColor={{ false: "#CBD5E1", true: "#0C4A94" }}
                thumbColor="white"
              />
            </View>

            <View style={styles.divider} />

            {/* เปิดแฟลชอัตโนมัติเวลากลางคืน */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="flashlight-outline" size={22} color="#0C4A94" />
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.settingLabel}>เปิดไฟแฟลชช่วยตรวจกะดึก</Text>
                  <Text style={styles.settingSub}>เปิดแฟลชอัตโนมัติเมื่อถ่ายภาพในที่แสงน้อย</Text>
                </View>
              </View>
              <Switch
                value={autoFlashNight}
                onValueChange={(val) => {
                  setAutoFlashNight(val);
                  cpStore.updateSettings({ autoFlashNight: val });
                }}
                trackColor={{ false: "#CBD5E1", true: "#0C4A94" }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal 1: เลือกรูปแบบเสียงแจ้งเตือน + ปุ่มเพิ่มเสียงเอง */}
      <Modal visible={showSoundModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>เลือกรูปแบบเสียงแจ้งเตือน</Text>
                <Text style={styles.modalSub}>แตะเพื่อเลือกและทดสอบฟังเสียงจริง</Text>
              </View>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setShowSoundModal(false)}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              <View style={styles.soundOptionsList}>
                {soundsList.map((item) => {
                  const isSelected = item.id === selectedSoundId;
                  return (
                    <Pressable
                      key={item.id}
                      style={[styles.soundItem, isSelected && styles.soundItemActive]}
                      onPress={() => {
                        setSelectedSoundId(item.id);
                        setSelectedSoundName(item.name);
                        cpStore.updateSettings({
                          selectedSoundId: item.id,
                          selectedSoundName: item.name
                        });
                        handleTestSound(item.uri || item.id);
                      }}
                    >
                      <View style={styles.soundIconCircle}>
                        <Ionicons
                          name={(item.icon as any) || "musical-notes-outline"}
                          size={18}
                          color="#0C4A94"
                        />
                      </View>
                      <View style={{ flex: 1, paddingRight: 6 }}>
                        <Text
                          style={[styles.soundItemText, isSelected && styles.soundItemTextActive]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {item.isCustom && (
                          <Text style={styles.customBadgeText}>★ เสียงที่คุณเพิ่มเอง</Text>
                        )}
                      </View>

                      {/* Delete button for custom sounds */}
                      {item.isCustom && (
                        <Pressable
                          style={styles.deleteSoundBtn}
                          onPress={() => handleDeleteSound(item)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </Pressable>
                      )}

                      <View
                        style={[styles.switchRadio, isSelected && styles.switchRadioActive]}
                      >
                        {isSelected && <View style={styles.switchRadioInner} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* ปุ่มใหญ่ "+ เพิ่มเสียงแจ้งเตือนของคุณเอง" */}
            <Pressable
              style={({ pressed }) => [styles.addCustomSoundBtn, pressed && styles.btnPressed]}
              onPress={() => {
                setShowSoundModal(false);
                setShowAddSoundModal(true);
              }}
            >
              <Ionicons name="add-circle" size={20} color="#0C4A94" />
              <Text style={styles.addCustomSoundBtnText}>+ เพิ่มเสียงแจ้งเตือนของคุณเอง</Text>
            </Pressable>

            <Pressable
              style={styles.modalConfirmBtn}
              onPress={() => setShowSoundModal(false)}
            >
              <Text style={styles.modalConfirmText}>ตกลง</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal 2: เมนูเลือกว่าจะเพิ่มเสียงด้วยวิธีไหน (อัดเสียง / เลือกไฟล์) */}
      <Modal visible={showAddSoundModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>เพิ่มเสียงแจ้งเตือนใหม่</Text>
                <Text style={styles.modalSub}>เลือกวิธีการเพิ่มเสียงของคุณ</Text>
              </View>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setShowAddSoundModal(false)}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <View style={{ gap: 12, marginTop: 8 }}>
              {/* Choice 1: อัดเสียงใหม่ด้วยไมค์ */}
              <Pressable
                style={({ pressed }) => [styles.addChoiceCard, pressed && styles.btnPressed]}
                onPress={() => {
                  setShowAddSoundModal(false);
                  setShowRecordModal(true);
                }}
              >
                <View style={[styles.addChoiceIconWrap, { backgroundColor: "#FEE2E2" }]}>
                  <Ionicons name="mic" size={24} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addChoiceTitle}>🎙️ อัดเสียงใหม่ด้วยไมโครโฟน</Text>
                  <Text style={styles.addChoiceSub}>
                    อัดเสียงพูดของคุณ เช่น "ตรวจจุดสำเร็จ" หรือเสียงสัญญาณ
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>

              {/* Choice 2: เลือกไฟล์เสียงจากเครื่อง / โฟลเดอร์ดาวน์โหลด */}
              <Pressable
                style={({ pressed }) => [styles.addChoiceCard, pressed && styles.btnPressed]}
                onPress={handlePickAudioFile}
              >
                <View style={[styles.addChoiceIconWrap, { backgroundColor: "#EAF2FF" }]}>
                  <Ionicons name="folder-open" size={24} color="#0C4A94" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addChoiceTitle}>📁 เลือกจากโฟลเดอร์ไฟล์ / ดาวน์โหลด</Text>
                  <Text style={styles.addChoiceSub}>
                    เลือกไฟล์เสียง MP3, WAV, M4A, AAC จากในเครื่อง
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>

              {/* Choice 3: เลือกจากคลังแกลเลอรี / สื่อในเครื่อง */}
              <Pressable
                style={({ pressed }) => [styles.addChoiceCard, pressed && styles.btnPressed]}
                onPress={handlePickFromGallery}
              >
                <View style={[styles.addChoiceIconWrap, { backgroundColor: "#E0F2FE" }]}>
                  <Ionicons name="images" size={24} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addChoiceTitle}>🖼️ เลือกจากคลังแกลเลอรี / สื่อในเครื่อง</Text>
                  <Text style={styles.addChoiceSub}>
                    เปิดแกลเลอรีรูปภาพ/วิดีโอเพื่อดึงเสียง
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 3: สตูดิโออัดเสียงแจ้งเตือน (Voice Recording Studio) */}
      <Modal visible={showRecordModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>🎙️ สตูดิโออัดเสียงแจ้งเตือน</Text>
                <Text style={styles.modalSub}>
                  แตะปุ่มสีแดงเพื่อเริ่มอัดเสียงพูดหรือเสียงเตือน
                </Text>
              </View>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => {
                  if (isRecording) handleStopRecord();
                  setShowRecordModal(false);
                }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            {/* Recording Visual & Timer */}
            <View style={styles.recordBox}>
              <View
                style={[
                  styles.recordVisualCircle,
                  isRecording && styles.recordVisualCircleActive
                ]}
              >
                <Ionicons
                  name={isRecording ? "radio" : "mic"}
                  size={42}
                  color={isRecording ? "#DC2626" : "#0C4A94"}
                />
              </View>

              <Text style={styles.recordTimerText}>
                {isRecording ? formatDuration(recordDuration) : recordedUri ? "อัดเสียงเรียบร้อย ✓" : "พร้อมอัดเสียง"}
              </Text>
              <Text style={styles.recordInstruction}>
                {isRecording
                  ? "กำลังบันทึกเสียง... แตะปุ่มหยุดเมื่อเสร็จ"
                  : recordedUri
                  ? "สามารถกดฟังตัวอย่าง หรือบันทึกเพื่อใช้งานได้เลย"
                  : "กดปุ่มด้านล่างเพื่อเริ่มอัดเสียงสั้น 2-5 วินาที"}
              </Text>
            </View>

            {/* Record Control Buttons */}
            <View style={styles.recordActionsRow}>
              {!isRecording ? (
                <Pressable
                  style={[styles.recordBtnPrimary, { backgroundColor: "#DC2626" }]}
                  onPress={handleStartRecord}
                >
                  <Ionicons name="ellipse" size={18} color="white" />
                  <Text style={styles.recordBtnText}>
                    {recordedUri ? "อัดเสียงใหม่" : "เริ่มอัดเสียง"}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.recordBtnPrimary, { backgroundColor: "#0F172A" }]}
                  onPress={handleStopRecord}
                >
                  <Ionicons name="stop" size={18} color="white" />
                  <Text style={styles.recordBtnText}>หยุดการอัดเสียง</Text>
                </Pressable>
              )}

              {/* Preview Button */}
              {recordedUri && !isRecording && (
                <Pressable
                  style={[styles.recordBtnSecondary]}
                  onPress={() => handleTestSound(recordedUri)}
                >
                  <Ionicons name="play" size={18} color="#0C4A94" />
                  <Text style={styles.recordBtnSecText}>ฟังตัวอย่าง</Text>
                </Pressable>
              )}
            </View>

            {/* Custom Sound Name Input */}
            {recordedUri && !isRecording && (
              <View style={styles.soundNameInputGroup}>
                <Text style={styles.soundNameInputLabel}>ตั้งชื่อเสียงแจ้งเตือนนี้:</Text>
                <TextInput
                  style={styles.soundNameInput}
                  value={customSoundName}
                  onChangeText={setCustomSoundName}
                  placeholder="เช่น เสียงตรวจจุดประจำป้อม"
                  placeholderTextColor="#94A3B8"
                />

                <Pressable
                  style={styles.saveRecordedBtn}
                  onPress={handleSaveRecordedSound}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.saveRecordedBtnText}>บันทึกและใช้เสียงนี้ทันที</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal 4: เลือกเวลาเตือนล่วงหน้า */}
      <Modal visible={showReminderModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>แจ้งเตือนก่อนถึงรอบตรวจ</Text>
                <Text style={styles.modalSub}>เลือกระยะเวลาที่ต้องการให้ระบบแจ้งเตือน</Text>
              </View>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setShowReminderModal(false)}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.soundOptionsList}>
              {REMINDER_OPTIONS.map((opt) => {
                const isSelected = opt === selectedReminder;
                return (
                  <Pressable
                    key={opt}
                    style={[styles.soundItem, isSelected && styles.soundItemActive]}
                    onPress={() => {
                      setSelectedReminder(opt);
                      cpStore.updateSettings({ reminderTime: opt });
                      setShowReminderModal(false);
                    }}
                  >
                    <Ionicons
                      name="alarm-outline"
                      size={20}
                      color={isSelected ? "#0C4A94" : "#64748B"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[styles.soundItemText, isSelected && styles.soundItemTextActive]}
                    >
                      {opt}
                    </Text>
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

      {/* Modal 5: เลือกระดับความดังเสียง (Volume Selector Modal) */}
      <Modal visible={showVolumeModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>เลือกระดับความดังเสียง</Text>
                <Text style={styles.modalSub}>
                  แตะเพื่อเลือกระดับความดังของเสียงแจ้งเตือน
                </Text>
              </View>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setShowVolumeModal(false)}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.soundOptionsList}>
              {VOLUME_OPTIONS.map((opt) => {
                const isSelected = Math.abs(opt.val - selectedVolume) < 0.05;
                return (
                  <Pressable
                    key={opt.val}
                    style={[styles.soundItem, isSelected && styles.soundItemActive]}
                    onPress={() => {
                      setSelectedVolume(opt.val);
                      soundHelper.setVolume(opt.val);
                      cpStore.updateSettings({ soundVolume: opt.val });
                      handleTestSound(selectedSoundId, opt.val);
                      setShowVolumeModal(false);
                    }}
                  >
                    <View style={styles.soundIconCircle}>
                      <Ionicons
                        name={opt.icon as any}
                        size={20}
                        color={isSelected ? "#0C4A94" : "#64748B"}
                      />
                    </View>
                    <Text
                      style={[styles.soundItemText, isSelected && styles.soundItemTextActive]}
                    >
                      {opt.label}
                    </Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    paddingBottom: 24
  },
  section: {
    marginHorizontal: 14,
    marginTop: 16
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#475569",
    marginBottom: 8,
    marginLeft: 4
  },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text
  },
  settingSub: {
    fontSize: 11.5,
    color: COLORS.muted,
    marginTop: 2
  },
  settingSelectedValue: {
    fontSize: 12.5,
    color: "#0C4A94",
    fontWeight: "700",
    marginTop: 2
  },
  pillSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#F0F6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  pillSelectorText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0C4A94"
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9"
  },
  btnPressed: {
    opacity: 0.85
  },
  versionCard: {
    alignItems: "center",
    marginTop: 24,
    gap: 4
  },
  versionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569"
  },
  versionSub: {
    fontSize: 11.5,
    color: "#94A3B8"
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
  soundOptionsList: {
    gap: 8,
    marginTop: 4
  },
  soundItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0"
  },
  soundItemActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#0C4A94"
  },
  soundIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  soundItemText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#334155"
  },
  soundItemTextActive: {
    color: "#0C4A94",
    fontWeight: "900"
  },
  customBadgeText: {
    fontSize: 11,
    color: "#0C4A94",
    fontWeight: "700",
    marginTop: 2
  },
  deleteSoundBtn: {
    padding: 6,
    marginRight: 6
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
  },
  addCustomSoundBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#CCE0FA",
    borderStyle: "dashed",
    borderRadius: 12,
    height: 46
  },
  addCustomSoundBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0C4A94"
  },
  modalConfirmBtn: {
    backgroundColor: "#0C4A94",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12
  },
  modalConfirmText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900"
  },

  // Add Choice Cards
  addChoiceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 12
  },
  addChoiceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  addChoiceTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.text
  },
  addChoiceSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2
  },

  // Voice Recording Studio
  recordBox: {
    alignItems: "center",
    paddingVertical: 18,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginTop: 6
  },
  recordVisualCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  recordVisualCircleActive: {
    backgroundColor: "#FEE2E2",
    transform: [{ scale: 1.08 }]
  },
  recordTimerText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 1
  },
  recordInstruction: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 20
  },
  recordActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  recordBtnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  recordBtnText: {
    color: "white",
    fontSize: 14.5,
    fontWeight: "800"
  },
  recordBtnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#CCE0FA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  recordBtnSecText: {
    color: "#0C4A94",
    fontSize: 14.5,
    fontWeight: "800"
  },
  soundNameInputGroup: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12
  },
  soundNameInputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6
  },
  soundNameInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: COLORS.text
  },
  saveRecordedBtn: {
    backgroundColor: "#0C4A94",
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10
  },
  saveRecordedBtnText: {
    color: "white",
    fontSize: 14.5,
    fontWeight: "900"
  },
  volPresetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  volPresetBtnActive: {
    backgroundColor: "#0C4A94",
    borderColor: "#0C4A94"
  },
  volPresetText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#64748B"
  },
  volPresetTextActive: {
    color: "white"
  }
});
