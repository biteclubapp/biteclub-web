import 'server-only';
import { supabase } from './supabase';
import { acceptedCoverImageId, recipeImageId, type RecipeRow } from './seo';

export { acceptedCoverImageId } from './seo';

/** Optional public RPC: missing deployments and failures quietly use the existing fallback. */
export async function fetchOwnRecipeCoverId(id: string): Promise<string | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  try {
    const { data, error } = await supabase.rpc('recipe_cover_image_id', { p_recipe_id: id });
    return acceptedCoverImageId(data, error);
  } catch {
    return null;
  }
}

export async function resolveRecipeImageId(row: RecipeRow): Promise<string | null> {
  return (await fetchOwnRecipeCoverId(row.id)) ?? recipeImageId(row);
}
