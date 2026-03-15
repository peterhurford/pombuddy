'use client';

import { Participant } from '@/lib/types';

interface ParticipantListProps {
  participants: Participant[];
  currentParticipantId: string | null;
}

const STALE_MS = 2 * 60 * 1000; // 2 minutes

export default function ParticipantList({ participants, currentParticipantId }: ParticipantListProps) {
  if (participants.length === 0) return null;

  const now = Date.now();

  return (
    <div className="w-full max-w-lg mb-6 flex flex-wrap gap-2 justify-center">
      {participants.map((p) => {
        const isStale = now - new Date(p.last_seen_at).getTime() > STALE_MS;
        const isCurrent = p.id === currentParticipantId;

        return (
          <div
            key={p.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
              isCurrent
                ? 'border-accent/50 bg-accent/10'
                : 'border-card-border bg-card-bg'
            } ${isStale ? 'opacity-40' : ''}`}
            title={p.current_target || undefined}
          >
            <span>{p.emoji}</span>
            <span className="font-medium truncate max-w-[80px]">{p.name}</span>
            {p.current_target && (
              <span className="text-foreground/40 truncate max-w-[120px] hidden sm:inline">
                — {p.current_target}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
