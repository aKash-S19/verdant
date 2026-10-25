// Google Gemini API Integration Layer
import { GoogleGenerativeAI } from '@google/generative-ai';
import { plantApiService } from './plantApiService.js';

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey.trim() !== '') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[GeminiService] Initialized with Google Gemini API key.');
  } catch (err) {
    console.warn('[GeminiService] Error initializing Gemini client:', err.message);
  }
} else {
  console.log('[GeminiService] No GEMINI_API_KEY provided. AI features will fail.');
}

const SYSTEM_INSTRUCTION = `
You are Verdant AI, a personal, encouraging, and knowledgeable botanical companion.
Your mission is to help people grow smarter and garden better through personalized gardening management.
Key Rules:
1. Provide practical, beginner-friendly, structured advice (bulleted checklists, schedules, step-by-step instructions).
2. Use actual environmental data provided to you to tailor your recommendations.
3. Be warm, calming, and nature-inspired in tone.
4. Format markdown with clear headers, bold highlights, and clean actionable bullet points.
`;

export async function askGardeningAssistant({ message, history = [], gardenContext = {}, weatherData = null }) {
  if (!genAI) throw new Error("Gemini API not configured.");

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      systemInstruction: SYSTEM_INSTRUCTION
    });

    let contextPrompt = '';
    if (gardenContext.userPlants && gardenContext.userPlants.length > 0) {
      const plantList = gardenContext.userPlants
        .map(p => `- ${p.custom_name || p.species} (${p.category || 'General'}, Location: ${p.location || 'Balcony'}, Status: ${p.status || 'Active'})`)
        .join('\n');
      contextPrompt += `\n[User's Current Garden Plants]:\n${plantList}\n`;
    }
    if (gardenContext.profile) {
      contextPrompt += `[User Profile]: Space: ${gardenContext.profile.garden_space || 'Balcony'}, Sunlight: ${gardenContext.profile.sunlight_availability || 'Partial'}, Experience: ${gardenContext.profile.experience_level || 'Beginner'}.\n`;
    }
    
    // Inject Weather Data
    if (weatherData && weatherData.current) {
       contextPrompt += `[Current Weather at ${weatherData.location}]: ${weatherData.current.temperature}°C, ${weatherData.current.precipitation}mm rain, ${weatherData.current.humidity}% humidity. Forecast: Max ${weatherData.forecast.maxTemp}°C, Min ${weatherData.forecast.minTemp}°C, Rain Probability: ${weatherData.forecast.rainProbability}%.\n`;
    }

    const contents = [];
    if (contextPrompt) {
      contents.push({ role: 'user', parts: [{ text: `Here is my gardening profile, garden context, and real-time weather: ${contextPrompt}` }] });
      contents.push({ role: 'model', parts: [{ text: `I have loaded your gardening profile, plants, and local weather into memory. How can I help you grow today?` }] });
    }

    for (const msg of (history || []).slice(-6)) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    contents.push({ role: 'user', parts: [{ text: message }] });

    const result = await model.generateContent({ contents });
    const response = await result.response;
    
    return {
      reply: response.text(),
      source: 'gemini-3.5-flash-lite'
    };
  } catch (err) {
    console.error('[GeminiService] Error during Gemini chat generation:', err.message);
    throw err;
  }
}

export async function getPersonalizedRecommendations(params) {
  // Leverage the dynamic plant API service we built to handle this using Gemini
  return {
    recommendations: await plantApiService.getRecommendations(params, 6),
    source: 'gemini-3.5-flash-lite'
  };
}

