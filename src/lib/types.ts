export type RoomMode = '25/5' | '50/10';
export type RoomState = 'lobby' | 'pre_work' | 'working' | 'post_work' | 'break';
export type CompletedStatus = 'yes' | 'mostly_yes' | 'mostly_no' | 'no';

export interface Room {
  id: string;
  created_at: string;
  mode: RoomMode;
  state: RoomState;
  timer_start: string | null;
  timer_duration: number | null;
  current_cycle: number;
  paused: boolean;
  paused_remaining: number | null;
}

export interface Cycle {
  id: string;
  room_id: string;
  cycle_number: number;
  target: string | null;
  first_step: string | null;
  success_criteria: string | null;
  failure_risks: string | null;
  completed_status: CompletedStatus | null;
  incomplete_reason: string | null;
  break_plan: string | null;
  created_at: string;
}
