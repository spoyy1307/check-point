-- ==============================================================================
-- CHECK POINT PATROL & SECURITY MANAGEMENT - DRIZZLE MIGRATION 0014
-- Migration: 0014_create_checkpoint_patrol_tables.sql
-- Compatible with PostgreSQL & Drizzle ORM Auto-Deploy Runner
-- ==============================================================================

-- 1. FACTORIES (cp_factories)
CREATE TABLE IF NOT EXISTS "cp_factories" (
    "id" VARCHAR(50) PRIMARY KEY,
    "code" VARCHAR(30) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "province" VARCHAR(100),
    "latitude" NUMERIC(10, 8) NOT NULL DEFAULT 14.9033,
    "longitude" NUMERIC(11, 8) NOT NULL DEFAULT 102.0562,
    "radius_meters" INTEGER NOT NULL DEFAULT 200,
    "admin_pin" VARCHAR(255) NOT NULL DEFAULT '123456',
    "soc_hotline" VARCHAR(50) DEFAULT '02-999-8888',
    "supervisor_phone" VARCHAR(50) DEFAULT '089-999-8877',
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. GUARD ACCOUNTS (cp_guard_accounts)
CREATE TABLE IF NOT EXISTS "cp_guard_accounts" (
    "id" VARCHAR(50) PRIMARY KEY,
    "employee_id" VARCHAR(50) NOT NULL UNIQUE,
    "factory_id" VARCHAR(50) NOT NULL REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "role" VARCHAR(100) NOT NULL DEFAULT 'รปภ. ประจำกะดึก',
    "assigned_zone" VARCHAR(150) DEFAULT 'ทุกโซนพื้นที่ส่วนกลาง',
    "avatar_url" TEXT,
    "avatar_emoji" VARCHAR(10) DEFAULT '👮',
    "pin_code" VARCHAR(255) NOT NULL DEFAULT '123456',
    "start_date" DATE DEFAULT CURRENT_DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. SHIFT LOGS (cp_shift_logs)
CREATE TABLE IF NOT EXISTS "cp_shift_logs" (
    "id" VARCHAR(50) PRIMARY KEY,
    "factory_id" VARCHAR(50) NOT NULL REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "guard_id" VARCHAR(50) NOT NULL REFERENCES "cp_guard_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "shift_name" VARCHAR(100) NOT NULL,
    "shift_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "check_in_time" TIMESTAMP WITH TIME ZONE,
    "check_in_latitude" NUMERIC(10, 8),
    "check_in_longitude" NUMERIC(11, 8),
    "check_in_device_id" VARCHAR(100),
    "check_out_time" TIMESTAMP WITH TIME ZONE,
    "check_out_latitude" NUMERIC(10, 8),
    "check_out_longitude" NUMERIC(11, 8),
    "total_working_minutes" INTEGER DEFAULT 0,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. CHECKPOINT MASTER (cp_checkpoints)
CREATE TABLE IF NOT EXISTS "cp_checkpoints" (
    "id" VARCHAR(50) PRIMARY KEY,
    "factory_id" VARCHAR(50) NOT NULL REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "point_number" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "target_time_desc" VARCHAR(50),
    "latitude" NUMERIC(10, 8) NOT NULL,
    "longitude" NUMERIC(11, 8) NOT NULL,
    "allowed_radius_meters" INTEGER NOT NULL DEFAULT 50,
    "nfc_tag_uid" VARCHAR(100),
    "qr_code_data" VARCHAR(255),
    "sequence_order" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. PATROL ROUND SCHEDULES (cp_patrol_schedules)
CREATE TABLE IF NOT EXISTS "cp_patrol_schedules" (
    "id" VARCHAR(50) PRIMARY KEY,
    "factory_id" VARCHAR(50) NOT NULL REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "round_number" INTEGER NOT NULL,
    "round_name" VARCHAR(100) NOT NULL,
    "start_time" VARCHAR(20) NOT NULL,
    "end_time" VARCHAR(20) NOT NULL,
    "points_count" INTEGER NOT NULL DEFAULT 8,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. ROUND EXECUTIONS (cp_round_executions)
CREATE TABLE IF NOT EXISTS "cp_round_executions" (
    "id" VARCHAR(50) PRIMARY KEY,
    "shift_log_id" VARCHAR(50) REFERENCES "cp_shift_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "schedule_id" VARCHAR(50) REFERENCES "cp_patrol_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "factory_id" VARCHAR(50) NOT NULL REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "guard_id" VARCHAR(50) NOT NULL REFERENCES "cp_guard_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "round_number" INTEGER NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP WITH TIME ZONE,
    "finished_at" TIMESTAMP WITH TIME ZONE,
    "completed_points" INTEGER NOT NULL DEFAULT 0,
    "total_points" INTEGER NOT NULL DEFAULT 8,
    "on_time_points" INTEGER NOT NULL DEFAULT 0,
    "late_points" INTEGER NOT NULL DEFAULT 0,
    "missed_points" INTEGER NOT NULL DEFAULT 0,
    "round_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. CHECKPOINT SCANS (cp_checkpoint_scans)
CREATE TABLE IF NOT EXISTS "cp_checkpoint_scans" (
    "id" VARCHAR(50) PRIMARY KEY,
    "round_execution_id" VARCHAR(50) NOT NULL REFERENCES "cp_round_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "checkpoint_id" VARCHAR(50) NOT NULL REFERENCES "cp_checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "guard_id" VARCHAR(50) NOT NULL REFERENCES "cp_guard_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "scanned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scan_status" VARCHAR(30) NOT NULL DEFAULT 'on_time',
    "latitude" NUMERIC(10, 8),
    "longitude" NUMERIC(11, 8),
    "accuracy_meters" NUMERIC(6, 2),
    "distance_meters" NUMERIC(8, 2),
    "nfc_verified" BOOLEAN NOT NULL DEFAULT FALSE,
    "qr_verified" BOOLEAN NOT NULL DEFAULT FALSE,
    "photos" JSONB DEFAULT '[]',
    "late_reason" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. EMERGENCY INCIDENTS (cp_emergency_incidents)
CREATE TABLE IF NOT EXISTS "cp_emergency_incidents" (
    "id" VARCHAR(50) PRIMARY KEY,
    "factory_id" VARCHAR(50) NOT NULL REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "reporter_guard_id" VARCHAR(50) NOT NULL REFERENCES "cp_guard_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "incident_type" VARCHAR(100) NOT NULL,
    "severity_level" VARCHAR(30) NOT NULL DEFAULT 'high',
    "location_name" VARCHAR(255),
    "latitude" NUMERIC(10, 8),
    "longitude" NUMERIC(11, 8),
    "details" TEXT,
    "photos" JSONB DEFAULT '[]',
    "audio_record_url" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "resolved_at" TIMESTAMP WITH TIME ZONE,
    "resolved_by" VARCHAR(255),
    "resolution_note" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. NOTIFICATIONS (cp_notifications)
CREATE TABLE IF NOT EXISTS "cp_notifications" (
    "id" VARCHAR(50) PRIMARY KEY,
    "factory_id" VARCHAR(50) NOT NULL REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL DEFAULT 'announcement',
    "priority" VARCHAR(30) NOT NULL DEFAULT 'normal',
    "target_audience" VARCHAR(50) NOT NULL DEFAULT 'all_guards',
    "is_broadcast" BOOLEAN NOT NULL DEFAULT TRUE,
    "scheduled_time" TIMESTAMP WITH TIME ZONE,
    "read_by_guards" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. APP SETTINGS (cp_app_settings)
CREATE TABLE IF NOT EXISTS "cp_app_settings" (
    "id" VARCHAR(50) PRIMARY KEY,
    "factory_id" VARCHAR(50) NOT NULL REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "guard_id" VARCHAR(50) REFERENCES "cp_guard_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "sound_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "sound_volume" NUMERIC(3, 2) NOT NULL DEFAULT 1.00,
    "selected_sound_id" VARCHAR(50) NOT NULL DEFAULT 'beep',
    "selected_sound_name" VARCHAR(150) NOT NULL DEFAULT 'เสียงบี๊บมาตรฐาน (Loud Beep)',
    "reminder_minutes" INTEGER NOT NULL DEFAULT 5,
    "watermark_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "auto_flash_night" BOOLEAN NOT NULL DEFAULT TRUE,
    "custom_sounds" JSONB DEFAULT '[]',
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_cp_app_settings_factory_guard" UNIQUE ("factory_id", "guard_id")
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS "idx_cp_guard_accounts_factory" ON "cp_guard_accounts"("factory_id");
CREATE INDEX IF NOT EXISTS "idx_cp_shift_logs_factory_date" ON "cp_shift_logs"("factory_id", "shift_date");
CREATE INDEX IF NOT EXISTS "idx_cp_shift_logs_guard" ON "cp_shift_logs"("guard_id");
CREATE INDEX IF NOT EXISTS "idx_cp_checkpoints_factory" ON "cp_checkpoints"("factory_id");
CREATE INDEX IF NOT EXISTS "idx_cp_patrol_schedules_factory" ON "cp_patrol_schedules"("factory_id");
CREATE INDEX IF NOT EXISTS "idx_cp_round_executions_factory_round" ON "cp_round_executions"("factory_id", "round_number");
CREATE INDEX IF NOT EXISTS "idx_cp_round_executions_guard" ON "cp_round_executions"("guard_id");
CREATE INDEX IF NOT EXISTS "idx_cp_checkpoint_scans_round" ON "cp_checkpoint_scans"("round_execution_id");
CREATE INDEX IF NOT EXISTS "idx_cp_checkpoint_scans_checkpoint" ON "cp_checkpoint_scans"("checkpoint_id");
CREATE INDEX IF NOT EXISTS "idx_cp_emergency_incidents_factory_status" ON "cp_emergency_incidents"("factory_id", "status");
CREATE INDEX IF NOT EXISTS "idx_cp_notifications_factory" ON "cp_notifications"("factory_id");
