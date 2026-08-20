export type RoundStatus = "pending" | "active" | "complete" | "late";

export type PatrolRound = {
  id: number;
  title: string;
  time: string;
  points: number;
  completed: number;
  status: RoundStatus;
};

export const PATROL_ROUNDS: PatrolRound[] = [
  { id: 1, title: "รอบที่ 1", time: "20:00 - 22:00 น.", points: 8, completed: 0, status: "active" },
  { id: 2, title: "รอบที่ 2", time: "22:00 - 00:00 น.", points: 8, completed: 7, status: "late" },
  { id: 3, title: "รอบที่ 3", time: "00:00 - 02:00 น.", points: 8, completed: 8, status: "complete" },
  { id: 4, title: "รอบที่ 4", time: "02:00 - 04:00 น.", points: 8, completed: 5, status: "late" }
];

export const CHECKPOINT = {
  id: "POINT-001",
  name: "ประตูทางเข้าหลัก",
  latitude: 16.8156,
  longitude: 100.2620,
  radiusMeters: 100
};
