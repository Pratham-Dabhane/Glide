# Glide — Debug. Monitor. Automate. 🔍⚡

Glide is a micro‑SaaS for monitoring and debugging automation workflows with real-time alerts and notifications.

## 🚀 Features

- **Workflow Monitoring**: Real-time monitoring of all your Zapier workflows
- **Error Detection**: Automatic detection of workflow failures and errors
- **Multi-Channel Alerts**: Notifications via Slack and email when workflows fail
- **Success Metrics**: Track success rates and performance over time
- **Secure Authentication**: User authentication powered by Clerk
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Automated Monitoring**: Background cron jobs check workflows every 5 minutes

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase (client-side)
- **Deployment**: Vercel

### Backend (Node.js)
- **Framework**: Express.js
- **Authentication**: Clerk SDK
- **Database**: Supabase (server-side with service role)
- **Monitoring**: Node-cron for scheduled tasks
- **Notifications**: Slack webhooks + SendGrid for email
- **Deployment**: Railway (recommended) or Vercel

### Database (Supabase)
- **Users**: Store user profiles linked to Clerk
- **Integrations**: API keys and notification preferences
- **Workflow Logs**: Workflow status, runs, and error history

## 📁 Project Structure

```
glide/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js 13+ app directory
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── settings/        # Settings page
│   │   ├── sign-in/         # Authentication pages
│   │   └── sign-up/
│   ├── components/          # Reusable UI components
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── routes/             # Express route handlers
│   ├── services/           # Business logic services
│   │   ├── zapier.js       # Zapier API integration
│   │   ├── monitoring.js   # Workflow monitoring service
│   │   └── notifications.js # Slack/email notifications
│   └── package.json
├── supabase/               # Database schema and migrations
│   ├── migrations/         # SQL migration files
│   └── README.md
├── DEPLOYMENT.md           # Deployment instructions
└── README.md              # This file
```

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS | Modern React framework with SSR/SSG |
| **Backend** | Node.js, Express.js | RESTful API server |
| **Database** | Supabase (PostgreSQL) | Real-time database with auth |
| **Authentication** | Clerk | Complete auth solution |
| **Monitoring** | Node-cron | Scheduled workflow checking |
| **Notifications** | SendGrid, Slack Webhooks | Multi-channel alerts |
| **Deployment** | Vercel, Railway | Serverless and container deployment |

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Clerk account  
- Zapier account with API access
- SendGrid account (for email notifications)

### 1. Clone Repository

```bash
git clone <repository-url>
cd glide
```

### 2. Setup Backend

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# CLERK_SECRET_KEY=sk_test_...
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
# SENDGRID_API_KEY=SG...
# FROM_EMAIL=noreply@yourdomain.com

# Start development server
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your credentials
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Start development server  
npm run dev
```

### 4. Setup Database

```bash
cd supabase

# Option A: Using Supabase CLI
npx supabase init
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push

# Option B: Manual setup via Supabase dashboard
# Copy contents of migrations/001_initial_schema.sql 
# Paste in SQL Editor and execute
```

### 5. Configure Services

1. **Clerk**: Set up authentication, configure redirect URLs
2. **Supabase**: Create project, run migrations, configure RLS
3. **SendGrid**: Create API key, verify sender domain
4. **Zapier**: Generate API key from developer settings

### 6. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

## 📊 Usage

### 1. User Registration
- Sign up using Clerk authentication
- User profile automatically created in Supabase

### 2. Configure Integration
- Navigate to Settings page
- Add your Zapier API key
- Optionally configure Slack webhook URL
- Set email for failure notifications

### 3. Monitor Workflows
- Dashboard shows all your Zapier workflows
- Real-time status updates every 5 minutes
- Success rates and error tracking
- Manual refresh capability

### 4. Receive Alerts
- Automatic notifications when workflows fail
- Slack messages with detailed error information
- Email alerts with actionable recommendations
- Configurable notification preferences

## 🔧 API Endpoints

### Authentication
- All endpoints require Bearer token from Clerk

### Workflows
- `GET /api/workflows` - List user workflows
- `POST /api/workflows/refresh` - Manual refresh from Zapier
- `GET /api/workflows/:id` - Get workflow details

### Integration
- `GET /api/integration` - Get integration settings
- `POST /api/integration` - Save integration settings
- `POST /api/integration/test-zapier` - Test Zapier API key

### User Management
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Webhooks
- `POST /api/webhook/zapier` - Zapier webhook endpoint

## 🔐 Security

### Authentication
- JWT tokens via Clerk
- Row Level Security (RLS) in Supabase
- API key encryption

### Data Protection
- Environment variables for all secrets
- HTTPS enforcement in production
- CORS configuration
- Request rate limiting

### Best Practices
- Regular dependency updates
- Security headers via Helmet.js
- Input validation and sanitization
- Error handling without information leakage

## 📈 Monitoring & Observability

### Application Health
- Health check endpoints
- Structured logging
- Error tracking and alerting

### Performance Monitoring
- API response time tracking
- Database query optimization
- Workflow polling efficiency

### User Analytics
- User engagement tracking
- Feature usage analytics
- Success/failure metrics

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
```bash
cd frontend
vercel --prod
```

**Backend (Railway):**
```bash
cd backend
railway up
```

### Environment Variables

Ensure all required environment variables are set in your deployment platform:

**Frontend:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY` 
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

**Backend:**
- `CLERK_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENDGRID_API_KEY`
- `FROM_EMAIL`

## 🧪 Testing

### Manual Testing
1. User registration/login flow
2. Zapier API key validation
3. Workflow data fetching
4. Alert notification delivery
5. Dashboard functionality

### Automated Testing (Future Enhancement)
- Unit tests for service functions
- Integration tests for API endpoints
- E2E tests for critical user flows

## 📋 Roadmap

### Phase 1 (Current)
- ✅ Basic workflow monitoring
- ✅ Error detection and alerts
- ✅ Slack and email notifications
- ✅ User authentication

### Phase 2 (Future)
- [ ] Advanced analytics and insights
- [ ] Workflow performance trends
- [ ] Custom alert rules and thresholds
- [ ] Team collaboration features

### Phase 3 (Future)
- [ ] Zapier marketplace integration
- [ ] Multi-tenant support
- [ ] Advanced reporting and exports
- [ ] Mobile application

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support and questions:
- Create an issue in the repository
- Check the [DEPLOYMENT.md](DEPLOYMENT.md) for common issues
- Review logs in your deployment platform

## 🎯 Business Model

This application can be monetized as a SaaS product:

### Pricing Tiers
- **Free**: Up to 5 workflows, basic alerts
- **Pro**: Unlimited workflows, advanced analytics, priority support
- **Enterprise**: Team features, custom integrations, SLA

### Revenue Streams
- Monthly/annual subscriptions
- Usage-based pricing for high-volume users
- Professional services for custom integrations

---

**Built with ❤️ using Next.js, Node.js, and modern web technologies**