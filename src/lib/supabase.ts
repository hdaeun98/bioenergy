import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type CircadianProfile = {
  id: string;
  user_id: string;
  chronotype: 'morning' | 'intermediate' | 'evening';
  gender: 'male' | 'female';
  natural_wake_time: string;
  peak_energy_time: string;
  survey_responses: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type MenstrualCycle = {
  id: string;
  user_id: string;
  last_period_start: string;
  next_period_expected: string;
  cycle_length: number;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
};
