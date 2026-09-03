import { useEffect, useState } from "react";
import { CheckpointItem, CheckpointStatus, PATROL_ROUNDS, PatrolRound } from "../types/patrol";
import { api, apiClient } from "./api";

// In-memory state for active session
let roundsData: PatrolRound[] = JSON.parse(JSON.stringify(PATROL_ROUNDS));

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export const patrolStore = {
  getRounds(): PatrolRound[] {
    return roundsData;
  },

  getRound(roundId: number): PatrolRound | undefined {
    return roundsData.find((r) => r.id === roundId);
  },

  async fetchCheckpointsForFactory(factoryId?: string): Promise<PatrolRound[]> {
    try {
      const res = await apiClient.get<any>("/checkpoints");
      const rawList = Array.isArray(res?.data)
        ? res.data
        : (Array.isArray(res) ? res : (Array.isArray(res?.data?.data) ? res.data.data : []));

      if (rawList && rawList.length > 0) {
        const points: CheckpointItem[] = rawList.map((cp: any, idx: number) => ({
          id: Number(cp.id) || idx + 1,
          name: cp.name || `จุดตรวจที่ ${idx + 1}`,
          scheduledTime: cp.target_time_desc || cp.targetTimeDesc || "ตามรอบเวลา",
          currentTime: "ตรงเวลา",
          status: "pending",
          photos: [],
          latitude: Number(cp.latitude) || 14.9033,
          longitude: Number(cp.longitude) || 102.0562,
          radiusMeters: Number(cp.radius_meters || cp.radiusMeters) || 50
        }));

        const singleRound: PatrolRound = {
          id: 1,
          title: "รอบที่ 1 (ประจำกะปฏิบัติการ)",
          time: "08:00 - 20:00 น.",
          startTime: "08:00",
          endTime: "20:00",
          points: points.length,
          completed: 0,
          status: "pending",
          checkpoints: points
        };

        roundsData = [singleRound];
        notifyListeners();
        return roundsData;
      }
    } catch (e) {
      console.log("Could not fetch real checkpoints from backend:", e);
    }
    return roundsData;
  },

  completeCheckpoint(
    roundId: number,
    pointId: number,
    status: CheckpointStatus,
    photos?: string[] | string,
    reason?: string
  ): { round: PatrolRound; isRoundCompleted: boolean; nextPointIndex: number } | null {
    const round = roundsData.find((r) => r.id === roundId);
    if (!round) return null;

    const pointIndex = round.checkpoints.findIndex((p) => p.id === pointId);
    if (pointIndex === -1) return null;

    let photoArray: string[] = [];
    if (Array.isArray(photos)) {
      photoArray = photos;
    } else if (typeof photos === "string") {
      photoArray = [photos];
    } else if (round.checkpoints[pointIndex].photos?.length) {
      photoArray = round.checkpoints[pointIndex].photos;
    }

    round.checkpoints[pointIndex] = {
      ...round.checkpoints[pointIndex],
      status,
      photos: photoArray,
      photoUri: photoArray[0] || round.checkpoints[pointIndex].photoUri,
      reason: reason || round.checkpoints[pointIndex].reason
    };

    const completedCount = round.checkpoints.filter((p) => p.status !== "pending").length;
    round.completed = completedCount;

    const isRoundCompleted = completedCount === round.checkpoints.length;
    if (isRoundCompleted) {
      const hasLate = round.checkpoints.some((p) => p.status === "late");
      round.status = hasLate ? "late" : "complete";
    } else {
      round.status = "active";
    }

    // Find next pending checkpoint
    const nextPendingIndex = round.checkpoints.findIndex((p) => p.status === "pending");
    const nextPointIndex = nextPendingIndex !== -1 ? nextPendingIndex : round.checkpoints.length - 1;

    notifyListeners();

    // Call Backend API to record completion
    api.patrol
      .completeCheckpoint(roundId, pointId, {
        status: status === "late" ? "late" : "on_time",
        photos: photoArray,
        latitude: round.checkpoints[pointIndex].latitude,
        longitude: round.checkpoints[pointIndex].longitude,
        timestamp: new Date().toISOString()
      })
      .catch(() => {});

    return { round, isRoundCompleted, nextPointIndex };
  },

  getRoundSummary(roundId: number) {
    const round = roundsData.find((r) => r.id === roundId) || roundsData[0];
    const totalPoints = round.checkpoints.length;
    const onTimeCount = round.checkpoints.filter((p) => p.status === "on_time").length;
    const lateCount = round.checkpoints.filter((p) => p.status === "late").length;
    const pendingCount = round.checkpoints.filter((p) => p.status === "pending").length;
    const isAllDone = pendingCount === 0;

    const totalPhotosCount = round.checkpoints.reduce(
      (acc, p) => acc + (p.photos?.length || (p.photoUri ? 1 : 0)),
      0
    );

    return {
      roundId: round.id,
      roundTitle: round.title,
      roundTime: round.time,
      totalPoints,
      completedPoints: onTimeCount + lateCount,
      onTimeCount,
      lateCount,
      pendingCount,
      isAllDone,
      startTime: round.startTime,
      endTime: round.endTime,
      durationText: "2 ชม. 1 น.",
      totalPhotosCount,
      checkpoints: round.checkpoints
    };
  },

  getOverallStats() {
    const rounds = roundsData;
    const totalPoints = rounds.reduce(
      (acc, r) => acc + (r.checkpoints?.length || r.points || 0),
      0
    );

    let onTimeCount = 0;
    let lateCount = 0;
    let pendingCount = 0;

    rounds.forEach((round) => {
      round.checkpoints.forEach((cp) => {
        if (cp.status === "on_time") onTimeCount++;
        else if (cp.status === "late") lateCount++;
        else pendingCount++;
      });
    });

    const completedPoints = onTimeCount + lateCount;
    // Real-time score starting from 100 base score
    const calculatedScore = Math.max(0, 100 - (lateCount * 5));
    const score = completedPoints > 0 ? calculatedScore : 100;

    let scoreGrade = "ยอดเยี่ยม (A+)";
    if (score >= 95) scoreGrade = "ยอดเยี่ยม (A+)";
    else if (score >= 85) scoreGrade = "ดีมาก (A)";
    else if (score >= 75) scoreGrade = "ผ่านเกณฑ์ (B)";
    else scoreGrade = "ต้องปรับปรุง (C)";

    return {
      totalPoints,
      completedPoints,
      onTimeCount,
      lateCount,
      missCount: 0,
      score,
      scoreGrade
    };
  },

  resetRound(roundId: number) {
    const round = roundsData.find((r) => r.id === roundId);
    if (!round) return;

    round.checkpoints = round.checkpoints.map((p) => ({
      ...p,
      status: "pending",
      photos: [],
      photoUri: undefined,
      reason: undefined
    }));
    round.completed = 0;
    round.status = "active";

    notifyListeners();
  }
};

export function usePatrolStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return patrolStore;
}
