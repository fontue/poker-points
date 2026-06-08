export type MetricTone = {
  label: string;
  value: string;
  footer?: string;
};

export const metricTones = {
  points: {
    footer: 'bg-violet-600/15 ring-violet-500/20',
    label: 'text-violet-200/80',
    value: 'text-violet-100'
  },
  paid: {
    footer: 'bg-orange-500/15 ring-orange-500/20',
    label: 'text-orange-200/80',
    value: 'text-orange-100'
  },
  prize: {
    label: 'text-yellow-200/80',
    value: 'text-yellow-100'
  },
  chips: {
    footer: 'bg-emerald-600/15 ring-emerald-500/20',
    label: 'text-emerald-200/80',
    value: 'text-emerald-100'
  },
  neutral: {
    label: 'text-zinc-300',
    value: 'text-zinc-100'
  }
} satisfies Record<string, MetricTone>;

export function getPlayerCardClass(isEliminated: boolean, place?: number) {
  if (!isEliminated) return 'bg-zinc-900';
  if (place === 1) return 'bg-yellow-500/35 ring-yellow-300/50';
  if (place === 2) return 'bg-zinc-300/30 ring-zinc-100/45';
  if (place === 3) return 'bg-orange-700/45 ring-orange-300/50';
  return 'bg-red-500/10 ring-red-400/15';
}
