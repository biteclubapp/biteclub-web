import { cache } from 'react';
import { supabase } from '@/lib/supabase';
import { KITCHEN_USER_ID, type RecipeRow } from '@/lib/seo';
import { menu } from './menu';

// React cache deduplicates metadata/page reads within a request, never across publish runs.
export const liveThanksgivingRecipes = cache(async (): Promise<RecipeRow[]> => {
  try {
    const ids = [KITCHEN_USER_ID];
    const { data: profiles } = await supabase.from('profiles').select('id').eq('username', 'kitchen');
    for (const profile of profiles ?? []) if (!ids.includes(profile.id)) ids.push(profile.id);
    const { data, error } = await supabase.from('recipes')
      .select('*, profiles!recipes_user_id_fkey(username)')
      .in('user_id', ids).in('title', menu.map(dish => dish.title))
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as RecipeRow[];
  } catch {
    // The full static menu and shopping list still work when the lookup is unavailable.
    return [];
  }
});
