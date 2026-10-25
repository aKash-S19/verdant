// Authentication and User Profile Context — Production Supabase Engine
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and track Supabase Auth Session
  useEffect(() => {
    async function initAuth() {
      if (!isSupabaseConfigured() || !supabase) {
        console.warn('Supabase is not configured.');
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
          }
        });

        return () => subscription.unsubscribe();
      } catch (err) {
        console.error('Supabase auth session error:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  async function fetchProfile(userId) {
    // 1. Immediately hydrate from localStorage cache for instant UI rendering
    try {
      const cached = localStorage.getItem(`verdant_profile_${userId}`);
      if (cached) {
        setProfile(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Could not read cached profile:', e);
    }

    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        const fullProfile = { ...data, onboarded: Boolean(data.garden_space && data.garden_space !== '') };
        setProfile(fullProfile);
        try {
          localStorage.setItem(`verdant_profile_${userId}`, JSON.stringify(fullProfile));
        } catch {}
      } else {
        // Fallback to minimal profile if not yet created
        const initial = {
          id: userId,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Botanical Explorer',
          avatar_url: user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          location: 'Balcony Oasis',
          onboarded: false
        };
        setProfile(initial);
        try {
          localStorage.setItem(`verdant_profile_${userId}`, JSON.stringify(initial));
        } catch {}
      }
    } catch (err) {
      console.warn('Error fetching Supabase profile:', err.message);
    }
  }

  // Register: Creates confirmed user via server-side Supabase Admin API, bypassing SMTP rate limits
  async function register(email, password, fullName) {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // Immediately sign in with the new credentials to establish the Supabase JWT session
      const loginRes = await login(email, password);
      return { 
        success: true, 
        user: loginRes.user || data.user, 
        session: loginRes.session 
      };
    } finally {
      setLoading(false);
    }
  }

  // Direct Password Reset: Bypasses SMTP email rate limit
  async function resetPasswordDirect(email, newPassword) {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }
      return { success: true, message: data.message };
    } finally {
      setLoading(false);
    }
  }

  // Login
  async function login(email, password) {
    setLoading(true);
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase client is not configured.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      setUser(data.user);
      await fetchProfile(data.user.id);
      return { success: true, user: data.user, session: data.session };
    } finally {
      setLoading(false);
    }
  }

  // Logout
  async function logout() {
    setLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  // Complete Onboarding / Update Profile
  async function updateProfile(updates) {
    const updated = { ...(profile || {}), ...updates, onboarded: true, updated_at: new Date().toISOString() };
    setProfile(updated);

    if (user?.id) {
      try {
        localStorage.setItem(`verdant_profile_${user.id}`, JSON.stringify(updated));
      } catch (err) {
        console.warn('localStorage profile save warning:', err);
      }
    }

    if (isSupabaseConfigured() && supabase && user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() });
        if (error) console.error('Supabase profile update error:', error);
      } catch (e) {
        console.warn('Could not sync profile to Supabase:', e.message);
      }
    }

    return updated;
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isDemoMode: false,
      register,
      login,
      logout,
      resetPasswordDirect,
      updateProfile,
      isAuthenticated: Boolean(user)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
