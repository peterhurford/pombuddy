'use client';

import { useState, useRef, useEffect } from 'react';
import { Participant } from '@/lib/types';
import { getRandomEmojis } from '@/lib/emojis';

interface ParticipantListProps {
  participants: Participant[];
  currentParticipantId: string | null;
  onEmojiChange?: (emoji: string) => void;
}

const STALE_MS = 2 * 60 * 1000; // 2 minutes

export default function ParticipantList({ participants, currentParticipantId, onEmojiChange }: ParticipantListProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [emojiChoices, setEmojiChoices] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [pickerOpen]);

  if (participants.length === 0) return null;

  const now = Date.now();

  return (
    <div className="w-full max-w-lg mb-6 flex flex-wrap gap-2 justify-center">
      {participants.map((p) => {
        const isStale = now - new Date(p.last_seen_at).getTime() > STALE_MS;
        const isCurrent = p.id === currentParticipantId;

        return (
          <div key={p.id} className="relative">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                isCurrent
                  ? 'border-accent/50 bg-accent/10 cursor-pointer hover:bg-accent/15'
                  : 'border-card-border bg-card-bg'
              } ${isStale ? 'opacity-40' : ''}`}
              title={isCurrent ? 'Click to change emoji' : (p.current_target || undefined)}
              onClick={() => {
                if (!isCurrent || !onEmojiChange) return;
                setEmojiChoices(getRandomEmojis(30));
                setPickerOpen(!pickerOpen);
              }}
            >
              <span>{p.emoji}</span>
              <span className="font-medium truncate max-w-[80px]">{p.name}</span>
              {p.current_target && (
                <span className="text-foreground/40 truncate max-w-[120px] hidden sm:inline">
                  — {p.current_target}
                </span>
              )}
            </div>

            {isCurrent && pickerOpen && (
              <div
                ref={pickerRef}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 p-3 bg-card-bg border border-card-border rounded-xl shadow-lg animate-fade-in"
              >
                <div className="grid grid-cols-6 gap-1 w-[210px]">
                  {emojiChoices.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onEmojiChange?.(emoji);
                        setPickerOpen(false);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/10 transition-colors text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
