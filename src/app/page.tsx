'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomeView } from '@/src/components/home-view';
import { AdminLogin } from '@/src/components/admin-login';
import { AdminDashboard } from '@/src/components/admin-dashboard';

type View = 'home' | 'admin_login' | 'admin_dashboard';

export default function Home() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>('home');
  const [adminUser, setAdminUser] = useState<string | null>(null);

  function navigateToPlant(id: string) {
    router.push(`/plants/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setCurrentView('home');
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
