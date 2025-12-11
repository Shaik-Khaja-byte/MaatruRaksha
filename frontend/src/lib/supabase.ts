import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ASHA {
  id: string;
  asha_id: string;
  name: string;
  phc_name: string;
}

export interface Mother {
  id: string;
  asha_id: string;
  name: string;
  age: number;
  phone: string;
  address: string;
  last_anc_date: string;
  gestation_weeks: number;
  flagged: boolean;
  visited: boolean;
  notes: string;
}

export interface PHCStock {
  id: string;
  asha_id: string;
  iron_tablets: number;
  tt_vaccine: number;
  updated_at: string;
}

export interface CallLog {
  id: string;
  asha_id: string;
  mother_id: string;
  phone: string;
  result: 'answered' | 'not_answered' | 'pressed_2';
  created_at: string;
}
