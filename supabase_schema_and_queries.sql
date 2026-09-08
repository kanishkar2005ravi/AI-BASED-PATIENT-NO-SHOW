-- ====================================================================
-- AI CARESCHEDULE - SUPABASE DATABASE SCHEMA & WORKBENCH SQL QUERIES
-- ====================================================================

-- 1. PATIENTS TABLE (Includes email & password created by Admin)
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL DEFAULT 'password',
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add password column if table already exists
ALTER TABLE patients ADD COLUMN IF NOT EXISTS password VARCHAR(100) DEFAULT 'password';

-- 2. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  room_number VARCHAR(20),
  experience_years INT DEFAULT 5,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(20) NOT NULL,
  appointment_type VARCHAR(100) DEFAULT 'Routine Checkup',
  status VARCHAR(20) DEFAULT 'SCHEDULED',
  no_show_risk_score INT DEFAULT 15,
  no_show_risk_level VARCHAR(20) DEFAULT 'LOW',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. WAITLIST TABLE
CREATE TABLE IF NOT EXISTS waitlist (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  requested_time_slot VARCHAR(50) NOT NULL,
  position INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'WAITING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- SEED INITIAL DATA (Execute in Supabase SQL Editor)
-- ====================================================================

INSERT INTO doctors (id, name, specialization, department, email, phone, room_number, experience_years) 
VALUES 
  ('DOC-001', 'Dr. Arun Kumar', 'General Medicine', 'Internal Medicine', 'arun.kumar@careschedule.com', '9876543210', '101', 12),
  ('DOC-002', 'Dr. Meena Sharma', 'Cardiology', 'Cardiology Dept', 'meena.sharma@careschedule.com', '9876543211', '102', 15),
  ('DOC-003', 'Dr. Rajesh Kumar', 'Orthopedics', 'Orthopedic Surgery', 'rajesh.kumar@careschedule.com', '9876543212', '201', 10),
  ('DOC-004', 'Dr. Sneha Patel', 'Neurology', 'Neurology Dept', 'sneha.patel@careschedule.com', '9876543213', '301', 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO patients (id, name, email, password, phone, date_of_birth, gender, address)
VALUES 
  ('PAT-001', 'Kiran Raj', 'patient@example.com', 'password', '9876543210', '2006-09-06', 'Male', 'Coimbatore, Tamil Nadu'),
  ('PAT-002', 'Rahul Kumar', 'rahul@example.com', 'password', '9876543211', '1995-04-12', 'Male', 'Chennai, Tamil Nadu'),
  ('PAT-003', 'Priya Sharma', 'priya@example.com', 'password', '9876543212', '1998-11-23', 'Female', 'Bangalore, Karnataka')
ON CONFLICT (id) DO NOTHING;


-- ====================================================================
-- WORKBENCH EXECUTE QUERY NODES (COPY-PASTE INTO WORKBENCH)
-- ====================================================================

-- A) CREATE_PATIENT Node Query:
-- Inserts patient with password set by Admin
INSERT INTO patients (
  id, name, email, password, phone, date_of_birth, gender, address
) VALUES (
  '{{json.body.data.patientId}}',
  '{{json.body.data.name}}',
  '{{json.body.data.email}}',
  '{{json.body.data.password}}',
  '{{json.body.data.phone}}',
  CAST('{{json.body.data.dateOfBirth}}' AS DATE),
  '{{json.body.data.gender}}',
  '{{json.body.data.address}}'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  phone = EXCLUDED.phone
RETURNING *;


-- B) LOGIN Node Query:
-- Verifies Patient ID/Email AND Password against Supabase
SELECT id, name, email 
FROM patients 
WHERE (id = '{{json.body.data.email}}' OR email = '{{json.body.data.email}}')
  AND password = '{{json.body.data.password}}'
LIMIT 1;
