import { useEffect, useState } from "react";
import {
  CheckPointMobileData,
  DEFAULT_SHIFT_RECORD,
  ShiftRecord,
  SMART_VISITOR_FACTORIES,
  SMART_VISITOR_GUARDS,
  SmartVisitorFactory,
  SmartVisitorGuardAccount
} from "../types/checkpointMobile";
import { PATROL_ROUNDS } from "../types/patrol";
import { api } from "./api";

// Initial root state conforming to "check-point-mobile" schema
let checkpointMobileState: CheckPointMobileData["check-point-mobile"] = {
  version: "1.0.0",
  factory: { ...SMART_VISITOR_FACTORIES[0] },
  guardAccount: { ...SMART_VISITOR_GUARDS[0] },
  shift: { ...DEFAULT_SHIFT_RECORD },
  patrol: {
    activeRoundId: 1,
    rounds: JSON.parse(JSON.stringify(PATROL_ROUNDS))
  },
  incidents: [],
  settings: {
    soundEnabled: true,
    soundVolume: 1.0,
    selectedSoundId: "beep",
    watermarkEnabled: true,
    highAccuracyGps: true,
    keepScreenAwake: true,
    offlineMode: true
  },
  syncMeta: {
    lastSyncedAt: new Date().toISOString(),
    deviceId: "MOBILE-CP-01",
    isOnline: true
  }
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

let allFactoryGuards: SmartVisitorGuardAccount[] = [...SMART_VISITOR_GUARDS];
let isFactoryBoundState = false;

export const checkpointMobileStore = {
  // 1. Get entire check-point-mobile data payload
  getFullPayload(): CheckPointMobileData {
    return {
      "check-point-mobile": {
        ...checkpointMobileState,
        syncMeta: {
          ...checkpointMobileState.syncMeta,
          lastSyncedAt: new Date().toISOString()
        }
      }
    };
  },

  // 1.1 Factory Binding State (ฟิกโรงงานไว้ประจำเครื่อง)
  isFactoryBound(): boolean {
    return isFactoryBoundState;
  },

  bindFactory(factoryId: string) {
    isFactoryBoundState = true;
    this.setFactory(factoryId);
  },

  unbindFactory() {
    isFactoryBoundState = false;
    checkpointMobileState.guardAccount.isLoggedIn = false;
    notify();
  },

  // 2. Factory Details (แสดงข้อมูลเฉพาะของโรงงานนั้นๆ)
  getFactory(): SmartVisitorFactory {
    return checkpointMobileState.factory;
  },

  getAllFactories(): SmartVisitorFactory[] {
    return SMART_VISITOR_FACTORIES;
  },

  setFactory(factoryId: string) {
    const found = SMART_VISITOR_FACTORIES.find((f) => f.id === factoryId);
    if (found) {
      checkpointMobileState = {
        ...checkpointMobileState,
        factory: { ...found }
      };

      // Filter available guards of this factory
      const factoryGuards = allFactoryGuards.filter((g) => g.factoryId === found.id);
      if (factoryGuards.length > 0) {
        checkpointMobileState.guardAccount = { ...factoryGuards[0], isLoggedIn: false };
      }

      notify();

      // Sync with backend API
      api.patrol.getRounds().catch(() => {});
    }
  },

  // 3. Smart Visitor Guard Account
  getGuardAccount(): SmartVisitorGuardAccount {
    return checkpointMobileState.guardAccount;
  },

  getGuardsForCurrentFactory(): SmartVisitorGuardAccount[] {
    return allFactoryGuards.filter(
      (g) => g.factoryId === checkpointMobileState.factory.id
    );
  },

  addGuardToCurrentFactory(newGuard: {
    name: string;
    username: string;
    role: string;
    employeeId: string;
    phone?: string;
    shift?: string;
    pin?: string;
  }) {
    const created: SmartVisitorGuardAccount = {
      smartVisitorUserId: `SV-USR-${newGuard.employeeId}`,
      employeeId: newGuard.employeeId,
      username: newGuard.username.startsWith("@") ? newGuard.username : `@${newGuard.username}`,
      name: newGuard.name,
      role: newGuard.role,
      phone: newGuard.phone || "081-000-0000",
      shift: newGuard.shift || "กะเช้า (08:00 - 20:00 น.)",
      factoryId: checkpointMobileState.factory.id,
      factoryName: checkpointMobileState.factory.name,
      assignedZone: "ทุกโซนพื้นที่ส่วนกลาง",
      avatarEmoji: "👮",
      startDate: "1 ม.ค. 2567",
      isLoggedIn: false,
      pin: newGuard.pin || "123456"
    };

    allFactoryGuards = [created, ...allFactoryGuards];
    notify();
    return created;
  },

  switchGuardAccount(employeeId: string): SmartVisitorGuardAccount {
    const target = allFactoryGuards.find((g) => g.employeeId === employeeId);
    if (target) {
      // If guard belongs to different factory, also switch factory context
      const targetFactory = SMART_VISITOR_FACTORIES.find((f) => f.id === target.factoryId);
      checkpointMobileState = {
        ...checkpointMobileState,
        guardAccount: { ...target, isLoggedIn: true },
        factory: targetFactory ? { ...targetFactory } : checkpointMobileState.factory
      };
      notify();

      api.auth.switchGuard(employeeId).catch(() => {});
      return checkpointMobileState.guardAccount;
    }
    return checkpointMobileState.guardAccount;
  },

  updateGuardProfile(updates: Partial<SmartVisitorGuardAccount>) {
    checkpointMobileState = {
      ...checkpointMobileState,
      guardAccount: {
        ...checkpointMobileState.guardAccount,
        ...updates
      }
    };
    notify();

    api.auth.updateProfile(checkpointMobileState.guardAccount).catch(() => {});
  },

  // 4. Settings inside check-point-mobile
  getSettings(): typeof checkpointMobileState.settings {
    return checkpointMobileState.settings;
  },

  updateSettings(settingsUpdates: Partial<typeof checkpointMobileState.settings>) {
    checkpointMobileState = {
      ...checkpointMobileState,
      settings: {
        ...checkpointMobileState.settings,
        ...settingsUpdates
      }
    };
    notify();

    api.settings.updateSettings(checkpointMobileState.settings).catch(() => {});
  },

  // 5. Shift Operations (ลงเวลาเข้า-ออกกะ)
  getShift(): ShiftRecord {
    return checkpointMobileState.shift;
  },

  checkIn(
    time: string = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.",
    date: string = new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
    gps: { lat: number; lng: number } = { lat: 16.8156, lng: 100.2620 }
  ) {
    checkpointMobileState = {
      ...checkpointMobileState,
      shift: {
        ...checkpointMobileState.shift,
        isCheckedIn: true,
        checkInTime: time,
        checkInDate: date,
        checkInGps: gps,
        isCheckedOut: false,
        checkOutTime: null,
        checkOutDate: null,
        checkOutGps: null,
        totalWorkingDuration: null
      }
    };
    notify();
  },

  checkOut(
    time: string = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.",
    date: string = new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
    gps: { lat: number; lng: number } = { lat: 16.8156, lng: 100.2620 },
    duration: string = "12 ชั่วโมง 01 นาที"
  ) {
    checkpointMobileState = {
      ...checkpointMobileState,
      shift: {
        ...checkpointMobileState.shift,
        isCheckedOut: true,
        checkOutTime: time,
        checkOutDate: date,
        checkOutGps: gps,
        totalWorkingDuration: duration
      }
    };
    notify();
  },

  resetShift() {
    checkpointMobileState = {
      ...checkpointMobileState,
      shift: {
        ...DEFAULT_SHIFT_RECORD,
        isCheckedIn: false,
        checkInTime: null,
        checkInDate: null,
        checkInGps: null,
        isCheckedOut: false,
        checkOutTime: null,
        checkOutDate: null,
        checkOutGps: null,
        totalWorkingDuration: null
      }
    };
    notify();
  }
};

export function useCheckpointMobileStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return checkpointMobileStore;
}
