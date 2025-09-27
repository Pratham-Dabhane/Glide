'use client'

import Link from 'next/link'
import { ArrowLeft, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react'

export default function DemoDashboard() {
  // Demo data to show the UI
  const demoWorkflows = [
    {
      id: '1',
      workflow_name: 'Gmail to Slack Notifications',
      status: 'success',
      last_run: '2025-09-27T10:30:00Z',
      success_count: 847,
      error_count: 3,
      run_count: 850,
      error_message: null
    },
    {
      id: '2', 
      workflow_name: 'New Customer Onboarding',
      status: 'error',
      last_run: '2025-09-27T09:15:00Z', 
      success_count: 124,
      error_count: 8,
      run_count: 132,
      error_message: 'Authentication failed for Google Sheets connection'
    },
    {
      id: '3',
      workflow_name: 'Invoice Processing Automation',
      status: 'success',
      last_run: '2025-09-27T08:45:00Z',
      success_count: 1243,
      error_count: 12,
      run_count: 1255,
      error_message: null
    },
    {
      id: '4',
      workflow_name: 'Lead Scoring Pipeline',
      status: 'paused',
      last_run: '2025-09-26T16:20:00Z',
      success_count: 89,
      error_count: 0,
      run_count: 89,
      error_message: null
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      case 'paused':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'running':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'paused':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatLastRun = (timestamp: string) => {
    const now = new Date()
    const lastRun = new Date(timestamp)
    const diffMs = now.getTime() - lastRun.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ago`
    } else {
      return `${diffMinutes}m ago`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 mr-8">
                Glide
              </Link>
              <nav className="hidden sm:flex sm:space-x-8">
                <span className="border-b-2 border-blue-600 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Dashboard
                </span>
                <span className="border-transparent text-gray-500 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Settings
                </span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Demo Mode</span>
              <Link 
                href="/" 
                className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Demo Dashboard</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>This is a demonstration of the Glide dashboard with sample data. To access real workflow monitoring, you'll need to sign up and connect your Zapier API key.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-sm text-gray-700">
                Monitor your Zapier workflows and get real-time alerts for failures.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Workflows</dt>
                        <dd className="text-lg font-medium text-gray-900">4</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Failed Today</dt>
                        <dd className="text-lg font-medium text-gray-900">1</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <RefreshCw className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                        <dd className="text-lg font-medium text-gray-900">95.2%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Runs</dt>
                        <dd className="text-lg font-medium text-gray-900">2,326</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflows Table */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Workflow Monitoring</h1>
                    <p className="mt-2 text-sm text-gray-700">
                      Monitor the status and performance of your Zapier workflows
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                              Workflow Name
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Status
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Last Run
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Success Rate
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Error Message
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {demoWorkflows.map((workflow) => {
                            const successRate = workflow.run_count > 0 
                              ? Math.round((workflow.success_count / workflow.run_count) * 100) 
                              : 0
                            
                            return (
                              <tr key={workflow.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                                  <div className="flex items-center">
                                    {getStatusIcon(workflow.status)}
                                    <div className="ml-3">
                                      <div className="font-medium text-gray-900">{workflow.workflow_name}</div>
                                      <div className="text-gray-500 text-xs">ID: {workflow.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                  <span className={getStatusBadge(workflow.status)}>
                                    {workflow.status}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                  {formatLastRun(workflow.last_run)}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <div className="flex-1">
                                      <div className={`text-sm font-medium ${successRate >= 90 ? 'text-green-600' : successRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {successRate}%
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {workflow.success_count}/{workflow.run_count} runs
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 max-w-xs">
                                  {workflow.error_message ? (
                                    <div className="truncate" title={workflow.error_message}>
                                      {workflow.error_message}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">No errors</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}