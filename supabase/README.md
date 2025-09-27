# Supabase Setup Instructions

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

## 2. Run Migrations
You can run the migration in two ways:

### Option A: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize Supabase in your project
supabase init

# Link to your project (use project ref from your dashboard URL)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Option B: Manual SQL Execution
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Execute the SQL

## 3. Configure Environment Variables
Copy the values from your Supabase dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (for backend)

## 4. Test Connection
After setting up, you should see three tables in your Supabase dashboard:
- `users`
- `integrations` 
- `workflow_logs`

## Database Schema Overview

### Users Table
- Stores user information synced with Clerk
- Links Clerk user IDs to internal user IDs

### Integrations Table  
- Stores user API keys and notification preferences
- One row per user with their Zapier API key, Slack webhook, email settings

### Workflow Logs Table
- Stores workflow status and error information
- Updated by the monitoring system
- Tracks success/error counts and last run times