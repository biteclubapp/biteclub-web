# Link Preview Setup

This document explains how link previews work for BiteClub recipes and meals shared on social media.

## How It Works

When someone shares a BiteClub recipe or meal link (e.g., `https://biteclub.fun/recipe/123`), social media platforms request the page to extract Open Graph metadata for the preview card.

### Architecture

```
Social Media Bot → biteclub.fun → Next.js Server → Supabase (recipe data)
                                                  → Image Proxy → Media API → Cloudflare Images
```

### Key Components

1. **Server-Side Rendering** - Recipe and meal pages are server-rendered to generate meta tags
2. **Image Proxy** - `/api/image-proxy` endpoint fetches private images from Cloudflare and serves them publicly
3. **Open Graph Metadata** - `generateMetadata()` functions create social media preview tags

## Privacy & Security

✅ **Images stay private** in Cloudflare Images (no public variant needed)  
✅ **Next.js proxies images** - Images are fetched server-side with authentication  
✅ **Cached at CDN edge** - Vercel CDN caches the proxied images for performance  
✅ **No client-side exposure** - Image URLs are only exposed in final HTML meta tags  

## What Was Implemented

### 1. Recipe Pages (`/app/recipe/[id]/page.tsx`)
- Added `generateMetadata()` for Open Graph tags
- Converted from client-side to server-side rendering
- Images use proxy: `/api/image-proxy?uri={media_uri}`

### 2. Meal Pages (`/app/meal/[id]/page.tsx`)
- Created new page for meal sharing
- Same Open Graph functionality as recipes
- Images use the same proxy endpoint

### 3. Image Proxy (`/app/api/image-proxy/route.ts`)
- Already existed and working correctly
- Fetches signed URLs from media-api worker
- Streams images with 24-hour cache headers

## Environment Variables

Required in `.env.local` (see `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://biteclub.fun
NEXT_PUBLIC_MEDIA_API_URL=https://biteclub-media-api.biteclub.workers.dev
```

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
1. Check that media-api worker is accessible
2. Verify signed URLs are being generated
3. Check browser network tab for 403/404 errors on image-proxy
4. Clear social media cache (use debuggers above)

### Meta tags not updating
1. Clear social media platform cache
2. Verify `generateMetadata()` is running server-side
3. Check page source for `<meta property="og:image">` tags

### Image proxy errors
1. Check media-api worker logs in Cloudflare dashboard
2. Verify Supabase connection is working
3. Check that media_uri exists in database

