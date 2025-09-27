const express = require('express');
const router = express.Router();

// Get or create integration settings for user
router.get('/', async (req, res) => {
  try {
    const { data: integration, error } = await req.supabase
      .from('integrations')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // No integration found, return empty settings
      return res.json({ 
        integration: {
          zapier_api_key: '',
          slack_webhook_url: '',
          email_alert: ''
        }
      });
    }

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch integration settings' });
    }

    // Don't expose the full API key for security
    const safeIntegration = {
      ...integration,
      zapier_api_key: integration.zapier_api_key ? '••••••••' : ''
    };

    res.json({ integration: safeIntegration });
  } catch (error) {
    console.error('Integration fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save or update integration settings
router.post('/', async (req, res) => {
  try {
    const { zapier_api_key, slack_webhook_url, email_alert } = req.body;

    // Check if integration exists
    const { data: existing } = await req.supabase
      .from('integrations')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    const integrationData = {
      user_id: req.user.id,
      slack_webhook_url: slack_webhook_url || null,
      email_alert: email_alert || null
    };

    // Only update API key if it's not the masked version
    if (zapier_api_key && zapier_api_key !== '••••••••') {
      integrationData.zapier_api_key = zapier_api_key;
    }

    let result;
    if (existing) {
      // Update existing integration
      result = await req.supabase
        .from('integrations')
        .update(integrationData)
        .eq('user_id', req.user.id)
        .select()
        .single();
    } else {
      // Create new integration
      result = await req.supabase
        .from('integrations')
        .insert(integrationData)
        .select()
        .single();
    }

    if (result.error) {
      return res.status(500).json({ error: 'Failed to save integration settings' });
    }

    // Don't expose the full API key for security
    const safeIntegration = {
      ...result.data,
      zapier_api_key: result.data.zapier_api_key ? '••••••••' : ''
    };

    res.json({ integration: safeIntegration });
  } catch (error) {
    console.error('Integration save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test Zapier API key
router.post('/test-zapier', async (req, res) => {
  try {
    const zapierService = require('../services/zapier');
    const { zapier_api_key } = req.body;

    if (!zapier_api_key || zapier_api_key === '••••••••') {
      return res.status(400).json({ error: 'API key is required' });
    }

    const isValid = await zapierService.testApiKey(zapier_api_key);
    
    if (isValid) {
      res.json({ valid: true, message: 'API key is valid' });
    } else {
      res.json({ valid: false, message: 'API key is invalid or expired' });
    }
  } catch (error) {
    console.error('API key test error:', error);
    res.status(500).json({ error: 'Failed to test API key' });
  }
});

module.exports = router;