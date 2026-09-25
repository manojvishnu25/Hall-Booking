-- Supabase Database Schema for College Conference Hall & Auditorium Booking System

-- 1. Create Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    department_code VARCHAR(50) UNIQUE NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    password_hash TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Halls Table
CREATE TABLE IF NOT EXISTS halls (
    id SERIAL PRIMARY KEY,
    hall_code VARCHAR(50) UNIQUE NOT NULL,
    hall_name VARCHAR(150) NOT NULL,
    hall_type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    features TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(id) ON DELETE CASCADE,
    hall_id INT REFERENCES halls(id) ON DELETE CASCADE,
    event_name VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed',
    participants INT NOT NULL,
    organizer_name VARCHAR(150) NOT NULL,
    organizer_designation VARCHAR(100) DEFAULT 'Faculty In-Charge',
    organizer_contact VARCHAR(50) NOT NULL,
    special_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) or public policies
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow read access to anon users for public views
CREATE POLICY "Allow public read access on halls" ON halls FOR SELECT USING (true);
CREATE POLICY "Allow public read access on bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public read access on departments" ON departments FOR SELECT USING (true);
