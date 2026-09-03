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

export const DEFAULT_CHECKPOINTS_ROUND_1: CheckpointItem[] = [];

export const PATROL_ROUNDS: PatrolRound[] = [];

export const CHECKPOINT = {
  id: "POINT-001",
  name: "จุดตรวจหลัก",
  latitude: 14.9033,
  longitude: 102.0562,
  radiusMeters: 100
};
