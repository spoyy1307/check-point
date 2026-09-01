import { PatrolRound } from "./patrol";
import { EmergencyIncident } from "../lib/emergencyStore";

/**
 * Smart Visitor - Factory / Project Scope
 */
export type SmartVisitorFactory = {
  id: string;
  code: string;
  name: string;
  branchName: string;
  address: string;
  latitude: number;
  longitude: number;
  zones: string[];
  totalCheckpoints: number;
};

/**
 * Smart Visitor - Web Guard Account
 */
export type SmartVisitorGuardAccount = {
  smartVisitorUserId: string;
  employeeId: string;
  username?: string;
  name: string;
  role: string;
  phone: string;
  shift: string;
  factoryId: string;
  factoryName: string;
  assignedZone: string;
  avatarUri?: string;
  avatarEmoji?: string;
  startDate: string;
  isLoggedIn: boolean;
  pin?: string;
};

/**
 * Shift Check-in / Check-out Record
 */
export type ShiftRecord = {
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkInDate: string | null;
  checkInGps: { lat: number; lng: number } | null;
  isCheckedOut: boolean;
  checkOutTime: string | null;
  checkOutDate: string | null;
  checkOutGps: { lat: number; lng: number } | null;
  totalWorkingDuration: string | null;
  shiftName: string;
  scheduledHours: string;
};

/**
 * Root Schema Wrapper: check-point-mobile
 * All details and modules reside inside this namespace field
 */
export type CheckPointMobileData = {
  "check-point-mobile": {
    version: string;
    factory: SmartVisitorFactory;
    guardAccount: SmartVisitorGuardAccount;
    shift: ShiftRecord;
    patrol: {
      activeRoundId: number;
      rounds: PatrolRound[];
    };
    incidents: EmergencyIncident[];
    settings: {
      soundEnabled: boolean;
      soundVolume: number;
      selectedSoundId: string;
      selectedSoundName?: string;
      reminderTime?: string;
      vibrationEnabled?: boolean;
      watermarkEnabled: boolean;
      autoFlashNight?: boolean;
    };
    syncMeta: {
      lastSyncedAt: string;
      deviceId: string;
      isOnline: boolean;
    };
  };
};

/**
 * Default Available Factories for Smart Visitor System
 */
export const SMART_VISITOR_FACTORIES: SmartVisitorFactory[] = [
  {
    id: "FAC-ME-001",
    code: "ME-GRP",
    name: "ME Group Enterprise",
    branchName: "สาขา: ME Group Enterprise",
    address: "555 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร",
    latitude: 13.7248,
    longitude: 100.5802,
    zones: ["อาคารสำนักงานและล็อบบี้", "อาคารผลิต A", "คลังสินค้า B", "ลานจอดรถและป้อมยาม"],
    totalCheckpoints: 8
  },
  {
    id: "FAC-BKP-001",
    code: "SV-BKP",
    name: "โรงงานสมาร์ทวิสิทเทอร์ นิคมอุตสาหกรรมบางปู",
    branchName: "สาขาใหญ่ บางปู (โรงงาน 1)",
    address: "123 นิคมอุตสาหกรรมบางปู ซอย 12 ต.แพรกษา อ.เมือง จ.สมุทรปราการ",
    latitude: 13.5412,
    longitude: 100.6278,
    zones: ["อาคารสำนักงานและล็อบบี้", "อาคารผลิต A", "คลังสินค้า B", "ลานจอดรถและป้อมยาม"],
    totalCheckpoints: 8
  },
  {
    id: "FAC-KK-002",
    code: "SV-KK",
    name: "โรงงานกิ่งแก้ว อินดัสเทรียล พาร์ค",
    branchName: "สาขากิ่งแก้ว (โรงงาน 2)",
    address: "88/9 ถ.กิ่งแก้ว ต.ราชาเทวะ อ.บางพลี จ.สมุทรปราการ",
    latitude: 13.6825,
    longitude: 100.7289,
    zones: ["ป้อมประตูหลัก", "โซนโหลดสินค้า", "คลังวัตถุดิบ", "แนวรั้วทิศเหนือ"],
    totalCheckpoints: 8
  },
  {
    id: "FAC-AYA-003",
    code: "SV-AYA",
    name: "โรงงานไฮเทค อยุธยา โลจิสติกส์",
    branchName: "สาขานิคมไฮเทค อยุธยา",
    address: "99 นิคมอุตสาหกรรมบ้านหว้า (ไฮเทค) ต.บ้านเลน อ.บางปะอิน จ.อยุธยา",
    latitude: 14.2872,
    longitude: 100.5891,
    zones: ["อาคารควบคุมกลาง", "คลังสินค้าอัตโนมัติ", "ประตูทางเข้า 2"],
    totalCheckpoints: 8
  }
];

/**
 * Smart Visitor Web Guards associated with Factories
 */
