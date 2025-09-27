# 🚀 Deployment Checklist for Zapier Debugger & Monitor

## 📋 Pre-Deployment Setup

### 1. Account Setup
- [ ] **Clerk Account** - [dashboard.clerk.com](https://dashboard.clerk.com)
  - [ ] Create new application
  - [ ] Get publishable key and secret key
  - [ ] Configure allowed domains
- [ ] **Supabase Account** - [app.supabase.com](https://app.supabase.com)
  - [ ] Create new project
  - [ ] Get project URL and API keys
  - [ ] Run database migrations
- [ ] **Vercel Account** - [vercel.com](https://vercel.com) (Frontend)
- [ ] **Railway Account** - [railway.app](https://railway.app) (Backend)
- [ ] **SendGrid Account** - [sendgrid.com](https://sendgrid.com) (Optional - Email)

### 2. Repository Setup
- [ ] Push code to GitHub repository
- [ ] Ensure `.env` files are in `.gitignore`
- [ ] Create `.env.example` files with placeholder values

## 🔧 Environment Configuration

### Frontend Environment Variables (.env.local)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_API_URL` (Backend URL)

### Backend Environment Variables (.env)
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `FRONTEND_URL` (Frontend URL for CORS)
- [ ] `CLERK_SECRET_KEY`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_KEY`
- [ ] `SENDGRID_API_KEY` (Optional)
- [ ] `FROM_EMAIL` (Optional)

## 🗄️ Database Setup (Supabase)

- [ ] Create Supabase project
- [ ] Copy SQL from `supabase/migrations/001_initial_schema.sql`
- [ ] Run SQL in Supabase SQL Editor
- [ ] Verify tables are created:
  - [ ] `profiles`
  - [ ] `workflows`
  - [ ] `workflow_runs`
  - [ ] `integrations`
- [ ] Enable Row Level Security (RLS)
- [ ] Test database connection

## 🎨 Frontend Deployment (Vercel)

### Option A: Vercel CLI
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Navigate to frontend folder: `cd frontend`
- [ ] Run: `vercel`
- [ ] Follow prompts and configure project
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy: `vercel --prod`

### Option B: GitHub Integration
- [ ] Connect GitHub repo to Vercel
- [ ] Set root directory to `frontend`
- [ ] Configure environment variables
- [ ] Enable auto-deployments
- [ ] Deploy

### Vercel Configuration Check
- [ ] Build completes successfully
- [ ] Environment variables are set
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Preview deployments working

## 🚀 Backend Deployment (Railway)

### Option A: Railway CLI
- [ ] Install Railway CLI: `npm i -g @railway/cli`
- [ ] Navigate to backend folder: `cd backend`
- [ ] Login: `railway login`
- [ ] Initialize: `railway init`
- [ ] Set environment variables: `railway variables`
- [ ] Deploy: `railway up`

### Option B: GitHub Integration
- [ ] Connect GitHub repo to Railway
- [ ] Set root directory to `backend`
- [ ] Configure environment variables
- [ ] Set start command: `npm start`
- [ ] Deploy

### Railway Configuration Check
- [ ] Service starts successfully
- [ ] Environment variables are set
- [ ] Health endpoint responding: `/health`
- [ ] Database connection working
- [ ] CORS configured correctly

## 🔐 Authentication Setup (Clerk)

- [ ] **Development Settings:**
  - [ ] Add `http://localhost:3000` to allowed origins
  - [ ] Configure sign-in/sign-up URLs
- [ ] **Production Settings:**
  - [ ] Add production frontend URL to allowed origins
  - [ ] Update redirect URLs for production
  - [ ] Configure webhooks (if needed)
- [ ] **Test Authentication:**
  - [ ] Sign up works
  - [ ] Sign in works
  - [ ] Protected routes require authentication
  - [ ] JWT tokens are valid

## 📧 Email Setup (SendGrid - Optional)

- [ ] Create SendGrid account
- [ ] Verify sender identity
- [ ] Create API key
- [ ] Add API key to backend environment
- [ ] Test email sending
- [ ] Configure email templates

## 🔄 CORS Configuration

- [ ] Backend `FRONTEND_URL` matches Vercel deployment
- [ ] Clerk dashboard has correct domains
- [ ] API calls work from frontend to backend
- [ ] No CORS errors in browser console

## ✅ Post-Deployment Testing

### 1. Frontend Testing
- [ ] **Homepage loads correctly**
- [ ] **Authentication flows work:**
  - [ ] Sign up
  - [ ] Sign in
  - [ ] Sign out
- [ ] **Protected routes require auth:**
  - [ ] Dashboard redirects if not signed in
  - [ ] Settings requires authentication
- [ ] **UI is responsive on mobile**

### 2. Backend Testing
- [ ] **Health endpoint:** `GET /health`
- [ ] **Protected endpoints require auth:**
  - [ ] `GET /api/workflows` returns 401 without token
  - [ ] `GET /api/workflows` works with valid token
- [ ] **Database operations work:**
  - [ ] Can fetch user data
  - [ ] Can save integration settings

### 3. Integration Testing
- [ ] **Full user flow:**
  - [ ] Sign up → Dashboard → Settings → Save
- [ ] **API communication:**
  - [ ] Frontend can call backend APIs
  - [ ] Authentication tokens work
  - [ ] Data persists in database

### 4. Performance Testing
- [ ] **Frontend loads quickly**
- [ ] **API responses are fast**
- [ ] **No memory leaks**
- [ ] **Database queries are optimized**

## 🔧 Troubleshooting Checklist

### Common Issues
- [ ] **Build Failures:**
  - [ ] Check environment variables
  - [ ] Verify dependencies are installed
  - [ ] Clear cache and rebuild
- [ ] **CORS Errors:**
  - [ ] Verify FRONTEND_URL in backend
  - [ ] Check Clerk domain settings
- [ ] **Auth Issues:**
  - [ ] Verify Clerk keys match
  - [ ] Check allowed domains
  - [ ] Validate JWT tokens
- [ ] **Database Issues:**
  - [ ] Verify Supabase connection
  - [ ] Check RLS policies
  - [ ] Validate schema

### Debug Tools
- [ ] **Browser Developer Tools**
- [ ] **Vercel Function Logs**
- [ ] **Railway Application Logs**
- [ ] **Clerk Dashboard Logs**
- [ ] **Supabase Dashboard**

## 📊 Monitoring Setup

### Production Monitoring
- [ ] **Error tracking** (Sentry, LogRocket)
- [ ] **Performance monitoring**
- [ ] **Uptime monitoring**
- [ ] **Database monitoring**

### Alerts
- [ ] **Deployment notifications**
- [ ] **Error rate alerts**
- [ ] **Performance degradation alerts**
- [ ] **Database connection alerts**

## 🎉 Launch Checklist

- [ ] **All tests passing**
- [ ] **Performance is acceptable**
- [ ] **Security review completed**
- [ ] **Documentation is up to date**
- [ ] **Monitoring is configured**
- [ ] **Backup strategy in place**
- [ ] **Team has access to all accounts**
- [ ] **Custom domain configured** (optional)
- [ ] **SSL certificates working**
- [ ] **CDN configured** (optional)

## 📝 Post-Launch Tasks

- [ ] **Monitor error rates**
- [ ] **Check performance metrics**
- [ ] **Verify all features work**
- [ ] **Update documentation**
- [ ] **Plan first iteration improvements**

---

## 🚨 Emergency Rollback Plan

If something goes wrong:

1. **Vercel:** Use previous deployment or revert commit
2. **Railway:** Rollback to previous deployment
3. **Database:** Restore from backup (if needed)
4. **DNS:** Point back to previous version

---

**📧 Need Help?** 
- Check platform-specific logs (Vercel/Railway dashboards)
- Verify environment variables match between platforms
- Test locally first before deploying changes