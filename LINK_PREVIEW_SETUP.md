# Link Preview Setup

This document explains how link previews work for BiteClub recipes and meals shared on social media.

## How It Works

When someone shares a BiteClub recipe or meal link (e.g., `https://biteclub.fun/recipe/123`), social media platforms request the page to extract Open Graph metadata for the preview card.

### Architecture

```
Social Media Bot → biteclub.fun → Next.js Server → Supabase (recipe data)
                                                  → Cloudflare Images (signed URLs)
```

### Key Components

1. **Server-Side Rendering** - Recipe and meal pages are server-rendered to generate meta tags
2. **Signed URLs** - Images use time-limited, cryptographically signed URLs (1-hour expiration)
3. **Open Graph Metadata** - `generateMetadata()` functions create social media preview tags with signed image URLs

## Privacy & Security

✅ **Images stay private** in Cloudflare Images (requireSignedURLs enabled)
✅ **Time-limited access** - Signed URLs expire after 1 hour
✅ **HMAC-SHA256 signatures** - URLs can't be forged or tampered with
✅ **Direct delivery** - Images served directly from Cloudflare's global CDN (no proxy overhead)
✅ **No server bandwidth** - Next.js generates signed URLs but doesn't proxy image data  

## What Was Implemented

### 1. Recipe Pages (`/app/recipe/[id]/page.tsx`)
- Server-side rendering with `generateMetadata()` for Open Graph tags
- Generates signed Cloudflare Image URLs for social media previews
- Falls back to tomato.png if no image exists

### 2. Meal Pages (`/app/meal/[id]/page.tsx`)
- Server-side rendering for meal sharing
- Same Open Graph functionality as recipes
- Uses signed URLs for meal photos

### 3. Image URL Utility (`/lib/imageUrl.ts`)
- `signImageUrl()` function generates HMAC-SHA256 signed URLs
- Based on Cloudflare Images signed URL specification
- 1-hour expiration on all signed URLs

## Environment Variables

Required in `.env.local` and Vercel:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site config
NEXT_PUBLIC_BASE_URL=https://biteclub.fun

# Cloudflare Images (for signed URLs)
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH=your_account_hash
CLOUDFLARE_IMAGES_KEY_VALUE=your_signing_key_secret
```

**Important**:
- `CLOUDFLARE_IMAGES_KEY_VALUE` must be kept secret (server-side only, no `NEXT_PUBLIC_` prefix)
- Get the signing key from: Cloudflare Dashboard → Images → Signed URL Keys
- If you don't have a signing key, create one in the Cloudflare Images dashboard

## Testing Link Previews

### Local Testing
1. Run the dev server: `npm run dev`
2. Use ngrok to expose locally: `ngrok http 3000`
3. Test with social media debuggers:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

### Production Testing
1. Deploy to Vercel: `git push`
2. Test with real URLs: `https://biteclub.fun/recipe/{id}`
3. Use social media debuggers (links above)

## Deployment Checklist

- [ ] Set environment variables in Vercel
- [ ] Ensure `biteclub.fun` domain is configured in Vercel
- [ ] Test a recipe link in Facebook debugger
- [ ] Test a meal link in Twitter validator
- [ ] Verify images load in preview cards

## Troubleshooting

### Images not showing in previews
1. Check that `CLOUDFLARE_IMAGES_KEY_VALUE` is set in Vercel environment variables
2. Verify signed URLs are being generated (check Next.js server logs)
3. Test a signed URL directly in your browser (should load the image)
4. Check that `requireSignedURLs` is enabled for your Cloudflare Images
5. Clear social media cache (use debuggers above)

### Meta tags not updating
1. Clear social media platform cache
2. Verify `generateMetadata()` is running server-side
3. Check page source for `<meta property="og:image">` tags
4. Verify the signed URL in the og:image tag is valid

### Signed URL errors
1. Verify signing key exists in Cloudflare Images dashboard
2. Check that `CLOUDFLARE_IMAGES_KEY_VALUE` matches the key in Cloudflare
3. Ensure `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH` is correct
4. Test URL generation locally with `signImageUrl()` function
5. Check that image IDs (media_uri) exist in Cloudflare Images

### 403 Forbidden on images
1. Signature might be invalid - check the signing key
2. URL might be expired (1 hour limit)
3. Account hash might be incorrect

