-- ==============================================================================
-- CHECK POINT PATROL & SECURITY MANAGEMENT - INITIAL MIGRATION
-- Migration Name: 20260902000000_create_checkpoint_patrol_tables
-- Target: PostgreSQL / MySQL Auto-Deploy Pipeline
-- ==============================================================================

-- 1. FACTORIES / BRANCHES
CREATE TABLE IF NOT EXISTS "cp_factories" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "code" VARCHAR(30) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "province" VARCHAR(100),
    "latitude" DECIMAL(10,8) NOT NULL DEFAULT 14.9033,
    "longitude" DECIMAL(11,8) NOT NULL DEFAULT 102.0562,
    "radius_meters" INTEGER NOT NULL DEFAULT 200,
    "admin_pin" VARCHAR(255) NOT NULL DEFAULT '123456',
    "soc_hotline" VARCHAR(50) DEFAULT '02-999-8888',
    "supervisor_phone" VARCHAR(50) DEFAULT '089-999-8877',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. GUARD ACCOUNTS
CREATE TABLE IF NOT EXISTS "cp_guard_accounts" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "employee_id" VARCHAR(50) NOT NULL UNIQUE,
    "factory_id" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "role" VARCHAR(100) NOT NULL DEFAULT 'รปภ. ประจำกะดึก',
    "assigned_zone" VARCHAR(150) DEFAULT 'ทุกโซนพื้นที่ส่วนกลาง',
    "avatar_url" TEXT,
    "avatar_emoji" VARCHAR(10) DEFAULT '👮',
    "pin_code" VARCHAR(255) NOT NULL DEFAULT '123456',
    "start_date" DATE DEFAULT CURRENT_DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_cp_guard_accounts_factory" FOREIGN KEY ("factory_id") REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. SHIFT LOGS
CREATE TABLE IF NOT EXISTS "cp_shift_logs" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "factory_id" VARCHAR(50) NOT NULL,
    "guard_id" VARCHAR(50) NOT NULL,
    "shift_name" VARCHAR(100) NOT NULL,
    "shift_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "check_in_time" TIMESTAMPTZ(6),
    "check_in_latitude" DECIMAL(10,8),
    "check_in_longitude" DECIMAL(11,8),
    "check_in_device_id" VARCHAR(100),
    "check_out_time" TIMESTAMPTZ(6),
    "check_out_latitude" DECIMAL(10,8),
    "check_out_longitude" DECIMAL(11,8),
    "total_working_minutes" INTEGER DEFAULT 0,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_cp_shift_logs_factory" FOREIGN KEY ("factory_id") REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_cp_shift_logs_guard" FOREIGN KEY ("guard_id") REFERENCES "cp_guard_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. CHECKPOINT MASTER
CREATE TABLE IF NOT EXISTS "cp_checkpoints" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "factory_id" VARCHAR(50) NOT NULL,
    "point_number" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "target_time_desc" VARCHAR(50),
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "allowed_radius_meters" INTEGER NOT NULL DEFAULT 50,
    "nfc_tag_uid" VARCHAR(100),
    "qr_code_data" VARCHAR(255),
    "sequence_order" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_cp_checkpoints_factory" FOREIGN KEY ("factory_id") REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. PATROL ROUND SCHEDULES
CREATE TABLE IF NOT EXISTS "cp_patrol_schedules" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "factory_id" VARCHAR(50) NOT NULL,
    "round_number" INTEGER NOT NULL,
    "round_name" VARCHAR(100) NOT NULL,
    "start_time" VARCHAR(20) NOT NULL,
    "end_time" VARCHAR(20) NOT NULL,
    "points_count" INTEGER NOT NULL DEFAULT 8,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_cp_patrol_schedules_factory" FOREIGN KEY ("factory_id") REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. ROUND EXECUTIONS
