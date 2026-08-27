import { useEffect, useState } from "react";
import { api } from "./api";

export type EmergencyIncident = {
  id: string;
  type: string;
  detail: string;
  time: string;
  date: string;
  photos: string[];
  reporterName: string;
  reporterId: string;
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
    return latestIncident;
  },

  getAllIncidents(): EmergencyIncident[] {
    return incidentsHistory;
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
    latitude?: number;
    longitude?: number;
  }): EmergencyIncident {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")} น.`;
    const dateStr = `${now.getDate()} พ.ค. ${now.getFullYear() + 543}`;

    const newIncident: EmergencyIncident = {
      id: `EMG-${Date.now()}`,
      type: data.type || "เหตุฉุกเฉินทั่วไป",
      detail: data.detail || "ไม่ได้ระบุรายละเอียดเพิ่มเติม",
      time: timeStr,
      date: dateStr,
      photos: data.photos || [],
      reporterName: data.reporterName || "พงษ์พล อุทกานต์ภัทรกุล",
      reporterId: data.reporterId || "00123",
      latitude: data.latitude || 16.8156,
      longitude: data.longitude || 100.262,
      status: "transmitted"
    };

    latestIncident = newIncident;
    incidentsHistory.unshift(newIncident);
    notifyListeners();

    // Send to Backend API (POST /incidents)
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
