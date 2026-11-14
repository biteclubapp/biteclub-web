// Public recipe pages: indexability, canonical URLs, Recipe JSON-LD, stable cover URL and sitemap rows (BIT-597).
// Pure functions shared by app/recipe/[id], app/sitemap.ts and their tests. No imports, so
// `node --test --experimental-strip-types` can run the tests directly.

/** The one public origin for canonical, sitemap, robots, OG and JSON-LD. Matches the app's BITECLUB_WEB_URL (BIT-580). */
export const SITE_ORIGIN = 'https://www.biteclub.fun';

export function siteUrl(path = '/'): string {
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

/** @kitchen (publish runbook). Matched by id as well as username so a lookup failure can't drop it. */
export const KITCHEN_USER_ID = 'd226f6a9-6be3-46e0-a3a8-3af034ce71bb';

/**
 * Authors whose recipes are indexed and listed in the sitemap, in sitemap order. Recipes by anyone else still render
 * for people holding the link, but noindex, without canonical or JSON-LD: there is no per-recipe "public" flag we can
 * rely on yet, and a link share is not consent to be in Google. Will's username is `will` (Analyst exclusions / Team metrics).
 */
export const INDEXABLE_AUTHOR_USERNAMES: readonly string[] = ['kitchen', 'will'];

/** The recipe fields these helpers read. Extra columns (is_deleted, visibility…) are read defensively. */
export type RecipeRow = {
  id: string;
  title?: string | null;
  description?: string | null;
  ingredients_text?: unknown;
  instructions?: unknown;
  prep_time?: number | null;
  cook_time?: number | null;
  servings?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  user_id?: string | null;
  profiles?: { username?: string | null; full_name?: string | null } | null;
  recipe_media?: Array<{ media_uri: string; media_type: string | null }> | null;
  original_recipes?: { original_recipe_media?: Array<{ media_uri: string; media_type: string | null }> | null } | null;
  [column: string]: unknown;
};

export type RecipeVisibility = 'gone' | 'unlisted' | 'indexable';

/**
 * gone: missing or soft-deleted → 404.
 * unlisted: viewable by link, but noindex (explicitly private/draft, or not an indexable author).
 * indexable: self-canonical, Recipe JSON-LD, stable cover image, sitemap.
 * Columns are checked only when present, so a schema without them can't throw; anything ambiguous fails closed.
 */
export function recipeVisibility(row: RecipeRow | null | undefined, authorIds: readonly string[] = [KITCHEN_USER_ID]): RecipeVisibility {
  if (!row || typeof row.id !== 'string' || !row.id) return 'gone';
  if (row.is_deleted === true || (row.deleted_at != null && row.deleted_at !== '')) return 'gone';
  if (row.is_public === false || row.is_private === true || row.is_draft === true) return 'unlisted';
  if (typeof row.visibility === 'string' && row.visibility !== 'public') return 'unlisted';
  if (row.status === 'draft' || row.published === false) return 'unlisted';
  if (!row.title || !String(row.title).trim()) return 'unlisted';
  const byId = typeof row.user_id === 'string' && (row.user_id === KITCHEN_USER_ID || authorIds.includes(row.user_id));
  const username = row.profiles?.username ?? null;
  const byName = typeof username === 'string' && INDEXABLE_AUTHOR_USERNAMES.includes(username);
  return byId || byName ? 'indexable' : 'unlisted';
}

export const recipePath = (id: string): string => `/recipe/${encodeURIComponent(id)}`;
export const recipeCanonical = (id: string): string => siteUrl(recipePath(id));
/** The stable, same-origin image URL for schema and OG. Served by app/recipe/[id]/cover/route.ts. */
export const recipeCoverUrl = (id: string): string => siteUrl(`${recipePath(id)}/cover`);
export const FALLBACK_IMAGE_URL = siteUrl('/tomato.png');

/** Cloudflare Images id: path-safe characters only, never a URL or a traversal. */
export function isImageId(value: unknown): value is string {
  return typeof value === 'string'
    && /^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$/.test(value)
    && !value.includes('..')
    && !value.includes('//');
}

/** The recipe's own first image, else the original recipe's (copied recipes). Videos are skipped. */
export function recipeImageId(row: RecipeRow): string | null {
  const media = [...(row.recipe_media ?? []), ...(row.original_recipes?.original_recipe_media ?? [])];
  const first = media.find(m => !m.media_type || m.media_type.startsWith('image'));
  return first && isImageId(first.media_uri) ? first.media_uri : null;
}

/** Schema/OG image for an indexable recipe: the stable cover route, or the tomato when it has no photo. */
export function recipeSchemaImage(row: RecipeRow): string {
  return recipeImageId(row) ? recipeCoverUrl(row.id) : FALLBACK_IMAGE_URL;
}

/** Ingredient strings as displayed: JSON-ish `{"text": …}` items are unwrapped, blanks dropped. */
export function ingredientLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => {
      if (typeof item === 'string' && item.startsWith('{') && item.includes('"text"')) {
        try {
          const parsed = JSON.parse(item);
          return typeof parsed?.text === 'string' ? parsed.text : item;
        } catch {
          return item;
        }
      }
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && typeof (item as { text?: unknown }).text === 'string') return (item as { text: string }).text;
      return '';
    })
    .map(s => s.trim())
    .filter(Boolean);
}

