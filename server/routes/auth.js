import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * POST /api/auth/register
 * Creates a verified user directly via Supabase Admin API.
 * Bypasses the default Supabase SMTP rate limit completely by setting email_confirm: true.
 */
router.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || '' }
    });

    if (error) {
      if (
        error.message?.toLowerCase().includes('already') ||
        error.message?.toLowerCase().includes('exists')
      ) {
        return res.status(400).json({
          error: 'An account with this email address already exists. Please sign in instead.'
        });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      success: true,
      user: data.user,
      message: 'Account created and verified successfully.'
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during registration.' });
  }
});

/**
 * POST /api/auth/reset-password
 * Updates user password directly without triggering SMTP email rate limits.
 */
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const targetUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!targetUser) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    return res.json({
      success: true,
      message: 'Password updated successfully. You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('[Auth Reset Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to update password.' });
  }
});

export default router;
