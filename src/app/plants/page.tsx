import { PlantsDirectoryView } from '@/src/components/plants-directory-view';
import { loadPlantsServer } from '@/src/lib/supabase/load-plants-server';

export const dynamic = 'force-dynamic';

export default async function PlantsPage() {
  let initialPlants;
  try {
    initialPlants = await loadPlantsServer();
  } catch {
    // If server fetch fails, the client component will retry on its own
    initialPlants = null;
  }

  return <PlantsDirectoryView initialPlants={initialPlants} />;
}
