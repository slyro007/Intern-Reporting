-- Intern Tracking System Database Schema
-- This file initializes the PostgreSQL database with all required tables

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'intern',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create daily_logs table for intern daily submissions
CREATE TABLE IF NOT EXISTS daily_logs (
    id SERIAL PRIMARY KEY,
    intern_email VARCHAR(255) NOT NULL,
    intern_name VARCHAR(255) NOT NULL,
    log_date DATE NOT NULL,
    project_description TEXT,
    tasks_completed TEXT,
    time_spent DECIMAL(4,2),
    challenges TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Add foreign key constraint
    FOREIGN KEY (intern_email) REFERENCES users(email)
);

-- Create self_evaluations table for weekly evaluations
CREATE TABLE IF NOT EXISTS self_evaluations (
    id SERIAL PRIMARY KEY,
    intern_email VARCHAR(255) NOT NULL,
    intern_name VARCHAR(255) NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    accomplishments TEXT,
    challenges TEXT,
    learnings TEXT,
    goals TEXT,
    productivity_rating INTEGER CHECK (productivity_rating >= 1 AND productivity_rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Add foreign key constraint
    FOREIGN KEY (intern_email) REFERENCES users(email)
);

-- Create weekly_summaries table for AI-generated summaries
CREATE TABLE IF NOT EXISTS weekly_summaries (
    id SERIAL PRIMARY KEY,
    intern_email VARCHAR(255) NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    summary_content TEXT,
    generated_by VARCHAR(100) DEFAULT 'AI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Add foreign key constraint
    FOREIGN KEY (intern_email) REFERENCES users(email)
);

-- Create final_reports table for comprehensive reports
CREATE TABLE IF NOT EXISTS final_reports (
    id SERIAL PRIMARY KEY,
    intern_email VARCHAR(255) NOT NULL,
    report_period VARCHAR(50) NOT NULL, -- 'month', 'quarter', 'full'
    report_content TEXT,
    generated_by VARCHAR(100) DEFAULT 'AI',
    requested_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Add foreign key constraint
    FOREIGN KEY (intern_email) REFERENCES users(email)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_logs_email_date ON daily_logs(intern_email, log_date);
CREATE INDEX IF NOT EXISTS idx_self_evaluations_email_week ON self_evaluations(intern_email, week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_email_week ON weekly_summaries(intern_email, week_start_date);
CREATE INDEX IF NOT EXISTS idx_final_reports_email ON final_reports(intern_email);

-- Insert default users
INSERT INTO users (email, name, password_hash, role) VALUES 
    ('sjalagam@wolfflogics.com', 'Sujith Jalagam', '$2b$12$encrypted_password_hash_for_intern', 'intern'),
    ('dsolomon@wolfflogics.com', 'Dan Solomon', '$2b$12$encrypted_password_hash_for_admin', 'admin'),
    ('ehammond@wolfflogics.com', 'Eric Hammond', '$2b$12$encrypted_password_hash_for_admin', 'admin'),
    ('pcounts@wolfflogics.com', 'Paul Counts', '$2b$12$encrypted_password_hash_for_admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert some sample data for testing
INSERT INTO daily_logs (intern_email, intern_name, log_date, project_description, tasks_completed, time_spent, challenges, notes) VALUES
    ('sjalagam@wolfflogics.com', 'Sujith Jalagam', CURRENT_DATE - INTERVAL '1 day', 
     'Computer Setup using Immy.bot', 
     'Completed setup of 3 workstations, configured Windows 11, joined to domain', 
     8.0, 
     'Minor issue with domain join on one machine', 
     'All systems now ready for deployment')
ON CONFLICT DO NOTHING;

-- Create a view for easy reporting
CREATE OR REPLACE VIEW intern_activity_summary AS
SELECT 
    u.name as intern_name,
    u.email as intern_email,
    COUNT(dl.id) as total_logs,
    COALESCE(SUM(dl.time_spent), 0) as total_hours,
    COUNT(se.id) as total_evaluations,
    MAX(dl.log_date) as last_log_date,
    MAX(se.created_at) as last_evaluation_date
FROM users u
LEFT JOIN daily_logs dl ON u.email = dl.intern_email
LEFT JOIN self_evaluations se ON u.email = se.intern_email
WHERE u.role = 'intern'
GROUP BY u.name, u.email;

-- Grant permissions (optional, for better security)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO intern_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO intern_user; 