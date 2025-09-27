const axios = require('axios')
const nodemailer = require('nodemailer')

class NotificationService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient
    this.setupEmailTransporter()
  }

  setupEmailTransporter() {
    // Setup email transporter based on environment
    if (process.env.SENDGRID_API_KEY) {
      // Use SendGrid
      this.emailTransporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      })
    } else if (process.env.SMTP_HOST) {
      // Use custom SMTP
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      })
    } else {
      // No email service configured
      this.emailTransporter = null
      console.warn('⚠️  No email service configured. Email notifications will be disabled.')
    }
  }

  async sendSlackNotification(webhookUrl, title, message, color = 'good') {
    try {
      const payload = {
        text: title,
        attachments: [
          {
            color: color, // 'good', 'warning', 'danger', or hex color
            fields: [
              {
                title: 'Details',
                value: message,
                short: false
              },
              {
                title: 'Timestamp',
                value: new Date().toISOString(),
                short: true
              }
            ],
            footer: 'Zapier Debugger & Monitor',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      }

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })

      if (response.status === 200) {
        console.log('✅ Slack notification sent successfully')
        return true
      } else {
        console.error('❌ Slack notification failed:', response.status, response.data)
        return false
      }

    } catch (error) {
      console.error('❌ Error sending Slack notification:', error.message)
      return false
    }
  }

  async sendEmailNotification(toEmail, subject, message) {
    try {
      if (!this.emailTransporter) {
        console.warn('⚠️  Email transporter not configured. Skipping email notification.')
        return false
      }

      const fromEmail = process.env.FROM_EMAIL || 'noreply@zapier-debugger.com'

      const mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: subject,
        text: message,
        html: this.generateEmailHTML(subject, message)
      }

      const result = await this.emailTransporter.sendMail(mailOptions)
      console.log('✅ Email notification sent successfully:', result.messageId)
      return true

    } catch (error) {
      console.error('❌ Error sending email notification:', error.message)
      return false
    }
  }

  generateEmailHTML(subject, message) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #6366f1;
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              border: 1px solid #e5e7eb;
            }
            .alert-box {
              background-color: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 6px;
              padding: 16px;
              margin: 20px 0;
            }
            .alert-title {
              color: #dc2626;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .btn {
              display: inline-block;
              background-color: #6366f1;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚨 Zapier Workflow Alert</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <div class="alert-title">${subject}</div>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>This alert was generated because one of your Zapier workflows encountered an issue.</p>
            
            <p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn">
                View Dashboard
              </a>
            </p>
            
            <p><strong>What to do next:</strong></p>
            <ul>
              <li>Check your Zapier dashboard for more details</li>
              <li>Review the workflow configuration</li>
              <li>Test the workflow manually if needed</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </div>
          <div class="footer">
            <p>This email was sent by Zapier Debugger & Monitor</p>
            <p>Generated at: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `
  }

  async sendTestNotifications(slackWebhookUrl, alertEmail) {
    const results = {
      slack: false,
      email: false
    }

    // Test Slack notification
    if (slackWebhookUrl) {
      results.slack = await this.sendSlackNotification(
        slackWebhookUrl,
        '🧪 Test Notification from Zapier Debugger',
        'This is a test message to verify your Slack integration is working correctly. If you received this message, your setup is successful!',
        'good'
      )
    }

    // Test email notification
    if (alertEmail) {
      results.email = await this.sendEmailNotification(
        alertEmail,
        '🧪 Test Email from Zapier Debugger',
        'This is a test email to verify your email integration is working correctly.\n\nIf you received this message, your email setup is successful!\n\nBest regards,\nZapier Debugger & Monitor Team'
      )
    }

    return results
  }

  async notifyWorkflowFailure(user, workflow, integration) {
    const title = `🚨 Workflow Failed: ${workflow.workflow_name}`
    const message = `Your Zapier workflow "${workflow.workflow_name}" has encountered an error.
    
Error Details: ${workflow.error_message || 'No specific error message available'}
Last Run: ${workflow.last_run ? new Date(workflow.last_run).toLocaleString() : 'Unknown'}
Total Runs: ${workflow.run_count}
Success Rate: ${workflow.run_count > 0 ? ((workflow.success_count / workflow.run_count) * 100).toFixed(1) : 0}%

Please check your Zapier dashboard for more details.`

    const results = {
      slack: false,
      email: false
    }

    // Send Slack notification
    if (integration.slack_webhook_url) {
      results.slack = await this.sendSlackNotification(
        integration.slack_webhook_url,
        title,
        message,
        'danger'
      )
    }

    // Send email notification
    if (integration.alert_email) {
      results.email = await this.sendEmailNotification(
        integration.alert_email,
        title.replace('🚨 ', ''),
        message
      )
    }

    return results
  }
}

module.exports = NotificationService