import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.blue,
        tabBarInactiveTintColor: "#7A8595",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarStyle: {
          height: 56 + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.white
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "หน้าหลัก",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="patrol"
        options={{
          title: "ตรวจจุด",
          tabBarIcon: ({ color, size }) => <Ionicons name="location-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: "แจ้งเหตุฉุกเฉิน",
          tabBarActiveTintColor: COLORS.red,
          tabBarIcon: ({ color, size }) => <Ionicons name="warning-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "สรุปผล",
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "ตั้งค่า",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