/** Instruction steps as displayed: a newline-separated string, or an array of strings / `{text}` / `{step}`. */
export function instructionSteps(value: unknown): string[] {
  const list: unknown[] = typeof value === 'string' ? value.split('\n') : Array.isArray(value) ? value : [];
  return list
    .map(item => {
      if (typeof item === 'string') return item;
      const obj = (item ?? {}) as { text?: unknown; step?: unknown };
      return typeof obj.text === 'string' && obj.text ? obj.text : String(obj.step ?? '');
    })
    .map(s => s.trim())
    .filter(Boolean);
}

/** Minutes → ISO 8601 duration (45 → PT45M, 90 → PT1H30M). Missing, zero, negative or non-numeric → undefined. */
export function isoDuration(minutes: unknown): string | undefined {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) return undefined;
  const total = Math.round(minutes);
  if (total <= 0) return undefined;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}`;
}

/** schema.org Recipe for an indexable recipe. Missing optional fields are omitted, never invented. */
export function recipeJsonLd(row: RecipeRow): Record<string, unknown> {
  const authorName = row.profiles?.username?.trim() || row.profiles?.full_name?.trim();
  const prep = isoDuration(row.prep_time);
  const cook = isoDuration(row.cook_time);
  const total = prep && cook ? isoDuration((row.prep_time as number) + (row.cook_time as number)) : undefined;
  const servings = typeof row.servings === 'number' && row.servings > 0 ? String(row.servings) : undefined;
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: String(row.title ?? '').trim(),
    url: recipeCanonical(row.id),
    image: [recipeSchemaImage(row)],
    author: authorName ? { '@type': 'Person', name: authorName } : undefined,
    description: row.description?.trim() || undefined,
    datePublished: row.created_at || undefined,
    prepTime: prep,
    cookTime: cook,
    totalTime: total,
    recipeYield: servings,
    recipeIngredient: ingredientLines(row.ingredients_text),
    recipeInstructions: instructionSteps(row.instructions).map(text => ({ '@type': 'HowToStep', text })),
  };
  for (const k of Object.keys(ld)) if (ld[k] === undefined) delete ld[k];
  return ld;
}

/** JSON for an inline <script>: `<` escaped so user text can't close the tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export type SitemapRow = { url: string; lastModified?: Date; changeFrequency?: 'weekly' | 'monthly' | 'yearly'; priority?: number };

export function staticSitemapRows(): SitemapRow[] {
  return [
    { url: siteUrl('/'), lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: siteUrl('/terms'), lastModified: new Date('2025-08-18'), changeFrequency: 'yearly', priority: 0.3 },
    { url: siteUrl('/privacy'), lastModified: new Date('2025-08-18'), changeFrequency: 'yearly', priority: 0.3 },
  ];
}

/**
 * Recipe sitemap rows: indexable recipes only (no deleted, private, draft or other authors), in author order, deduped.
 * Only /recipe/<id> URLs are ever produced: never /pick, clubs or invites.
 */
export function recipeSitemapRows(rows: readonly RecipeRow[], authorIds: readonly string[]): SitemapRow[] {
  const rank = (r: RecipeRow) => {
    const i = authorIds.indexOf(r.user_id ?? '');
    return i === -1 ? authorIds.length : i;
  };
  const seen = new Set<string>();
  return rows
    .filter(r => recipeVisibility(r, authorIds) === 'indexable')
    .sort((a, b) => rank(a) - rank(b))
    .filter(r => (seen.has(r.id) ? false : (seen.add(r.id), true)))
    .map(r => {
      const stamp = Date.parse(String(r.updated_at || r.created_at || ''));
      return {
        url: recipeCanonical(r.id),
        ...(Number.isNaN(stamp) ? {} : { lastModified: new Date(stamp) }),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    });
}
