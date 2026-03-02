'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { DetailView } from '@/src/components/detail-view';
import {
  buildPlantDetailHref,
  getBackLabelForReturnTo,
  sanitizeReturnTo,
} from '@/src/lib/plant-detail-navigation';

export default function PlantDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plantId = Array.isArray(params.id) ? params.id[0] : params.id;
  const returnTo = sanitizeReturnTo(searchParams.get('returnTo'));
  const backLabel = getBackLabelForReturnTo(returnTo);

  return (
    <DetailView
      plantId={plantId ?? ''}
      onBack={() => router.push(returnTo)}
      onGoHome={() => router.push('/')}
      onGoDirectory={() => router.push('/plants')}
      onSelectPlant={(id) => router.push(buildPlantDetailHref(id, returnTo))}
      backLabel={backLabel}
    />
  );
}
