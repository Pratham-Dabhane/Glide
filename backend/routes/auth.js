const express = require('express');
const router = express.Router();

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const { data: user, error } = await req.supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user, error } = await req.supabase
      .from('users')
      .update({ email })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;