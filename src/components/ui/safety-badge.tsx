import type { SafetyStatus } from '@/src/lib/plants';
import { getStatusColor, getStatusLabel } from '@/src/lib/plants';

interface SafetyBadgeProps {
  status: SafetyStatus;
  className?: string;
  compact?: boolean;
}

export function SafetyBadge({ status, className = '', compact = false }: SafetyBadgeProps) {
  const color = getStatusColor(status);
  const sizeClass = compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const dotClass = compact ? 'h-1.5 w-1.5' : 'h-1.5 w-1.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap ${sizeClass} ${color.bg} ${color.text} ${color.border} ${className}`.trim()}
    >
      <span className={`${dotClass} rounded-full ${color.dot}`} aria-hidden="true" />
      {getStatusLabel(status)}
    </span>
  );
}
