import { useEffect, useState } from "react";
import { NotificationItem } from "../types/notification";
import { systemNotificationHelper } from "./systemNotificationHelper";

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

let notifications: NotificationItem[] = [];

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

export const notificationStore = {
  getAllNotifications(): NotificationItem[] {
    return notifications;
  },

  getUnreadCount(): number {
    return notifications.filter((n) => !n.isRead).length;
  },

  getNotificationsByCategory(category: "all" | "emergency" | "announcement" | "patrol"): NotificationItem[] {
    if (category === "all") return notifications;
    return notifications.filter((n) => n.category === category);
  },

  getNotificationById(id: string): NotificationItem | undefined {
    return notifications.find((n) => n.id === id);
  },

  markAsRead(id: string) {
    notifications = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    notify();
  },

  markAllAsRead() {
    notifications = notifications.map((n) => ({ ...n, isRead: true }));
    notify();
  },

  acknowledgeAnnouncement(id: string) {
    notifications = notifications.map((n) => {
      if (n.id === id && n.announcementData) {
        return {
          ...n,
          isRead: true,
          announcementData: {
            ...n.announcementData,
            acknowledgedByGuard: true
          }
        };
      }
      return n;
    });
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
  triggerTestPatrolReminder(roundNum: number = 2, minutesBefore: number = 5) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.";
    const dateStr = `${now.getDate()} ส.ค. 2569`;
    
    const minutesText = minutesBefore === 0 ? "เริ่มตรวจทันที" : `จะเริ่มในอีก ${minutesBefore} นาที`;

    const newNotif: NotificationItem = {
      id: `NOTIF-PAT-${Date.now()}`,
      title: `⏰ แจ้งเตือนรอบตรวจ: ใกล้ถึงเวลาตรวจรอบที่ ${roundNum}`,
      category: "patrol",
      priority: "normal",
      summary: `รอบตรวจที่ ${roundNum} ${minutesText} มีทั้งหมด 8 จุดตรวจ`,
      content: `ระบบตรวจจับตามตารางกะปฏิบัติงาน กรุณาเตรียมความพร้อมและเริ่มออกตรวจตามจุดที่ 1-8 ตามกำหนดเวลา`,
      timestamp: timeStr,
      date: dateStr,
      isRead: false,
      patrolData: {
        roundId: roundNum,
        roundName: `รอบที่ ${roundNum} (ประจำกะ)`,
        scheduledTime: timeStr,
        totalPoints: 8
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
