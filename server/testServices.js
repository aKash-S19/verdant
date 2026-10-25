import 'dotenv/config';
import { weatherService } from './services/weatherService.js';
import { plantApiService } from './services/plantApiService.js';

async function run() {
  console.log('Testing Weather Service...');
  const weather = await weatherService.getCurrentWeather('Seattle, WA');
  console.log('Weather:', weather);

  console.log('\nTesting Plant API Service...');
  const plants = await plantApiService.searchPlants('Monstera', 1);
  console.log('Plants:', JSON.stringify(plants, null, 2));
}

run().catch(console.error);
