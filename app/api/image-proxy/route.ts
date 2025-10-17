import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mediaUri = searchParams.get('uri');
  
  if (!mediaUri) {
    return NextResponse.json({ error: 'Missing uri parameter' }, { status: 400 });
  }

  try {
    // Construct Cloudflare Images URL directly for web sharing
    // Format: https://imagedelivery.net/{account_hash}/{image_id}/public
    const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH;
    
    if (!accountHash) {
      console.error('Missing CLOUDFLARE_ACCOUNT_HASH environment variable');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Build the public Cloudflare Images URL
    const cloudflareUrl = `https://imagedelivery.net/${accountHash}/${mediaUri}/public`;
    console.log('Fetching image from Cloudflare:', cloudflareUrl);

    // Fetch the actual image from Cloudflare
    const imageResponse = await fetch(cloudflareUrl);
    
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }

    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Return the image with appropriate headers for caching
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

