export interface TrendPoint {
  day: string;
  fullDate: string;
  score: number;
  onTime: number;
  late: number;
  miss: number;
}

export interface ScoreLogItem {
  id: string;
  date: string;
  time: string;
  type: "reward" | "penalty";
  points: number;
  title: string;
  detail: string;
  officer: string;
  category: "patrol" | "emergency" | "photo" | "discipline" | "attendance";
}

export const SEVEN_DAYS_DATA: TrendPoint[] = [
  { day: "8 พ.ค.", fullDate: "8 พฤษภาคม 2026", score: 88, onTime: 16, late: 3, miss: 1 },
  { day: "9 พ.ค.", fullDate: "9 พฤษภาคม 2026", score: 92, onTime: 17, late: 2, miss: 0 },
  { day: "10 พ.ค.", fullDate: "10 พฤษภาคม 2026", score: 90, onTime: 16, late: 2, miss: 0 },
  { day: "11 พ.ค.", fullDate: "11 พฤษภาคม 2026", score: 95, onTime: 18, late: 1, miss: 0 },
  { day: "12 พ.ค.", fullDate: "12 พฤษภาคม 2026", score: 93, onTime: 17, late: 2, miss: 0 },
  { day: "13 พ.ค.", fullDate: "13 พฤษภาคม 2026", score: 94, onTime: 18, late: 1, miss: 0 },
  { day: "14 พ.ค.", fullDate: "14 พฤษภาคม 2026", score: 95, onTime: 18, late: 2, miss: 0 }
];

export const FOURTEEN_DAYS_DATA: TrendPoint[] = [
  { day: "1 พ.ค.", fullDate: "1 พฤษภาคม 2026", score: 85, onTime: 15, late: 3, miss: 1 },
  { day: "2 พ.ค.", fullDate: "2 พฤษภาคม 2026", score: 87, onTime: 16, late: 2, miss: 1 },
  { day: "3 พ.ค.", fullDate: "3 พฤษภาคม 2026", score: 90, onTime: 17, late: 2, miss: 0 },
  { day: "4 พ.ค.", fullDate: "4 พฤษภาคม 2026", score: 89, onTime: 16, late: 3, miss: 0 },
  { day: "5 พ.ค.", fullDate: "5 พฤษภาคม 2026", score: 91, onTime: 17, late: 2, miss: 0 },
  { day: "6 พ.ค.", fullDate: "6 พฤษภาคม 2026", score: 94, onTime: 18, late: 1, miss: 0 },
  { day: "7 พ.ค.", fullDate: "7 พฤษภาคม 2026", score: 92, onTime: 17, late: 2, miss: 0 },
  ...SEVEN_DAYS_DATA
];

export const THIRTY_DAYS_DATA: TrendPoint[] = [
  { day: "15 เม.ย.", fullDate: "15 เมษายน 2026", score: 82, onTime: 14, late: 4, miss: 2 },
  { day: "18 เม.ย.", fullDate: "18 เมษายน 2026", score: 86, onTime: 15, late: 3, miss: 1 },
  { day: "21 เม.ย.", fullDate: "21 เมษายน 2026", score: 88, onTime: 16, late: 2, miss: 1 },
  { day: "24 เม.ย.", fullDate: "24 เมษายน 2026", score: 90, onTime: 17, late: 2, miss: 0 },
  { day: "27 เม.ย.", fullDate: "27 เมษายน 2026", score: 93, onTime: 18, late: 1, miss: 0 },
  { day: "30 เม.ย.", fullDate: "30 เมษายน 2026", score: 89, onTime: 16, late: 3, miss: 0 },
  ...FOURTEEN_DAYS_DATA
];

