const ZapierService = require('./zapier')
const NotificationService = require('./notifications')

class MonitoringService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient
    this.zapierService = new ZapierService()
    this.notificationService = new NotificationService(supabaseClient)
  }

  async checkAllWorkflows() {
    try {
      console.log('🔍 Starting workflow monitoring cycle...')

      // Get all active integrations with Zapier API keys
      const { data: integrations, error: integrationsError } = await this.supabase
        .from('integrations')
        .select(`
          *,
          users (
            id,
            clerk_id,
            email
          )
        `)
        .not('zapier_api_key', 'is', null)
        .eq('is_active', true)

      if (integrationsError) {
        throw integrationsError
      }

      if (!integrations || integrations.length === 0) {
        console.log('ℹ️  No active integrations found')
        return
      }

      console.log(`📊 Found ${integrations.length} active integration(s) to check`)

      for (const integration of integrations) {
        try {
          await this.checkUserWorkflows(integration)
        } catch (error) {
          console.error(`❌ Error checking workflows for user ${integration.users.email}:`, error.message)
        }
      }

      console.log('✅ Workflow monitoring cycle completed')
    } catch (error) {
      console.error('❌ Error in checkAllWorkflows:', error)
      throw error
    }
  }

  async checkUserWorkflows(integration) {
    try {
      const user = integration.users
      const apiKey = integration.zapier_api_key

      console.log(`🔍 Checking workflows for user: ${user.email}`)

      // Fetch workflows from Zapier
      const zaps = await this.zapierService.getZaps(apiKey)
      
      if (!zaps || zaps.length === 0) {
        console.log(`ℹ️  No workflows found for user ${user.email}`)
        return
      }

      console.log(`📋 Found ${zaps.length} workflows for ${user.email}`)

      for (const zap of zaps) {
        await this.processWorkflow(user, zap, apiKey, integration)
      }

    } catch (error) {
      console.error('Error checking user workflows:', error)
      throw error
    }
  }

  async processWorkflow(user, zap, apiKey, integration) {
    try {
      // Get recent runs for this zap
      const zapRuns = await this.zapierService.getZapRuns(apiKey, zap.id, 20)
      
      // Calculate stats
      const stats = this.zapierService.calculateRunStats(zapRuns)
      const lastRunTime = this.zapierService.getLastRunTime(zapRuns)
      const errorMessage = this.zapierService.getLatestErrorMessage(zapRuns)
      const currentStatus = this.zapierService.parseZapStatus(zap.status)

      // Update or insert workflow log
      const { data: existingLog, error: fetchError } = await this.supabase
        .from('workflow_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('zap_id', zap.id.toString())
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      const workflowData = {
        user_id: user.id,
        zap_id: zap.id.toString(),
        workflow_name: zap.name || zap.title || `Workflow ${zap.id}`,
        status: currentStatus,
        last_run: lastRunTime,
        error_message: errorMessage,
        run_count: stats.run_count,
        success_count: stats.success_count,
        error_count: stats.error_count,
        is_enabled: zap.status === 'on'
      }

      let workflowLog
      if (existingLog) {
        // Update existing log
        const { data, error } = await this.supabase
          .from('workflow_logs')
          .update(workflowData)
          .eq('id', existingLog.id)
          .select()
          .single()

        if (error) throw error
        workflowLog = data

        // Check if status changed from success to error
        if (existingLog.status !== 'error' && currentStatus === 'error') {
          console.log(`🚨 Workflow "${zap.name}" has new errors for ${user.email}`)
          await this.sendFailureAlert(user, workflowLog, integration)
        }
      } else {
        // Insert new log
        const { data, error } = await this.supabase
          .from('workflow_logs')
          .insert(workflowData)
          .select()
          .single()

        if (error) throw error
        workflowLog = data

        // Send alert for new workflows that are in error state
        if (currentStatus === 'error') {
          console.log(`🚨 New workflow "${zap.name}" found with errors for ${user.email}`)
          await this.sendFailureAlert(user, workflowLog, integration)
        }
      }

    } catch (error) {
      console.error(`Error processing workflow ${zap.name}:`, error.message)
    }
  }

  async sendFailureAlert(user, workflowLog, integration) {
    try {
      const alertMessage = `Workflow "${workflowLog.workflow_name}" has failed.`
      const errorDetails = workflowLog.error_message || 'No specific error message available.'

      // Send Slack notification
      if (integration.slack_webhook_url) {
        const slackSent = await this.notificationService.sendSlackNotification(
          integration.slack_webhook_url,
          alertMessage,
          `Error: ${errorDetails}\nLast run: ${workflowLog.last_run ? new Date(workflowLog.last_run).toLocaleString() : 'Unknown'}`,
          'danger'
        )

        // Log alert history
        await this.logAlert(user.id, workflowLog.id, 'slack', slackSent, slackSent ? null : 'Failed to send Slack notification')
      }

      // Send email notification
      if (integration.alert_email) {
        const emailSent = await this.notificationService.sendEmailNotification(
          integration.alert_email,
          'Zapier Workflow Failed',
          `${alertMessage}\n\nError Details: ${errorDetails}\n\nLast Run: ${workflowLog.last_run ? new Date(workflowLog.last_run).toLocaleString() : 'Unknown'}`
        )

        // Log alert history
        await this.logAlert(user.id, workflowLog.id, 'email', emailSent, emailSent ? null : 'Failed to send email notification')
      }

    } catch (error) {
      console.error('Error sending failure alert:', error)
    }
  }

  async logAlert(userId, workflowLogId, alertType, success, errorMessage = null) {
    try {
      await this.supabase
        .from('alert_history')
        .insert({
          user_id: userId,
          workflow_log_id: workflowLogId,
          alert_type: alertType,
          success: success,
          error_message: errorMessage
        })
    } catch (error) {
      console.error('Error logging alert:', error)
    }
  }

  async syncUserWorkflows(clerkUserId) {
    try {
      // Get user from database
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUserId)
        .single()

      if (userError) {
        throw new Error('User not found')
      }

      // Get user's integration
      const { data: integration, error: integrationError } = await this.supabase
        .from('integrations')
        .select('*')
        .eq('user_id', userData.id)
        .single()

      if (integrationError || !integration || !integration.zapier_api_key) {
        throw new Error('No Zapier API key configured')
      }

      // Test API key
      const isValidKey = await this.zapierService.testConnection(integration.zapier_api_key)
      if (!isValidKey) {
        throw new Error('Invalid Zapier API key')
      }

      // Fetch and process all workflows
      const zaps = await this.zapierService.getZaps(integration.zapier_api_key)
      
      for (const zap of zaps) {
        await this.processWorkflow(
          { id: userData.id, clerk_id: clerkUserId }, 
          zap, 
          integration.zapier_api_key, 
          integration
        )
      }

      return true
    } catch (error) {
      console.error('Error syncing user workflows:', error)
      return false
    }
  }
}

module.exports = MonitoringService