export const SMART_VISITOR_GUARDS: SmartVisitorGuardAccount[] = [
  {
    smartVisitorUserId: "SV-USR-00101",
    employeeId: "00101",
    username: "@kendo",
    name: "นายคเณศ สิมมะลา",
    role: "หัวหน้ารักษาความปลอดภัย",
    phone: "081-111-2233",
    shift: "กะเช้า (08:00 - 20:00 น.)",
    factoryId: "FAC-ME-001",
    factoryName: "ME Group Enterprise",
    assignedZone: "ทุกโซนพื้นที่ส่วนกลาง",
    avatarEmoji: "👮‍♂️",
    startDate: "1 ม.ค. 2565",
    isLoggedIn: false,
    pin: "123456"
  },
  {
    smartVisitorUserId: "SV-USR-00102",
    employeeId: "00102",
    username: "@tiw",
    name: "นายอภิโชค สิมศรีแก้ว",
    role: "หัวหน้ารักษาความปลอดภัย",
    phone: "082-222-3344",
    shift: "กะดึก (20:00 - 08:00 น.)",
    factoryId: "FAC-ME-001",
    factoryName: "ME Group Enterprise",
    assignedZone: "อาคารผลิตและคลังสินค้า",
    avatarEmoji: "👮",
    startDate: "15 ก.พ. 2565",
    isLoggedIn: false,
    pin: "123456"
  },
  {
    smartVisitorUserId: "SV-USR-00103",
    employeeId: "00103",
    username: "@poy",
    name: "นางสาวอัจฉรา จากสูงเนิน",
    role: "เจ้าหน้าที่ รปภ.",
    phone: "083-333-4455",
    shift: "กะบ่าย (14:00 - 22:00 น.)",
    factoryId: "FAC-ME-001",
    factoryName: "ME Group Enterprise",
    assignedZone: "ประตูทางเข้าหลัก และจุดคัดกรอง",
    avatarEmoji: "👮‍♀️",
    startDate: "1 พ.ค. 2566",
    isLoggedIn: false,
    pin: "123456"
  },
  {
    smartVisitorUserId: "SV-USR-00123",
    employeeId: "00123",
    username: "@pongpol",
    name: "พงษ์พล อุทกานต์ภัทรกุล",
    role: "รปภ. ประจำกะดึก",
    phone: "081-234-5678",
    shift: "กะดึก (20:00 - 08:00 น.)",
    factoryId: "FAC-ME-001",
    factoryName: "ME Group Enterprise",
    assignedZone: "อาคารผลิต A และลานจอดรถส่วนกลาง",
    avatarEmoji: "👮‍♂️",
    startDate: "1 ม.ค. 2566",
    isLoggedIn: false,
    pin: "123456"
  },
  {
    smartVisitorUserId: "SV-USR-00124",
    employeeId: "00124",
    username: "@somsak",
    name: "สมศักดิ์ ปลอดภัย",
    role: "รปภ. ประจำกะเช้า",
    phone: "089-555-1122",
    shift: "กะเช้า (08:00 - 20:00 น.)",
    factoryId: "FAC-BKP-001",
    factoryName: "โรงงานสมาร์ทวิสิทเทอร์ นิคมอุตสาหกรรมบางปู",
    assignedZone: "ประตูทางเข้าหลัก และป้อมยามหน้า",
    avatarEmoji: "👮",
    startDate: "15 พ.ค. 2565",
    isLoggedIn: false,
    pin: "123456"
  },
  {
    smartVisitorUserId: "SV-USR-00125",
    employeeId: "00125",
    username: "@vipada",
    name: "วิภาดา มั่นคง",
    role: "รปภ. ประจำจุดคัดกรอง",
    phone: "086-777-8899",
    shift: "กะบ่าย (14:00 - 22:00 น.)",
    factoryId: "FAC-KK-002",
    factoryName: "โรงงานกิ่งแก้ว อินดัสเทรียล พาร์ค",
    assignedZone: "ล็อบบี้ตึกอำนวยการ สาขากิ่งแก้ว",
    avatarEmoji: "👮‍♀️",
    startDate: "10 ก.ค. 2566",
    isLoggedIn: false,
    pin: "123456"
  },
  {
    smartVisitorUserId: "SV-USR-00126",
    employeeId: "00126",
    username: "@theeradej",
    name: "ธีรเดช เจริญสุข",
    role: "หัวหน้าชุด รปภ. เวรตรวจ",
    phone: "082-999-3344",
    shift: "กะพิเศษ (เวรตรวจความปลอดภัย 24 ชม.)",
    factoryId: "FAC-BKP-001",
    factoryName: "โรงงานสมาร์ทวิสิทเทอร์ นิคมอุตสาหกรรมบางปู",
    assignedZone: "ทุกโซนพื้นที่ส่วนกลาง โรงงานบางปู",
    avatarEmoji: "👨‍✈️",
    startDate: "1 มี.ค. 2564",
    isLoggedIn: false,
    pin: "123456"
  }
];

export const DEFAULT_SHIFT_RECORD: ShiftRecord = {
  isCheckedIn: false,
  checkInTime: null,
  checkInDate: null,
  checkInGps: null,
  isCheckedOut: false,
  checkOutTime: null,
  checkOutDate: null,
  checkOutGps: null,
  totalWorkingDuration: null,
  shiftName: "กะดึก (ผลัดกลางคืน)",
  scheduledHours: "20:00 - 08:00 น. (12 ชม.)"
};
