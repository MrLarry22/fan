import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rqutyfjgqcofuqbhhomw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdXR5ZmpncWNvZnVxYmhob213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTE0OTIsImV4cCI6MjA3MzA2NzQ5Mn0.i0UqBVr1f9jYibPjbB9rS-3NNu-EKEpSbnc_DPZ-mp0';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
});

// Database Types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'creator' | 'user';
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Creator {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  banner_url?: string;
  total_subscribers: number;
  total_revenue: number;
  total_likes?: number;
  media_count?: number;
  is_active: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface Content {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  content_url: string;
  content_type: 'image' | 'video' | 'text';
  is_premium: boolean;
  created_at: string;
  creators?: Creator;
}

export interface Subscription {
  id: string;
  user_id: string;
  creator_id: string;
  paypal_subscription_id?: string;
  status: 'active' | 'inactive' | 'cancelled' | 'pending';
  start_date: string;
  end_date?: string;
  amount: number;
  created_at: string;
  creators?: Creator;
}