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

export const SEVEN_DAYS_DATA: TrendPoint[] = [];

export const FOURTEEN_DAYS_DATA: TrendPoint[] = [];

export const THIRTY_DAYS_DATA: TrendPoint[] = [];

export const SCORE_AUDIT_LOGS: ScoreLogItem[] = [];

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
