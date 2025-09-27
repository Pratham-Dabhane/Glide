-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zapier_api_key TEXT,
  slack_webhook_url TEXT,
  email_alert VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create workflow_logs table
CREATE TABLE IF NOT EXISTS workflow_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workflow_id VARCHAR(255) NOT NULL,
  workflow_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'unknown',
  last_run TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workflow_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_user_id ON workflow_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_status ON workflow_logs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_last_run ON workflow_logs(last_run);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_logs_updated_at BEFORE UPDATE ON workflow_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- Integrations policies
CREATE POLICY "Users can view own integrations" ON integrations FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can update own integrations" ON integrations FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can insert own integrations" ON integrations FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can delete own integrations" ON integrations FOR DELETE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Workflow logs policies
CREATE POLICY "Users can view own workflow logs" ON workflow_logs FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can update own workflow logs" ON workflow_logs FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can insert own workflow logs" ON workflow_logs FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can delete own workflow logs" ON workflow_logs FOR DELETE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));