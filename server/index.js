import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import geminiRoutes from './routes/gemini.js';
import plantsRoutes from './routes/plants.js';
import healthRoutes from './routes/health.js';
import weatherRoutes from './routes/weather.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/plants', plantsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/weather', weatherRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Verdant AI API Server',
    tagline: 'Grow Smarter. Garden Better.',
    endpoints: [
      '/api/health',
      '/api/plants',
      '/api/gemini/chat',
      '/api/gemini/recommendations',
      '/api/gemini/care-routine',
      '/api/gemini/insights'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🌿 Verdant AI Server running at http://localhost:${PORT}`);
  console.log(`🤖 Gemini API configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
  console.log(`⚡ Supabase configured: ${Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)}`);
});
