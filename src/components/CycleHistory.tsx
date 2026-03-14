'use client';

import { Cycle } from '@/lib/types';

interface CycleHistoryProps {
  cycles: Cycle[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  yes: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-400/10' },
  mostly_yes: { label: 'Mostly Done', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  mostly_no: { label: 'Mostly Not', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  no: { label: 'Not Done', color: 'text-red-400', bg: 'bg-red-400/10' },
};

export default function CycleHistory({ cycles }: CycleHistoryProps) {
  if (cycles.length === 0) return null;

  return (
    <div className="w-full max-w-lg mx-auto mt-12 mb-4">
      <h3 className="text-foreground/30 text-xs uppercase tracking-[0.15em] font-medium mb-4">
        Cycle History
      </h3>
      <div className="space-y-2">
        {cycles.map((cycle) => {
          const statusInfo = cycle.completed_status
            ? STATUS_LABELS[cycle.completed_status]
            : null;

          return (
            <div
              key={cycle.id}
              className="bg-card-bg border border-card-border rounded-xl px-4 py-3 animate-fade-in flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-foreground/30 text-sm font-mono shrink-0">
                  #{cycle.cycle_number}
                </span>
                {cycle.target && (
                  <p className="text-foreground/70 text-sm truncate">{cycle.target}</p>
                )}
              </div>
              {statusInfo && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusInfo.color} ${statusInfo.bg}`}>
                  {statusInfo.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
