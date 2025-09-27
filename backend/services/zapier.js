const axios = require('axios')

class ZapierService {
  constructor() {
    this.baseURL = 'https://zapier.com/api/v1'
  }

  async testConnection(apiKey) {
    try {
      const response = await axios.get(`${this.baseURL}/me`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      })

      return response.status === 200
    } catch (error) {
      console.error('Zapier connection test failed:', error.response?.data || error.message)
      return false
    }
  }

  async getZaps(apiKey) {
    try {
      const response = await axios.get(`${this.baseURL}/zaps`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        params: {
          limit: 100 // Get up to 100 zaps
        },
        timeout: 15000
      })

      return response.data?.objects || []
    } catch (error) {
      console.error('Error fetching Zapier zaps:', error.response?.data || error.message)
      throw new Error('Failed to fetch Zapier workflows')
    }
  }

  async getZapHistory(apiKey, zapId, limit = 10) {
    try {
      const response = await axios.get(`${this.baseURL}/zaps/${zapId}/taskhistory`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        params: {
          limit
        },
        timeout: 15000
      })

      return response.data?.objects || []
    } catch (error) {
      console.error('Error fetching Zapier zap history:', error.response?.data || error.message)
      return []
    }
  }

  async getZapRuns(apiKey, zapId, limit = 50) {
    try {
      const response = await axios.get(`${this.baseURL}/zaps/${zapId}/zapruns`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        params: {
          limit
        },
        timeout: 15000
      })

      return response.data?.objects || []
    } catch (error) {
      console.error('Error fetching Zapier zap runs:', error.response?.data || error.message)
      return []
    }
  }

  parseZapStatus(status) {
    // Map Zapier statuses to our internal statuses
    const statusMap = {
      'on': 'success',
      'off': 'paused',
      'draft': 'paused',
      'error': 'error',
      'throttled': 'throttled',
      'halted': 'halted',
      'paused': 'paused'
    }

    return statusMap[status] || 'unknown'
  }

  calculateRunStats(zapRuns) {
    let successCount = 0
    let errorCount = 0
    let totalCount = zapRuns.length

    zapRuns.forEach(run => {
      if (run.status === 'success') {
        successCount++
      } else if (run.status === 'error' || run.status === 'halted') {
        errorCount++
      }
    })

    return {
      run_count: totalCount,
      success_count: successCount,
      error_count: errorCount
    }
  }

  getLatestErrorMessage(zapRuns) {
    const errorRuns = zapRuns.filter(run => 
      run.status === 'error' || run.status === 'halted'
    )
    
    if (errorRuns.length === 0) return null
    
    // Get the most recent error
    const latestError = errorRuns.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )[0]

    return latestError.message || latestError.error || 'Unknown error occurred'
  }

  getLastRunTime(zapRuns) {
    if (zapRuns.length === 0) return null

    const sortedRuns = zapRuns.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )

    return sortedRuns[0].created_at
  }

  // Legacy methods for backward compatibility
  async testApiKey(apiKey) {
    return this.testConnection(apiKey)
  }

  async fetchWorkflows(apiKey) {
    return this.getZaps(apiKey)
  }

  async fetchWorkflowRuns(apiKey, workflowId) {
    return this.getZapRuns(apiKey, workflowId)
  }

  async getWorkflowRuns(apiKey, workflowId) {
    return this.getZapRuns(apiKey, workflowId)
  }

  async fetchUserWorkflows(apiKey) {
    return this.getZaps(apiKey)
  }
}

module.exports = ZapierService