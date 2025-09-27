const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { createClient } = require('@supabase/supabase-js')
const { clerkClient } = require('@clerk/clerk-sdk-node')
const cron = require('node-cron')

// Import services
const ZapierService = require('./services/zapier')
const MonitoringService = require('./services/monitoring')
const NotificationService = require('./services/notifications')

const app = express()
const port = process.env.PORT || 5000

// Middleware
// Security headers and logging
app.use(helmet())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// CORS with allowlist support via FRONTEND_URL and CORS_ORIGINS (comma-separated)
const allowlist = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()) : [])
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowlist.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Initialize Supabase client (support both SERVICE_KEY and SERVICE_ROLE_KEY env names)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize services
const zapierService = new ZapierService()
const notificationService = new NotificationService(supabase)
const monitoringService = new MonitoringService(supabase, zapierService, notificationService)

// Authentication middleware
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Handle demo mode
    if (token === 'demo-token') {
      req.user = { 
        id: 'demo-user-id', 
        email: 'demo@example.com',
        name: 'Demo User',
        isDemoMode: true
      }
      return next()
    }

    // Validate Clerk JWT token
    try {
      const decoded = await clerkClient.verifyToken(token)
      const user = await clerkClient.users.getUser(decoded.sub)
      
      req.user = {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress,
        name: user.fullName || user.firstName + ' ' + user.lastName,
        isDemoMode: false
      }
      
      next()
    } catch (clerkError) {
      console.error('Clerk token validation failed:', clerkError)
      return res.status(401).json({ error: 'Invalid token' })
    }
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(401).json({ error: 'Authentication failed' })
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    service: 'glide-backend'
  })
})

// ==================== AUTHENTICATION ROUTES ====================

