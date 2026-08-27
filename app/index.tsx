import React from "react";
import { Redirect } from "expo-router";
import { useUserStore } from "../lib/userStore";
import { useCheckpointMobileStore } from "../lib/checkpointMobileStore";

/**
 * Root Entry Point of the App
 * Routes to:
 * 1. /login if factory is not bound/registered yet
 * 2. /guard-select if factory is bound but no guard is logged in (Image 2)
 * 3. /(tabs) if guard is logged in
 */
export default function AppEntry() {
  const userStore = useUserStore();
  const cpStore = useCheckpointMobileStore();
  const profile = userStore.getProfile();
  const isFactoryBound = cpStore.isFactoryBound();

  if (!isFactoryBound) {
    return <Redirect href="/login" />;
  }

  if (!profile.isLoggedIn) {
    return <Redirect href="/guard-select" />;
  }

  return <Redirect href="/(tabs)" />;
}
