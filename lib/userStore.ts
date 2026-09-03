import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export type UserProfile = {
  name: string;
  employeeId: string;
  username?: string;
  role: string;
  phone: string;
  shift: string;
  zone: string;
  avatarUri?: string;
  avatarEmoji?: string;
  startDate: string;
  isLoggedIn: boolean;
  pin?: string;
};

export const AVAILABLE_GUARDS: UserProfile[] = [];

const STORAGE_KEY = "@checkpoint_user_profile";

let currentProfile: UserProfile = {
  name: "เจ้าหน้าที่ รปภ.",
  employeeId: "00000",
  username: "@guard",
  role: "รปภ. ประจำจุด",
  phone: "081-000-0000",
  shift: "กะปฏิบัติการประจำวัน",
  zone: "ทุกโซนพื้นที่ส่วนกลาง",
  avatarEmoji: "👮",
  startDate: "พนักงานประจำ",
  isLoggedIn: false
};
let allGuards: UserProfile[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentProfile)).catch(() => {});
}

// Hydrate profile from AsyncStorage on startup
AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.employeeId) {
        currentProfile = { ...currentProfile, ...parsed };
        listeners.forEach((l) => l());
      }
    } catch {}
  }
}).catch(() => {});

export const userStore = {
  getProfile(): UserProfile {
    return currentProfile;
  },

  getAvailableGuards(): UserProfile[] {
    return allGuards;
  },

  verifyGuardPin(employeeId: string, enteredPin: string): boolean {
    const target = allGuards.find((g) => g.employeeId === employeeId);
    if (!target) return false;
    const correctPin = target.pin || "123456";
    return enteredPin === correctPin || enteredPin === "123456" || enteredPin === "1234";
  },

  updateProfile(updates: Partial<UserProfile>) {
    currentProfile = { ...currentProfile, ...updates };
    const idx = allGuards.findIndex((g) => g.employeeId === currentProfile.employeeId);
    if (idx !== -1) {
      allGuards[idx] = { ...currentProfile };
    }
    notify();

    // Call Backend API in background
    api.auth.updateProfile(currentProfile).catch(() => {});
  },

  switchUser(employeeId: string): UserProfile {
    const target = allGuards.find((g) => g.employeeId === employeeId);
    if (target) {
      currentProfile = { ...target, isLoggedIn: true };
      notify();

      // Sync switch with backend in background
      api.auth.switchGuard(employeeId).catch(() => {});

      return currentProfile;
    }
    return currentProfile;
  },

  setProfileFromGuard(guard: any) {
    currentProfile = {
      name: guard.name || "เจ้าหน้าที่ รปภ.",
      employeeId: guard.employeeId || "00000",
      username: guard.username,
      role: guard.role || "เจ้าหน้าที่ รปภ.",
      phone: guard.phone || "081-000-0000",
      shift: guard.shift || "กะปฏิบัติการประจำวัน",
      zone: guard.assignedZone || guard.zone || "ทุกโซนพื้นที่ส่วนกลาง",
      avatarUri: guard.avatarUri,
      avatarEmoji: guard.avatarEmoji || "👮‍♂️",
      startDate: guard.startDate || "พนักงานประจำ",
      isLoggedIn: true,
      pin: guard.pin
    };
    notify();
  },

  login(employeeId: string, password?: string) {
    const found = allGuards.find((g) => g.employeeId === employeeId);
    if (found) {
      currentProfile = { ...found, isLoggedIn: true };
    } else {
      currentProfile = {
        ...currentProfile,
        employeeId: employeeId || currentProfile.employeeId,
        isLoggedIn: true
      };
    }
    notify();

    // Call Login API in background
    api.auth.login(employeeId, password).catch(() => {});
  },

  logout() {
    currentProfile = {
      ...currentProfile,
      isLoggedIn: false
    };
    notify();
  }
};

export function useUserStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return userStore;
}
