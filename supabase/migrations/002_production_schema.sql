-- Production-ready Zapier Debugger & Monitor Database Schema
-- This migration creates all necessary tables with proper indexing, RLS, and sample data

-- Drop existing policies and tables if they exist (for clean reset)
DROP POLICY IF EXISTS "Users can delete own workflow logs" ON workflow_logs;
DROP POLICY IF EXISTS "Users can insert own workflow logs" ON workflow_logs;
DROP POLICY IF EXISTS "Users can update own workflow logs" ON workflow_logs;
DROP POLICY IF EXISTS "Users can view own workflow logs" ON workflow_logs;
DROP POLICY IF EXISTS "Users can delete own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can insert own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can update own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can view own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view own alert history" ON alert_history;

DROP TABLE IF EXISTS alert_history CASCADE;
DROP TABLE IF EXISTS workflow_logs CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (synced with Clerk authentication)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations table (stores user API keys and webhook URLs)
CREATE TABLE integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zapier_api_key TEXT,
  slack_webhook_url TEXT,
  alert_email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Workflow logs table (stores Zapier workflow status and history)
CREATE TABLE workflow_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zap_id VARCHAR(255) NOT NULL,
  workflow_name VARCHAR(500) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'error', 'halted', 'throttled', 'paused', 'running')),
  last_run TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, zap_id)
);

-- Alert history table (tracks sent notifications)
CREATE TABLE alert_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workflow_log_id UUID NOT NULL REFERENCES workflow_logs(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('email', 'slack')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  response_data JSONB
);

-- Performance indexes
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_active ON integrations(is_active);
CREATE INDEX idx_workflow_logs_user_id ON workflow_logs(user_id);
CREATE INDEX idx_workflow_logs_status ON workflow_logs(status);
CREATE INDEX idx_workflow_logs_last_run ON workflow_logs(last_run DESC);
CREATE INDEX idx_workflow_logs_zap_id ON workflow_logs(zap_id);
CREATE INDEX idx_workflow_logs_enabled ON workflow_logs(is_enabled);
CREATE INDEX idx_alert_history_user_id ON alert_history(user_id);
CREATE INDEX idx_alert_history_sent_at ON alert_history(sent_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at 
  BEFORE UPDATE ON integrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_logs_updated_at 
  BEFORE UPDATE ON workflow_logs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only access their own data
CREATE POLICY "Users can manage own profile" ON users
  FOR ALL USING (clerk_id = auth.jwt() ->> 'sub')
  WITH CHECK (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can manage own integrations" ON integrations
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can manage own workflow logs" ON workflow_logs
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can view own alert history" ON alert_history
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Demo data for testing (use real Clerk ID when you have it)
INSERT INTO users (clerk_id, email, first_name, last_name) VALUES 
  ('demo_user_123', 'demo@zapier-debugger.com', 'Demo', 'User')
ON CONFLICT (clerk_id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- Demo integration data
INSERT INTO integrations (user_id, zapier_api_key, slack_webhook_url, alert_email)
SELECT 
  u.id,
  'demo_zapier_key_replace_with_real',
  'https://hooks.slack.com/services/demo/webhook/url',
  'demo@zapier-debugger.com'
FROM users u 
WHERE u.clerk_id = 'demo_user_123'
ON CONFLICT (user_id) DO UPDATE SET
  zapier_api_key = EXCLUDED.zapier_api_key,
  slack_webhook_url = EXCLUDED.slack_webhook_url,
  alert_email = EXCLUDED.alert_email;

-- Demo workflow logs with realistic data
INSERT INTO workflow_logs (user_id, zap_id, workflow_name, status, last_run, run_count, success_count, error_count, error_message)
SELECT 
  u.id,
  'demo_zap_' || (ROW_NUMBER() OVER()),
  workflow_name,
  status,
  last_run,
  run_count,
  success_count,
  error_count,
  error_message
FROM users u,
(VALUES 
  ('Email to Slack Notification', 'success', NOW() - INTERVAL '2 hours', 150, 148, 2, NULL),
  ('Form Submission to Airtable', 'error', NOW() - INTERVAL '30 minutes', 75, 70, 5, 'API rate limit exceeded - Airtable returned 429'),
  ('Shopify Order to Google Sheets', 'success', NOW() - INTERVAL '1 hour', 200, 195, 5, NULL),
  ('RSS Feed to Twitter', 'halted', NOW() - INTERVAL '6 hours', 50, 45, 5, 'Twitter API authentication failed - invalid credentials'),
  ('Gmail to Trello Card', 'success', NOW() - INTERVAL '15 minutes', 300, 298, 2, NULL),
  ('Webhook to Database', 'running', NOW() - INTERVAL '5 minutes', 25, 24, 1, NULL),
  ('Calendar Event to Slack', 'error', NOW() - INTERVAL '1 hour', 100, 95, 5, 'Slack webhook endpoint not found - 404 error')
) AS t(workflow_name, status, last_run, run_count, success_count, error_count, error_message)
WHERE u.clerk_id = 'demo_user_123'
ON CONFLICT (user_id, zap_id) DO UPDATE SET
  workflow_name = EXCLUDED.workflow_name,
  status = EXCLUDED.status,
  last_run = EXCLUDED.last_run,
  run_count = EXCLUDED.run_count,
  success_count = EXCLUDED.success_count,
  error_count = EXCLUDED.error_count,
  error_message = EXCLUDED.error_message;