import { useEffect, useState } from "react";
import { NotificationItem } from "../types/notification";
import { systemNotificationHelper } from "./systemNotificationHelper";

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "NOTIF-EMG-001",
    title: "🚨 แจ้งเหตุด่วนจากสายตรวจอื่น: ไฟไหม้/กลุ่มควัน",
    category: "emergency",
    priority: "urgent",
    summary: "รปภ. สมศักดิ์ (ป้อมหน้า) แจ้งพบกลุ่มควันหนาแน่น บริเวณลานจัดเก็บสินค้าหลังโรงงาน",
    content: "พบกลุ่มควันลอยขึ้นจากมุมด้านหลังคลังสินค้า โซน B เจ้าหน้าที่สายตรวจป้อมหน้ากำลังเข้าพื้นที่เพื่อตรวจสอบเบื้องต้น ขอให้ รปภ. ในพื้นที่ใกล้เคียงเตรียมพร้อมเข้าสนับสนุนและประสานงานทีมดับเพลิงประจำโรงงาน",
    timestamp: "17:15 น.",
    date: "26 ส.ค. 2569",
    isRead: false,
    incidentData: {
      incidentType: "ไฟไหม้ / กลุ่มควัน",
      reporterName: "สมศักดิ์ ปลอดภัย",
      reporterId: "00124",
      reporterPhone: "089-555-1122",
      locationName: "ลานจัดเก็บสินค้า โซน B (หลังโรงงาน)",
      latitude: 14.9038,
      longitude: 102.0575,
      distanceMeters: 120,
      photos: [
        "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80"
      ],
      status: "ongoing"
    }
  },
  {
    id: "NOTIF-ANN-001",
    title: "📢 คำสั่งพิเศษจากแอดมิน: ตรวจเข้มงวดยานพาหนะเข้า-ออก",
    category: "announcement",
    priority: "urgent",
    summary: "กำชับเจ้าหน้าที่ รปภ. ทุกผลัด ตรวจค้นท้ายรถและบันทึกภาพทะเบียนรถบรรทุกทุกคันอย่างเคร่งครัด",
    content: "ตามนโยบายยกระดับความปลอดภัยประจำไตรมาส ขอให้เจ้าหน้าที่ รปภ. ประจำจุดคัดกรองและป้อมหน้า ทำการตรวจสอบบัตรประชาชนผู้ขับขี่ บันทึกภาพถ่ายป้ายทะเบียน และตรวจใบนำสินค้าออกทุกครั้งก่อนเปิดไม้กั้น หากพบสิ่งผิดปกติให้แจ้งศูนย์ควบคุม (SOC) ทันที",
    timestamp: "14:30 น.",
    date: "26 ส.ค. 2569",
    isRead: false,
    announcementData: {
      publisherName: "ฝ่ายดูแลระบบ Check Point (SOC Admin)",
      publisherRole: "ผู้จัดการฝ่ายรักษาความปลอดภัย",
      importance: "high",
      bannerImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
      acknowledgedByGuard: false,
      validUntil: "31 ส.ค. 2569"
    }
  },
  {
    id: "NOTIF-PAT-001",
    title: "⏰ แจ้งเตือนรอบตรวจ: ใกล้ถึงเวลาตรวจรอบที่ 2",
    category: "patrol",
    priority: "normal",
    summary: "รอบตรวจที่ 2 (22:00 - 00:00 น.) จะเริ่มในอีก 15 นาที มีทั้งหมด 8 จุดตรวจ",
    content: "กรุณาเตรียมความพร้อมของอุปกรณ์มือถือ และเริ่มออกตรวจตามเส้นทางที่กำหนดเพื่อความปลอดภัยของพื้นที่โรงงาน",
    timestamp: "21:45 น.",
    date: "26 ส.ค. 2569",
    isRead: false,
    patrolData: {
      roundId: 2,
      roundName: "รอบที่ 2 (22:00 - 00:00 น.)",
      scheduledTime: "22:00 น.",
      totalPoints: 8
    }
  },
  {
    id: "NOTIF-ANN-002",
    title: "📢 ประกาศทั่วไป: กำหนดการซ้อมแผนอพยพหนีไฟประจำปี",
    category: "announcement",
    priority: "normal",
    summary: "โรงงานจะทำการซ้อมแผนดับเพลิงและอพยพหนีไฟในวันศุกร์ที่ 28 ส.ค. เวลา 13:30 - 15:00 น.",
    content: "ขอให้เจ้าหน้าที่ รปภ. ทุกท่าน ศึกษารายละเอียดจุดรวมพลและเส้นทางอพยพหลักของโรงงาน พร้อมอำนวยความสะดวกให้แก่พนักงานและเจ้าหน้าที่ดับเพลิงเทศบาลที่จะมาร่วมฝึกซ้อม",
    timestamp: "09:00 น.",
    date: "25 ส.ค. 2569",
    isRead: true,
    announcementData: {
      publisherName: "ฝ่ายความปลอดภัยและสิ่งแวดล้อม (EHS)",
      publisherRole: "เจ้าหน้าที่ความปลอดภัยวิชาชีพ",
      importance: "normal",
      bannerImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80",
      acknowledgedByGuard: true,
      validUntil: "28 ส.ค. 2569"
    }
  }
];

let notifications: NotificationItem[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));

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
