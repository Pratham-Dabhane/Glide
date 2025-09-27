const express = require('express');
const router = express.Router();

// Webhook endpoint for external services (no auth required)
router.post('/zapier', async (req, res) => {
  try {
    console.log('Received Zapier webhook:', req.body);
    
    // This endpoint can be used by Zapier to notify us of workflow events
    // You could expand this to handle specific webhook events
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Health check for webhooks
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'webhooks' });
});

module.exports = router;