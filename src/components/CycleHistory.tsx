'use client';

import { Cycle } from '@/lib/types';

interface CycleHistoryProps {
  cycles: Cycle[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  yes: { label: 'Completed', color: 'text-green-400' },
  mostly_yes: { label: 'Mostly Done', color: 'text-yellow-400' },
  mostly_no: { label: 'Mostly Not', color: 'text-orange-400' },
  no: { label: 'Not Done', color: 'text-red-400' },
};

export default function CycleHistory({ cycles }: CycleHistoryProps) {
  if (cycles.length === 0) return null;

  return (
    <div className="w-full max-w-lg mx-auto mt-8">
      <h3 className="text-foreground/40 text-sm uppercase tracking-widest mb-4">
        Cycle History
      </h3>
      <div className="space-y-3">
        {cycles.map((cycle) => {
          const statusInfo = cycle.completed_status
            ? STATUS_LABELS[cycle.completed_status]
            : null;

          return (
            <div
              key={cycle.id}
              className="bg-card-bg border border-card-border rounded-xl p-4 animate-fade-in"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-foreground/50 text-sm">
                  Cycle {cycle.cycle_number}
                </span>
                {statusInfo && (
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                )}
              </div>
              {cycle.target && (
                <p className="text-foreground/80 text-sm">{cycle.target}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
