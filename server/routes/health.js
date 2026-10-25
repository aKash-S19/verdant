// Server Health and Status Check
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'Verdant AI — Personal Gardening Companion',
    tagline: 'Grow Smarter. Garden Better.',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
    supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    timestamp: new Date().toISOString()
  });
});

export default router;
