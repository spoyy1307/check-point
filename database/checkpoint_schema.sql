-- ==============================================================================
-- CHECK POINT MOBILE SYSTEM - DATABASE SCHEMA (PostgreSQL / MySQL compatible)
-- Database Table Definitions for Guard Patrol, Shift Management & Admin System
-- ==============================================================================

-- 1. FACTORIES / BRANCHES (ตารางข้อมูลโรงงาน / สาขาที่สังกัด)
CREATE TABLE IF NOT EXISTS cp_factories (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    province VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL DEFAULT 14.9033,
    longitude DECIMAL(11, 8) NOT NULL DEFAULT 102.0562,
    radius_meters INT NOT NULL DEFAULT 200,
    admin_pin VARCHAR(255) NOT NULL DEFAULT '123456',
    soc_hotline VARCHAR(50) DEFAULT '02-999-8888',
    supervisor_phone VARCHAR(50) DEFAULT '089-999-8877',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. GUARD ACCOUNTS (ตารางบัญชีเจ้าหน้าที่ รปภ. ประจำโรงงาน)
CREATE TABLE IF NOT EXISTS cp_guard_accounts (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    factory_id VARCHAR(50) NOT NULL REFERENCES cp_factories(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(100) NOT NULL DEFAULT 'รปภ. ประจำกะดึก',
    assigned_zone VARCHAR(150) DEFAULT 'ทุกโซนพื้นที่ส่วนกลาง',
    avatar_url TEXT,
    avatar_emoji VARCHAR(10) DEFAULT '👮',
    pin_code VARCHAR(255) NOT NULL DEFAULT '123456',
    start_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SHIFT LOGS (ตารางบันทึกการลงเวลากะ เข้า-ออกงาน รปภ.)
CREATE TABLE IF NOT EXISTS cp_shift_logs (
    id VARCHAR(50) PRIMARY KEY,
    factory_id VARCHAR(50) NOT NULL REFERENCES cp_factories(id) ON DELETE CASCADE,
    guard_id VARCHAR(50) NOT NULL REFERENCES cp_guard_accounts(id) ON DELETE CASCADE,
    shift_name VARCHAR(100) NOT NULL, -- e.g. 'กะบ่าย (14:00 - 22:00 น.)'
    shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_in_latitude DECIMAL(10, 8),
    check_in_longitude DECIMAL(11, 8),
    check_in_device_id VARCHAR(100),
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_out_latitude DECIMAL(10, 8),
    check_out_longitude DECIMAL(11, 8),
    total_working_minutes INT DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'on_duty', 'completed', 'late'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CHECKPOINT MASTER (ตารางจุดตรวจทั้งหมดที่แอดมินกำหนดในโรงงาน)
CREATE TABLE IF NOT EXISTS cp_checkpoints (
    id VARCHAR(50) PRIMARY KEY,
    factory_id VARCHAR(50) NOT NULL REFERENCES cp_factories(id) ON DELETE CASCADE,
    point_number INT NOT NULL, -- 1, 2, 3... 8
    name VARCHAR(255) NOT NULL, -- e.g. 'ป้อมยามหน้าประตูหลัก'
    description TEXT,
    target_time_desc VARCHAR(50), -- e.g. '20:15 น.'
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    allowed_radius_meters INT NOT NULL DEFAULT 50,
    nfc_tag_uid VARCHAR(100),
    qr_code_data VARCHAR(255),
    sequence_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PATROL ROUND SCHEDULES (ตารางรอบตรวจที่แอดมินกำหนดประจำกะ)
CREATE TABLE IF NOT EXISTS cp_patrol_schedules (
    id VARCHAR(50) PRIMARY KEY,
    factory_id VARCHAR(50) NOT NULL REFERENCES cp_factories(id) ON DELETE CASCADE,
    round_number INT NOT NULL, -- 1, 2, 3, 4, 5, 6
    round_name VARCHAR(100) NOT NULL, -- e.g. 'รอบที่ 1 (20:00 - 22:00 น.)'
    start_time TIME NOT NULL, -- e.g. '20:00:00'
    end_time TIME NOT NULL, -- e.g. '22:00:00'
    points_count INT NOT NULL DEFAULT 8,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PATROL ROUND EXECUTIONS (ตารางบันทึกประวัติการเดินตรวจแต่ละรอบจริง)
CREATE TABLE IF NOT EXISTS cp_round_executions (
    id VARCHAR(50) PRIMARY KEY,
    shift_log_id VARCHAR(50) REFERENCES cp_shift_logs(id) ON DELETE SET NULL,
    schedule_id VARCHAR(50) REFERENCES cp_patrol_schedules(id) ON DELETE SET NULL,
    factory_id VARCHAR(50) NOT NULL REFERENCES cp_factories(id) ON DELETE CASCADE,
    guard_id VARCHAR(50) NOT NULL REFERENCES cp_guard_accounts(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'late', 'missed'
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    completed_points INT NOT NULL DEFAULT 0,
    total_points INT NOT NULL DEFAULT 8,
    on_time_points INT NOT NULL DEFAULT 0,
    late_points INT NOT NULL DEFAULT 0,
    missed_points INT NOT NULL DEFAULT 0,
    round_score INT NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CHECKPOINT SCAN LOGS (ตารางบันทึกการสแกนตรวจแต่ละจุด พร้อมรูปภาพและ GPS)
CREATE TABLE IF NOT EXISTS cp_checkpoint_scans (
    id VARCHAR(50) PRIMARY KEY,
    round_execution_id VARCHAR(50) NOT NULL REFERENCES cp_round_executions(id) ON DELETE CASCADE,
    checkpoint_id VARCHAR(50) NOT NULL REFERENCES cp_checkpoints(id) ON DELETE CASCADE,
    guard_id VARCHAR(50) NOT NULL REFERENCES cp_guard_accounts(id) ON DELETE CASCADE,
    factory_id VARCHAR(50) NOT NULL REFERENCES cp_factories(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scan_status VARCHAR(30) NOT NULL DEFAULT 'on_time', -- 'on_time', 'late', 'skipped'
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    accuracy_meters DECIMAL(6, 2),
    distance_meters DECIMAL(8, 2),
    nfc_verified BOOLEAN DEFAULT FALSE,
    qr_verified BOOLEAN DEFAULT FALSE,
    photos JSONB DEFAULT '[]'::jsonb, -- Array of Photo URLs with timestamp & GPS watermark
    late_reason TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. EMERGENCY INCIDENTS (ตารางแจ้งเหตุฉุกเฉินและขอความช่วยเหลือ)
CREATE TABLE IF NOT EXISTS cp_emergency_incidents (
    id VARCHAR(50) PRIMARY KEY,
    factory_id VARCHAR(50) NOT NULL REFERENCES cp_factories(id) ON DELETE CASCADE,
    reporter_guard_id VARCHAR(50) NOT NULL REFERENCES cp_guard_accounts(id) ON DELETE CASCADE,
    incident_type VARCHAR(100) NOT NULL, -- e.g. 'ไฟไหม้ / กลุ่มควัน', 'ผู้บุกรุก'
    severity_level VARCHAR(30) NOT NULL DEFAULT 'high', -- 'low', 'medium', 'high', 'critical'
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    details TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    audio_record_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'reported', -- 'reported', 'ack_by_soc', 'investigating', 'resolved'
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. NOTIFICATIONS & ANNOUNCEMENTS (ตารางการแจ้งเตือน คำสั่ง และข่าวสารจากแอดมิน)
CREATE TABLE IF NOT EXISTS cp_notifications (
    id VARCHAR(50) PRIMARY KEY,
    factory_id VARCHAR(50) REFERENCES cp_factories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(30) NOT NULL DEFAULT 'patrol', -- 'patrol', 'emergency', 'announcement'
    priority VARCHAR(30) NOT NULL DEFAULT 'normal', -- 'normal', 'urgent', 'critical'
    summary TEXT,
    content TEXT,
    banner_image_url TEXT,
    published_by VARCHAR(100),
    valid_until TIMESTAMP WITH TIME ZONE,
    target_guard_id VARCHAR(50) REFERENCES cp_guard_accounts(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. APP & DEVICE SETTINGS (ตารางการตั้งค่าแอปพลิเคชันและอุปกรณ์)
CREATE TABLE IF NOT EXISTS cp_app_settings (
    id VARCHAR(50) PRIMARY KEY,
    factory_id VARCHAR(50) NOT NULL REFERENCES cp_factories(id) ON DELETE CASCADE,
    device_id VARCHAR(100) NOT NULL,
    sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sound_volume DECIMAL(3, 2) NOT NULL DEFAULT 1.00,
    selected_sound_id VARCHAR(50) DEFAULT 'beep',
    selected_sound_name VARCHAR(100) DEFAULT 'เสียงบี๊บมาตรฐาน (Loud Beep)',
    reminder_minutes INT NOT NULL DEFAULT 5, -- 0, 5, 10, 15
    vibration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    watermark_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    auto_flash_night BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(factory_id, device_id)
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCH & REAL-TIME SYNC
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_guard_factory ON cp_guard_accounts(factory_id);
CREATE INDEX IF NOT EXISTS idx_shift_factory_date ON cp_shift_logs(factory_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_checkpoints_factory ON cp_checkpoints(factory_id);
CREATE INDEX IF NOT EXISTS idx_patrol_sched_factory ON cp_patrol_schedules(factory_id);
CREATE INDEX IF NOT EXISTS idx_round_exec_guard ON cp_round_executions(guard_id, created_at);
CREATE INDEX IF NOT EXISTS idx_scans_round ON cp_checkpoint_scans(round_execution_id);
CREATE INDEX IF NOT EXISTS idx_emergency_factory ON cp_emergency_incidents(factory_id, status);
CREATE INDEX IF NOT EXISTS idx_notif_factory ON cp_notifications(factory_id, category, is_read);
