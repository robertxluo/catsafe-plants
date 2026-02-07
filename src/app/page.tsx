'use client';

import { useState, useMemo } from 'react';
import { HomeView } from '@/src/components/home-view';
import { DetailView } from '@/src/components/detail-view';
import { AdminLogin } from '@/src/components/admin-login';
import { AdminDashboard } from '@/src/components/admin-dashboard';
import { plants } from '@/src/lib/plants';

type View = 'home' | 'detail' | 'admin_login' | 'admin_dashboard';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');

  const selectedPlant = useMemo(() => plants.find((p) => p.id === selectedPlantId), [selectedPlantId]);

  function navigateToPlant(id: string) {
    setSelectedPlantId(id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setCurrentView('home');
    setSelectedPlantId('');
  }

  function handleAdminLogin(email: string) {
    setAdminUser(email);
    setCurrentView('admin_dashboard');
  }

  function handleLogout() {
    setAdminUser(null);
    setCurrentView('home');
  }

  switch (currentView) {
    case 'home':
      return <HomeView onSelectPlant={navigateToPlant} onAdminClick={() => setCurrentView('admin_login')} />;

    case 'detail':
      return selectedPlant ? (
        <DetailView plantId={selectedPlant.id} onBack={goBack} onSelectPlant={navigateToPlant} />
      ) : (
        <HomeView onSelectPlant={navigateToPlant} onAdminClick={() => setCurrentView('admin_login')} />
      );

    case 'admin_login':
      return <AdminLogin onBack={goBack} onLogin={handleAdminLogin} />;

    case 'admin_dashboard':
      return adminUser ? (
        <AdminDashboard adminUser={adminUser} onLogout={handleLogout} />
      ) : (
        <AdminLogin onBack={goBack} onLogin={handleAdminLogin} />
      );

    default:
      return <HomeView onSelectPlant={navigateToPlant} onAdminClick={() => setCurrentView('admin_login')} />;
  }
}
