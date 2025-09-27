# Deployment Instructions

This document provides step-by-step instructions for deploying Glide.

## Prerequisites

- Supabase account and project
- Clerk account and application
- Vercel account (for frontend)
- Railway account (for backend - recommended) OR Vercel (alternative)
- SendGrid account (for email notifications)

## 1. Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and keys

2. **Run Database Migrations**
   ```bash
   # Option A: Using Supabase CLI
   cd supabase
   npx supabase init
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   
   # Option B: Manual - Copy paste content of migrations/001_initial_schema.sql in SQL editor
   ```

3. **Configure Authentication**
   - Enable email/password authentication
   - Configure any additional providers as needed

## 2. Clerk Setup

1. **Create Clerk Application**
   - Go to [clerk.com](https://clerk.com)
   - Create new application
   - Configure sign-in/sign-up options

2. **Get API Keys**
   - Copy Publishable Key
   - Copy Secret Key
   - Configure allowed redirect URLs

## 3. SendGrid Setup (Optional)

1. **Create SendGrid Account**
   - Sign up at [sendgrid.com](https://sendgrid.com)
   - Verify your sender identity/domain

2. **Create API Key**
   - Generate API key with mail send permissions
   - Note the API key for environment variables

## 4. Frontend Deployment (Vercel)

1. **Prepare Environment Variables**
   Create these in Vercel dashboard:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```

2. **Deploy to Vercel**
   ```bash
   cd frontend
   
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   
   # Or connect GitHub repo in Vercel dashboard
   ```

3. **Configure Domain (Optional)**
   - Add custom domain in Vercel settings
   - Update CORS settings in backend

## 5. Backend Deployment (Railway - Recommended)

1. **Prepare Environment Variables**
   Set these in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=3001
   CLERK_SECRET_KEY=sk_test_...
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   SENDGRID_API_KEY=SG....
   FROM_EMAIL=noreply@yourdomain.com
   ```

2. **Deploy to Railway**
   ```bash
   cd backend
   
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

3. **Alternative: Deploy to Vercel**
   ```bash
   cd backend
   vercel --prod
   ```

## 6. Environment Variables Reference

### Frontend (.env.local)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
CLERK_SECRET_KEY=sk_test_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@yourdomain.com
```

## 7. Post-Deployment Configuration

1. **Update CORS Settings**
   - Update frontend URL in backend CORS config
   - Update Clerk allowed origins

2. **Test the Application**
   - Sign up/login functionality
   - Zapier API key integration
   - Workflow monitoring
   - Alert notifications

3. **Configure Webhooks (Optional)**
   - Set up Zapier webhooks pointing to your backend
   - Configure Slack webhook URLs

## 8. Monitoring and Maintenance

1. **Check Logs**
   - Monitor Railway/Vercel logs for errors
   - Check Supabase logs for database issues

2. **Update Dependencies**
   - Regularly update npm packages
   - Monitor security advisories

3. **Backup Database**
   - Supabase provides automatic backups
   - Consider additional backup strategies for production

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check frontend URL in backend CORS config
   - Verify environment variables

2. **Authentication Issues**
   - Verify Clerk keys and configuration
   - Check redirect URLs

3. **Database Connection Issues**
   - Verify Supabase keys
   - Check RLS policies

4. **API Rate Limiting**
   - Monitor Zapier API usage
   - Implement exponential backoff

### Health Checks:

- Backend: `GET /health`
- Frontend: Should load without errors
- Database: Check Supabase dashboard
- Monitoring: Check cron job logs

## Security Considerations

1. **API Keys**
   - Never commit API keys to version control
   - Use environment variables for all secrets
   - Rotate keys regularly

2. **Database Security**
   - Enable RLS (Row Level Security)
   - Use service role key only in backend
   - Regular security updates

3. **HTTPS**
   - Ensure all deployments use HTTPS
   - Secure webhook endpoints

## Support

For issues or questions:
1. Check application logs first
2. Verify all environment variables
3. Test individual components (auth, database, API)
4. Check service status pages (Vercel, Railway, Supabase, Clerk)