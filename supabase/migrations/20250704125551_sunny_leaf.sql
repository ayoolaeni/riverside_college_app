-- Riverside College E-Learning Database Schema
-- PostgreSQL Database Setup

-- Create database (run this manually in PostgreSQL)
-- CREATE DATABASE riverside_college;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'teacher', 'student')) NOT NULL,
    class_level VARCHAR(10) CHECK (class_level IN ('JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    class_level VARCHAR(10) CHECK (class_level IN ('JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3')) NOT NULL,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    class_level VARCHAR(10) CHECK (class_level IN ('JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(10) CHECK (type IN ('pdf', 'cbt')) NOT NULL,
    class_level VARCHAR(10) CHECK (class_level IN ('JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3')) NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE,
    file_url VARCHAR(500),
    questions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    class_level VARCHAR(10) CHECK (class_level IN ('JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3')) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    file_url VARCHAR(500),
    uploaded_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assignment submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_url VARCHAR(500),
    answers JSONB,
    score INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by INTEGER REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_videos_class_level ON videos(class_level);
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON videos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_announcements_class_level ON announcements(class_level);
CREATE INDEX IF NOT EXISTS idx_assignments_class_level ON assignments(class_level);
CREATE INDEX IF NOT EXISTS idx_results_student_id ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_class_level ON results(class_level);

-- Insert default users with properly hashed passwords
-- Password for all users: password123
-- Hash: $2a$10$K7L/8Y1t85haFQRdi6mz0uPiAuqiE.H/.JqT0ZCvQqg8S5XzMQJSi

INSERT INTO users (email, username, full_name, password, role) 
VALUES ('admin@riverside.edu', 'admin', 'System Administrator', '$2a$10$K7L/8Y1t85haFQRdi6mz0uPiAuqiE.H/.JqT0ZCvQqg8S5XzMQJSi', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, username, full_name, password, role, class_level) 
VALUES ('teacher@riverside.edu', 'teacher1', 'John Smith', '$2a$10$K7L/8Y1t85haFQRdi6mz0uPiAuqiE.H/.JqT0ZCvQqg8S5XzMQJSi', 'teacher', 'JSS1')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, username, full_name, password, role, class_level) 
VALUES ('student@riverside.edu', 'student1', 'Jane Doe', '$2a$10$K7L/8Y1t85haFQRdi6mz0uPiAuqiE.H/.JqT0ZCvQqg8S5XzMQJSi', 'student', 'JSS1')
ON CONFLICT (email) DO NOTHING;

-- Insert some sample data
INSERT INTO announcements (title, content, created_by) 
SELECT 'Welcome to Riverside College E-Learning Platform', 
       'We are excited to launch our new e-learning platform. Students can now access videos, assignments, and results online.',
       id FROM users WHERE role = 'admin' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO videos (title, description, url, class_level, uploaded_by)
SELECT 'Introduction to Mathematics', 
       'Basic mathematical concepts for JSS1 students',
       'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
       'JSS1',
       id FROM users WHERE role = 'teacher' LIMIT 1
ON CONFLICT DO NOTHING;