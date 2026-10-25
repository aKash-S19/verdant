-- ==========================================================
-- VERDANT AI — DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- "Grow Smarter. Garden Better."
-- PostgreSQL / Supabase Compatible Schema
-- ==========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES TABLE
-- Extends Supabase auth.users with personalized gardening preferences
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    location TEXT DEFAULT 'City, Region',
    experience_level TEXT DEFAULT 'Beginner' CHECK (experience_level IN ('Beginner', 'Intermediate', 'Experienced', 'Master')),
    garden_space TEXT DEFAULT 'Balcony' CHECK (garden_space IN ('Balcony', 'Windowsill', 'Indoor Container', 'Raised Bed', 'Backyard / Garden', 'Rooftop', 'Greenhouse')),
    sunlight_availability TEXT DEFAULT 'Partial Sunlight (3-6 hrs)' CHECK (sunlight_availability IN ('Full Sunlight (6+ hrs)', 'Partial Sunlight (3-6 hrs)', 'Indirect / Shaded Light', 'Low Light / Fluorescent')),
    indoor_outdoor_pref TEXT DEFAULT 'Both' CHECK (indoor_outdoor_pref IN ('Indoor Only', 'Outdoor Only', 'Both')),
    preferred_categories TEXT[] DEFAULT ARRAY['Herbs', 'Indoor Plants', 'Vegetables'],
    maintenance_pref TEXT DEFAULT 'Low to Medium' CHECK (maintenance_pref IN ('Low Maintenance', 'Low to Medium', 'Medium', 'High / Intensive')),
    notification_preferences JSONB DEFAULT '{"watering": true, "fertilizing": true, "pruning": true, "tips": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PUBLIC PLANT CATALOG TABLE
-- Curated realistic botanical plant database
CREATE TABLE IF NOT EXISTS public.plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    scientific_name TEXT,
    category TEXT NOT NULL CHECK (category IN ('Herbs', 'Vegetables', 'Indoor Plants', 'Flowers', 'Decorative Plants', 'Medicinal Plants', 'Fruit Plants', 'Succulents')),
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    sunlight TEXT NOT NULL,
    watering TEXT NOT NULL,
    soil TEXT NOT NULL,
    temperature TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Challenging')),
    maintenance_level TEXT NOT NULL CHECK (maintenance_level IN ('Low', 'Medium', 'High')),
    indoor_outdoor TEXT NOT NULL CHECK (indoor_outdoor IN ('Indoor', 'Outdoor', 'Both')),
    growth_duration TEXT,
    planting_info TEXT,
    maintenance_tips TEXT,
    care_schedule_defaults JSONB NOT NULL DEFAULT '{"watering_interval_days": 3, "fertilizing_interval_days": 21, "pruning_interval_days": 30}'::jsonb,
    purpose TEXT[],
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER GARDEN TABLE
-- User's managed plants
CREATE TABLE IF NOT EXISTS public.user_gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
    custom_name TEXT NOT NULL,
    species TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Indoor Plants',
    location TEXT DEFAULT 'Living Room Windowsill',
    indoor_outdoor TEXT DEFAULT 'Indoor' CHECK (indoor_outdoor IN ('Indoor', 'Outdoor', 'Both')),
    acquisition_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Thriving' CHECK (status IN ('Seedling', 'Growing', 'Thriving', 'Flowering', 'Harvest Ready', 'Dormant', 'Archived')),
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SMART CARE TASKS TABLE
-- Personalized schedules for watering, fertilizing, repotting, pruning, harvest
CREATE TABLE IF NOT EXISTS public.care_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    garden_plant_id UUID REFERENCES public.user_gardens(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (task_type IN ('Watering', 'Fertilizing', 'Pruning', 'Repotting', 'Planting', 'Harvesting', 'Custom')),
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    recurrence_interval_days INT DEFAULT 0, -- 0 means one-time
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    is_skipped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PLANT GROWTH TRACKER RECORDS TABLE
-- Periodic photo logs and measurements (height, leaf count, milestones)
CREATE TABLE IF NOT EXISTS public.growth_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    garden_plant_id UUID NOT NULL REFERENCES public.user_gardens(id) ON DELETE CASCADE,
    photo_url TEXT,
    height_cm NUMERIC(6, 2),
    leaf_count INT,
    milestone TEXT,
    notes TEXT,
    recorded_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GARDEN JOURNAL TABLE
-- Personal gardening diary with tags, photos, achievements
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    garden_plant_id UUID REFERENCES public.user_gardens(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    photo_url TEXT,
    tags TEXT[] DEFAULT ARRAY['Observation'],
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE
-- Activity and care alerts
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.care_tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'Care Alert' CHECK (category IN ('Care Alert', 'AI Insight', 'Milestone', 'System')),
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AI CONVERSATIONS & MESSAGES TABLE
-- Persistent history for Gemini AI Gardening Assistant
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Gardening Session',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    structured_data JSONB, -- Optional recommendations, checklists, steps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PLANT FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.plant_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plant_id)
);

-- ==========================================================
-- INDEXES FOR PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_user_gardens_user ON public.user_gardens(user_id);
CREATE INDEX IF NOT EXISTS idx_care_tasks_user_date ON public.care_tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_growth_records_plant ON public.growth_records(garden_plant_id);
CREATE INDEX IF NOT EXISTS idx_journal_user ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages(conversation_id);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS)
-- Secure user data so users can only access their own records
-- ==========================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_favorites ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Plants RLS (Catalog is publicly readable by all authenticated & anon users)
DROP POLICY IF EXISTS "Public plants catalog is viewable by everyone" ON public.plants;
CREATE POLICY "Public plants catalog is viewable by everyone" 
    ON public.plants FOR SELECT USING (true);

-- 3. User Gardens RLS
DROP POLICY IF EXISTS "Users can manage their own gardens" ON public.user_gardens;
CREATE POLICY "Users can manage their own gardens" 
    ON public.user_gardens FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Care Tasks RLS
DROP POLICY IF EXISTS "Users can manage their own care tasks" ON public.care_tasks;
CREATE POLICY "Users can manage their own care tasks" 
    ON public.care_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Growth Records RLS
DROP POLICY IF EXISTS "Users can manage their growth records" ON public.growth_records;
CREATE POLICY "Users can manage their growth records" 
    ON public.growth_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Journal Entries RLS
DROP POLICY IF EXISTS "Users can manage their journal entries" ON public.journal_entries;
CREATE POLICY "Users can manage their journal entries" 
    ON public.journal_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Notifications RLS
DROP POLICY IF EXISTS "Users can manage their notifications" ON public.notifications;
CREATE POLICY "Users can manage their notifications" 
    ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. AI Conversations & Messages RLS
DROP POLICY IF EXISTS "Users can manage their AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can manage their AI conversations" 
    ON public.ai_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their AI messages" ON public.ai_messages;
CREATE POLICY "Users can manage their AI messages" 
    ON public.ai_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Plant Favorites RLS
DROP POLICY IF EXISTS "Users can manage their favorites" ON public.plant_favorites;
CREATE POLICY "Users can manage their favorites" 
    ON public.plant_favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ==========================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================================
-- STORAGE BUCKETS (Run in Supabase Storage or via API)
-- ==========================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('plant-photos', 'plant-photos', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('journal-photos', 'journal-photos', true) ON CONFLICT DO NOTHING;
