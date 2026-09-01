import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { NotificationItem } from "../types/notification";

// Configure how notifications appear when the app is foregrounded or backgrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.MAX
  })
});

export const systemNotificationHelper = {
  async init() {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("checkpoint-patrol-channel", {
          name: "การแจ้งเตือนรอบตรวจและเหตุด่วน Check Point",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#0C4A94",
          sound: "default",
          enableVibrate: true,
          enableLights: true,
          showBadge: true
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === "granted";
    } catch (err) {
      console.log("Error initializing system notifications:", err);
      return false;
    }
  },

  /**
   * Immediately fire an OS-level System Notification
   * Pops up on Phone Status Bar, Lock Screen & Notification Center outside app!
   */
  async presentSystemNotification(item: NotificationItem) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: item.title,
          body: item.summary || item.content,
          data: { id: item.id, category: item.category, patrolData: item.patrolData },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          badge: 1
        },
        trigger: null // null means send immediately
      });
    } catch (err) {
      console.log("Error sending system notification:", err);
    }
  },

  /**
   * Schedule a future OS-level System Notification for upcoming patrol round
   * Will wake phone and alert on lock screen at exact time even if app is closed!
   */
  async scheduleRoundSystemNotification(
    roundNum: number,
    targetDate: Date,
    reminderMinutes: number
  ) {
    try {
      const id = `patrol_round_${roundNum}_system_alert`;
      // Cancel previous schedule for this round if any
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

      const minutesText = reminderMinutes === 0 ? "ถึงเวลาตรวจแล้ว" : `จะเริ่มในอีก ${reminderMinutes} นาที`;

      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: `⏰ แจ้งเตือนรอบตรวจ: ใกล้ถึงเวลาตรวจรอบที่ ${roundNum}`,
          body: `รอบตรวจที่ ${roundNum} ${minutesText} กรุณาเริ่มลงเวลาและตรวจจุดตามกำหนด`,
          data: { roundId: roundNum, type: "patrol" },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: targetDate
        }
      });
    } catch (err) {
      console.log("Error scheduling round system notification:", err);
    }
  }
};
