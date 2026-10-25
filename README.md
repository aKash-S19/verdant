# 🌿 Verdant AI — Personal Gardening Companion
> **“Grow Smarter. Garden Better.”**

Verdant AI is an intelligent personal gardening platform designed to help people discover suitable plants, create and manage their personal garden, follow personalized plant-care routines, track plant growth, maintain a gardening journal, and receive intelligent gardening guidance powered by the **Google Gemini API** and **Supabase**.

---

## 📑 Table of Contents
1. [Quick Start (Run Immediately)](#1-quick-start-run-immediately)
2. [Project Architecture](#2-project-architecture)
3. [How to Connect Google Gemini API](#3-how-to-connect-google-gemini-api)
4. [How to Connect Supabase (Database, Auth & Storage)](#4-how-to-connect-supabase)
5. [Application Features Tour](#5-application-features-tour)
6. [Environment Variables Reference](#6-environment-variables-reference)

---

## 1. Quick Start (Run Immediately)

> [!TIP]
> **Zero-Config Dual Mode**: You can run and explore 100% of Verdant AI right out of the box! If you haven't added Gemini or Supabase keys yet, the built-in botanical knowledge engine and local session storage will handle everything automatically.

### Prerequisites
- **Node.js** (v18 or newer installed)
- **npm** (comes with Node.js)

### Step 1: Install Dependencies
Open a terminal in the root folder (`d:\genai`):

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Start Both Frontend and Backend

You have two ways to run the project:

#### Option A: One-Command Start (Recommended)
From the root folder (`d:\genai`):
```bash
node dev-runner.js
```
*This starts both the backend server (port 3001) and the frontend client (port 5173) together.*

#### Option B: Two Separate Terminals
* **Terminal 1 (Backend API):**
  ```bash
  cd server
  npm start
  ```
  Runs at: `http://localhost:3001`

* **Terminal 2 (Frontend React App):**
  ```bash
  cd client
  npm run dev
  ```
  Runs at: `http://localhost:5173`

### Step 3: Open in Browser
Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 2. Project Architecture

```
d:\genai\
├── client/                     # React Frontend (Vite + Vanilla CSS Design Tokens)
│   ├── src/
│   │   ├── components/layout/  # Navbar, MobileNav, Footer
│   │   ├── context/            # AuthContext, GardenContext, NotificationContext
│   │   ├── pages/              # Landing, Dashboard, Discovery, MyGarden, PlantDetail,
│   │   │                       # CareCalendar, GrowthTracker, Journal, Assistant, Settings
│   │   ├── lib/                # supabase.js, api.js (backend client)
│   │   ├── data/               # samplePlants.js (16 botanical plant profiles)
│   │   └── index.css           # Custom nature-inspired design tokens
│   ├── .env                    # Frontend environment variables
│   └── package.json
├── server/                     # Node.js Backend (Express)
│   ├── routes/                 # gemini.js, plants.js, health.js
│   ├── services/               # geminiService.js, botanicalEngine.js, botanicalData.js
│   ├── .env                    # Backend secrets (Gemini API Key, Supabase Keys)
│   ├── index.js                # Server entry point (port 3001)
│   └── package.json
├── supabase/
│   └── schema.sql              # Complete PostgreSQL schema, tables, RLS policies
├── dev-runner.js               # Concurrent launcher for server + client
└── README.md                   # This setup guide
```

---

## 3. How to Connect Google Gemini API

The Gemini API powers the botanical AI Gardening Assistant, custom plant care generation, and personalized plant recommendations.

### Step 3.1: Get Your Free API Key
1. Go to **[https://aistudio.google.com/](https://aistudio.google.com/)**.
2. Sign in with your Google account.
3. Click **"Get API key"** -> **"Create API key"**.
4. Choose **"Create API key in new project"**.
5. Copy the generated key (starts with `AIzaSy...`).

### Step 3.2: Add Key to `server/.env`
Open `server/.env` in your editor and paste your key:
```env
PORT=3001
GEMINI_API_KEY=AIzaSyYourActualKeyHere1234567890
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Step 3.3: Restart the Server
In your server terminal, press `Ctrl + C` and run `npm start` again.
The server log will display:
```
🤖 Gemini API configured: true
```

> [!IMPORTANT]
> **Security Guarantee**: The Gemini API key is stored **only in `server/.env`** and is NEVER exposed to the frontend/browser code. All AI queries pass through secure backend routes (`/api/gemini/*`).

---

## 4. How to Connect Supabase

Supabase provides persistent cloud storage, PostgreSQL tables with Row Level Security (RLS), and authentication.

### Step 4.1: Create a Free Supabase Project
1. Go to **[https://supabase.com/](https://supabase.com/)** and sign in.
2. Click **"New Project"**.
3. Name it `verdant-ai`, set a database password, select your closest region(mumbai), and choose the **Free Plan**.
4. Click **"Create new project"** (takes ~1 minute to spin up).

### Step 4.2: Run the SQL Schema
1. In your Supabase Dashboard, click on **"SQL Editor"** in the left sidebar.
2. Open the file `supabase/schema.sql` on your computer.
3. Copy the entire file content, paste it into the Supabase SQL Editor, and click **"Run"**.
4. You will see **"Success. No rows returned"**.
   * *This creates the `profiles`, `plants`, `user_gardens`, `care_tasks`, `growth_records`, `journal_entries`, and `notifications` tables with Row Level Security (RLS).*

### Step 4.3: Create Storage Buckets (For Photos)
1. On the left sidebar in Supabase, click **"Storage"**.
2. Click **"New bucket"**, enter the name: `plant-photos`.
   * **Toggle "Public bucket" to ON (Enabled)**. Click **Save**.
3. Click **"New bucket"**, enter the name: `journal-photos`.
   * **Toggle "Public bucket" to ON (Enabled)**. Click **Save**.

### Step 4.4: Get Your Supabase Keys
1. In Supabase, click on **Project Settings** (gear icon ⚙️ at bottom-left) -> **API**.
2. You will find:
   - **Project URL** (e.g. `https://abcdefghijklm.supabase.co`)
   - **Project API Keys** -> `anon` `public`
   - **Project API Keys** -> `service_role` `secret`

### Step 4.5: Update the `.env` Files

#### 1. In `client/.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
VITE_API_BASE_URL=
```

#### 2. In `server/.env`:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key
```

### Step 4.6: Restart Both Terminals
Restart the server (`npm start` in `server/`) and client (`npm run dev` in `client/`).
The server log will display:
```
⚡ Supabase configured: true
```

---

## 5. Application Features Tour

Once running at **`http://localhost:5173`**, explore these key areas:

### 1. 🌿 Landing Page
- Headline: **“Grow Smarter. Garden Better.”**
- Hero section with live task micro-cards and Gemini insight preview.
- 5-stage botanical methodology walkthrough.
- Comparison breakdown for Beginners vs. Experienced Gardeners.

### 2. 🔐 Authentication & Onboarding
- Register with email and password or use the 1-click **Demo Profile**.
- 3-step onboarding calibrates your:
  - Gardening space (Balcony, Windowsill, Raised Bed, Indoor Container, etc.)
  - Sunlight exposure (Full, Partial, Indirect, Low Light)
  - Experience level & time commitment
  - Preferred plant categories (Herbs, Vegetables, Flowers, Succulents)

### 3. 📊 Personalized Gardening Dashboard
- Real-time plant counts, tasks due today, and growth milestones.
- Active gardening streak flame counter with celebration confetti on task completion.
- **“Today's Garden Tasks”** checklist with instant checkoff.
- **Gemini Garden Insights** widget analyzing active plants and suggesting seasonal actions.
- Empty state experience (*“Your garden is waiting to grow.”*).

### 4. 🔍 Plant Discovery & Recommendation Wizard
- Search and filter 16+ botanical cultivars by category, sunlight, difficulty, and indoor/outdoor status.
- Detailed botanical profiles with sunlight meters, watering cycles, and soil advice.
- One-click **“Add to My Garden”** automatically generates recurring watering and feeding tasks.
- **AI Recommendation Wizard**: answers user space and sunlight constraints to match ideal flora.

### 5. 🪴 My Garden & Plant Details
- Grid and List views with status filters (Seedling, Growing, Thriving, Flowering, Harvest Ready, Archived).
- Custom plant management with nicknames, acquisition dates, and photos.
- Dedicated Plant Detail view with:
  - Care schedule & upcoming tasks
  - Growth records & measurements
  - Gemini Botanical Advisory with weekly care cycles

### 6. 📅 Smart Care Scheduler & Interactive Calendar
- Monthly, Weekly, and Daily calendar views.
- Color-coded activity indicators for watering, fertilizing, pruning, and harvesting.
- Day task inspector and custom task scheduler.

### 7. 📈 Plant Growth Tracker
- Measurement logs for stem height (cm), leaf count, and photo records.
- Chronological timeline with milestone badges.
- **Photo Comparison Mode** comparing earliest versus latest observations.

### 8. 📖 Garden Journal
- Chronological diary for harvest records, culinary achievements, and observations.
- Tag filters (`#Harvest`, `#Culinary`, `#Repotting`, `#Balcony`).
- Photo attachments and full CRUD capabilities.

### 9. 🤖 Gemini AI Gardening Assistant
- Contextual assistant loaded with your garden's active plants, light, and space.
- Structured responses with checklists, schedules, and step-by-step guidance.
- Quick starter prompts (*“What should I do for my garden today?”*, *“When should I water my basil?”*).
- Copy-to-clipboard and session reset controls.

### 10. ⚙️ Profile & Settings
- Update gardening space, sunlight calibration, and notification alerts.
- View live Supabase and Gemini connection status indicators.

---

## 6. Environment Variables Reference

### `server/.env` (Backend Secrets)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port for Express server | `3001` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `SUPABASE_URL` | Supabase Project URL | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Anonymous Public Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key | `eyJhbGciOi...` |

### `client/.env` (Frontend Public Config)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase Project URL | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anonymous Public Key | `eyJhbGciOi...` |
| `VITE_API_BASE_URL` | Backend URL (optional, defaults to Vite proxy) | `http://localhost:3001` |

---

## 📜 License & Acknowledgments
Built with React, Node.js, Vite, Supabase, Google Gemini API, and Lucide Icons.
© Verdant AI — *“Grow Smarter. Garden Better.”*
