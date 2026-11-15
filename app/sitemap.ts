import type { MetadataRoute } from "next";
import { INDEXABLE_AUTHOR_IDS, recipeSitemapRows, staticSitemapRows, type RecipeRow } from "@/lib/seo";
import { attachRecipeLineage, supabase } from "@/lib/supabase";

// Rebuilt at most hourly. Recipe rows are filtered by lib/seo.ts recipeVisibility: indexable authors only, never
// soft-deleted/private/draft rows, and never /pick, club or invite URLs.
export const revalidate = 3600;

async function recipeRows(): Promise<MetadataRoute.Sitemap> {
  try {
    const authorIds = [...INDEXABLE_AUTHOR_IDS];
    // Only columns that exist on public.recipes today, plus original_recipes.user_id.
    // recipeVisibility also reads deleted_at/is_public/visibility/status/published when present; those
    // columns are not in the current schema, so they are omitted rather than breaking the query.
    const { data, error } = await supabase
      .from("recipes")
      .select("id,title,user_id,created_at,updated_at,is_deleted,parent_recipe_id,copied_from_recipe_id,branched_from_recipe_id,original_recipe_id,original_recipes:original_recipe_id(user_id)")
      .in("user_id", authorIds)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) {
      console.error("Sitemap recipe query failed:", error.code);
      return [];
    }
    const rows = (data ?? []) as RecipeRow[];
    await attachRecipeLineage(rows);
    return recipeSitemapRows(rows, authorIds);
  } catch {
    console.error("Sitemap recipe query failed");
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [...staticSitemapRows(), ...(await recipeRows())];
}