CREATE TABLE IF NOT EXISTS "cp_round_executions" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "shift_log_id" VARCHAR(50),
    "schedule_id" VARCHAR(50),
    "factory_id" VARCHAR(50) NOT NULL,
    "guard_id" VARCHAR(50) NOT NULL,
    "round_number" INTEGER NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMPTZ(6),
    "finished_at" TIMESTAMPTZ(6),
    "completed_points" INTEGER NOT NULL DEFAULT 0,
    "total_points" INTEGER NOT NULL DEFAULT 8,
    "on_time_points" INTEGER NOT NULL DEFAULT 0,
    "late_points" INTEGER NOT NULL DEFAULT 0,
    "missed_points" INTEGER NOT NULL DEFAULT 0,
    "round_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_cp_round_executions_shift" FOREIGN KEY ("shift_log_id") REFERENCES "cp_shift_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_cp_round_executions_schedule" FOREIGN KEY ("schedule_id") REFERENCES "cp_patrol_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_cp_round_executions_factory" FOREIGN KEY ("factory_id") REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_cp_round_executions_guard" FOREIGN KEY ("guard_id") REFERENCES "cp_guard_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. CHECKPOINT SCANS
CREATE TABLE IF NOT EXISTS "cp_checkpoint_scans" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "round_execution_id" VARCHAR(50) NOT NULL,
    "checkpoint_id" VARCHAR(50) NOT NULL,
    "guard_id" VARCHAR(50) NOT NULL,
    "scanned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scan_status" VARCHAR(30) NOT NULL DEFAULT 'on_time',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "accuracy_meters" DECIMAL(6,2),
    "distance_meters" DECIMAL(8,2),
    "nfc_verified" BOOLEAN NOT NULL DEFAULT false,
    "qr_verified" BOOLEAN NOT NULL DEFAULT false,
    "photos" JSONB DEFAULT '[]',
    "late_reason" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_cp_checkpoint_scans_round" FOREIGN KEY ("round_execution_id") REFERENCES "cp_round_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_cp_checkpoint_scans_checkpoint" FOREIGN KEY ("checkpoint_id") REFERENCES "cp_checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_cp_checkpoint_scans_guard" FOREIGN KEY ("guard_id") REFERENCES "cp_guard_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 8. EMERGENCY INCIDENTS
CREATE TABLE IF NOT EXISTS "cp_emergency_incidents" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "factory_id" VARCHAR(50) NOT NULL,
    "reporter_guard_id" VARCHAR(50) NOT NULL,
    "incident_type" VARCHAR(100) NOT NULL,
    "severity_level" VARCHAR(30) NOT NULL DEFAULT 'high',
    "location_name" VARCHAR(255),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "details" TEXT,
    "photos" JSONB DEFAULT '[]',
    "audio_record_url" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "resolved_at" TIMESTAMPTZ(6),
    "resolved_by" VARCHAR(255),
    "resolution_note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_cp_emergency_incidents_factory" FOREIGN KEY ("factory_id") REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_cp_emergency_incidents_guard" FOREIGN KEY ("reporter_guard_id") REFERENCES "cp_guard_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS "cp_notifications" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "factory_id" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL DEFAULT 'announcement',
    "priority" VARCHAR(30) NOT NULL DEFAULT 'normal',
    "target_audience" VARCHAR(50) NOT NULL DEFAULT 'all_guards',
    "is_broadcast" BOOLEAN NOT NULL DEFAULT true,
    "scheduled_time" TIMESTAMPTZ(6),
    "read_by_guards" JSONB DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_cp_notifications_factory" FOREIGN KEY ("factory_id") REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 10. APP SETTINGS
CREATE TABLE IF NOT EXISTS "cp_app_settings" (
    "id" VARCHAR(50) NOT NULL PRIMARY KEY,
    "factory_id" VARCHAR(50) NOT NULL,
    "guard_id" VARCHAR(50),
    "sound_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sound_volume" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "selected_sound_id" VARCHAR(50) NOT NULL DEFAULT 'beep',
    "selected_sound_name" VARCHAR(150) NOT NULL DEFAULT 'เสียงบี๊บมาตรฐาน (Loud Beep)',
    "reminder_minutes" INTEGER NOT NULL DEFAULT 5,
    "watermark_enabled" BOOLEAN NOT NULL DEFAULT true,
    "auto_flash_night" BOOLEAN NOT NULL DEFAULT true,
    "custom_sounds" JSONB DEFAULT '[]',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_cp_app_settings_factory" FOREIGN KEY ("factory_id") REFERENCES "cp_factories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_cp_app_settings_guard" FOREIGN KEY ("guard_id") REFERENCES "cp_guard_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "uq_cp_app_settings_factory_guard" UNIQUE ("factory_id", "guard_id")
);

-- ==============================================================================
-- INDEXES FOR HIGH QUERY PERFORMANCE
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