export async function generatePlantCarePlan(plantName, environment = {}, weatherData = null) {
  if (!genAI) throw new Error("Gemini API not configured.");

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    let prompt = `
Create a personalized care plan for the plant "${plantName}".
Environment context:
- Location: ${environment.location || 'Balcony / Patio'}
- Sunlight: ${environment.sunlight || 'Partial to Full Sun'}
`;

    if (weatherData && weatherData.current) {
        prompt += `- Current Weather: ${weatherData.current.temperature}°C, ${weatherData.current.precipitation}mm rain.
- Weather Forecast: Max ${weatherData.forecast.maxTemp}°C, Min ${weatherData.forecast.minTemp}°C, Rain Probability: ${weatherData.forecast.rainProbability}%.
Adapt the watering and care schedule intelligently based on this real-time weather data. If it is currently raining or has high rain probability, extend the watering interval.`;
    }

    prompt += `
Respond strictly with JSON format matching:
{
  "plantName": "${plantName}",
  "scientificName": "Latin binomial",
  "routineSummary": "Summary of care requirements considering current weather",
  "weeklyChecklist": [
    { "day": "Monday", "action": "Action Name", "detail": "Specific instructions" },
    { "day": "Wednesday", "action": "Action Name", "detail": "Specific instructions" },
    { "day": "Friday", "action": "Action Name", "detail": "Specific instructions" },
    { "day": "Sunday", "action": "Action Name", "detail": "Specific instructions" }
  ],
  "recommendedTasks": [
    { "taskType": "Watering", "title": "Water plant", "intervalDays": 3, "tips": "Watering guidance based on weather" },
    { "taskType": "Fertilizing", "title": "Fertilize plant", "intervalDays": 21, "tips": "Fertilizer guidance" },
    { "taskType": "Pruning", "title": "Prune plant", "intervalDays": 30, "tips": "Pruning guidance" }
  ],
  "growthMilestones": [
    { "timeframe": "Week 1-2", "observation": "Acclimation milestone" },
    { "timeframe": "Month 1", "observation": "Early growth milestone" },
    { "timeframe": "Month 2-3", "observation": "Maturity milestone" }
  ]
}
`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
    const carePlan = JSON.parse(cleanJson);
    return {
      carePlan,
      source: 'gemini-3.5-flash-lite'
    };
  } catch (err) {
    console.error('[GeminiService] Error during care plan generation:', err.message);
    throw err;
  }
}

export async function diagnosePlantDisease({ imageBase64, mimeType = 'image/jpeg', plantName = '', userNotes = '' }) {
  if (!genAI) throw new Error("Gemini API not configured.");

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite'
    });

    const prompt = `
You are an expert botanical pathologist and plant physician.
Analyze this plant leaf/plant image carefully and diagnose any disease, pest infestation, nutrient deficiency, or physiological disorder.

${plantName ? `The user identified this plant as: "${plantName}".` : ''}
${userNotes ? `User observations: "${userNotes}".` : ''}

Provide an accurate, detailed diagnosis strictly in valid JSON format matching this schema:
{
  "conditionName": "Common Name of Disease / Condition (Scientific Pathogen name in brackets if applicable)",
  "healthy": false,
  "confidenceScore": 95,
  "severity": "Moderate",
  "category": "Fungal",
  "summary": "Clear, concise 2-sentence summary of what is happening to the plant.",
  "symptomsIdentified": [
    "Specific visual symptom 1 (e.g. Yellowing leaf margins)",
    "Specific visual symptom 2 (e.g. Powdery white fungal patches)"
  ],
  "rootCauses": [
    "High humidity and stagnant airflow",
    "Overwatering or fungal spore transmission"
  ],
  "treatmentOrganic": [
    "Step 1: Prune and safely discard heavily infected foliage using sterilized shears.",
    "Step 2: Spray organic neem oil solution (5ml neem + 2 drops mild soap in 1L water) every 5-7 days."
  ],
  "treatmentChemical": [
    "Apply copper-based fungicide or sulfur powder if organic treatment fails to arrest spread."
  ],
  "preventionTips": [
    "Water at the base of the plant early in the morning, avoiding wet leaves.",
    "Ensure at least 15cm spacing between pots to improve air circulation."
  ],
  "suggestedTasks": [
    {
      "taskType": "Pruning",
      "title": "Prune infected leaves",
      "description": "Isolate plant and remove infected leaves with sanitized shears to prevent spore spread.",
      "intervalDays": 3
    },
    {
      "taskType": "Custom",
      "title": "Apply organic neem/fungicide spray",
      "description": "Spray tops and undersides of leaves in late afternoon.",
      "intervalDays": 7
    }
  ]
}

Note: If the image appears completely healthy with no disease symptoms, set "healthy": true, "conditionName": "Healthy & Thriving", "severity": "None", "category": "Healthy", and provide maintenance tips.
Respond with pure JSON only without any markdown formatting.`;

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const parts = [
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64
        }
      },
      { text: prompt }
    ];

    const result = await model.generateContent(parts);
    const text = result.response.text();
    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
    const diagnosis = JSON.parse(cleanJson);

    return {
      success: true,
      diagnosis,
      timestamp: new Date().toISOString(),
      source: 'gemini-3.5-flash-lite'
    };
  } catch (err) {
    console.error('[GeminiService] Error during plant disease diagnosis:', err.message);
    throw err;
  }
}

