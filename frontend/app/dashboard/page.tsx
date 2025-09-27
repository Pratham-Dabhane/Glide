'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import WorkflowTable from '@/components/WorkflowTable'
import Link from 'next/link'
import { RefreshCw, Settings, Plus, AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface WorkflowLog {
  id: string
  zap_id: string
  workflow_name: string
  status: 'success' | 'error' | 'running' | 'paused' | 'halted' | 'throttled'
  last_run: string | null
  error_message?: string | null
  run_count: number
  success_count: number
  error_count: number
  is_enabled: boolean
}

interface DashboardStats {
  total_workflows: number
  active_workflows: number
  error_workflows: number
  success_rate: number
}

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [workflows, setWorkflows] = useState<WorkflowLog[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasIntegration, setHasIntegration] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
      return
    }

    if (isSignedIn) {
      fetchWorkflows()
      checkIntegration()
    }
  }, [isLoaded, isSignedIn, router])

  const fetchWorkflows = async () => {
    if (!user) return
    
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workflows`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch workflows')
      }

      const data = await response.json()
      setWorkflows(data.workflows || [])
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching workflows:', error)
      // Fallback to demo data if API fails or in demo mode
      const token = await getToken()
      if (!token) {
        setWorkflows([
          {
            id: '1',
            zap_id: 'demo_zap_1',
            workflow_name: 'Email to Slack Notification',
            status: 'success',
            last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            run_count: 150,
            success_count: 148,
            error_count: 2,
            is_enabled: true
          },
          {
            id: '2',
            zap_id: 'demo_zap_2',
            workflow_name: 'Form Submission to Airtable',
            status: 'error',
            last_run: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            run_count: 75,
            success_count: 70,
            error_count: 5,
            error_message: 'API rate limit exceeded - Airtable returned 429',
            is_enabled: true
          },
          {
            id: '3',
            zap_id: 'demo_zap_3',
            workflow_name: 'Shopify Order to Google Sheets',
            status: 'success',
            last_run: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            run_count: 200,
            success_count: 195,
            error_count: 5,
            is_enabled: true
          },
          {
            id: '4',
            zap_id: 'demo_zap_4',
            workflow_name: 'RSS Feed to Twitter',
            status: 'halted',
            last_run: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            run_count: 50,
            success_count: 45,
            error_count: 5,
            error_message: 'Twitter API authentication failed - invalid credentials',
            is_enabled: false
          },
          {
            id: '5',
            zap_id: 'demo_zap_5',
            workflow_name: 'Gmail to Trello Card',
            status: 'success',
            last_run: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            run_count: 300,
            success_count: 298,
            error_count: 2,
            is_enabled: true
          }
        ])
        
        setStats({
          total_workflows: 5,
          active_workflows: 4,
          error_workflows: 2,
          success_rate: 94.2
        })
      } else {
        toast.error('Failed to fetch workflows')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const checkIntegration = async () => {
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
        setHasIntegration(!!data?.zapier_api_key)
      } else {
        setHasIntegration(false)
      }
    } catch (error) {
      console.error('Error checking integration:', error)
      setHasIntegration(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchWorkflows()
    toast.success('Workflows refreshed')
  }

  const handleSync = async () => {
    if (!hasIntegration) {
      toast.error('Please configure your Zapier API key in settings first')
      return
    }

    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workflows/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success('Syncing workflows from Zapier...')
        setTimeout(() => {
          fetchWorkflows()
        }, 2000)
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      console.error('Error syncing workflows:', error)
      toast.error('Failed to sync workflows')
    }
  }

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Monitor your Zapier workflows in real-time
            </p>
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Workflows
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.total_workflows}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Workflows
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.active_workflows}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Workflows with Errors
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.error_workflows}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">%</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Success Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.success_rate.toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          {hasIntegration ? (
            <button
              onClick={handleSync}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Sync from Zapier
            </button>
          ) : (
            <Link
              href="/settings"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
            >
              <Settings className="h-4 w-4 mr-2" />
              Setup Zapier API Key
            </Link>
          )}
        </div>

        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* No Integration Warning */}
      {!hasIntegration && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Zapier Integration Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  To monitor your real Zapier workflows, please configure your API key in{' '}
                  <Link href="/settings" className="font-medium underline">
                    Settings
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflows Table */}
      {loading ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <WorkflowTable workflows={workflows} onRefresh={handleRefresh} />
      )}

      {workflows.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows</h3>
          <p className="mt-1 text-sm text-gray-500">
            {hasIntegration 
              ? 'Click "Sync from Zapier" to import your workflows.'
              : 'Configure your Zapier API key to get started.'
            }
          </p>
        </div>
      )}
    </div>
  )
}