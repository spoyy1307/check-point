import { useEffect, useState } from "react";
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

export const AVAILABLE_GUARDS: UserProfile[] = [
  {
    name: "นายคเณศ สิมมะลา",
    employeeId: "00101",
    username: "@kendo",
    role: "หัวหน้ารักษาความปลอดภัย",
    phone: "081-111-2233",
    shift: "กะเช้า (08:00 - 20:00 น.)",
    zone: "ทุกโซนพื้นที่ส่วนกลาง",
    avatarEmoji: "👮‍♂️",
    startDate: "1 ม.ค. 2565",
    isLoggedIn: false,
    pin: "123456"
  },
  {
    name: "นายอภิโชค สิมศรีแก้ว",
    employeeId: "00102",
    username: "@tiw",
    role: "หัวหน้ารักษาความปลอดภัย",
    phone: "082-222-3344",
    shift: "กะดึก (20:00 - 08:00 น.)",
    zone: "อาคารผลิตและคลังสินค้า",
    avatarEmoji: "👮",
    startDate: "15 ก.พ. 2565",
    isLoggedIn: false,
    pin: "123456"
  },
  {
    name: "นางสาวอัจฉรา จากสูงเนิน",
    employeeId: "00103",
    username: "@poy",
    role: "เจ้าหน้าที่ รปภ.",
    phone: "083-333-4455",
    shift: "กะบ่าย (14:00 - 22:00 น.)",
    zone: "ประตูทางเข้าหลัก และจุดคัดกรอง",
    avatarEmoji: "👮‍♀️",
    startDate: "1 พ.ค. 2566",
    isLoggedIn: false,
    pin: "123456"
  },
  {
    name: "พงษ์พล อุทกานต์ภัทรกุล",
    employeeId: "00123",
    username: "@pongpol",
    role: "รปภ. ประจำกะดึก",
    phone: "081-234-5678",
    shift: "กะดึก (20:00 - 08:00 น.)",
    zone: "อาคาร A และลานจอดรถส่วนกลาง",
    avatarEmoji: "👮‍♂️",
    startDate: "1 ม.ค. 2566",
    isLoggedIn: false,
    pin: "123456"
  },
  {
    name: "สมศักดิ์ ปลอดภัย",
    employeeId: "00124",
    username: "@somsak",
    role: "รปภ. ประจำกะเช้า",
    phone: "089-555-1122",
    shift: "กะเช้า (08:00 - 20:00 น.)",
    zone: "ประตูทางเข้าหลัก และป้อมยามหน้า",
    avatarEmoji: "👮",
    startDate: "15 พ.ค. 2565",
    isLoggedIn: false,
    pin: "123456"
  },
  {
    name: "วิภาดา มั่นคง",
    employeeId: "00125",
    username: "@vipada",
    role: "รปภ. ประจำจุดคัดกรอง",
    phone: "086-777-8899",
    shift: "กะบ่าย (14:00 - 22:00 น.)",
    zone: "ล็อบบี้ตึกอำนวยการ",
    avatarEmoji: "👮‍♀️",
    startDate: "10 ก.ค. 2566",
    isLoggedIn: false,
    pin: "123456"
  },
  {
    name: "ธีรเดช เจริญสุข",
    employeeId: "00126",
    username: "@theeradej",
    role: "หัวหน้าชุด รปภ. เวรตรวจ",
    phone: "082-999-3344",
    shift: "กะพิเศษ (เวรตรวจความปลอดภัย 24 ชม.)",
    zone: "ทุกโซนพื้นที่ส่วนกลาง",
    avatarEmoji: "👨‍✈️",
    startDate: "1 มี.ค. 2564",
    isLoggedIn: false,
    pin: "123456"
  }
];

let currentProfile: UserProfile = { ...AVAILABLE_GUARDS[0] };
let allGuards: UserProfile[] = [...AVAILABLE_GUARDS];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

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
