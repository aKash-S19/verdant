// Express API Route for Weather Engine
import { Router } from 'express';
import { weatherService } from '../services/weatherService.js';

const router = Router();

// GET /api/weather?location=City
router.get('/', async (req, res) => {
  try {
    const locationQuery = req.query.location || req.query.city;
    
    if (!locationQuery || locationQuery.trim() === '' || locationQuery === 'City, Region') {
      return res.status(400).json({ 
        success: false, 
        error: 'Location query parameter is required (e.g. ?location=Chennai).' 
      });
    }

    const weatherData = await weatherService.getCurrentWeather(locationQuery.trim());

    if (!weatherData) {
      return res.status(404).json({
        success: false,
        error: `Could not retrieve live weather for location "${locationQuery}". Please verify city name.`
      });
    }

    return res.json({
      success: true,
      weather: weatherData
    });
  } catch (error) {
    console.error('Error in GET /api/weather:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data.',
      details: error.message
    });
  }
});

export default router;
