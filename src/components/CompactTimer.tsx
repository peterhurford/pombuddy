'use client';

import { useEffect, useState } from 'react';

interface CompactTimerProps {
  timerStart: string | null;
  timerDuration: number | null;
  label: string;
  paused: boolean;
  pausedRemaining: number | null;
  onTimerEnd: () => void;
  onPause: () => void;
  onResume: () => void;
  target?: string | null;
}

export default function CompactTimer({
  timerStart,
  timerDuration,
  label,
  paused,
  pausedRemaining,
  onTimerEnd,
  onPause,
  onResume,
  target,
}: CompactTimerProps) {
  const [remaining, setRemaining] = useState(pausedRemaining ?? timerDuration ?? 0);
  const [hasEnded, setHasEnded] = useState(false);

  // Update document.title
  useEffect(() => {
    return () => {
      document.title = 'Pombuddy - Shared Pomodoro Timer';
    };
  }, []);

  useEffect(() => {
    if (paused) {
      setRemaining(pausedRemaining ?? 0);
      const m = String(Math.floor((pausedRemaining ?? 0) / 60)).padStart(2, '0');
      const s = String((pausedRemaining ?? 0) % 60).padStart(2, '0');
      document.title = `⏸ ${m}:${s} ${label} - Pombuddy`;
      return;
    }

    if (!timerStart || !timerDuration) return;

    setHasEnded(false);

    const interval = setInterval(() => {
      const startTime = new Date(timerStart).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const left = Math.max(0, timerDuration - elapsed);
      setRemaining(left);

      const m = String(Math.floor(left / 60)).padStart(2, '0');
      const s = String(left % 60).padStart(2, '0');
      document.title = `${m}:${s} ${label} - Pombuddy`;

      if (left === 0 && !hasEnded) {
        setHasEnded(true);
        onTimerEnd();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [timerStart, timerDuration, paused, pausedRemaining, hasEnded, onTimerEnd, label]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <div className="inline-flex items-center gap-3 px-8 py-4 bg-card-bg border border-card-border rounded-2xl font-mono tabular-nums">
        <span className="text-5xl sm:text-6xl font-bold tracking-tight">{minutes}:{seconds}</span>
        <span className="text-foreground/20 text-2xl">·</span>
        <span className={`uppercase tracking-wider text-sm ${paused ? 'text-accent animate-pulse-subtle' : 'text-foreground/40'}`}>
          {paused ? 'Paused' : label}
        </span>
      </div>

      <button
        onClick={paused ? onResume : onPause}
        className={`mt-4 px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          paused
            ? 'bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20'
            : 'border border-card-border text-foreground/50 hover:text-foreground/80 hover:border-foreground/20'
        }`}
      >
        {paused ? 'Resume' : 'Pause'}
      </button>

      {target && (
        <div className="mt-4 text-center max-w-md">
          <p
            className="text-foreground/50 text-sm leading-relaxed line-clamp-2 cursor-default"
            title={target}
          >
            {target}
          </p>
        </div>
      )}
    </div>
  );
}
