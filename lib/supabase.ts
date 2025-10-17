import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for recipe data
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  source?: string;
  rating?: number;
  ingredients_text?: string[];
  instructions?: any;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  created_at: string;
  user_id: string;
  profiles?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  recipe_media?: Array<{
    media_uri: string;
    media_type: string | null;
  }>;
}

