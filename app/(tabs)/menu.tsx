import React from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";
import TopBar from "../../components/TopBar";
import { useUserStore } from "../../lib/userStore";

export default function SettingsTabScreen() {
  const insets = useSafeAreaInsets();
  const userStore = useUserStore();
  const profile = userStore.getProfile();

  const handleLogout = () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบการปฏิบัติงานหรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: () => {
          userStore.logout();
          router.replace("/guard-select");
        }
      }
    ]);
  };

  const handleMenuPress = (route: string) => {
    if (route === "logout") {
      handleLogout();
    } else {
      router.push(route as any);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
      showsVerticalScrollIndicator={false}
    >
      <TopBar title="ตั้งค่า" />

      {/* Profile Card (Clickable to Edit Profile) */}
      <Pressable
        style={({ pressed }) => [styles.profileCard, pressed && styles.cardPressed]}
        onPress={() => router.push("/profile")}
      >
        <View style={styles.avatar}>
          {profile.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{profile.avatarEmoji || "👮‍♂️"}</Text>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.role}>{profile.role}</Text>
          <Text style={styles.empId}>รหัสพนักงาน: {profile.employeeId}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
      </Pressable>

      {/* Menu List */}
      <View style={styles.list}>
        {/* 1. ตั้งค่าแอปพลิเคชัน */}
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.cardPressed]}
          onPress={() => handleMenuPress("/app-settings")}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="settings-outline" size={22} color="#0C4A94" />
          </View>
          <Text style={styles.rowText}>ตั้งค่าแอปพลิเคชัน</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
        </Pressable>

        {/* 3. คู่มือการใช้งาน */}
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.cardPressed]}
          onPress={() => handleMenuPress("/guide")}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="help-circle-outline" size={22} color="#0C4A94" />
          </View>
          <Text style={styles.rowText}>คู่มือการใช้งาน</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
        </Pressable>

        {/* 4. ติดต่อผู้ดูแลระบบ */}
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.cardPressed]}
          onPress={() => handleMenuPress("/contact-admin")}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="people-outline" size={22} color="#0C4A94" />
          </View>
          <Text style={styles.rowText}>ติดต่อผู้ดูแลระบบ</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
        </Pressable>

        {/* 5. ออกจากระบบ */}
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.cardPressed]}
          onPress={() => handleMenuPress("logout")}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          </View>
          <Text style={[styles.rowText, { color: "#DC2626" }]}>ออกจากระบบ</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
        </Pressable>
      </View>
    </ScrollView>
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
  profileCard: {
    marginHorizontal: 14,
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EAF2FF",
    borderWidth: 2,
    borderColor: "#DCE8F7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  avatarImage: {
    width: "100%",
    height: "100%"
  },
  avatarText: {
    fontSize: 32
  },
  profileInfo: {
    flex: 1
  },
  name: {
    fontWeight: "900",
    color: COLORS.text,
    fontSize: 16
  },
  role: {
    color: COLORS.muted,
    marginTop: 3,
    fontSize: 12.5
  },
  empId: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  },
  list: {
    paddingHorizontal: 14,
    marginTop: 12,
    gap: 10
  },
  row: {
    minHeight: 58,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center"
  },
  rowText: {
    flex: 1,
    fontWeight: "800",
    color: COLORS.text,
    fontSize: 15,
    marginLeft: 14
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }]
  }
});
