import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role key (bypasses RLS)
// Only use this for server-side operations
function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

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

// Type for club data
export interface Club {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  is_public: boolean;
  join_mode?: string;
  head_chef_id: string;
  profiles?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  member_count: number;
}

// Helper function to fetch club data
export async function getClub(clubId: string): Promise<Club | null> {
  try {
    // Use server client for server-side queries (bypasses RLS)
    const serverClient = createServerClient();
    
    // Fetch club data with head chef info
    const { data: club, error } = await serverClient
      .from('clubs')
      .select(`
        id,
        name,
        description,
        avatar_url,
        is_public,
        join_mode,
        head_chef_id,
        profiles:head_chef_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('id', clubId)
      .single();

    if (error) {
      console.error('Error fetching club:', error);
      return null;
    }

    // Get member count
    const { count, error: countError } = await serverClient
      .from('club_members')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .eq('status', 'active');

    if (countError) {
      console.error('Error fetching member count:', countError);
    }

    // Supabase returns profiles as an array, but we want a single object
    const profiles = Array.isArray((club as any).profiles)
      ? (club as any).profiles[0]
      : (club as any).profiles;

    return {
      ...club,
      profiles,
      member_count: count || 0,
    } as Club;
  } catch (error) {
    console.error('Unexpected error fetching club:', error);
    return null;
  }
}

