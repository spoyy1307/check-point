export type NotificationCategory = "all" | "emergency" | "announcement" | "patrol";

export type NotificationPriority = "urgent" | "normal" | "info";

export type NotificationItem = {
  id: string;
  title: string;
  category: "emergency" | "announcement" | "patrol";
  priority: NotificationPriority;
  summary: string;
  content?: string;
  timestamp: string;
  date: string;
  isRead: boolean;

  // For Emergency Peer Alerts
  incidentData?: {
    incidentType: string;
    reporterName: string;
    reporterId: string;
    reporterPhone: string;
    locationName: string;
    latitude: number;
    longitude: number;
    photos: string[];
    distanceMeters?: number;
    status: "ongoing" | "resolved";
  };

  // For Admin Announcements
  announcementData?: {
    publisherName: string;
    publisherRole: string;
    importance: "high" | "normal";
    bannerImage?: string;
    acknowledgedByGuard: boolean;
    validUntil?: string;
  };

  // For Patrol Reminders
  patrolData?: {
    roundId: number;
    roundName: string;
    scheduledTime: string;
    totalPoints: number;
  };
};
