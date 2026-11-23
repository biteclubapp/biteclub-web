import { cache } from 'react';
import { attachRecipeLineage, supabase } from '@/lib/supabase';
import { type RecipeRow } from '@/lib/seo';
import { pool } from './pool';
import { resolveDinnerPool, type DinnerCard } from './resolve';

const SELECT = 'id,title,user_id,created_at,updated_at,prep_time,cook_time,servings,instructions,is_deleted,parent_recipe_id,copied_from_recipe_id,branched_from_recipe_id,original_recipe_id,original_recipes:original_recipe_id(user_id),profiles!recipes_user_id_fkey(username)';

export const loadDinnerPool = cache(async (): Promise<DinnerCard[]> => {
  try {
    const { data, error } = await supabase.from('recipes')
      .select(SELECT)
      .in('id', pool.map(dish => dish.id));
    if (error) return resolveDinnerPool([], true);
    const rows = (data ?? []) as RecipeRow[];
    await attachRecipeLineage(rows);
    return resolveDinnerPool(rows, false);
  } catch {
    return resolveDinnerPool([], true);
  }
});
