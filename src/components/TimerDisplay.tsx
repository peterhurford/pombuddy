'use client';

import { useEffect, useState } from 'react';

interface TimerDisplayProps {
  timerStart: string | null;
  timerDuration: number | null;
  onTimerEnd: () => void;
  label: string;
  paused: boolean;
  pausedRemaining: number | null;
  onPause: () => void;
  onResume: () => void;
}

export default function TimerDisplay({
  timerStart,
  timerDuration,
  onTimerEnd,
  label,
  paused,
  pausedRemaining,
  onPause,
  onResume,
}: TimerDisplayProps) {
  const [remaining, setRemaining] = useState(pausedRemaining ?? timerDuration ?? 0);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    if (paused) {
      setRemaining(pausedRemaining ?? 0);
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

      if (left === 0 && !hasEnded) {
        setHasEnded(true);
        onTimerEnd();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [timerStart, timerDuration, onTimerEnd, hasEnded, paused, pausedRemaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const totalDuration = paused ? (pausedRemaining ?? 0) + ((timerDuration ?? 0) - (pausedRemaining ?? 0)) : (timerDuration ?? 0);
  const progress = totalDuration ? (totalDuration - remaining) / totalDuration : 0;

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <div className="relative w-72 h-72">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-card-border"
          />
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-accent transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-mono font-bold tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-foreground/50 text-sm mt-2 uppercase tracking-widest">
            {paused ? 'Paused' : label}
          </span>
        </div>
      </div>

      <button
        onClick={paused ? onResume : onPause}
        className="mt-6 px-6 py-3 rounded-xl border border-card-border text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors text-sm font-medium"
      >
        {paused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
}