export const SCORE_AUDIT_LOGS: ScoreLogItem[] = [
  {
    id: "log-1",
    date: "14 พ.ค. 2026",
    time: "20:30 น.",
    type: "reward",
    points: 5,
    title: "ตรวจครบ 8 จุดตรงเวลา 100%",
    detail: "รอบที่ 1 (20:00 - 20:30 น.) ปฏิบัติหน้าที่ตรวจตราครบถ้วนสมบูรณ์",
    officer: "ระบบตรวจสอบอัตโนมัติ (SOC AI)",
    category: "patrol"
  },
  {
    id: "log-2",
    date: "14 พ.ค. 2026",
    time: "22:15 น.",
    type: "reward",
    points: 5,
    title: "รายงานเหตุการณ์ฉุกเฉินและประสานงานรวดเร็ว",
    detail: "แจ้งเหตุไฟฟ้าดับบริเวณโกดังสินค้าและประสานงานช่างเทคนิคภายใน 5 นาที",
    officer: "ร.ต.อ. สมศักดิ์ มั่นคงดี (หัวหน้าชุด)",
    category: "emergency"
  },
  {
    id: "log-3",
    date: "13 พ.ค. 2026",
    time: "00:45 น.",
    type: "penalty",
    points: -3,
    title: "ตรวจล่าช้าเกินเวลาที่กำหนด 15 นาที",
    detail: "จุดตรวจที่ 4 อาคารสำนักงาน (รอบที่ 3) เข้าตรวจเวลา 00:45 น. (กำหนด 00:30 น.)",
    officer: "ระบบบันทึกเวลา GPS",
    category: "patrol"
  },
  {
    id: "log-4",
    date: "12 พ.ค. 2026",
    time: "08:00 น.",
    type: "reward",
    points: 10,
    title: "โบนัสความประพฤติดีเด่นประจำสัปดาห์",
    detail: "เข้าปฏิบัติหน้าที่ตรงเวลาและตรวจจุดไม่ขาดตกบกพร่องต่อเนื่อง 7 วัน",
    officer: "คุณเกียรติศักดิ์ เจริญผล (ผจก. HSE)",
    category: "attendance"
  },
  {
    id: "log-5",
    date: "11 พ.ค. 2026",
    time: "02:15 น.",
    type: "penalty",
    points: -2,
    title: "ถ่ายรูปภาพหลักฐานไม่ชัดเจน / มืดเกินไป",
    detail: "จุดตรวจที่ 7 ลานจอดรถด้านใน ภาพถ่ายไม่เห็นสภาพแวดล้อมโดยรอบชัดเจน",
    officer: "ศูนย์ควบคุมความปลอดภัย SOC",
    category: "photo"
  },
  {
    id: "log-6",
    date: "10 พ.ค. 2026",
    time: "04:30 น.",
    type: "reward",
    points: 5,
    title: "ตรวจพบและรายงานประตูด้านหลังปิดไม่สนิท",
    detail: "เข้าตรวจสอบจุดที่ 8 ประตูทางออก และช่วยล็อกกุญแจความปลอดภัยเรียบร้อย",
    officer: "ร.ต.อ. สมศักดิ์ มั่นคงดี (หัวหน้าชุด)",
    category: "patrol"
  },
  {
    id: "log-7",
    date: "8 พ.ค. 2026",
    time: "03:10 น.",
    type: "penalty",
    points: -5,
    title: "ขาดการตรวจจุดตามรอบที่กำหนด",
    detail: "จุดตรวจที่ 6 ทางหนีไฟทิศเหนือ ไม่พบข้อมูลการเช็คอินในรอบตรวจที่ 4",
    officer: "ระบบตรวจสอบอัตโนมัติ (SOC AI)",
    category: "patrol"
  }
];

export const scoreHistoryStore = {
  getTrendData(filter: string): TrendPoint[] {
    if (filter === "14 วันล่าสุด") return FOURTEEN_DAYS_DATA;
    if (filter === "30 วันล่าสุด") return THIRTY_DAYS_DATA;
    return SEVEN_DAYS_DATA;
  },

  getAuditLogs(filterType?: "all" | "reward" | "penalty", selectedDate?: string): ScoreLogItem[] {
    let logs = SCORE_AUDIT_LOGS;
    if (selectedDate) {
      logs = logs.filter((l) => l.date === selectedDate);
    }
    if (filterType === "reward") {
      return logs.filter((l) => l.type === "reward");
    }
    if (filterType === "penalty") {
      return logs.filter((l) => l.type === "penalty");
    }
    return logs;
  }
};
