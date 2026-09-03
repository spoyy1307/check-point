/**
 * Smart Visitor - Checkpoint Patrol API Client
 * Manages HTTP communication with Backend REST API
 */

export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.smartvisitor-security.com/api/v1",
  apiKey: process.env.EXPO_PUBLIC_API_KEY || "smart_visitor_patrol_key_2026",
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || "15000", 10),
  branchId: process.env.EXPO_PUBLIC_BRANCH_ID || "BR-001"
};

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
};

let authToken: string | null = null;

export const apiClient = {
  setToken(token: string | null) {
    authToken = token;
  },

  getToken(): string | null {
    return authToken;
  },

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const rawBase = (API_CONFIG.baseUrl || "http://localhost:3001").replace(/\/$/, "");
    const cleanEndpoint = endpoint.replace(/^\//, "");
    
    let url: string;
    if (rawBase.endsWith("/api") || rawBase.includes("/api/")) {
      url = `${rawBase}/${cleanEndpoint}`;
    } else {
      url = `${rawBase}/api/${cleanEndpoint}`;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-KEY": API_CONFIG.apiKey,
      "X-BRANCH-ID": API_CONFIG.branchId,
      ...(options.headers as Record<string, string>)
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timer);

      let data: any = null;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          success: false,
          statusCode: response.status,
          message: data?.message || `API Error (${response.status})`,
          data
        };
      }

      return {
        success: true,
        statusCode: response.status,
        data: data?.data !== undefined ? data.data : data,
        message: data?.message || "Success"
      };
    } catch (err: any) {
      clearTimeout(timer);
      const isAbort = err.name === "AbortError";
      return {
        success: false,
        statusCode: isAbort ? 408 : 503,
        message: isAbort
          ? "การเชื่อมต่อ API หมดเวลา (Timeout)"
          : `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (${err.message || "Network Error"})`
      };
    }
  },

  get<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "GET", headers });
  },

  post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers
    });
  },

  put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers
    });
  },

  delete<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }
};

/**
 * High-Level Structured API Services (CRUD for all entities)
 */
export const api = {
  // 1. Auth & Guard Profile
  auth: {
    async login(employeeId: string, password?: string) {
      return apiClient.post("/auth/login", { employeeId, password });
    },
    async getProfile() {
      return apiClient.get("/auth/profile");
    },
    async updateProfile(profileData: any) {
      return apiClient.put("/auth/profile", profileData);
    },
    async switchGuard(employeeId: string) {
      return apiClient.post("/auth/switch-guard", { employeeId });
    },
    async getBranchGuards() {
      return apiClient.get(`/guards?branchId=${API_CONFIG.branchId}`);
    }
  },

  // 2. Checkpoint Patrol & Rounds
  patrol: {
    async getRounds() {
      return apiClient.get(`/patrol/rounds?branchId=${API_CONFIG.branchId}`);
    },
    async getRoundById(roundId: number) {
      return apiClient.get(`/patrol/rounds/${roundId}`);
    },
    async completeCheckpoint(
      roundId: number,
      pointId: number,
      data: {
        status: "on_time" | "late";
        photos: string[];
        latitude?: number;
        longitude?: number;
        timestamp?: string;
      }
    ) {
      return apiClient.post(
        `/patrol/rounds/${roundId}/checkpoints/${pointId}/complete`,
        data
      );
    },
    async markLate(
      roundId: number,
      pointId: number,
      data: {
        reason: string;
        photoUri?: string;
        latitude?: number;
        longitude?: number;
      }
    ) {
      return apiClient.post(
        `/patrol/rounds/${roundId}/checkpoints/${pointId}/late`,
        data
      );
    },
    async getRoundSummary(roundId: number) {
      return apiClient.get(`/patrol/rounds/${roundId}/summary`);
    }
  },

  // 3. Emergency Incidents
  emergency: {
    async getIncidents() {
      return apiClient.get(`/incidents?branchId=${API_CONFIG.branchId}`);
    },
    async getIncidentById(id: string) {
      return apiClient.get(`/incidents/${id}`);
    },
    async createIncident(data: {
      type: string;
      detail: string;
      photos: string[];
      reporterName: string;
      reporterId: string;
      latitude: number;
      longitude: number;
    }) {
      return apiClient.post("/incidents", data);
    },
    async updateIncident(id: string, updates: any) {
      return apiClient.put(`/incidents/${id}`, updates);
    },
    async deleteIncident(id: string) {
      return apiClient.delete(`/incidents/${id}`);
    }
  },

  // 4. System Settings
  settings: {
    async getSettings() {
      return apiClient.get("/settings");
    },
    async updateSettings(settings: any) {
      return apiClient.put("/settings", settings);
    }
  }
};
