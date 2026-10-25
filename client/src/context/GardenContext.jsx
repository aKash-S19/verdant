import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const GardenContext = createContext();

export function GardenProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { addToast, addNotification } = useNotifications();

  const [plants, setPlants] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [growthRecords, setGrowthRecords] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [streakDays, setStreakDays] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setPlants([]);
        setTasks([]);
        setGrowthRecords([]);
        setJournalEntries([]);
        setFavorites([]);
        setStreakDays(0);
        setIsLoaded(true);
        return;
      }

      function loadLocalStorage() {
        try {
          const savedPlants = localStorage.getItem('verdant_plants_' + user.id);
          const savedTasks = localStorage.getItem('verdant_tasks_' + user.id);
          const savedGrowth = localStorage.getItem('verdant_growth_' + user.id);
          const savedJournals = localStorage.getItem('verdant_journal_' + user.id);
          const savedFavs = localStorage.getItem('verdant_favs_' + user.id);
          if (savedPlants) setPlants(JSON.parse(savedPlants));
          if (savedTasks) setTasks(JSON.parse(savedTasks));
          if (savedGrowth) setGrowthRecords(JSON.parse(savedGrowth));
          if (savedJournals) setJournalEntries(JSON.parse(savedJournals));
          if (savedFavs) setFavorites(JSON.parse(savedFavs));
        } catch (e) {
          console.warn('Error loading local garden state:', e);
        }
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          // Fetch user gardens
          const { data: gardensData, error: gErr } = await supabase.from('user_gardens').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          if (gErr) throw gErr;
          if (gardensData) setPlants(gardensData);

          // Fetch care tasks
          const { data: tasksData } = await supabase.from('care_tasks').select('*').eq('user_id', user.id).order('due_date', { ascending: true });
          if (tasksData) {
            setTasks(tasksData);
            const completedCount = tasksData.filter(t => t.is_completed).length;
            setStreakDays(completedCount);
          }

          // Fetch growth records
          const { data: growthData } = await supabase.from('growth_records').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false });
          if (growthData) setGrowthRecords(growthData);

          // Fetch journal entries
          const { data: journalData } = await supabase.from('journal_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: false });
          if (journalData) setJournalEntries(journalData);

          // Fetch favorites
          const { data: favsData } = await supabase.from('plant_favorites').select('plant_id').eq('user_id', user.id);
          if (favsData) setFavorites(favsData.map(f => f.plant_id));

        } catch (e) {
          console.warn("Supabase unreachable, loading local offline garden data:", e.message);
          loadLocalStorage();
        }
      } else {
        loadLocalStorage();
      }
      setIsLoaded(true);
    }
    loadData();
  }, [user]);

  // Actions
  async function addPlantToGarden(newPlantData) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const rawId = newPlantData.plant_id || newPlantData.id;
    const validPlantId = rawId && uuidRegex.test(rawId) ? rawId : null;

    const newEntry = {
      user_id: user?.id,
      plant_id: validPlantId,
      custom_name: newPlantData.custom_name || newPlantData.species,
      species: newPlantData.species,
      category: newPlantData.category || 'Indoor Plants',
      location: newPlantData.location || 'Balcony',
      indoor_outdoor: newPlantData.indoor_outdoor || 'Indoor',
      acquisition_date: newPlantData.acquisition_date || new Date().toISOString().split('T')[0],
      status: newPlantData.status || 'Thriving',
      notes: newPlantData.notes || '',
      photo_url: newPlantData.photo_url || newPlantData.image_url || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'
    };

    let createdPlant = null;

    if (isSupabaseConfigured() && supabase && user) {
      try {
        const { data, error } = await supabase.from('user_gardens').insert([newEntry]).select().single();
        if (!error && data) {
          createdPlant = data;
        } else {
          console.warn('Supabase add plant error, falling back locally:', error);
        }
      } catch (err) {
        console.warn('Supabase unreachable, saving plant locally:', err.message);
      }
    }

    if (!createdPlant) {
      createdPlant = {
        ...newEntry,
        id: 'garden_plant_' + Date.now(),
        created_at: new Date().toISOString()
      };
    }

    setPlants(prev => {
      const next = [createdPlant, ...prev];
      if (user?.id) localStorage.setItem('verdant_plants_' + user.id, JSON.stringify(next));
      return next;
    });

    generateCareTasksForPlant(createdPlant);
    addNotification({
      title: 'Plant Added to Garden 🌱',
      message: `${createdPlant.custom_name} was added. Smart care schedule generated!`,
      category: 'Garden Update'
    });
    return createdPlant;
  }

  async function generateCareTasksForPlant(plantEntry) {
    const wateringInterval = 3;
    const fertilizingInterval = 21;

    const initialCareTasks = [
      {
        id: 'task_' + Date.now() + '_1',
        user_id: user?.id,
        garden_plant_id: plantEntry.id,
        task_type: 'Watering',
        title: `Water ${plantEntry.custom_name}`,
        description: `Hydrate at the base according to requirements.`,
        due_date: new Date().toISOString().split('T')[0],
        recurrence_interval_days: wateringInterval,
        is_completed: false
      },
      {
        id: 'task_' + Date.now() + '_2',
        user_id: user?.id,
        garden_plant_id: plantEntry.id,
        task_type: 'Fertilizing',
        title: `Feed ${plantEntry.custom_name}`,
        description: `Apply diluted organic liquid fertilizer.`,
        due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        recurrence_interval_days: fertilizingInterval,
        is_completed: false
      }
    ];

    if (isSupabaseConfigured() && supabase && user) {
      try {
        const { data, error } = await supabase.from('care_tasks').insert(initialCareTasks.map(({ id, ...t }) => t)).select();
        if (!error && data) {
          setTasks(prev => {
            const next = [...data, ...prev];
            localStorage.setItem('verdant_tasks_' + user.id, JSON.stringify(next));
            return next;
          });
          return;
        }
      } catch (err) {
        console.warn('Supabase tasks insert unreachable:', err.message);
      }
    }

    setTasks(prev => {
      const next = [...initialCareTasks, ...prev];
      if (user?.id) localStorage.setItem('verdant_tasks_' + user.id, JSON.stringify(next));
      return next;
    });
  }

  async function updatePlant(id, updates) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('user_gardens').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase updatePlant offline:', e.message);
      }
    }
    setPlants(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      if (user?.id) localStorage.setItem('verdant_plants_' + user.id, JSON.stringify(next));
      return next;
    });
    addToast('Plant profile updated.', 'info');
  }

  async function removePlant(id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('user_gardens').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase removePlant offline:', e.message);
      }
    }
    setPlants(prev => {
      const next = prev.filter(p => p.id !== id);
      if (user?.id) localStorage.setItem('verdant_plants_' + user.id, JSON.stringify(next));
      return next;
    });
    setTasks(prev => {
      const next = prev.filter(t => t.garden_plant_id !== id);
      if (user?.id) localStorage.setItem('verdant_tasks_' + user.id, JSON.stringify(next));
      return next;
    });
    addToast('Plant removed from garden.', 'info');
  }

  async function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const nextCompleted = !task.is_completed;
    
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('care_tasks').update({ 
          is_completed: nextCompleted, 
          completed_at: nextCompleted ? new Date().toISOString() : null 
        }).eq('id', taskId);
      } catch (e) {
        console.warn('Supabase toggleTask offline:', e.message);
      }
    }

    setTasks(prev => {
      const next = prev.map(t => t.id === taskId ? { ...t, is_completed: nextCompleted, completed_at: nextCompleted ? new Date().toISOString() : null } : t);
      if (user?.id) localStorage.setItem('verdant_tasks_' + user.id, JSON.stringify(next));
      return next;
    });

    if (nextCompleted) {
      setStreakDays(s => s + 1);
      addToast(`Completed: ${task.title}`, 'success');
    }
  }

  async function skipTask(taskId) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('care_tasks').update({ is_skipped: true }).eq('id', taskId);
      } catch (e) {
        console.warn('Supabase skipTask offline:', e.message);
      }
    }
    setTasks(prev => {
      const next = prev.map(t => t.id === taskId ? { ...t, is_skipped: true } : t);
      if (user?.id) localStorage.setItem('verdant_tasks_' + user.id, JSON.stringify(next));
      return next;
    });
    addToast('Task skipped for today.', 'info');
  }

  async function addCustomTask(taskData) {
    let created = null;
    if (isSupabaseConfigured() && supabase && user) {
      try {
        const { data, error } = await supabase.from('care_tasks').insert([{ ...taskData, user_id: user.id }]).select().single();
        if (!error && data) created = data;
      } catch (e) {
        console.warn('Supabase addCustomTask offline:', e.message);
      }
    }
    if (!created) {
      created = { ...taskData, id: 'task_' + Date.now(), user_id: user?.id, is_completed: false };
    }
    setTasks(prev => {
      const next = [created, ...prev];
      if (user?.id) localStorage.setItem('verdant_tasks_' + user.id, JSON.stringify(next));
      return next;
    });
    return created;
  }

  async function addGrowthRecord(recordData) {
    let created = null;
    if (isSupabaseConfigured() && supabase && user) {
      try {
        const { data, error } = await supabase.from('growth_records').insert([{ ...recordData, user_id: user.id }]).select().single();
        if (!error && data) created = data;
      } catch (e) {
        console.warn('Supabase addGrowthRecord offline:', e.message);
      }
    }
    if (!created) {
      created = { ...recordData, id: 'growth_' + Date.now(), user_id: user?.id, recorded_at: new Date().toISOString() };
    }
    setGrowthRecords(prev => {
      const next = [created, ...prev];
      if (user?.id) localStorage.setItem('verdant_growth_' + user.id, JSON.stringify(next));
      return next;
    });
    return created;
  }

  async function addJournalEntry(entryData) {
    let created = null;
    if (isSupabaseConfigured() && supabase && user) {
      try {
        const { data, error } = await supabase.from('journal_entries').insert([{ ...entryData, user_id: user.id }]).select().single();
        if (!error && data) created = data;
      } catch (e) {
        console.warn('Supabase addJournalEntry offline:', e.message);
      }
    }
    if (!created) {
      created = { ...entryData, id: 'journal_' + Date.now(), user_id: user?.id, entry_date: new Date().toISOString() };
    }
    setJournalEntries(prev => {
      const next = [created, ...prev];
      if (user?.id) localStorage.setItem('verdant_journal_' + user.id, JSON.stringify(next));
      return next;
    });
    return created;
  }

  async function updateJournalEntry(id, updates) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('journal_entries').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateJournalEntry offline:', e.message);
      }
    }
    setJournalEntries(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...updates } : e);
      if (user?.id) localStorage.setItem('verdant_journal_' + user.id, JSON.stringify(next));
      return next;
    });
  }

  async function deleteJournalEntry(id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('journal_entries').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteJournalEntry offline:', e.message);
      }
    }
    setJournalEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      if (user?.id) localStorage.setItem('verdant_journal_' + user.id, JSON.stringify(next));
      return next;
    });
  }

  async function toggleFavorite(plantId) {
    const isFav = favorites.includes(plantId);
    
    // Optimistically update local state for all plants
    setFavorites(prev => {
      const next = isFav ? prev.filter(id => id !== plantId) : [...prev, plantId];
      if (user?.id) localStorage.setItem('verdant_favs_' + user.id, JSON.stringify(next));
      return next;
    });

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUUID = uuidRegex.test(plantId);

    // Only attempt to persist to Supabase if it's a valid UUID
    if (isSupabaseConfigured() && supabase && user && isValidUUID) {
      try {
        if (isFav) {
          await supabase.from('plant_favorites').delete().match({ user_id: user.id, plant_id: plantId });
        } else {
          await supabase.from('plant_favorites').insert([{ user_id: user.id, plant_id: plantId }]);
        }
      } catch (e) {
        console.warn('Supabase toggleFavorite offline:', e.message);
      }
    }
  }

  function loadSampleGarden() {}
  function clearGarden() {}

  return (
    <GardenContext.Provider value={{
      plants,
      tasks,
      growthRecords,
      journalEntries,
      favorites,
      streakDays,
      addPlantToGarden,
      updatePlant,
      removePlant,
      toggleTaskCompletion,
      skipTask,
      addCustomTask,
      addGrowthRecord,
      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      toggleFavorite,
      loadSampleGarden,
      clearGarden
    }}>
      {children}
    </GardenContext.Provider>
  );
}

export function useGarden() {
  return useContext(GardenContext);
}
