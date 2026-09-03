import { useEffect, useState } from "react";
import { NotificationItem } from "../types/notification";
import { systemNotificationHelper } from "./systemNotificationHelper";
import { userStore } from "./userStore";

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

let notifications: NotificationItem[] = [];
const readMap: Record<string, Set<string>> = {};
const acknowledgedMap: Record<string, Set<string>> = {};

type Listener = () => void;
const listeners = new Set<Listener>();

type BannerListener = (item: NotificationItem) => void;
const bannerListeners = new Set<BannerListener>();

function notify() {
  listeners.forEach((listener) => listener());
}

function notifyBanner(item: NotificationItem) {
  bannerListeners.forEach((listener) => listener(item));
}

function getCurrentGuardId(overrideId?: string): string {
  if (overrideId) return overrideId;
  const profile = userStore.getProfile();
  return profile?.employeeId || "default_guard";
}

export const notificationStore = {
  getAllNotifications(guardId?: string): NotificationItem[] {
    const gid = getCurrentGuardId(guardId);
    const guardReadSet = readMap[gid] || new Set<string>();
    const guardAckSet = acknowledgedMap[gid] || new Set<string>();

    return notifications.map((n) => ({
      ...n,
      isRead: guardReadSet.has(n.id),
      announcementData: n.announcementData
        ? {
            ...n.announcementData,
            acknowledgedByGuard: guardAckSet.has(n.id)
          }
        : undefined
    }));
  },

  getUnreadCount(guardId?: string): number {
    const all = this.getAllNotifications(guardId);
    return all.filter((n) => !n.isRead).length;
  },

  getNotificationsByCategory(
    category: "all" | "emergency" | "announcement" | "patrol",
    guardId?: string
  ): NotificationItem[] {
    const all = this.getAllNotifications(guardId);
    if (category === "all") return all;
    return all.filter((n) => n.category === category);
  },

  getNotificationById(id: string, guardId?: string): NotificationItem | undefined {
    const all = this.getAllNotifications(guardId);
    return all.find((n) => n.id === id);
  },

  markAsRead(id: string, guardId?: string) {
    const gid = getCurrentGuardId(guardId);
    if (!readMap[gid]) {
      readMap[gid] = new Set<string>();
    }
    readMap[gid].add(id);
    notify();
  },

  markAllAsRead(guardId?: string) {
    const gid = getCurrentGuardId(guardId);
    if (!readMap[gid]) {
      readMap[gid] = new Set<string>();
    }
    notifications.forEach((n) => readMap[gid].add(n.id));
    notify();
  },

  acknowledgeAnnouncement(id: string, guardId?: string) {
    const gid = getCurrentGuardId(guardId);
    if (!readMap[gid]) {
      readMap[gid] = new Set<string>();
    }
    if (!acknowledgedMap[gid]) {
      acknowledgedMap[gid] = new Set<string>();
    }
    readMap[gid].add(id);
    acknowledgedMap[gid].add(id);
    notify();
  },

  addNotification(item: NotificationItem, showBanner: boolean = true) {
    notifications = [item, ...notifications];
    notify();
    if (showBanner) {
      notifyBanner(item);
      systemNotificationHelper.presentSystemNotification(item);
    }
  },

  triggerPushBanner(item: NotificationItem) {
    this.addNotification(item, true);
  },

  // Helper to trigger realistic Real-Time Patrol Round Alert
  triggerTestPatrolReminder(
    roundNum: number = 1,
    minutesBefore: number = 5,
    roundTimeStr?: string,
    factoryNameStr?: string
  ) {
    const now = new Date();
    const timeStr =
      now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.";
    const dateStr = `${now.getDate()} ส.ค. ${now.getFullYear() + 543}`;

    const minutesText =
      minutesBefore === 0 ? "ถึงเวลาเริ่มตรวจแล้ว" : `อีก ${minutesBefore} นาที`;
    const facName = factoryNameStr || "พื้นที่โรงงานโครงการ";
    const schedTime = roundTimeStr || timeStr;

    const newNotif: NotificationItem = {
      id: `NOTIF-PAT-${Date.now()}`,
      title: `🔔 แจ้งเตือน ใกล้ถึงเวลาการตรวจ ${minutesText}`,
      category: "patrol",
      priority: "normal",
      summary: `รอบการตรวจที่ ${roundNum} เวลาเริ่มตรวจ ${schedTime} โครงการ ${facName}`,
      content: `ระบบตรวจจับตามตารางกะปฏิบัติงาน กรุณาเตรียมความพร้อมและเริ่มออกตรวจตามรอบเวลาที่กำหนด`,
      timestamp: timeStr,
      date: dateStr,
      isRead: false,
      patrolData: {
        roundId: roundNum,
        roundName: `รอบที่ ${roundNum} (ประจำกะ)`,
        scheduledTime: schedTime,
        totalPoints: 0
      }
    };

    this.addNotification(newNotif, true);
    return newNotif;
  },

  // Helper to trigger realistic Real-Time Admin Announcement Alert
  triggerTestAnnouncement() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.";
    const dateStr = `${now.getDate()} ส.ค. 2569`;

    const newNotif: NotificationItem = {
      id: `NOTIF-ANN-${Date.now()}`,
      title: `📢 ข้อความด่วนจากแอดมิน: ตรวจสอบความเรียบร้อยก่อนส่งเวร`,
      category: "announcement",
      priority: "urgent",
      summary: `หัวหน้าชุดสั่งการกำชับตรวจเช็คอุปกรณ์ประจำป้อมและรายงานสถานะรอบสุดท้าย`,
      content: `ขอให้เจ้าหน้าที่ทุกจุดตรวจเช็ควิทยุสื่อสาร กุญแจ และสมุดบันทึกส่งมอบให้ครบถ้วนก่อนสลับผลัด`,
      timestamp: timeStr,
      date: dateStr,
      isRead: false,
      announcementData: {
        publisherName: "ฝ่ายดูแลระบบ Check Point (SOC Admin)",
        publisherRole: "หัวหน้าฝ่ายรักษาความปลอดภัย",
        importance: "high",
        acknowledgedByGuard: false,
        validUntil: "31 ส.ค. 2569"
      }
    };

    this.addNotification(newNotif, true);
    return newNotif;
  },

  deleteNotification(id: string) {
    notifications = notifications.filter((n) => n.id !== id);
    notify();
  },

  subscribeBanner(listener: BannerListener) {
    bannerListeners.add(listener);
    return () => {
      bannerListeners.delete(listener);
    };
  }
};

export function useNotificationStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return notificationStore;
}
