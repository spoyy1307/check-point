import { checkpointMobileStore } from "./checkpointMobileStore";
import { notificationStore } from "./notificationStore";
import { patrolStore } from "./patrolStore";

let intervalId: NodeJS.Timeout | null = null;
const notifiedRounds = new Set<string>();

/**
 * Extract reminder minutes integer from settings string
 * e.g. "เตือนล่วงหน้า 5 นาที (แนะนำ)" -> 5
 *      "เตือนตรงเวลาพอดี" -> 0
 */
export function getReminderMinutesFromSetting(settingStr?: string): number {
  if (!settingStr) return 5;
  if (settingStr.includes("15 นาที")) return 15;
  if (settingStr.includes("10 นาที")) return 10;
  if (settingStr.includes("5 นาที")) return 5;
  if (settingStr.includes("ตรงเวลา")) return 0;
  return 5;
}

export const patrolReminderEngine = {
  start() {
    if (intervalId) return;

    // Check every 20 seconds
    intervalId = setInterval(() => {
      this.checkAndTriggerUpcomingReminders();
    }, 20000);
  },

  stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  },

  checkAndTriggerUpcomingReminders() {
    const settings = checkpointMobileStore.getSettings();
    const reminderMinutes = getReminderMinutesFromSetting(settings.reminderTime);
    const rounds = patrolStore.getRounds();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMin;

    for (const round of rounds) {
      // Parse round start time e.g. "20:00 - 22:00" -> 20:00
      const startPart = round.time.split("-")[0]?.trim();
      if (!startPart) continue;

      const [hStr, mStr] = startPart.split(":");
      const startHour = parseInt(hStr, 10);
      const startMin = parseInt(mStr || "0", 10);
      if (isNaN(startHour)) continue;

      const roundStartTotalMinutes = startHour * 60 + startMin;
      const diffMinutes = roundStartTotalMinutes - currentTotalMinutes;

      // Check if diff is within reminder window (e.g. within 0 to reminderMinutes)
      if (diffMinutes >= 0 && diffMinutes <= reminderMinutes) {
        const todayKey = `${now.toISOString().split("T")[0]}_round_${round.id}_${diffMinutes}`;
        if (!notifiedRounds.has(todayKey)) {
          notifiedRounds.add(todayKey);
          notificationStore.triggerTestPatrolReminder(round.id, diffMinutes);
          break;
        }
      }
    }
  },

  triggerInstantTest(type: "patrol" | "announcement" = "patrol", roundNum: number = 2) {
    const settings = checkpointMobileStore.getSettings();
    const reminderMinutes = getReminderMinutesFromSetting(settings.reminderTime);

    if (type === "patrol") {
      return notificationStore.triggerTestPatrolReminder(roundNum, reminderMinutes);
    } else {
      return notificationStore.triggerTestAnnouncement();
    }
  }
};
