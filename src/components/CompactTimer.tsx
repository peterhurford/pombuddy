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
  mode?: string;
  onModeChange?: (mode: string) => void;
  onSetTime?: (seconds: number) => void;
}

const TIME_PRESETS = [1, 5, 10, 15, 20, 25, 30, 40, 50];

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
  mode,
  onModeChange,
  onSetTime,
}: CompactTimerProps) {
  const [remaining, setRemaining] = useState(pausedRemaining ?? timerDuration ?? 0);
  const [hasEnded, setHasEnded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

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

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={paused ? onResume : onPause}
          className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            paused
              ? 'bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20'
              : 'border border-card-border text-foreground/50 hover:text-foreground/80 hover:border-foreground/20'
          }`}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>

        {(onModeChange || onSetTime) && (
          <button
            onClick={() => setShowEdit(!showEdit)}
            className={`p-2 rounded-xl text-sm transition-all duration-200 border ${
              showEdit
                ? 'border-accent/30 text-accent bg-accent/10'
                : 'border-card-border text-foreground/50 hover:text-foreground/80 hover:border-foreground/20'
            }`}
            title="Timer settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>

      {showEdit && (
        <div className="mt-3 p-4 bg-card-bg border border-card-border rounded-xl animate-fade-in w-full max-w-xs">
          {onModeChange && mode && (
            <div className="mb-3">
              <label className="text-foreground/40 text-xs uppercase tracking-wider block mb-2">Mode</label>
              <div className="flex gap-2">
                {['25/5', '50/10'].map((m) => (
                  <button
                    key={m}
                    onClick={() => onModeChange(m)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      mode === m
                        ? 'bg-accent/15 border border-accent/30 text-accent'
                        : 'border border-card-border text-foreground/50 hover:text-foreground/80'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
          {onSetTime && (
            <div>
              <label className="text-foreground/40 text-xs uppercase tracking-wider block mb-2">Set time</label>
              <select
                value=""
                onChange={(e) => {
                  const mins = parseInt(e.target.value, 10);
                  if (!isNaN(mins)) onSetTime(mins * 60);
                }}
                className="w-full py-1.5 px-3 rounded-lg text-sm bg-background border border-card-border text-foreground/70 cursor-pointer"
              >
                <option value="" disabled>Select minutes...</option>
                {TIME_PRESETS.map((m) => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

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
