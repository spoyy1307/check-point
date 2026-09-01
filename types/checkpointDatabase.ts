/**
 * TypeScript Data Models matching Database Tables (cp_* tables)
 */

export interface CpFactoryTable {
  id: string;
  code: string;
  name: string;
  address?: string;
  province?: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  admin_pin: string;
  soc_hotline?: string;
  supervisor_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CpGuardAccountTable {
  id: string;
  employee_id: string;
  factory_id: string;
  full_name: string;
  phone?: string;
  role: string;
  assigned_zone?: string;
  avatar_url?: string;
  avatar_emoji?: string;
  pin_code: string;
  start_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CpShiftLogTable {
  id: string;
  factory_id: string;
  guard_id: string;
  shift_name: string;
  shift_date: string;
  check_in_time?: string;
  check_in_latitude?: number;
  check_in_longitude?: number;
  check_in_device_id?: string;
  check_out_time?: string;
  check_out_latitude?: number;
  check_out_longitude?: number;
  total_working_minutes: number;
  status: "pending" | "on_duty" | "completed" | "late";
  created_at: string;
  updated_at: string;
}

export interface CpCheckpointTable {
  id: string;
  factory_id: string;
  point_number: number;
  name: string;
  description?: string;
  target_time_desc?: string;
  latitude: number;
  longitude: number;
  allowed_radius_meters: number;
  nfc_tag_uid?: string;
  qr_code_data?: string;
  sequence_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CpPatrolScheduleTable {
  id: string;
  factory_id: string;
  round_number: number;
  round_name: string;
  start_time: string; // "20:00:00"
  end_time: string; // "22:00:00"
  points_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CpRoundExecutionTable {
  id: string;
  shift_log_id?: string;
  schedule_id?: string;
  factory_id: string;
  guard_id: string;
  round_number: number;
  status: "pending" | "in_progress" | "completed" | "late" | "missed";
  started_at?: string;
  finished_at?: string;
  completed_points: number;
  total_points: number;
  on_time_points: number;
  late_points: number;
  missed_points: number;
  round_score: number;
  created_at: string;
  updated_at: string;
}

export interface CpCheckpointScanTable {
  id: string;
  round_execution_id: string;
  checkpoint_id: string;
  guard_id: string;
  factory_id: string;
  scanned_at: string;
  scan_status: "on_time" | "late" | "skipped";
  latitude?: number;
  longitude?: number;
  accuracy_meters?: number;
  distance_meters?: number;
  nfc_verified: boolean;
  qr_verified: boolean;
  photos: string[];
  late_reason?: string;
  remarks?: string;
  created_at: string;
}

export interface CpEmergencyIncidentTable {
  id: string;
  factory_id: string;
  reporter_guard_id: string;
  incident_type: string;
  severity_level: "low" | "medium" | "high" | "critical";
  location_name: string;
  latitude?: number;
  longitude?: number;
  details?: string;
  photos: string[];
  audio_record_url?: string;
  status: "reported" | "ack_by_soc" | "investigating" | "resolved";
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CpNotificationTable {
  id: string;
  factory_id?: string;
  title: string;
  category: "patrol" | "emergency" | "announcement";
  priority: "normal" | "urgent" | "critical";
  summary?: string;
  content?: string;
  banner_image_url?: string;
  published_by?: string;
  valid_until?: string;
  target_guard_id?: string;
  is_read: boolean;
  acknowledged_at?: string;
  created_at: string;
}

export interface CpAppSettingTable {
  id: string;
  factory_id: string;
  device_id: string;
  sound_enabled: boolean;
  sound_volume: number;
  selected_sound_id: string;
  selected_sound_name: string;
  reminder_minutes: number;
  vibration_enabled: boolean;
  watermark_enabled: boolean;
  auto_flash_night: boolean;
  created_at: string;
  updated_at: string;
}
