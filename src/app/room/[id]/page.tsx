'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Room, Cycle, Participant, RoomState } from '@/lib/types';
import { pickEmoji } from '@/lib/emojis';
import CompactTimer from '@/components/CompactTimer';
import PreWorkFlow from '@/components/PreWorkFlow';
import PostWorkFlow from '@/components/PostWorkFlow';
import CycleHistory from '@/components/CycleHistory';
import ShareLink from '@/components/ShareLink';
import ThemeToggle from '@/components/ThemeToggle';
import SessionPlan from '@/components/SessionPlan';
import PlanProgress from '@/components/PlanProgress';
import NameEntry from '@/components/NameEntry';
import ParticipantList from '@/components/ParticipantList';

function getWorkDuration(mode: string): number {
  return mode === '50/10' ? 50 * 60 : 25 * 60;
}

function getBreakDuration(mode: string): number {
  return mode === '50/10' ? 10 * 60 : 5 * 60;
}

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const notes = [830, 1000, 830, 1000, 830];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const startTime = ctx.currentTime + i * 0.25;
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  } catch {
    // Audio not available
  }
  // Browser notification
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification('Pombuddy', { body: 'Timer is up!' });
  }
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCycleId, setCurrentCycleId] = useState<string | null>(null);
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [preWorkDone, setPreWorkDone] = useState(false);
  const [sessionPlan, setSessionPlan] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(`pombuddy-plan-${roomId}`);
      return stored ? (JSON.parse(stored).plan ?? []) : [];
    } catch { return []; }
  });
  const [planIndex, setPlanIndex] = useState(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = localStorage.getItem(`pombuddy-plan-${roomId}`);
      return stored ? (JSON.parse(stored).planIndex ?? 0) : 0;
    } catch { return 0; }
  });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantId, setParticipantId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`pombuddy-participant-${roomId}`) ?? null;
  });
  const timerEndedRef = useRef(false);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Save session plan to localStorage when it changes
  useEffect(() => {
    if (sessionPlan.length > 0) {
      localStorage.setItem(
        `pombuddy-plan-${roomId}`,
        JSON.stringify({ plan: sessionPlan, planIndex })
      );
    }
  }, [sessionPlan, planIndex, roomId]);

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

  // Fetch participants + subscribe to realtime changes
  useEffect(() => {
    async function fetchParticipants() {
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomId);
      if (data) setParticipants(data as Participant[]);
    }

    fetchParticipants();

    const channel = supabase
      .channel(`participants-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          // Re-fetch all participants on any change
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Heartbeat: update last_seen_at every 30s
  useEffect(() => {
    if (!participantId) return;

    const interval = setInterval(() => {
      supabase
        .from('participants')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', participantId)
        .then();
    }, 30_000);

    return () => clearInterval(interval);
  }, [participantId]);

  // Cleanup: best-effort delete on unload
  useEffect(() => {
    if (!participantId) return;

    const handleUnload = () => {
      navigator.sendBeacon?.(
        // sendBeacon doesn't work with Supabase client, so we do a best-effort delete
        // The stale detection (opacity dim) handles cases where this fails
        ''
      );
      // Use supabase delete as best-effort
      supabase
        .from('participants')
        .delete()
        .eq('id', participantId)
        .then();
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      // Also try to delete on React unmount
      supabase
        .from('participants')
        .delete()
        .eq('id', participantId)
        .then();
    };
  }, [participantId]);

  // Handle name submission: create participant
  const handleNameSubmit = useCallback(
    async (name: string) => {
      const existingEmojis = participants.map((p) => p.emoji);
      const emoji = pickEmoji(existingEmojis);

      const { data } = await supabase
        .from('participants')
        .insert({
          room_id: roomId,
          name,
          emoji,
        })
        .select('id')
        .single();

      if (data) {
        setParticipantId(data.id);
        localStorage.setItem(`pombuddy-participant-${roomId}`, data.id);
      }
    },
    [roomId, participants]
  );

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
      setCurrentTarget(answers.target);
      setPreWorkDone(true);

      // Update participant's current_target so others can see it
      if (participantId) {
        await supabase
          .from('participants')
          .update({ current_target: answers.target })
          .eq('id', participantId);
      }
    },
    [roomId, room?.current_cycle, participantId]
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
  const handleCondensedPreWorkComplete = useCallback(async (answers: {
    target: string;
    environment_check: string;
    first_step: string;
    success_criteria: string;
    failure_risks: string;
  }) => {
    setCurrentTarget(answers.target);
    setPreWorkDone(true);

    if (participantId) {
      await supabase
        .from('participants')
        .update({ current_target: answers.target })
        .eq('id', participantId);
    }
  }, [participantId]);

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

  const handleModeChange = useCallback(async (newMode: string) => {
    await updateRoom({ mode: newMode as Room['mode'] });
  }, [updateRoom]);

  const handleSetTime = useCallback(async (seconds: number) => {
    await updateRoom({
      timer_start: new Date().toISOString(),
      timer_duration: seconds,
      paused: false,
      paused_remaining: null,
    });
  }, [updateRoom]);

  const handleEmojiChange = useCallback(async (emoji: string) => {
    if (!participantId) return;
    await supabase
      .from('participants')
      .update({ emoji })
      .eq('id', participantId);
  }, [participantId]);

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

    const nextPlanIndex = planIndex + 1;
    const planIsActive = sessionPlan.filter(s => s.trim()).length > 0;

    if (planIsActive && nextPlanIndex >= sessionPlan.filter(s => s.trim()).length) {
      // All planned poms are done
      setPlanIndex(nextPlanIndex);
      setSessionComplete(true);
      await updateRoom({
        state: 'pre_work' as RoomState,
        timer_start: null,
        timer_duration: null,
        current_cycle: (room?.current_cycle ?? 1) + 1,
        paused: false,
        paused_remaining: null,
      });
    } else {
      setPlanIndex(nextPlanIndex);
      await updateRoom({
        state: 'pre_work' as RoomState,
        timer_start: null,
        timer_duration: null,
        current_cycle: (room?.current_cycle ?? 1) + 1,
        paused: false,
        paused_remaining: null,
      });
    }

    setCurrentCycleId(null);
    setCurrentTarget(null);

    // Clear participant's current_target for the next cycle
    if (participantId) {
      await supabase
        .from('participants')
        .update({ current_target: null })
        .eq('id', participantId);
    }
  }, [updateRoom, room?.current_cycle, planIndex, sessionPlan, participantId]);

  // Compute the planned target for the current cycle (if plan exists)
  const activePlan = sessionPlan.filter(s => s.trim());
  const plannedTarget = activePlan.length > 0 && planIndex < activePlan.length
    ? activePlan[planIndex]
    : undefined;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-foreground/20 text-sm tracking-widest uppercase animate-pulse-subtle">Loading</div>
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

  // Gate: require name entry before showing room
  if (!participantId) {
    return <NameEntry onSubmit={handleNameSubmit} />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 pt-6 sm:pt-8">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="mr-1.5">🍅</span><span className="text-accent">Pom</span>buddy
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-foreground/30 text-xs font-medium uppercase tracking-[0.1em]">
              {room.mode}
            </span>
            <span className="text-foreground/15">·</span>
            <span className="text-foreground/30 text-xs font-medium uppercase tracking-[0.1em]">
              Cycle {room.current_cycle}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShareLink />
          <ThemeToggle />
        </div>
      </div>

      {/* Timer — rendered near top of page (outside centered container) */}
      {room.state === 'working' && (
        <div className="w-full max-w-lg flex flex-col items-center mt-4">
          {activePlan.length > 0 && preWorkDone && (
            <PlanProgress plan={activePlan} currentIndex={planIndex} />
          )}
          <CompactTimer
            timerStart={room.timer_start}
            timerDuration={room.timer_duration}
            onTimerEnd={handleWorkTimerEnd}
            label="Working"
            paused={room.paused}
            pausedRemaining={room.paused_remaining}
            onPause={handlePause}
            onResume={handleResume}
            target={preWorkDone ? (currentTarget ?? plannedTarget) : undefined}
            mode={room.mode}
            onModeChange={handleModeChange}
            onSetTime={handleSetTime}
          />
          {!preWorkDone && (
            <div className="w-full mt-6">
              <PreWorkFlow onComplete={handleCondensedPreWorkComplete} condensed prefilledTarget={plannedTarget} />
            </div>
          )}
        </div>
      )}

      {room.state === 'break' && (
        <div className="w-full max-w-lg flex flex-col items-center mt-4">
          {activePlan.length > 0 && (
            <PlanProgress plan={activePlan} currentIndex={planIndex} />
          )}
          <CompactTimer
            timerStart={room.timer_start}
            timerDuration={room.timer_duration}
            onTimerEnd={handleBreakTimerEnd}
            label="Break"
            paused={room.paused}
            pausedRemaining={room.paused_remaining}
            onPause={handlePause}
            onResume={handleResume}
            mode={room.mode}
            onModeChange={handleModeChange}
            onSetTime={handleSetTime}
          />
        </div>
      )}

      {/* Participants */}
      <ParticipantList participants={participants} currentParticipantId={participantId} onEmojiChange={handleEmojiChange} />

      {/* Main content area — vertically centered for non-timer states */}
      <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center">
        {/* LOBBY */}
        {room.state === 'lobby' && (
          <div className="text-center animate-fade-in w-full flex flex-col items-center">
            <div className="mb-10">
              <div className="text-8xl font-bold font-mono tracking-tight mb-3">
                {room.mode === '25/5' ? '25' : '50'}
                <span className="text-foreground/20 text-4xl ml-1 font-sans font-normal">min</span>
              </div>
              <p className="text-foreground/30 text-sm">
                {room.mode === '25/5' ? '25 min work / 5 min break' : '50 min work / 10 min break'}
              </p>
            </div>
            <button
              onClick={handleStartPreWork}
              className="px-10 py-4 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-lg active:scale-[0.98]"
            >
              {sessionPlan.filter(s => s.trim()).length > 0
                ? `Start Session (${sessionPlan.filter(s => s.trim()).length} poms)`
                : 'Start First Cycle'}
            </button>
            <SessionPlan plan={sessionPlan.length > 0 ? sessionPlan : ['']} onChange={setSessionPlan} />
          </div>
        )}

        {/* SESSION COMPLETE */}
        {room.state === 'pre_work' && sessionComplete && (
          <div className="text-center animate-fade-in">
            <div className="mb-8">
              <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Session complete!</h3>
              <p className="text-foreground/35 text-sm">
                You finished all {sessionPlan.filter(s => s.trim()).length} planned poms
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSessionComplete(false);
                }}
                className="px-8 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]"
              >
                Continue Freestyle
              </button>
            </div>
          </div>
        )}

        {/* PRE_WORK */}
        {room.state === 'pre_work' && !preWorkDone && !sessionComplete && (
          <PreWorkFlow
            onComplete={handlePreWorkComplete}
            prefilledTarget={plannedTarget}
          />
        )}

        {room.state === 'pre_work' && preWorkDone && !sessionComplete && (
          <div className="text-center animate-fade-in">
            <div className="mb-8">
              <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
                <svg className="w-9 h-9 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Ready to go</h3>
              <p className="text-foreground/35 text-sm">
                Start the timer when everyone is set
              </p>
            </div>
            <button
              onClick={handleStartTimer}
              className="px-10 py-4 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-lg active:scale-[0.98]"
            >
              Start Timer
            </button>
          </div>
        )}

        {/* POST_WORK */}
        {room.state === 'post_work' && (
          <PostWorkFlow onComplete={handlePostWorkComplete} />
        )}
      </div>

      {/* Cycle History */}
      <CycleHistory cycles={cycles.filter((c) => c.completed_status !== null)} />
    </main>
  );
}
