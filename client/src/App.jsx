import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GardenProvider } from './context/GardenContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { MyGardenPage } from './pages/MyGardenPage';
import { PlantDetailPage } from './pages/PlantDetailPage';
import { CareCalendarPage } from './pages/CareCalendarPage';
import { GrowthTrackerPage } from './pages/GrowthTrackerPage';
import { JournalPage } from './pages/JournalPage';
import { AssistantPage } from './pages/AssistantPage';
import { DiseaseDetectionPage } from './pages/DiseaseDetectionPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

function AppContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(user ? 'dashboard' : 'landing');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [doctorPlant, setDoctorPlant] = useState(null);

  const protectedTabs = ['dashboard', 'garden', 'scheduler', 'growth', 'journal', 'assistant', 'disease-doctor', 'settings', 'plant-detail'];

  useEffect(() => {
    if (user && currentTab === 'landing') {
      setCurrentTab('dashboard');
    }
  }, [user]);

  // Navigation router with Auth Protection
  function navigateTo(tabId) {
    if (protectedTabs.includes(tabId) && !user) {
      setCurrentTab('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tabId === 'plant-detail' && !selectedPlant) {
      setCurrentTab('garden');
      return;
    }
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenPlantDetail(plant) {
    setSelectedPlant(plant);
    setCurrentTab('plant-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenDoctor(plant) {
    setDoctorPlant(plant || null);
    navigateTo('disease-doctor');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <Navbar
        activeTab={currentTab}
        onNavigate={navigateTo}
      />

      {/* Main Page Routing */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        ...(currentTab === 'assistant' ? { 
          height: 'calc(100vh - 4.25rem)', 
          maxHeight: 'calc(100vh - 4.25rem)', 
          overflow: 'hidden' 
        } : {}) 
      }}>
        {currentTab === 'landing' && (
          <LandingPage
            onGetStarted={() => {
              if (user) navigateTo('dashboard');
              else navigateTo('auth');
            }}
            onExplorePlants={() => navigateTo('discover')}
          />
        )}

        {currentTab === 'auth' && (
          <AuthPage
            initialMode="register"
            onAuthSuccess={() => navigateTo('dashboard')}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            onNavigate={navigateTo}
            onOpenPlantDetail={handleOpenPlantDetail}
            onOpenDoctor={handleOpenDoctor}
          />
        )}

        {currentTab === 'discover' && (
          <DiscoveryPage
            onNavigate={navigateTo}
          />
        )}

        {currentTab === 'garden' && (
          <MyGardenPage
            onNavigate={navigateTo}
            onSelectPlant={handleOpenPlantDetail}
            onOpenDoctor={handleOpenDoctor}
          />
        )}

        {currentTab === 'plant-detail' && selectedPlant && (
          <PlantDetailPage
            plant={selectedPlant}
            onBack={() => navigateTo('garden')}
            onNavigate={navigateTo}
            onOpenDoctor={handleOpenDoctor}
          />
        )}

        {currentTab === 'scheduler' && (
          <CareCalendarPage />
        )}

        {currentTab === 'growth' && (
          <GrowthTrackerPage />
        )}

        {currentTab === 'journal' && (
          <JournalPage />
        )}

        {currentTab === 'assistant' && (
          <AssistantPage />
        )}

        {currentTab === 'disease-doctor' && (
          <DiseaseDetectionPage 
            onNavigate={navigateTo} 
            initialPlant={doctorPlant} 
          />
        )}

        {currentTab === 'settings' && (
          <ProfileSettingsPage />
        )}
      </main>

      {/* Footer - Hidden on Assistant view to keep chat pinned to screen */}
      {currentTab !== 'assistant' && (
        <Footer onNavigate={navigateTo} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <GardenProvider>
          <AppContent />
        </GardenProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
