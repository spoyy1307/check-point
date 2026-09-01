import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import GlobalPushBanner from "../components/GlobalPushBanner";
import { patrolReminderEngine } from "../lib/patrolReminderEngine";

export default function RootLayout() {
  useEffect(() => {
    patrolReminderEngine.start();
    return () => {
      patrolReminderEngine.stop();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.blue} translucent />
      <GlobalPushBanner />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
