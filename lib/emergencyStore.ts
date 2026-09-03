import { useEffect, useState } from "react";
import { api } from "./api";
import { checkpointMobileStore } from "./checkpointMobileStore";
import { userStore } from "./userStore";
import { notificationStore } from "./notificationStore";

export type EmergencyIncident = {
  id: string;
  type: string;
  detail: string;
  time: string;
  date: string;
  photos: string[];
  reporterName: string;
  reporterId: string;
  factoryId: string;
  factoryName?: string;
  latitude: number;
  longitude: number;
  status: "transmitted" | "received" | "resolved";
};

let latestIncident: EmergencyIncident | null = null;
let incidentsHistory: EmergencyIncident[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export const emergencyStore = {
  getLatestIncident(): EmergencyIncident | null {
    const currentFactoryId = checkpointMobileStore.getFactory().id;
    if (latestIncident && latestIncident.factoryId === currentFactoryId) return latestIncident;
    return incidentsHistory.find((inc) => inc.factoryId === currentFactoryId) || null;
  },

  getAllIncidents(): EmergencyIncident[] {
    const currentFactoryId = checkpointMobileStore.getFactory().id;
    return incidentsHistory.filter((inc) => inc.factoryId === currentFactoryId);
  },

  getIncidentById(id: string): EmergencyIncident | undefined {
    if (latestIncident && latestIncident.id === id) return latestIncident;
    return incidentsHistory.find((inc) => inc.id === id);
  },

  createIncident(data: {
    type: string;
    detail: string;
    photos: string[];
    reporterName?: string;
    reporterId?: string;
    factoryId?: string;
    latitude?: number;
    longitude?: number;
  }): EmergencyIncident {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")} น.`;
    const dateStr = `${now.getDate()} ส.ค. ${now.getFullYear() + 543}`;

    const currentFactory = checkpointMobileStore.getFactory();
    const currentProfile = userStore.getProfile();

    const newIncident: EmergencyIncident = {
      id: `EMG-${Date.now()}`,
      type: data.type || "เหตุฉุกเฉินทั่วไป",
      detail: data.detail || "ไม่ได้ระบุรายละเอียดเพิ่มเติม",
      time: timeStr,
      date: dateStr,
      photos: data.photos || [],
      reporterName: data.reporterName || currentProfile.name || "เจ้าหน้าที่ รปภ.",
      reporterId: data.reporterId || currentProfile.employeeId || "0",
      factoryId: data.factoryId || currentFactory.id,
      factoryName: currentFactory.name,
      latitude: data.latitude || currentFactory.latitude || 16.8156,
      longitude: data.longitude || currentFactory.longitude || 100.262,
      status: "transmitted"
    };

    latestIncident = newIncident;
    incidentsHistory.unshift(newIncident);
    notifyListeners();

    // Trigger high-priority in-app banner alert for guards in this factory
    notificationStore.addNotification(
      {
        id: `NOTIF-EMG-${Date.now()}`,
        title: `🚨 แจ้งเหตุฉุกเฉิน: ${newIncident.type}`,
        category: "emergency",
        priority: "urgent",
        summary: `แจ้งโดย: ${newIncident.reporterName} (${newIncident.factoryName})`,
        content: newIncident.detail || "เกิดเหตุฉุกเฉินในพื้นที่ กรุณาตรวจสอบทันที",
        timestamp: timeStr,
        date: dateStr,
        isRead: false,
        incidentData: {
          incidentType: newIncident.type,
          reporterName: newIncident.reporterName,
          reporterId: newIncident.reporterId,
          reporterPhone: currentProfile.phone || "081-000-0000",
          locationName: newIncident.factoryName || "พื้นที่โรงงาน",
          latitude: newIncident.latitude,
          longitude: newIncident.longitude,
          photos: newIncident.photos,
          status: "ongoing"
        }
      },
      true
    );

    // Send to Backend API (POST /incidents) with factoryId and real reporter info
    api.emergency
      .createIncident({
        type: newIncident.type,
        detail: newIncident.detail,
        photos: newIncident.photos,
        reporterName: newIncident.reporterName,
        reporterId: newIncident.reporterId,
        latitude: newIncident.latitude,
        longitude: newIncident.longitude
      })
      .catch(() => {});

    return newIncident;
  },

  updateIncident(id: string, updates: Partial<EmergencyIncident>) {
    const idx = incidentsHistory.findIndex((inc) => inc.id === id);
    if (idx !== -1) {
      incidentsHistory[idx] = { ...incidentsHistory[idx], ...updates };
      if (latestIncident?.id === id) {
        latestIncident = incidentsHistory[idx];
      }
      notifyListeners();

      // PUT to Backend API
      api.emergency.updateIncident(id, updates).catch(() => {});
    }
  },

  deleteIncident(id: string) {
    incidentsHistory = incidentsHistory.filter((inc) => inc.id !== id);
    if (latestIncident?.id === id) {
      latestIncident = incidentsHistory[0] || null;
    }
    notifyListeners();

    // DELETE from Backend API
    api.emergency.deleteIncident(id).catch(() => {});
  }
};

export function useEmergencyStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return emergencyStore;
}
