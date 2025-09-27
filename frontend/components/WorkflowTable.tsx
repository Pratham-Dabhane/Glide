'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, RefreshCw, Pause, StopCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
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

interface WorkflowTableProps {
  workflows: WorkflowLog[]
  onRefresh: () => void
  loading?: boolean
}

export default function WorkflowTable({ workflows, onRefresh, loading = false }: WorkflowTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-500" />
      case 'halted':
        return <StopCircle className="w-5 h-5 text-red-500" />
      case 'throttled':
        return <Clock className="w-5 h-5 text-orange-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'halted':
        return 'bg-red-100 text-red-800'
      case 'throttled':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatLastRun = (lastRun: string) => {
    try {
      return formatDistanceToNow(new Date(lastRun), { addSuffix: true })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const calculateSuccessRate = (success: number, total: number) => {
    if (total === 0) return 0
    return ((success / total) * 100).toFixed(1)
  }

  if (workflows.length === 0 && !loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
          <p className="text-gray-500 mb-6">
            Connect your Zapier account to start monitoring your workflows.
          </p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Workflows
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Workflow Monitor
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Real-time status of your Zapier workflows
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Workflow
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Run
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Success Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Runs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Error Message
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workflows.map((workflow) => (
              <tr key={workflow.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {workflow.workflow_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {workflow.zap_id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(workflow.status)}
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {workflow.last_run ? formatLastRun(workflow.last_run) : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {calculateSuccessRate(workflow.success_count, workflow.run_count)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${calculateSuccessRate(workflow.success_count, workflow.run_count)}%`
                      }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span className="text-green-600">✓ {workflow.success_count}</span>
                    <span className="text-red-600">✗ {workflow.error_count}</span>
                    <span className="text-gray-500">Total: {workflow.run_count}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs">
                  {workflow.error_message ? (
                    <div className="truncate" title={workflow.error_message}>
                      {workflow.error_message}
                    </div>
                  ) : (
                    <span className="text-gray-400">No errors</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-4 py-3 sm:px-6">
        <div className="text-sm text-gray-500">
          Showing {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
          {workflows.length > 0 && (
            <span className="ml-4">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}