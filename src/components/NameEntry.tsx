'use client';

import { useState } from 'react';

interface NameEntryProps {
  onSubmit: (name: string) => void;
}

export default function NameEntry({ onSubmit }: NameEntryProps) {
  const [name, setName] = useState('');

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/5">
          <h2 className="text-lg sm:text-xl font-semibold mb-6">What&apos;s your name?</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full bg-background/50 border border-card-border rounded-xl p-4 text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="mt-4 w-full py-3.5 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Join Room
          </button>
        </div>
      </div>
    </main>
  );
}
