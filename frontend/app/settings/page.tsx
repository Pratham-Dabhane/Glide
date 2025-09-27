'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Save, Key, Mail, MessageSquare, TestTube, Check, X, AlertCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'

interface Integration {
  zapier_api_key: string
  slack_webhook_url: string
  alert_email: string
}

export default function SettingsPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [integration, setIntegration] = useState<Integration>({
    zapier_api_key: '',
    slack_webhook_url: '',
    alert_email: user?.emailAddresses?.[0]?.emailAddress || '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<{slack: boolean, zapier: boolean}>({slack: false, zapier: false})
  const [testResults, setTestResults] = useState<{slack: string | null, zapier: string | null}>({slack: null, zapier: null})

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
      return
    }

    if (isSignedIn) {
      fetchIntegration()
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress && !integration.alert_email) {
      setIntegration(prev => ({ ...prev, alert_email: user.emailAddresses[0].emailAddress || '' }))
    }
  }, [user, integration.alert_email])

  const fetchIntegration = async () => {
    if (!user) return
    
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/integrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const integrationData = data?.integration ?? data
        if (integrationData) {
          setIntegration({
            zapier_api_key: integrationData.zapier_api_key || '',
            slack_webhook_url: integrationData.slack_webhook_url || '',
            alert_email: integrationData.alert_email || user?.emailAddresses?.[0]?.emailAddress || '',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching integration:', error)
      toast.error('Failed to load integration settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/integrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(integration),
      })

      if (response.ok) {
        toast.success('Integration settings saved successfully!')
        setTestResults({slack: null, zapier: null})
      } else {
        throw new Error('Failed to save integration settings')
      }
    } catch (error) {
      console.error('Error saving integration:', error)
      toast.error('Failed to save integration settings')
    } finally {
      setSaving(false)
    }
  }

  const testSlackWebhook = async () => {
    if (!integration.slack_webhook_url) {
      toast.error('Please enter a Slack webhook URL first')
      return
    }

    setTesting(prev => ({...prev, slack: true}))
    
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/integrations/test-slack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ webhook_url: integration.slack_webhook_url }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setTestResults(prev => ({...prev, slack: 'success'}))
        toast.success('Slack webhook test successful!')
      } else {
        setTestResults(prev => ({...prev, slack: 'error'}))
        toast.error(`Slack test failed: ${data.message}`)
      }
    } catch (error) {
      console.error('Error testing Slack webhook:', error)
      setTestResults(prev => ({...prev, slack: 'error'}))
      toast.error('Failed to test Slack webhook')
    } finally {
      setTesting(prev => ({...prev, slack: false}))
    }
  }

  const testZapierConnection = async () => {
    if (!integration.zapier_api_key) {
      toast.error('Please enter a Zapier API key first')
      return
    }

    setTesting(prev => ({...prev, zapier: true}))
    
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/integrations/test-zapier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ api_key: integration.zapier_api_key }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setTestResults(prev => ({...prev, zapier: 'success'}))
        toast.success('Zapier API connection successful!')
      } else {
        setTestResults(prev => ({...prev, zapier: 'error'}))
        toast.error(`Zapier test failed: ${data.message}`)
      }
    } catch (error) {
      console.error('Error testing Zapier connection:', error)
      setTestResults(prev => ({...prev, zapier: 'error'}))
      toast.error('Failed to test Zapier connection')
    } finally {
      setTesting(prev => ({...prev, zapier: false}))
    }
  }

  const getTestResultIcon = (result: string | null) => {
    switch (result) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />
      case 'error':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Integration Settings</h1>
        <p className="mt-2" style={{ color: '#6B7280' }}>
          Configure your API keys and notification settings
        </p>
      </div>



      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
        {/* Zapier API Configuration */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Key className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Zapier API Key
              </h3>
            </div>
            
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Enter your Zapier API key to monitor your workflows. You can find this in your{' '}
                <a 
                  href="https://zapier.com/app/developer" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  Zapier Developer account
                </a>.
              </p>
            </div>

            <div className="mt-5 flex space-x-3">
              <div className="flex-1">
                <label htmlFor="zapier_api_key" className="sr-only">
                  Zapier API Key
                </label>
                <input
                  type="password"
                  name="zapier_api_key"
                  id="zapier_api_key"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your Zapier API key"
                  value={integration.zapier_api_key}
                  onChange={(e) => setIntegration(prev => ({ ...prev, zapier_api_key: e.target.value }))}
                />
              </div>
              <button
                type="button"
                onClick={testZapierConnection}
                disabled={testing.zapier || !integration.zapier_api_key}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:border-blue-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <TestTube className={`h-4 w-4 mr-1 ${testing.zapier ? 'animate-pulse' : ''}`} />
                {testing.zapier ? 'Testing...' : 'Test'}
                {getTestResultIcon(testResults.zapier)}
              </button>
            </div>
          </div>
        </div>

        {/* Slack Webhook Configuration */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Slack Webhook
              </h3>
            </div>
            
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Configure a Slack webhook to receive notifications when workflows fail. Create one in your{' '}
                <a 
                  href="https://api.slack.com/incoming-webhooks" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  Slack workspace settings
                </a>.
              </p>
            </div>

            <div className="mt-5 flex space-x-3">
              <div className="flex-1">
                <label htmlFor="slack_webhook_url" className="sr-only">
                  Slack Webhook URL
                </label>
                <input
                  type="url"
                  name="slack_webhook_url"
                  id="slack_webhook_url"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://hooks.slack.com/services/..."
                  value={integration.slack_webhook_url}
                  onChange={(e) => setIntegration(prev => ({ ...prev, slack_webhook_url: e.target.value }))}
                />
              </div>
              <button
                type="button"
                onClick={testSlackWebhook}
                disabled={testing.slack || !integration.slack_webhook_url}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:border-blue-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <TestTube className={`h-4 w-4 mr-1 ${testing.slack ? 'animate-pulse' : ''}`} />
                {testing.slack ? 'Testing...' : 'Test'}
                {getTestResultIcon(testResults.slack)}
              </button>
            </div>
          </div>
        </div>

        {/* Email Alert Configuration */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Email Alerts
              </h3>
            </div>
            
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Email address where you want to receive workflow failure notifications.
              </p>
            </div>

            <div className="mt-5">
              <label htmlFor="alert_email" className="sr-only">
                Alert Email
              </label>
              <input
                type="email"
                name="alert_email"
                id="alert_email"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="your-email@example.com"
                value={integration.alert_email}
                onChange={(e) => setIntegration(prev => ({ ...prev, alert_email: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Need help?</h4>
        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <strong>Zapier API Key:</strong> Visit your{' '}
            <a href="https://zapier.com/app/developer" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              Zapier Developer Dashboard
            </a>{' '}
            to generate an API key.
          </div>
          <div>
            <strong>Slack Webhook:</strong> Create an incoming webhook in your{' '}
            <a href="https://api.slack.com/incoming-webhooks" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              Slack workspace
            </a>{' '}
            to receive notifications.
          </div>
          <div>
            <strong>Email Alerts:</strong> We'll send email notifications to this address when workflows fail.
          </div>
        </div>
      </div>
    </div>
  )
}