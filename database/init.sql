-- Kannamma Database Schema
-- This file can be used to manually create tables in PostgreSQL
-- For SQLite, Flask-SQLAlchemy will auto-create tables

-- Note: Flask-SQLAlchemy will create these tables automatically
-- This file is for reference or manual PostgreSQL setup

-- ASHA Workers Table
CREATE TABLE IF NOT EXISTS ashas (
    id VARCHAR(36) PRIMARY KEY,
    asha_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phc_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ashas_asha_id ON ashas(asha_id);

-- Mothers/Patients Table
CREATE TABLE IF NOT EXISTS mothers (
    id VARCHAR(36) PRIMARY KEY,
    asha_id VARCHAR(36) NOT NULL REFERENCES ashas(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    last_anc_date DATE NOT NULL,
    gestation_weeks INTEGER NOT NULL,
    flagged BOOLEAN DEFAULT FALSE,
    visited BOOLEAN DEFAULT FALSE,
    notes TEXT DEFAULT '',
    health_status VARCHAR(50) DEFAULT 'normal',
    next_appointment_date DATE,
    medication_reminders BOOLEAN DEFAULT TRUE,
    last_period_date DATE,
    cycle_length INTEGER DEFAULT 28,
    post_pregnancy BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mothers_asha_id ON mothers(asha_id);
CREATE INDEX IF NOT EXISTS idx_mothers_phone ON mothers(phone);
CREATE INDEX IF NOT EXISTS idx_mothers_flagged ON mothers(flagged);

-- PHC Stock Table
CREATE TABLE IF NOT EXISTS phc_stock (
    id VARCHAR(36) PRIMARY KEY,
    asha_id VARCHAR(36) UNIQUE NOT NULL REFERENCES ashas(id) ON DELETE CASCADE,
    iron_tablets INTEGER DEFAULT 0,
    tt_vaccine INTEGER DEFAULT 0,
    folic_acid INTEGER DEFAULT 0,
    calcium_tablets INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call Logs Table
CREATE TABLE IF NOT EXISTS call_logs (
    id VARCHAR(36) PRIMARY KEY,
    asha_id VARCHAR(36) NOT NULL REFERENCES ashas(id) ON DELETE CASCADE,
    mother_id VARCHAR(36) NOT NULL REFERENCES mothers(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    result VARCHAR(50) NOT NULL,
    call_duration INTEGER,
    call_sid VARCHAR(100),
    response_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_call_logs_asha_id ON call_logs(asha_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_mother_id ON call_logs(mother_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at);

-- Health Records Table
CREATE TABLE IF NOT EXISTS health_records (
    id VARCHAR(36) PRIMARY KEY,
    mother_id VARCHAR(36) NOT NULL REFERENCES mothers(id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    symptoms TEXT,
    medication_taken BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_records_mother_id ON health_records(mother_id);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY,
    mother_id VARCHAR(36) NOT NULL REFERENCES mothers(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'scheduled',
    reminder_sent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_mother_id ON appointments(mother_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- IVR Schedules Table
CREATE TABLE IF NOT EXISTS ivr_schedules (
    id VARCHAR(36) PRIMARY KEY,
    mother_id VARCHAR(36) NOT NULL REFERENCES mothers(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP NOT NULL,
    call_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    call_sid VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ivr_schedules_mother_id ON ivr_schedules(mother_id);
CREATE INDEX IF NOT EXISTS idx_ivr_schedules_time ON ivr_schedules(scheduled_time);

