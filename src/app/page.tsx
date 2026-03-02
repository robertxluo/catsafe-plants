'use client';

import { useRouter } from 'next/navigation';
import { HomeView } from '@/src/components/home-view';
import { buildPlantDetailHref } from '@/src/lib/plant-detail-navigation';

export default function Home() {
  const router = useRouter();

  function navigateToPlant(id: string) {
    router.push(buildPlantDetailHref(id, '/'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return <HomeView onSelectPlant={navigateToPlant} />;
}
