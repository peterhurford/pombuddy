'use client';

import { useEffect, useState } from 'react';

interface CompactTimerProps {
  timerStart: string | null;
  timerDuration: number | null;
  label: string;
  paused: boolean;
  pausedRemaining: number | null;
}

export default function CompactTimer({
  timerStart,
  timerDuration,
  label,
  paused,
  pausedRemaining,
}: CompactTimerProps) {
  const [remaining, setRemaining] = useState(pausedRemaining ?? timerDuration ?? 0);

  useEffect(() => {
    if (paused) {
      setRemaining(pausedRemaining ?? 0);
      return;
    }

    if (!timerStart || !timerDuration) return;

    const interval = setInterval(() => {
      const startTime = new Date(timerStart).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setRemaining(Math.max(0, timerDuration - elapsed));
    }, 200);

    return () => clearInterval(interval);
  }, [timerStart, timerDuration, paused, pausedRemaining]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return (
    <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-card-bg border border-card-border rounded-full text-sm font-mono tabular-nums">
      <span className="font-semibold">{minutes}:{seconds}</span>
      <span className="text-foreground/40">·</span>
      <span className="text-foreground/50 uppercase tracking-wider text-xs">{label}</span>
    </div>
  );
}
