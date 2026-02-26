'use client';

import { useParams, useRouter } from 'next/navigation';
import { DetailView } from '@/src/components/detail-view';

export default function PlantDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const plantId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <DetailView
      plantId={plantId ?? ''}
      onBack={() => router.push('/')}
      onGoDirectory={() => router.push('/plants')}
      onSelectPlant={(id) => router.push(`/plants/${id}`)}
    />
  );
}
