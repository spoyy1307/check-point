export type RoundStatus = "pending" | "active" | "complete" | "late";
export type CheckpointStatus = "pending" | "on_time" | "late";

export type CheckpointItem = {
  id: number;
  name: string;
  scheduledTime: string;
  currentTime: string;
  status: CheckpointStatus;
  photoUri?: string;
  photos: string[]; // Supports up to 50 photos
  reason?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
};

export type PatrolRound = {
  id: number;
  title: string;
  time: string;
  startTime: string;
  endTime: string;
  points: number;
  completed: number;
  status: RoundStatus;
  checkpoints: CheckpointItem[];
};

export const DEFAULT_CHECKPOINTS_ROUND_1: CheckpointItem[] = [
  {
    id: 1,
    name: "ประตูทางเข้าหลัก",
    scheduledTime: "20:00 น.",
    currentTime: "20:02 น.",
    status: "pending",
    photos: [],
    latitude: 16.8156,
    longitude: 100.2620,
    radiusMeters: 100
  },
  {
    id: 2,
    name: "อาคารสำนักงาน",
    scheduledTime: "20:15 น.",
    currentTime: "20:17 น.",
    status: "pending",
    photos: [],
    latitude: 16.8158,
    longitude: 100.2623,
    radiusMeters: 100
  },
  {
    id: 3,
    name: "โรงจอดรถ",
    scheduledTime: "20:30 น.",
    currentTime: "20:32 น.",
    status: "pending",
    photos: [],
    latitude: 16.8160,
    longitude: 100.2626,
    radiusMeters: 100
  },
  {
    id: 4,
    name: "ป้อมยามด้านหลัง",
    scheduledTime: "20:45 น.",
    currentTime: "20:47 น.",
    status: "pending",
    photos: [],
    latitude: 16.8163,
    longitude: 100.2629,
    radiusMeters: 100
  },
  {
    id: 5,
    name: "สวนหย่อมส่วนกลาง",
    scheduledTime: "21:00 น.",
    currentTime: "21:02 น.",
    status: "pending",
    photos: [],
    latitude: 16.8165,
    longitude: 100.2631,
    radiusMeters: 100
  },
  {
    id: 6,
    name: "ลานโหลดสินค้า",
    scheduledTime: "21:15 น.",
    currentTime: "21:18 น.",
    status: "pending",
    photos: [],
    latitude: 16.8167,
    longitude: 100.2634,
    radiusMeters: 100
  },
  {
    id: 7,
    name: "ทางหนีไฟทิศเหนือ",
    scheduledTime: "21:30 น.",
    currentTime: "21:33 น.",
    status: "pending",
    photos: [],
    latitude: 16.8170,
    longitude: 100.2637,
    radiusMeters: 100
  },
  {
    id: 8,
    name: "ถังเก็บน้ำ",
    scheduledTime: "22:00 น.",
    currentTime: "22:01 น.",
    status: "pending",
    photos: [],
    latitude: 16.8172,
    longitude: 100.2640,
    radiusMeters: 100
  }
];

export const PATROL_ROUNDS: PatrolRound[] = [
  {
    id: 1,
    title: "รอบที่ 1",
    time: "20:00 - 22:00 น.",
    startTime: "20:00 น.",
    endTime: "22:00 น.",
    points: 8,
    completed: 0,
    status: "active",
    checkpoints: DEFAULT_CHECKPOINTS_ROUND_1.map((p) => ({ ...p, status: "pending", photos: [] }))
  },
  {
    id: 2,
    title: "รอบที่ 2",
    time: "22:00 - 00:00 น.",
    startTime: "22:00 น.",
    endTime: "00:00 น.",
    points: 8,
    completed: 0,
    status: "pending",
    checkpoints: DEFAULT_CHECKPOINTS_ROUND_1.map((p) => ({ ...p, status: "pending", photos: [] }))
  },
  {
    id: 3,
    title: "รอบที่ 3",
    time: "00:00 - 02:00 น.",
    startTime: "00:00 น.",
    endTime: "02:00 น.",
    points: 8,
    completed: 0,
    status: "pending",
    checkpoints: DEFAULT_CHECKPOINTS_ROUND_1.map((p) => ({ ...p, status: "pending", photos: [] }))
  },
  {
    id: 4,
    title: "รอบที่ 4",
    time: "02:00 - 04:00 น.",
    startTime: "02:00 น.",
    endTime: "04:00 น.",
    points: 8,
    completed: 0,
    status: "pending",
    checkpoints: DEFAULT_CHECKPOINTS_ROUND_1.map((p) => ({ ...p, status: "pending", photos: [] }))
  }
];

export const CHECKPOINT = {
  id: "POINT-001",
  name: "ประตูทางเข้าหลัก",
  latitude: 16.8156,
  longitude: 100.2620,
  radiusMeters: 100
};
