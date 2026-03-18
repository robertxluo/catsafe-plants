'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Leaf } from 'lucide-react';
import type { SafetyStatus } from '@/src/lib/plants';
import { getStatusColor } from '@/src/lib/plants';

interface PlantImageProps {
  src: string | null;
  alt: string;
  status: SafetyStatus;
  fallbackLabel?: string;
  className?: string;
  imageClassName?: string;
  placeholderTestId?: string;
  width: number;
  height: number;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

export function PlantImage({
  src,
  alt,
  status,
  fallbackLabel,
  className = '',
  imageClassName = '',
  placeholderTestId,
  width,
  height,
  loading,
  fetchPriority,
  sizes,
  priority,
  unoptimized = false,
}: PlantImageProps) {
  const [failed, setFailed] = useState(false);
  const color = getStatusColor(status);

  const showFallback = !src || failed;

  return (
    <div className={`relative overflow-hidden ${className}`.trim()}>
      {showFallback ? (
        <div
          className={`flex h-full w-full items-center justify-center ${color.bg}`}
          data-testid={placeholderTestId}
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-1.5">
            <Leaf className={`w-8 h-8 ${color.text} opacity-70`} />
            {fallbackLabel ? <span className={`text-[11px] ${color.text} opacity-80`}>{fallbackLabel}</span> : null}
          </div>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={imageClassName}
          loading={loading}
          fetchPriority={fetchPriority}
          sizes={sizes}
          priority={priority}
          unoptimized={unoptimized}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
