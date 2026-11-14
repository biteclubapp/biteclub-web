// Stable public cover image for indexable recipes (BIT-597): https://www.biteclub.fun/recipe/<id>/cover.
// Recipe JSON-LD and OG point here instead of a 1-hour signed imagedelivery.net URL. The server signs a short-lived
// URL, fetches the bytes and proxies them: no signature or key ever reaches HTML or a redirect Location.
// Only recipes lib/seo.ts recipeVisibility calls 'indexable' are served (not deleted, not private/draft, allowlisted
// author); everything else is a 404 that does not reveal why.
import { signImageUrl } from '@/lib/imageUrl';
import { resolveRecipeImageId } from '@/lib/coverImage';
import { recipeVisibility, type RecipeRow } from '@/lib/seo';
import { fetchRecipe } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const notFound = () =>
  new Response('Not found', {
    status: 404,
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300', 'X-Robots-Tag': 'noindex' },
  });

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return notFound();

  const recipe = await fetchRecipe(id);
  if (recipeVisibility(recipe as RecipeRow | null) !== 'indexable') return notFound();

  const imageId = await resolveRecipeImageId(recipe as RecipeRow);
  if (!imageId) {
    // Public recipe without a photo: the stable cover URL redirects to the placeholder.
    return new Response(null, {
      status: 302,
      headers: { Location: '/tomato.png', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(await signImageUrl(imageId), { cache: 'no-store' });
  } catch {
    console.error('Recipe cover fetch failed');
    return new Response('Unavailable', { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
  const type = upstream.headers.get('content-type') ?? '';
  if (!upstream.ok || !upstream.body || !type.startsWith('image/')) {
    console.error('Recipe cover upstream error:', upstream.status);
    return new Response('Unavailable', { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': type,
      // Short edge cache so a recipe that is deleted or made private stops being served within the hour.
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
