import type { MetadataRoute } from "next";
import { INDEXABLE_AUTHOR_USERNAMES, KITCHEN_USER_ID, recipeSitemapRows, staticSitemapRows, type RecipeRow } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

// Rebuilt at most hourly. Recipe rows are filtered by lib/seo.ts recipeVisibility: indexable authors only, never
// soft-deleted/private/draft rows, and never /pick, club or invite URLs.
export const revalidate = 3600;

async function indexableAuthorIds(): Promise<string[]> {
  const ids = [KITCHEN_USER_ID];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .in("username", [...INDEXABLE_AUTHOR_USERNAMES]);
  if (error) {
    console.error("Sitemap author lookup failed:", error.code);
    return ids;
  }
  // Keep INDEXABLE_AUTHOR_USERNAMES order (@kitchen first).
  for (const name of INDEXABLE_AUTHOR_USERNAMES) {
    const row = (data ?? []).find((p) => p.username === name);
    if (row && !ids.includes(row.id)) ids.push(row.id);
  }
  return ids;
}

async function recipeRows(): Promise<MetadataRoute.Sitemap> {
  try {
    const authorIds = await indexableAuthorIds();
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .in("user_id", authorIds)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) {
      console.error("Sitemap recipe query failed:", error.code);
      return [];
    }
    return recipeSitemapRows((data ?? []) as RecipeRow[], authorIds);
  } catch {
    console.error("Sitemap recipe query failed");
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [...staticSitemapRows(), ...(await recipeRows())];
}
