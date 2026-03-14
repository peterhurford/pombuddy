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
  target?: string | null;
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
  target,
}: TimerDisplayProps) {
  const [remaining, setRemaining] = useState(pausedRemaining ?? timerDuration ?? 0);
  const [hasEnded, setHasEnded] = useState(false);
  const [flashing, setFlashing] = useState(false);

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
        setFlashing(true);
        setTimeout(() => setFlashing(false), 3000);
        onTimerEnd();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [timerStart, timerDuration, onTimerEnd, hasEnded, paused, pausedRemaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const totalDuration = paused
    ? (pausedRemaining ?? 0) + ((timerDuration ?? 0) - (pausedRemaining ?? 0))
    : (timerDuration ?? 0);
  const progress = totalDuration ? (totalDuration - remaining) / totalDuration : 0;

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Screen flash overlay */}
      {flashing && (
        <div className="fixed inset-0 z-50 pointer-events-none animate-timer-flash bg-accent/20" />
      )}

      {/* Target display */}
      {target && (
        <div className="mb-6 text-center max-w-sm">
          <p className="text-foreground/50 text-sm leading-relaxed">
            {target}
          </p>
        </div>
      )}

      <div className={`relative w-80 h-80 sm:w-96 sm:h-96 ${paused ? '' : 'animate-pulse-glow'}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 320 320">
          {/* Background track */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-card-border"
          />
          {/* Progress ring */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-accent transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-7xl sm:text-8xl font-mono font-bold tabular-nums tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className={`text-sm mt-3 uppercase tracking-[0.2em] ${paused ? 'text-accent animate-pulse-subtle' : 'text-foreground/40'}`}>
            {paused ? 'Paused' : label}
          </span>
        </div>
      </div>

      <button
        onClick={paused ? onResume : onPause}
        className={`mt-8 px-8 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          paused
            ? 'bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20'
            : 'border border-card-border text-foreground/50 hover:text-foreground/80 hover:border-foreground/20'
        }`}
      >
        {paused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
}
