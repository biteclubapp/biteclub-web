import { needsRecipeLineage, type RecipeRow } from './seo';
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

// Ancestors deliberately exclude media. The anon client keeps RLS in effect.
export const LINEAGE_SELECT = 'id,user_id,parent_recipe_id,copied_from_recipe_id,branched_from_recipe_id,original_recipe_id,original_recipes:original_recipe_id(user_id)';
const LINEAGE_POINTERS = ['parent_recipe_id', 'copied_from_recipe_id', 'branched_from_recipe_id'] as const;

export async function attachRecipeLineage(rows: RecipeRow[]): Promise<void> {
  const catalog = new Map<string, RecipeRow>();
  for (const row of rows) catalog.set(row.id, row);
  for (const row of rows) {
    for (const name of ['parent', 'copied_from', 'branched_from']) {
      const nested = row[name] as RecipeRow | null | undefined;
      if (nested?.id && !catalog.has(nested.id)) catalog.set(nested.id, nested);
    }
  }
  const attempted = new Set<string>();
  // Embedded nodes count as the first hop; the verifier enforces the exact per-root depth cap.
  for (let depth = 0; depth < 20; depth++) {
    const missing = new Set<string>();
    for (const node of catalog.values()) {
      for (const key of LINEAGE_POINTERS) {
        const id = node[key];
        if (typeof id === 'string' && id && !catalog.has(id) && !attempted.has(id)) missing.add(id);
      }
    }
    if (!missing.size) break;
    const ids = [...missing];
    for (let offset = 0; offset < ids.length; offset += 200) {
      const batch = ids.slice(offset, offset + 200);
      batch.forEach(id => attempted.add(id));
      try {
        const { data, error } = await supabase.from('recipes').select(LINEAGE_SELECT).in('id', batch);
        if (!error) for (const node of (data ?? []) as unknown as RecipeRow[]) catalog.set(node.id, node);
      } catch {
        // Missing ancestors remain absent, so visibility fails closed.
      }
    }
  }
  for (const row of rows) row.__lineage = catalog;
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
  original_recipes?: {
    user_id?: string | null;
    original_recipe_media?: Array<{
      media_uri: string;
      media_type: string | null;
    }> | null;
  } | null;
  // Other columns (is_deleted, …) come through `*` and are read by lib/seo.ts recipeVisibility.
  [column: string]: unknown;
}

/**
 * A recipe row with author and media, via the anon client (RLS applies). Callers must still gate on
 * lib/seo.ts recipeVisibility: this returns soft-deleted and non-public rows too. Never logs the row.
 */
export async function fetchRecipe(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      parent:parent_recipe_id (${LINEAGE_SELECT}),
      copied_from:copied_from_recipe_id (${LINEAGE_SELECT}),
      branched_from:branched_from_recipe_id (${LINEAGE_SELECT}),
      profiles!recipes_user_id_fkey (
        username,
        full_name,
        avatar_url
      ),
      recipe_media (
        media_uri,
        media_type
      ),
      original_recipes:original_recipe_id (
        user_id,
        original_recipe_media (
          media_uri,
          media_type
        )
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Recipe fetch failed:', error.code);
    return null;
  }
  const row = (data as Recipe | null) ?? null;
  // Non-allowlisted authors are always unlisted (recipeVisibility never reads their lineage), so skip the walk.
  if (row && needsRecipeLineage(row as RecipeRow)) await attachRecipeLineage([row as RecipeRow]);
  return row;
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

