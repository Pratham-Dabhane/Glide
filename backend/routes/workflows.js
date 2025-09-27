const express = require('express');
const router = express.Router();
const zapierService = require('../services/zapier');

// Get all workflows for user
router.get('/', async (req, res) => {
  try {
    // Get user's Zapier API key
    const { data: integration } = await req.supabase
      .from('integrations')
      .select('zapier_api_key')
      .eq('user_id', req.user.id)
      .single();

    if (!integration?.zapier_api_key) {
      return res.json({ workflows: [] });
    }

    // Fetch workflows from database
    const { data: workflows, error } = await req.supabase
      .from('workflow_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch workflows' });
    }

    res.json({ workflows: workflows || [] });
  } catch (error) {
    console.error('Workflows fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manually refresh workflows from Zapier API
router.post('/refresh', async (req, res) => {
  try {
    // Get user's Zapier API key
    const { data: integration } = await req.supabase
      .from('integrations')
      .select('zapier_api_key')
      .eq('user_id', req.user.id)
      .single();

    if (!integration?.zapier_api_key) {
      return res.status(400).json({ error: 'Zapier API key not configured' });
    }

    // Fetch workflows from Zapier
    const zapierWorkflows = await zapierService.fetchWorkflows(integration.zapier_api_key);
    
    if (!zapierWorkflows) {
      return res.status(400).json({ error: 'Failed to fetch workflows from Zapier' });
    }

    // Update workflow logs in database
    const updatedWorkflows = [];
    for (const workflow of zapierWorkflows) {
      const { data: existing } = await req.supabase
        .from('workflow_logs')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('workflow_id', workflow.id)
        .single();

      const workflowData = {
        user_id: req.user.id,
        workflow_id: workflow.id,
        workflow_name: workflow.name || `Workflow ${workflow.id}`,
        status: workflow.status === 'on' ? 'success' : workflow.status === 'off' ? 'paused' : 'unknown',
        last_run: workflow.last_run || null,
        error_message: workflow.error_message || null,
        run_count: existing?.run_count || 0,
        success_count: existing?.success_count || 0,
        error_count: existing?.error_count || 0
      };

      let result;
      if (existing) {
        result = await req.supabase
          .from('workflow_logs')
          .update(workflowData)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await req.supabase
          .from('workflow_logs')
          .insert(workflowData)
          .select()
          .single();
      }

      if (result.data) {
        updatedWorkflows.push(result.data);
      }
    }

    res.json({ 
      workflows: updatedWorkflows,
      message: `Updated ${updatedWorkflows.length} workflows`
    });
  } catch (error) {
    console.error('Workflow refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh workflows' });
  }
});

// Get workflow details by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: workflow, error } = await req.supabase
      .from('workflow_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('workflow_id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ workflow });
  } catch (error) {
    console.error('Workflow details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;