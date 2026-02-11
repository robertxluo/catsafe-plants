'use client';

import { useRouter } from 'next/navigation';
import { HomeView } from '@/src/components/home-view';

export default function Home() {
  const router = useRouter();

  function navigateToPlant(id: string) {
    router.push(`/plants/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return <HomeView onSelectPlant={navigateToPlant} />;
}
