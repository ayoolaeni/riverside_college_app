-- Riverside College E-Learning Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    class_level VARCHAR(10) CHECK (class_level IN ('JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3')) NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    class_level VARCHAR(10) CHECK (class_level IN ('JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(10) CHECK (type IN ('pdf', 'cbt')) NOT NULL,
    class_level VARCHAR(10) CHECK (class_level IN ('JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3')) NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE,
    file_url VARCHAR(500),
    questions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_level VARCHAR(10) CHECK (class_level IN ('JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3')) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    file_url VARCHAR(500),
    uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assignment submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_url VARCHAR(500),
    answers JSONB,
    score INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES users(id)
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

-- Insert default admin user (password: admin123)
INSERT INTO users (email, username, full_name, password, role) 
VALUES ('admin@riverside.edu', 'admin', 'System Administrator', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample teacher (password: teacher123)
INSERT INTO users (email, username, full_name, password, role, class_level) 
VALUES ('teacher@riverside.edu', 'teacher1', 'John Smith', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'JSS1')
ON CONFLICT (email) DO NOTHING;

-- Insert sample student (password: student123)
INSERT INTO users (email, username, full_name, password, role, class_level) 
VALUES ('student@riverside.edu', 'student1', 'Jane Doe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'JSS1')
ON CONFLICT (email) DO NOTHING;