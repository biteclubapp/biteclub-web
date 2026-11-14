// Public recipe pages: indexability, canonical URLs, Recipe JSON-LD, stable cover URL and sitemap rows (BIT-597).
// Pure functions shared by app/recipe/[id], app/sitemap.ts and their tests. No imports, so
// `node --test --experimental-strip-types` can run the tests directly.

/** The one public origin for canonical, sitemap, robots, OG and JSON-LD. Matches the app's BITECLUB_WEB_URL (BIT-580). */
export const SITE_ORIGIN = 'https://www.biteclub.fun';

export function siteUrl(path = '/'): string {
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

/** @kitchen (publish runbook). */
export const KITCHEN_USER_ID = 'd226f6a9-6be3-46e0-a3a8-3af034ce71bb';

export const WILL_USER_ID = 'e74a8033-1d4f-49c7-906c-3af9141e48d7';
export const INDEXABLE_AUTHOR_IDS = [KITCHEN_USER_ID, WILL_USER_ID] as const;

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
  original_recipes?: { user_id?: string | null; original_recipe_media?: Array<{ media_uri: string; media_type: string | null }> | null } | null;
  [column: string]: unknown;
};

export type LineageCatalog = Map<string, RecipeRow> | Record<string, RecipeRow>;
const LINEAGE_LINKS = [
  ['parent_recipe_id', 'parent', 'parent_recipe'],
  ['copied_from_recipe_id', 'copied_from', 'copied_from_recipe'],
  ['branched_from_recipe_id', 'branched_from', 'branched_from_recipe'],
] as const;

/** Attached __lineage catalog supplies ancestors beyond the embedded first hop. Unknown ownership fails closed. */
export function sameAuthorLineage(row: RecipeRow): boolean {
  if (typeof row.user_id !== 'string' || !row.user_id) return false;
  const catalog = row.__lineage as LineageCatalog | undefined;
  const active = new Set<string>();
  function walk(node: RecipeRow, depth: number): boolean {
    if (depth > 20 || node.user_id !== row.user_id || !node.id || active.has(node.id)) return false;
    if (node.original_recipe_id != null) {
      const owner = node.original_recipes?.user_id;
      if (owner !== null && owner !== row.user_id) return false;
    }
    active.add(node.id);
    for (const [pointer, short, long] of LINEAGE_LINKS) {
      const id = node[pointer];
      if (id == null) continue;
      if (typeof id !== 'string' || !id) return false;
      const nested = (node[short] ?? node[long]) as RecipeRow | undefined;
      const ancestor = nested ?? (catalog instanceof Map ? catalog.get(id) : catalog?.[id]);
      if (!ancestor || ancestor.id !== id || !walk(ancestor, depth + 1)) return false;
    }
    active.delete(node.id);
    return true;
  }
  return walk(row, 0);
}

/** Only allowlisted authors can be indexable, so only their rows need the lineage walk; others are unlisted without it. */
export function needsRecipeLineage(row: RecipeRow | null | undefined, authorIds: readonly string[] = INDEXABLE_AUTHOR_IDS): boolean {
  return typeof row?.user_id === 'string' && authorIds.includes(row.user_id);
}

export type RecipeVisibility = 'gone' | 'unlisted' | 'indexable';

/**
 * gone: missing or soft-deleted → 404.
 * unlisted: viewable by link, but noindex (explicitly private/draft, or not an indexable author).
 * indexable: self-canonical, Recipe JSON-LD, stable cover image, sitemap.
 * Columns are checked only when present, so a schema without them can't throw; anything ambiguous fails closed.
 */
export function recipeVisibility(row: RecipeRow | null | undefined, authorIds: readonly string[] = INDEXABLE_AUTHOR_IDS): RecipeVisibility {
  if (!row || typeof row.id !== 'string' || !row.id) return 'gone';
  if (row.is_deleted === true || (row.deleted_at != null && row.deleted_at !== '')) return 'gone';
  if (row.is_public === false || row.is_private === true || row.is_draft === true) return 'unlisted';
  if (typeof row.visibility === 'string' && row.visibility !== 'public') return 'unlisted';
  if (row.status === 'draft' || row.published === false) return 'unlisted';
  if (!row.title || !String(row.title).trim()) return 'unlisted';
  return needsRecipeLineage(row, authorIds) && sameAuthorLineage(row)
    ? 'indexable' : 'unlisted';
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

/**
 * Own first image, else the original recipe's image. Videos are skipped. By default (indexable output: cover route,
 * JSON-LD, indexable page) the original's image counts only when its owner is explicitly null or the same author.
 * Link-only pages pass `sameAuthorMedia: false` to keep the pre-BIT-597 photo for ordinary copies.
 */
export function recipeImageId(row: RecipeRow, { sameAuthorMedia = true }: { sameAuthorMedia?: boolean } = {}): string | null {
  const owner = row.original_recipes?.user_id;
  const safeOriginal = !sameAuthorMedia || owner === null || (typeof row.user_id === 'string' && owner === row.user_id);
  const media = [...(row.recipe_media ?? []), ...(safeOriginal ? row.original_recipes?.original_recipe_media ?? [] : [])];
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
    { url: siteUrl('/thanksgiving'), changeFrequency: 'weekly', priority: 0.8 },
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

/** Exact-title @kitchen match only; drafts, private and soft-deleted rows cannot become menu links. */
export function publishedKitchenRecipe(title: string, rows: readonly RecipeRow[]): RecipeRow | undefined {
  return rows.find(row => row.title === title
    && row.user_id === KITCHEN_USER_ID
    && recipeVisibility(row) === 'indexable');
}

export function kitchenRecipeHref(title: string, rows: readonly RecipeRow[]): string | undefined {
  const row = publishedKitchenRecipe(title, rows);
  return row ? recipePath(row.id) : undefined;
}
