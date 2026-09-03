-- ==============================================================================
-- SMART VISITOR / CHECK POINT - MISSING TABLES FOR POSTGRESQL
-- รันไฟล์นี้ในฐานข้อมูล PostgreSQL ของ Backend เพื่อสร้างตารางจุดตรวจและรอบตรวจ
-- ==============================================================================

-- 1. ตารางจุดตรวจ (checkpoints)
CREATE TABLE IF NOT EXISTS "checkpoints" (
    "id" SERIAL PRIMARY KEY,
    "factory_id" INTEGER NOT NULL REFERENCES "factories"("id") ON DELETE CASCADE,
    "point_number" INTEGER NOT NULL DEFAULT 1,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50),
    "description" TEXT,
    "target_time_desc" VARCHAR(100),
    "latitude" DECIMAL(10, 8) NOT NULL DEFAULT 14.9033,
    "longitude" DECIMAL(11, 8) NOT NULL DEFAULT 102.0562,
    "radius_meters" INTEGER NOT NULL DEFAULT 50,
    "sequence_order" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางรอบการเดินตรวจ (patrol_rounds)
CREATE TABLE IF NOT EXISTS "patrol_rounds" (
    "id" SERIAL PRIMARY KEY,
    "factory_id" INTEGER NOT NULL REFERENCES "factories"("id") ON DELETE CASCADE,
    "round_number" INTEGER NOT NULL DEFAULT 1,
    "title" VARCHAR(255) NOT NULL,
    "start_time" VARCHAR(50) NOT NULL DEFAULT '08:00',
    "end_time" VARCHAR(50) NOT NULL DEFAULT '10:00',
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางบันทึกการสแกนตรวจจุด (patrol_checkpoint_logs)
CREATE TABLE IF NOT EXISTS "patrol_checkpoint_logs" (
    "id" SERIAL PRIMARY KEY,
    "round_id" INTEGER REFERENCES "patrol_rounds"("id") ON DELETE SET NULL,
    "checkpoint_id" INTEGER REFERENCES "checkpoints"("id") ON DELETE CASCADE,
    "guard_id" INTEGER REFERENCES "security"("id") ON DELETE SET NULL,
    "factory_id" INTEGER NOT NULL REFERENCES "factories"("id") ON DELETE CASCADE,
    "scheduled_time" VARCHAR(50),
    "actual_time" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL DEFAULT 'on_time',
    "scan_latitude" DECIMAL(10, 8),
    "scan_longitude" DECIMAL(11, 8),
    "photos" JSONB DEFAULT '[]'::jsonb,
    "reason" TEXT,
    "remarks" TEXT,
    "scanned_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ตารางผู้ตรวจการ (inspectors)
CREATE TABLE IF NOT EXISTS "inspectors" (
    "id" SERIAL PRIMARY KEY,
    "code" VARCHAR(50) UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "role_title" VARCHAR(100) DEFAULT 'ผู้ตรวจการความปลอดภัย',
    "phone" VARCHAR(50),
    "factory_id" INTEGER REFERENCES "factories"("id") ON DELETE SET NULL,
    "zone" VARCHAR(150),
    "shift" VARCHAR(100),
    "status" VARCHAR(50) DEFAULT 'active',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ตารางบันทึกการตรวจประเมินผล รปภ. (inspector_audit_logs)
CREATE TABLE IF NOT EXISTS "inspector_audit_logs" (
    "id" SERIAL PRIMARY KEY,
    "inspector_id" INTEGER REFERENCES "inspectors"("id") ON DELETE SET NULL,
    "target_guard_id" INTEGER REFERENCES "security"("id") ON DELETE SET NULL,
    "factory_id" INTEGER REFERENCES "factories"("id") ON DELETE CASCADE,
    "audit_datetime" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "topic" VARCHAR(255),
    "score" DECIMAL(5, 2) DEFAULT 100.00,
    "result" VARCHAR(50) DEFAULT 'passed',
    "items_checked" JSONB DEFAULT '[]'::jsonb,
    "notes" TEXT,
    "photos" JSONB DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes สำหรับเร่งความเร็ว
CREATE INDEX IF NOT EXISTS "idx_checkpoints_factory" ON "checkpoints"("factory_id");
CREATE INDEX IF NOT EXISTS "idx_patrol_rounds_factory" ON "patrol_rounds"("factory_id");
CREATE INDEX IF NOT EXISTS "idx_patrol_checkpoint_logs_factory" ON "patrol_checkpoint_logs"("factory_id");
CREATE INDEX IF NOT EXISTS "idx_patrol_checkpoint_logs_scanned_at" ON "patrol_checkpoint_logs"("scanned_at" DESC);
