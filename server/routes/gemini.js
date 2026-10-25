// Express API Routes for Gemini AI Gardening Engine
import { Router } from 'express';
import { 
  askGardeningAssistant, 
  getPersonalizedRecommendations, 
  generatePlantCarePlan,
  diagnosePlantDisease
} from '../services/geminiService.js';
import { weatherService } from '../services/weatherService.js';

const router = Router();

// Helper to safely get weather for a given user profile location
async function safeGetWeather(location) {
  if (location && location !== 'City, Region') {
    return await weatherService.getCurrentWeather(location);
  }
  return null;
}

// POST /api/gemini/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history, gardenContext } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required and cannot be empty.' });
    }

    const weatherData = await safeGetWeather(gardenContext?.profile?.location);

    const response = await askGardeningAssistant({
      message: message.trim(),
      history: history || [],
      gardenContext: gardenContext || {},
      weatherData
    });

    return res.json({ success: true, ...response });
  } catch (error) {
    console.error('Error in /api/gemini/chat:', error);
    return res.status(500).json({ 
      error: 'An error occurred while generating the gardening response.',
      details: error.message 
    });
  }
});

// POST /api/gemini/recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { space, sunlight, experience, maintenance, preferences, location } = req.body;

    const weatherData = await safeGetWeather(location);
    const environmentContext = { space, sunlight, experience, maintenance, preferences, weatherData };

    const response = await getPersonalizedRecommendations(environmentContext);

    return res.json({ success: true, ...response });
  } catch (error) {
    console.error('Error in /api/gemini/recommendations:', error);
    return res.status(500).json({ 
      error: 'Failed to generate personalized plant recommendations.',
      details: error.message 
    });
  }
});

// POST /api/gemini/care-routine
router.post('/care-routine', async (req, res) => {
  try {
    const { plantName, environment } = req.body;

    if (!plantName) {
      return res.status(400).json({ error: 'Plant name is required.' });
    }

    const weatherData = await safeGetWeather(environment?.location);
    const response = await generatePlantCarePlan(plantName, environment || {}, weatherData);

    return res.json({ success: true, ...response });
  } catch (error) {
    console.error('Error in /api/gemini/care-routine:', error);
    return res.status(500).json({ 
      error: 'Failed to generate care routine.',
      details: error.message 
    });
  }
});

// POST /api/gemini/insights
router.post('/insights', async (req, res) => {
  try {
    const { userGarden, profile } = req.body;
    
    // We'll generate a generic insights payload for the dashboard if empty,
    // otherwise Gemini can build it
    const hasPlants = userGarden && userGarden.length > 0;
    
    const weatherData = await safeGetWeather(profile?.location);
    
    let insights = [];
    
    if (!hasPlants) {
      insights.push({
        type: "welcome",
        title: "Welcome to Verdant AI",
        message: "Your garden is waiting to grow! Start by exploring our plant catalog.",
        icon: "Sprout",
        actionText: "Discover Plants",
        actionLink: "/discover"
      });
    } else {
      insights.push({
        type: "insight",
        title: "Garden Analysis",
        message: `You have ${userGarden.length} active plants in your ${profile?.garden_space || 'garden'}. Keep an eye on your care schedule.`,
        icon: "Leaf",
      });
    }

    if (weatherData && weatherData.current) {
      insights.push({
        type: "weather",
        title: "Current Weather",
        message: `It's currently ${weatherData.current.temperature}°C in ${weatherData.location}. ${weatherData.current.precipitation > 0 ? "Rain expected, hold off on watering outdoor plants!" : "Good day for gardening!"}`,
        icon: "Sun"
      });
    }

    return res.json({ success: true, insights });
  } catch (error) {
    console.error('Error in /api/gemini/insights:', error);
    return res.status(500).json({ 
      error: 'Failed to generate garden insights.',
      details: error.message 
    });
  }
});

// POST /api/gemini/diagnose - AI Plant Doctor Disease Detection
router.post('/diagnose', async (req, res) => {
  try {
    const { imageBase64, mimeType, plantName, userNotes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data (imageBase64) is required for disease diagnosis.' });
    }

    const response = await diagnosePlantDisease({
      imageBase64,
      mimeType: mimeType || 'image/jpeg',
      plantName,
      userNotes
    });

    return res.json(response);
  } catch (error) {
    console.error('Error in /api/gemini/diagnose:', error);
    return res.status(500).json({ 
      error: 'Failed to diagnose plant leaf image.',
      details: error.message 
    });
  }
});

export default router;
