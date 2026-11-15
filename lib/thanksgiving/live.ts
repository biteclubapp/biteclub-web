import { cache } from 'react';
import { attachRecipeLineage, supabase } from '@/lib/supabase';
import { KITCHEN_USER_ID, type RecipeRow } from '@/lib/seo';
import { menu } from './menu';

// React cache deduplicates metadata/page reads within a request, never across publish runs.
// Kitchen is pinned by user id (Guard). Lineage is attached so copied/branched rows cannot become hrefs.
export const liveThanksgivingRecipes = cache(async (): Promise<RecipeRow[]> => {
  try {
    const { data, error } = await supabase.from('recipes')
      .select('id,title,user_id,created_at,updated_at,is_deleted,parent_recipe_id,copied_from_recipe_id,branched_from_recipe_id,original_recipe_id,original_recipes:original_recipe_id(user_id)')
      .eq('user_id', KITCHEN_USER_ID)
      .in('title', menu.map(dish => dish.title))
      .order('created_at', { ascending: false });
    if (error) return [];
    const rows = (data ?? []) as RecipeRow[];
    await attachRecipeLineage(rows);
    return rows;
  } catch {
    // The full static menu and shopping list still work when the lookup is unavailable.
    return [];
  }
});
