'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RoomMode } from '@/lib/types';
import { generateSlug } from '@/lib/words';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<RoomMode>('25/5');
  const [creating, setCreating] = useState(false);

  async function createRoom() {
    setCreating(true);
    const slug = generateSlug();
    const { data, error } = await supabase
      .from('rooms')
      .insert({ id: slug, mode, state: 'lobby', current_cycle: 1 })
      .select('id')
      .single();

    if (error || !data) {
      // Retry with a different slug in case of collision
      const retrySlug = generateSlug() + '-' + Math.floor(Math.random() * 10);
      const { data: retryData, error: retryError } = await supabase
        .from('rooms')
        .insert({ id: retrySlug, mode, state: 'lobby', current_cycle: 1 })
        .select('id')
        .single();

      if (retryError || !retryData) {
        alert('Failed to create room. Make sure Supabase is configured.');
        setCreating(false);
        return;
      }

      router.push(`/room/${retryData.id}`);
      return;
    }

    router.push(`/room/${data.id}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-14">
          <div className="text-5xl mb-5">🍅</div>
          <h1 className="text-6xl font-bold mb-4 tracking-tight">
            <span className="text-accent">Pom</span>buddy
          </h1>
          <p className="text-foreground/40 text-lg">
            Shared Pomodoro timer with structured reflections
          </p>
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-8 shadow-lg shadow-black/5 space-y-8">
          <div>
            <label className="block text-xs font-medium text-foreground/30 mb-3 uppercase tracking-[0.15em]">
              Timer Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['25/5', '50/10'] as RoomMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-5 px-6 rounded-xl text-center transition-all duration-200 border ${
                    mode === m
                      ? 'bg-accent/10 border-accent/40 text-accent font-semibold shadow-sm shadow-accent/5'
                      : 'bg-background/50 border-card-border text-foreground/50 hover:border-foreground/20 hover:text-foreground/70'
                  }`}
                >
                  <div className="text-3xl font-bold">{m.split('/')[0]}</div>
                  <div className="text-xs mt-1.5 opacity-60">
                    {m.split('/')[0]}min work / {m.split('/')[1]}min break
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={createRoom}
            disabled={creating}
            className="w-full py-4 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg active:scale-[0.98]"
          >
            {creating ? 'Creating...' : 'Create Room'}
          </button>
        </div>

        <p className="text-center text-foreground/20 text-sm mt-10">
          Create a room and share the link with your co-working buddies
        </p>
      </div>
    </main>
  );
}
