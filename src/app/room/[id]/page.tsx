'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Room, Cycle, RoomState } from '@/lib/types';
import TimerDisplay from '@/components/TimerDisplay';
import PreWorkFlow from '@/components/PreWorkFlow';
import PostWorkFlow from '@/components/PostWorkFlow';
import CycleHistory from '@/components/CycleHistory';
import ShareLink from '@/components/ShareLink';
import ThemeToggle from '@/components/ThemeToggle';

function getWorkDuration(mode: string): number {
  return mode === '50/10' ? 50 * 60 : 25 * 60;
}

function getBreakDuration(mode: string): number {
  return mode === '50/10' ? 10 * 60 : 5 * 60;
}

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 830;
    oscillator.type = 'sine';
    gain.gain.value = 0.3;
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available
  }
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCycleId, setCurrentCycleId] = useState<string | null>(null);
  const [preWorkDone, setPreWorkDone] = useState(false);
  const timerEndedRef = useRef(false);

  // Reset preWorkDone when a new cycle starts
  useEffect(() => {
    setPreWorkDone(false);
  }, [room?.current_cycle]);

  // Fetch room data
  useEffect(() => {
    async function fetchRoom() {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setRoom(data as Room);
      setLoading(false);
    }

    fetchRoom();
  }, [roomId]);

  // Fetch cycles
  useEffect(() => {
    async function fetchCycles() {
      const { data } = await supabase
        .from('cycles')
        .select('*')
        .eq('room_id', roomId)
        .order('cycle_number', { ascending: true });

      if (data) setCycles(data as Cycle[]);
    }

    fetchCycles();
  }, [roomId, room?.state]);

  // Subscribe to realtime room changes
  useEffect(() => {
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoom(payload.new as Room);
          timerEndedRef.current = false;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Update room state in Supabase
  const updateRoom = useCallback(
    async (updates: Partial<Room>) => {
      await supabase.from('rooms').update(updates).eq('id', roomId);
    },
    [roomId]
  );

  // State transition handlers
  const handleStartPreWork = useCallback(async () => {
    await updateRoom({ state: 'pre_work' as RoomState });
  }, [updateRoom]);

  const handlePreWorkComplete = useCallback(
    async (answers: {
      target: string;
      environment_check: string;
      first_step: string;
      success_criteria: string;
      failure_risks: string;
    }) => {
      // Create cycle record
      const { data } = await supabase
        .from('cycles')
        .insert({
          room_id: roomId,
          cycle_number: room?.current_cycle ?? 1,
          target: answers.target,
          first_step: answers.first_step,
          success_criteria: answers.success_criteria,
          failure_risks: answers.failure_risks,
        })
        .select('id')
        .single();

      if (data) setCurrentCycleId(data.id);

      // Mark local pre-work as done — do NOT auto-start timer
      setPreWorkDone(true);
    },
    [roomId, room?.current_cycle]
  );

  const handleStartTimer = useCallback(async () => {
    const duration = getWorkDuration(room?.mode ?? '25/5');
    await updateRoom({
      state: 'working' as RoomState,
      timer_start: new Date().toISOString(),
      timer_duration: duration,
      paused: false,
      paused_remaining: null,
    });
  }, [room?.mode, updateRoom]);

  // Late joiner condensed pre-work — no DB write, just local reflection
  const handleCondensedPreWorkComplete = useCallback(() => {
    setPreWorkDone(true);
  }, []);

  const handlePause = useCallback(async () => {
    if (!room?.timer_start || !room?.timer_duration) return;
    const startTime = new Date(room.timer_start).getTime();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, room.timer_duration - elapsed);

    await updateRoom({
      paused: true,
      paused_remaining: remaining,
      timer_start: null,
    });
  }, [room?.timer_start, room?.timer_duration, updateRoom]);

  const handleResume = useCallback(async () => {
    if (!room?.paused_remaining) return;
    await updateRoom({
      paused: false,
      timer_start: new Date().toISOString(),
      timer_duration: room.paused_remaining,
      paused_remaining: null,
    });
  }, [room?.paused_remaining, updateRoom]);

  const handleWorkTimerEnd = useCallback(async () => {
    if (timerEndedRef.current) return;
    timerEndedRef.current = true;
    playNotificationSound();
    await updateRoom({
      state: 'post_work' as RoomState,
      timer_start: null,
      timer_duration: null,
      paused: false,
      paused_remaining: null,
    });
  }, [updateRoom]);

  const handlePostWorkComplete = useCallback(
    async (answers: {
      completed_status: string;
      incomplete_reason: string;
      break_plan: string;
    }) => {
      // Update cycle record
      if (currentCycleId) {
        await supabase
          .from('cycles')
          .update({
            completed_status: answers.completed_status,
            incomplete_reason: answers.incomplete_reason || null,
            break_plan: answers.break_plan,
          })
          .eq('id', currentCycleId);
      }

      // Start break timer
      const duration = getBreakDuration(room?.mode ?? '25/5');
      await updateRoom({
        state: 'break' as RoomState,
        timer_start: new Date().toISOString(),
        timer_duration: duration,
        paused: false,
        paused_remaining: null,
      });
    },
    [currentCycleId, room?.mode, updateRoom]
  );

  const handleBreakTimerEnd = useCallback(async () => {
    if (timerEndedRef.current) return;
    timerEndedRef.current = true;
    playNotificationSound();
    await updateRoom({
      state: 'pre_work' as RoomState,
      timer_start: null,
      timer_duration: null,
      current_cycle: (room?.current_cycle ?? 1) + 1,
      paused: false,
      paused_remaining: null,
    });
    setCurrentCycleId(null);
  }, [updateRoom, room?.current_cycle]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-foreground/40">Loading...</div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Room not found</h1>
          <p className="text-foreground/50">This room may have been deleted or the link is invalid.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 pt-8">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-accent">Pom</span>buddy
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-foreground/40 text-sm">
              {room.mode} mode
            </span>
            <span className="text-foreground/20">|</span>
            <span className="text-foreground/40 text-sm">
              Cycle {room.current_cycle}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShareLink />
          <ThemeToggle />
        </div>
      </div>

      {/* Main content area */}
      <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center">
        {/* LOBBY */}
        {room.state === 'lobby' && (
          <div className="text-center animate-fade-in">
            <div className="mb-8">
              <div className="text-6xl mb-4">
                {room.mode === '25/5' ? '25' : '50'}
                <span className="text-foreground/30 text-3xl ml-1">min</span>
              </div>
              <p className="text-foreground/50">
                {room.mode === '25/5' ? '25 min work / 5 min break' : '50 min work / 10 min break'}
              </p>
            </div>
            <button
              onClick={handleStartPreWork}
              className="px-8 py-4 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-colors text-lg"
            >
              Start First Cycle
            </button>
          </div>
        )}

        {/* PRE_WORK */}
        {room.state === 'pre_work' && !preWorkDone && (
          <PreWorkFlow onComplete={handlePreWorkComplete} />
        )}

        {room.state === 'pre_work' && preWorkDone && (
          <div className="text-center animate-fade-in">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Pre-work complete</h3>
              <p className="text-foreground/50">
                Ready when you are. Start the timer when everyone is set.
              </p>
            </div>
            <button
              onClick={handleStartTimer}
              className="px-8 py-4 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-colors text-lg"
            >
              Start Timer
            </button>
          </div>
        )}

        {/* WORKING — condensed pre-work for late joiners */}
        {room.state === 'working' && !preWorkDone && (
          <PreWorkFlow onComplete={handleCondensedPreWorkComplete} condensed />
        )}

        {/* WORKING — timer */}
        {room.state === 'working' && preWorkDone && (
          <TimerDisplay
            timerStart={room.timer_start}
            timerDuration={room.timer_duration}
            onTimerEnd={handleWorkTimerEnd}
            label="Working"
            paused={room.paused}
            pausedRemaining={room.paused_remaining}
            onPause={handlePause}
            onResume={handleResume}
          />
        )}

        {/* POST_WORK */}
        {room.state === 'post_work' && (
          <PostWorkFlow onComplete={handlePostWorkComplete} />
        )}

        {/* BREAK */}
        {room.state === 'break' && (
          <TimerDisplay
            timerStart={room.timer_start}
            timerDuration={room.timer_duration}
            onTimerEnd={handleBreakTimerEnd}
            label="Break"
            paused={room.paused}
            pausedRemaining={room.paused_remaining}
            onPause={handlePause}
            onResume={handleResume}
          />
        )}
      </div>

      {/* Cycle History */}
      <CycleHistory cycles={cycles.filter((c) => c.completed_status !== null)} />
    </main>
  );
}
