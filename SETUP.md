# BiteClub Web Setup Guide

This is the web component of BiteClub that displays recipe previews when users share recipe links. It's built with Next.js 15 and handles:

- Recipe preview pages with Open Graph meta tags for beautiful link previews
- Deep linking to the mobile app
- Fallback experience for users without the app installed

## Prerequisites

- Node.js 20+ installed
- Access to the BiteClub Supabase project

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

You can find these values in the BiteClub mobile app's `.env` file or in the Supabase project settings.

### 3. Verify Apple Team ID

Check the Apple Team ID in `/public/.well-known/apple-app-site-association`. The current value is `WQHKN43K8Z`. 

To verify this is correct:
1. Go to https://developer.apple.com/account
2. Check your Team ID in the membership section
3. Update the `appID` in the file if needed (format: `{TEAM_ID}.{BUNDLE_ID}`)

### 4. Configure Android SHA256 Fingerprint

For Android deep linking to work, you need to add your app's SHA256 fingerprint to `/public/.well-known/assetlinks.json`.

To get your fingerprint:
```bash
# For production
keytool -list -v -keystore /path/to/your/keystore -alias your-key-alias

# For development
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the SHA256 fingerprint and add it to the `assetlinks.json` file.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

### 6. Test Recipe Pages

To test a recipe page locally:
```
http://localhost:3000/recipe/{recipe_id}
```

Replace `{recipe_id}` with an actual recipe ID from your Supabase database.

## Deployment

### Deploy to Vercel (Recommended)

1. Push this repo to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Serve the `.well-known` files correctly
- Enable edge functions for dynamic metadata
- Set up the custom domain (biteclub.fun)

### Important: Domain Configuration

After deploying, make sure `biteclub.fun` is configured in:
1. Vercel (or your hosting provider)
2. Your DNS provider
3. The mobile app's `app.config.js` (already done - `associatedDomains: ["applinks:biteclub.fun"]`)

## How It Works

### Deep Linking Flow

1. User shares a recipe link: `https://biteclub.fun/recipe/123`
2. When clicked:
   - **If app is installed**: iOS/Android opens the BiteClub app directly
   - **If app is NOT installed**: Opens in browser, shows recipe preview + "Download App" button

### Link Preview Generation

The recipe page includes Open Graph and Twitter Card meta tags that are dynamically generated from the recipe data. This means when you paste a link into:
- iMessage
- WhatsApp
- Slack
- Twitter
- Facebook

It will show a beautiful preview with the recipe image, title, and description.

### Universal Links Configuration

The app uses:
- **iOS**: `.well-known/apple-app-site-association` file
- **Android**: `.well-known/assetlinks.json` file

These files tell the operating system that your domain is associated with the mobile app, enabling seamless deep linking.

## Troubleshooting

### Links don't open in the app

1. Verify the Apple App Site Association file is accessible:
   ```
   https://biteclub.fun/.well-known/apple-app-site-association
   ```
   - Should return JSON
   - Should have `Content-Type: application/json` header

2. Check the Android Asset Links file:
   ```
   https://biteclub.fun/.well-known/assetlinks.json
   ```

3. Verify the mobile app has the correct configuration:
   - iOS: `associatedDomains` in app.config.js
   - Android: `intentFilters` in app.config.js

4. Test with a freshly built app (universal links don't work in development builds)

### Recipe preview not showing

1. Check that the recipe exists in Supabase
2. Verify environment variables are set correctly
3. Check the browser console for errors
4. Ensure the recipe has media (images)

### Link previews not working

1. Test with the Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
2. Test with Twitter Card Validator: https://cards-dev.twitter.com/validator
3. Ensure images are publicly accessible
4. Check that Open Graph meta tags are rendered in the page source

## File Structure

```
app/
  recipe/
    [id]/
      page.tsx          # Dynamic recipe viewer with Open Graph tags
  page.tsx              # Landing page
lib/
  supabase.ts           # Supabase client configuration
public/
  .well-known/
    apple-app-site-association    # iOS universal links
    assetlinks.json              # Android app links
```

## Support

If you run into issues, check:
1. This SETUP.md file
2. The mobile app's deep linking configuration
3. Supabase RLS policies (recipes must be publicly readable)

