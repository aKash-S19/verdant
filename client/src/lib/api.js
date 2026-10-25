// Client API communication service for Verdant AI
// Connects to Node.js backend server API with graceful error handling

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function askGeminiChat(message, history = [], gardenContext = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/gemini/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, gardenContext })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('[API Client] Chat endpoint unavailable:', err.message);
    return {
      success: false,
      reply: 'The Verdant AI assistant is currently unavailable. Please ensure your backend is running and the Gemini API key is configured.'
    };
  }
}

export async function getGeminiRecommendations(params) {
  try {
    const res = await fetch(`${API_BASE}/api/gemini/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API Client] Recommendations endpoint unavailable:', err.message);
    return { success: false, recommendations: [] };
  }
}

export async function generateGeminiCareRoutine(plantName, environment) {
  try {
    const res = await fetch(`${API_BASE}/api/gemini/care-routine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plantName, environment })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API Client] Care routine endpoint fallback:', err.message);
    return {
      success: false,
      carePlan: null
    };
  }
}

export async function getGeminiInsights(userGarden, profile) {
  try {
    const res = await fetch(`${API_BASE}/api/gemini/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userGarden, profile })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      success: false,
      insights: []
    };
  }
}

export async function fetchPlantsCatalog(queryParams = {}) {
  try {
    const params = new URLSearchParams(queryParams).toString();
    const res = await fetch(`${API_BASE}/api/plants?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API Client] Plants catalog endpoint unavailable:', err.message);
    return { success: false, count: 0, plants: [] };
  }
}

export async function fetchWeatherData(location) {
  try {
    if (!location) return { success: false, weather: null };
    const res = await fetch(`${API_BASE}/api/weather?location=${encodeURIComponent(location)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API Client] Weather endpoint error:', err.message);
    return { success: false, weather: null };
  }
}

export async function diagnosePlantDisease(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/gemini/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('[API Client] Disease diagnosis error:', err.message);
    return {
      success: false,
      error: err.message || 'Diagnosis failed. Please ensure the backend server is running.'
    };
  }
}

export async function fetchGoogleBotanicalSearch(query) {
  try {
    const res = await fetch(`${API_BASE}/api/plants/google-search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API Client] Google Botanical search error:', err.message);
    return { success: false, count: 0, plants: [] };
  }
}