// Get current user
app.get('/api/user', authenticateUser, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      isDemoMode: req.user.isDemoMode,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

// ==================== INTEGRATION ROUTES ====================

// Get user's integration settings
app.get('/api/integrations', authenticateUser, async (req, res) => {
  try {
    if (req.user.isDemoMode) {
      // Return demo integration
      return res.json({
        integration: {
          id: 'demo-integration-id',
          user_id: 'demo-user-id',
          zapier_api_key: 'demo_api_key_*****',
          slack_webhook_url: 'https://hooks.slack.com/services/demo/webhook',
          alert_email: 'demo@example.com',
          monitoring_enabled: true,
          check_interval: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
    }

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', req.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const integration = data
      ? {
          ...data,
          alert_email: data.email_alert,
        }
      : null

    res.json({ integration })
  } catch (error) {
    console.error('Get integrations error:', error)
    res.status(500).json({ error: 'Failed to fetch integrations' })
  }
})

// Create or update integration
app.post('/api/integrations', authenticateUser, async (req, res) => {
  try {
    const { zapier_api_key, slack_webhook_url, alert_email, monitoring_enabled, check_interval } = req.body
    
    if (req.user.isDemoMode) {
      return res.json({
        integration: {
          id: 'demo-integration-id',
          user_id: 'demo-user-id',
          zapier_api_key: zapier_api_key,
          slack_webhook_url: slack_webhook_url,
          alert_email: alert_email,
          monitoring_enabled: monitoring_enabled ?? true,
          check_interval: check_interval || 5,
          updated_at: new Date().toISOString()
        }
      })
    }

    const { data, error } = await supabase
      .from('integrations')
      .upsert({
        user_id: req.user.id,
        zapier_api_key,
        slack_webhook_url,
        email_alert: alert_email,
        monitoring_enabled: monitoring_enabled ?? true,
        check_interval: check_interval || 5,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    res.json({ integration: { ...data, alert_email: data.email_alert } })
  } catch (error) {
    console.error('Save integrations error:', error)
    res.status(500).json({ error: 'Failed to save integrations' })
  }
})

// Test Zapier connection (legacy route)
app.post('/api/test-zapier', async (req, res) => {
  try {
    const { api_key } = req.body
    
    if (!api_key) {
      return res.status(400).json({ error: 'API key is required' })
    }

    const result = await zapierService.testConnection(api_key)
    res.json(result)
  } catch (error) {
    console.error('Test Zapier error:', error)
    res.status(500).json({ error: 'Failed to test Zapier connection' })
  }
})

// Test notifications (legacy route)
app.post('/api/test-notifications', async (req, res) => {
  try {
    const { slack_webhook_url, alert_email } = req.body
    
    const results = await notificationService.sendTestNotifications(slack_webhook_url, alert_email)
    res.json({
      success: results.slack || results.email,
      results: results
    })
  } catch (error) {
    console.error('Test notifications error:', error)
    res.status(500).json({ error: 'Failed to test notifications' })
  }
})

// ==================== INTEGRATION TEST ROUTES (for frontend) ====================

// Test Slack webhook
app.post('/api/integrations/test-slack', authenticateUser, async (req, res) => {
  try {
    const { webhook_url } = req.body
    if (!webhook_url) {
      return res.status(400).json({ success: false, message: 'webhook_url is required' })
    }

    const ok = await notificationService.sendSlackNotification(
      webhook_url,
      '🧪 Test Notification from Glide',
      'This is a test message to verify your Slack integration is working correctly.',
      'good'
    )

    if (ok) {
      return res.json({ success: true })
    }
    return res.status(400).json({ success: false, message: 'Slack webhook test failed' })
  } catch (error) {
    console.error('Test Slack error:', error)
    return res.status(500).json({ success: false, message: 'Failed to test Slack webhook' })
  }
})

// Test Zapier connection (frontend expected route)
app.post('/api/integrations/test-zapier', authenticateUser, async (req, res) => {
  try {
    const { api_key } = req.body
    if (!api_key) {
      return res.status(400).json({ success: false, message: 'api_key is required' })
    }

    const result = await zapierService.testConnection(api_key)
    // Normalize response to { success, ... }
    const success = !!(result && (result.success === true || result.ok === true))
    if (success) {
      return res.json({ success: true, ...result })
    }
    return res.status(400).json({ success: false, message: result?.message || 'Zapier connection failed' })
  } catch (error) {
    console.error('Test Zapier (integrations) error:', error)
    return res.status(500).json({ success: false, message: 'Failed to test Zapier connection' })
  }
})

// ==================== WORKFLOW ROUTES ====================

// Get user's workflows
app.get('/api/workflows', authenticateUser, async (req, res) => {
  try {
    if (req.user?.isDemoMode) {
      // Return demo workflows
      return res.json([
        {
          id: 'demo-workflow-1',
          workflow_id: 'wf_demo_1',
          workflow_name: 'Email to Slack Notification',
          status: 'on',
          last_run: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          run_count: 47,
          success_count: 45,
          error_count: 2,
          success_rate: 95.7,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() // 7 days ago
        },
        {
          id: 'demo-workflow-2',
          workflow_id: 'wf_demo_2',
          workflow_name: 'Form Submission to Google Sheets',
          status: 'on',
          last_run: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
          run_count: 23,
          success_count: 23,
          error_count: 0,
          success_rate: 100,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
        },
        {
          id: 'demo-workflow-3',
          workflow_id: 'wf_demo_3',
          workflow_name: 'Twitter to Discord',
          status: 'error',
          last_run: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          run_count: 15,
          success_count: 12,
          error_count: 3,
          success_rate: 80,
          error_message: 'Authentication failed with Discord API',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
        }
      ])
    }

    const { data: integration } = await supabase
      .from('integrations')
      .select('zapier_api_key')
  .eq('user_id', req.user.id)
      .single()

    if (!integration?.zapier_api_key) {
      return res.json([])
    }

    const workflows = await zapierService.getWorkflows(integration.zapier_api_key)
    res.json(workflows)
  } catch (error) {
    console.error('Get workflows error:', error)
    res.status(500).json({ error: 'Failed to fetch workflows' })
  }
})

// Get workflow runs/logs
app.get('/api/workflows/:workflowId/runs', authenticateUser, async (req, res) => {
  try {
    const { workflowId } = req.params
    const { limit = 50, offset = 0 } = req.query
    
    if (req.user?.isDemoMode) {
      // Return demo workflow runs
      const demoRuns = []
      for (let i = 0; i < parseInt(limit); i++) {
        demoRuns.push({
          id: `demo-run-${i + 1}`,
          workflow_id: workflowId,
          status: i === 0 && workflowId === 'wf_demo_3' ? 'error' : Math.random() > 0.1 ? 'success' : 'error',
          started_at: new Date(Date.now() - 1000 * 60 * (i * 30 + Math.random() * 30)).toISOString(),
          finished_at: new Date(Date.now() - 1000 * 60 * (i * 30 + Math.random() * 15)).toISOString(),
          error_message: i === 0 && workflowId === 'wf_demo_3' ? 'Authentication failed with Discord API' : null
        })
      }
      return res.json(demoRuns)
    }

    const { data, error } = await supabase
      .from('workflow_logs')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('started_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    console.error('Get workflow runs error:', error)
    res.status(500).json({ error: 'Failed to fetch workflow runs' })
  }
})

// ==================== MONITORING ROUTES ====================

// Get monitoring status
app.get('/api/monitoring/status', authenticateUser, async (req, res) => {
  try {
    if (req.user?.isDemoMode) {
      return res.json({
        enabled: true,
        last_check: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        next_check: new Date(Date.now() + 1000 * 60 * 5).toISOString(), // 5 minutes from now
        check_interval: 5,
        total_workflows: 3,
        active_workflows: 2,
        error_workflows: 1
      })
    }

    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
  .eq('user_id', req.user.id)
      .single()

    if (!integration) {
      return res.json({ enabled: false })
    }

    res.json({
      enabled: integration.monitoring_enabled,
      check_interval: integration.check_interval,
      last_updated: integration.updated_at
    })
  } catch (error) {
    console.error('Get monitoring status error:', error)
    res.status(500).json({ error: 'Failed to fetch monitoring status' })
  }
})

// Manual workflow check
app.post('/api/monitoring/check', authenticateUser, async (req, res) => {
  try {
    if (req.user?.isDemoMode) {
      return res.json({
        success: true,
        message: 'Demo mode: Manual check completed',
        checked_workflows: 3,
        issues_found: 1
      })
    }

  const result = await monitoringService.checkAllWorkflows(req.user.id)
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Manual check error:', error)
    res.status(500).json({ error: 'Failed to perform manual check' })
  }
})

// ==================== ALERT ROUTES ====================

// Get alert history
app.get('/api/alerts', authenticateUser, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    
    if (req.user?.isDemoMode) {
      const demoAlerts = [
        {
          id: 'demo-alert-1',
          user_id: 'demo-user-id',
          workflow_id: 'wf_demo_3',
          workflow_name: 'Twitter to Discord',
          alert_type: 'workflow_error',
          message: 'Workflow failed: Authentication failed with Discord API',
          sent_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          channels: ['email', 'slack']
        },
        {
          id: 'demo-alert-2',
          user_id: 'demo-user-id',
          workflow_id: 'wf_demo_1',
          workflow_name: 'Email to Slack Notification',
          alert_type: 'workflow_error',
          message: 'Workflow failed: Rate limit exceeded',
          sent_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          channels: ['email']
        }
      ]
      return res.json(demoAlerts.slice(parseInt(offset), parseInt(offset) + parseInt(limit)))
    }

    const { data, error } = await supabase
      .from('alert_history')
      .select('*')
  .eq('user_id', req.user.id)
      .order('sent_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    console.error('Get alerts error:', error)
    res.status(500).json({ error: 'Failed to fetch alerts' })
  }
})

// ==================== DASHBOARD STATS ====================

// Get dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '')
    
    if (token === 'demo-token') {
      return res.json({
        total_workflows: 3,
        active_workflows: 2,
        total_runs_today: 23,
        success_rate_today: 91.3,
        total_errors_today: 2,
        avg_response_time: 1.2
      })
    }

    // Fetch real stats from database
    const stats = await monitoringService.getDashboardStats('user-id')
    res.json(stats)
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

// ==================== CRON JOBS ====================

// Start monitoring cron job
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Starting monitoring cron job...')
  
  // Check workflows every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔄 Running scheduled workflow checks...')
    try {
      await monitoringService.runScheduledChecks()
    } catch (error) {
      console.error('❌ Scheduled check error:', error)
    }
  })
} else {
  console.log('🔧 Development mode: Cron jobs disabled')
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
  console.log(`📊 Health check: http://localhost:${port}/health`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})