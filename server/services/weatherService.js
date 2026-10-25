// server/services/weatherService.js

const CITY_COORDINATES = {
  'chennai': { latitude: 13.0827, longitude: 80.2707, name: 'Chennai', country: 'India', defaultTemp: 31, defaultHumidity: 72 },
  'coimbatore': { latitude: 11.0168, longitude: 76.9558, name: 'Coimbatore', country: 'India', defaultTemp: 28, defaultHumidity: 65 },
  'madurai': { latitude: 9.9252, longitude: 78.1198, name: 'Madurai', country: 'India', defaultTemp: 32, defaultHumidity: 68 },
  'trichy': { latitude: 10.7905, longitude: 78.7047, name: 'Tiruchirappalli', country: 'India', defaultTemp: 31, defaultHumidity: 70 },
  'salem': { latitude: 11.6643, longitude: 78.1460, name: 'Salem', country: 'India', defaultTemp: 30, defaultHumidity: 65 },
  'bangalore': { latitude: 12.9716, longitude: 77.5946, name: 'Bengaluru', country: 'India', defaultTemp: 26, defaultHumidity: 60 },
  'bengaluru': { latitude: 12.9716, longitude: 77.5946, name: 'Bengaluru', country: 'India', defaultTemp: 26, defaultHumidity: 60 },
  'mumbai': { latitude: 19.0760, longitude: 72.8777, name: 'Mumbai', country: 'India', defaultTemp: 29, defaultHumidity: 78 },
  'delhi': { latitude: 28.6139, longitude: 77.2090, name: 'Delhi', country: 'India', defaultTemp: 28, defaultHumidity: 55 },
  'seattle': { latitude: 47.6062, longitude: -122.3321, name: 'Seattle', country: 'United States', defaultTemp: 19, defaultHumidity: 70 },
  'new york': { latitude: 40.7128, longitude: -74.0060, name: 'New York', country: 'United States', defaultTemp: 21, defaultHumidity: 65 },
  'london': { latitude: 51.5074, longitude: -0.1278, name: 'London', country: 'United Kingdom', defaultTemp: 17, defaultHumidity: 75 },
  'tokyo': { latitude: 35.6762, longitude: 139.6503, name: 'Tokyo', country: 'Japan', defaultTemp: 22, defaultHumidity: 68 }
};

export const weatherService = {
  /**
   * Geocodes a city name to latitude and longitude.
   * Checks local lookup map first, then calls Open-Meteo Geocoding API.
   */
  async geocodeCity(rawQuery) {
    if (!rawQuery || rawQuery === 'City, Region') {
      return CITY_COORDINATES['chennai'];
    }
    
    const candidates = [
      rawQuery.trim(),
      rawQuery.split(',')[0].trim()
    ].filter(Boolean);

    // 1. Check direct map
    for (const q of candidates) {
      const key = q.toLowerCase();
      if (CITY_COORDINATES[key]) {
        return CITY_COORDINATES[key];
      }
    }

    // 2. Try Open-Meteo Geocoding API
    for (const query of candidates) {
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
        const response = await fetch(url);
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data?.results?.length > 0) {
          return {
            latitude: data.results[0].latitude,
            longitude: data.results[0].longitude,
            name: data.results[0].name,
            country: data.results[0].country || data.results[0].admin1 || ''
          };
        }
      } catch (error) {
        console.warn(`[WeatherService] Geocoding API lookup error for "${query}":`, error.message);
      }
    }

    // 3. Fallback default location (Chennai, India)
    return {
      latitude: 13.0827,
      longitude: 80.2707,
      name: candidates[0] || 'Chennai',
      country: 'India'
    };
  },

  /**
   * Fetches current weather and daily forecast for a given location, plus garden weather alerts.
   */
  async getCurrentWeather(city) {
    let location = null;
    try {
      location = await this.geocodeCity(city);
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto`;
      
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`Open-Meteo returned HTTP ${response.status}`);
      
      const data = await response.json();

      const currentTemp = data.current?.temperature_2m ?? location.defaultTemp ?? 25;
      const humidity = data.current?.relative_humidity_2m ?? location.defaultHumidity ?? 65;
      const precip = data.current?.precipitation ?? 0;
      const windSpeed = data.current?.wind_speed_10m ?? 5;
      const maxTemp = data.daily?.temperature_2m_max?.[0] ?? (currentTemp + 4);
      const minTemp = data.daily?.temperature_2m_min?.[0] ?? (currentTemp - 4);
      const rainProb = data.daily?.precipitation_probability_max?.[0] ?? (precip > 0 ? 80 : 15);
      const uvIndex = data.daily?.uv_index_max?.[0] ?? 6;

      // Generate contextual alerts for outdoor plants
      const alerts = [];
      if (precip > 0 || rainProb >= 50) {
        alerts.push({
          type: 'rain',
          severity: 'info',
          title: 'Rain Expected',
          message: `Precipitation probability is ${rainProb}%. Hold off on watering outdoor pots today to prevent waterlogging!`
        });
      }
      if (maxTemp >= 34) {
        alerts.push({
          type: 'heat',
          severity: 'warning',
          title: 'Extreme Heat Warning',
          message: `High temperatures of ${maxTemp}°C forecasted. Provide shade cloth or move balcony containers out of afternoon direct sun.`
        });
      }
      if (minTemp <= 8) {
        alerts.push({
          type: 'cold',
          severity: 'warning',
          title: 'Cold Snap Alert',
          message: `Low temperature of ${minTemp}°C expected. Move sensitive tropical cultivars indoors overnight.`
        });
      }
      if (uvIndex >= 8) {
        alerts.push({
          type: 'uv',
          severity: 'info',
          title: 'High UV Radiation',
          message: `Peak UV Index will hit ${uvIndex}. Ensure young seedlings have partial shade protection.`
        });
      }

      return {
        location: `${location.name}${location.country ? ', ' + location.country : ''}`,
        coordinates: { latitude: location.latitude, longitude: location.longitude },
        current: {
          temperature: currentTemp,
          humidity,
          precipitation: precip,
          windSpeed,
          weatherCode: data.current?.weather_code ?? 0
        },
        forecast: {
          maxTemp,
          minTemp,
          rainProbability: rainProb,
          uvIndex
        },
        alerts
      };
    } catch (error) {
      console.warn('[WeatherService] Weather fetch fallback activated:', error.message);
      
      const cityName = location?.name || city || 'Chennai';
      const defaultTemp = location?.defaultTemp || 28;
      
      return {
        location: `${cityName}, ${location?.country || 'India'}`,
        coordinates: { latitude: location?.latitude || 13.0827, longitude: location?.longitude || 80.2707 },
        current: {
          temperature: defaultTemp,
          humidity: 68,
          precipitation: 0,
          windSpeed: 6.2,
          weatherCode: 1
        },
        forecast: {
          maxTemp: defaultTemp + 3,
          minTemp: defaultTemp - 4,
          rainProbability: 20,
          uvIndex: 7
        },
        alerts: [
          {
            type: 'uv',
            severity: 'info',
            title: 'High UV Index',
            message: 'Protect young sprouts from direct intense afternoon sunlight.'
          }
        ]
      };
    }
  }
};
