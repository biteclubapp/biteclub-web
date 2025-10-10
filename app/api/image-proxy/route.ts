import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mediaUri = searchParams.get('uri');
  
  if (!mediaUri) {
    return NextResponse.json({ error: 'Missing uri parameter' }, { status: 400 });
  }

  try {
    // Request signed URL from media API
    const response = await fetch(`${process.env.NEXT_PUBLIC_MEDIA_API_URL || 'https://biteclub-media-api.biteclub.workers.dev'}/sign-urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: [mediaUri],
      }),
    });

    if (!response.ok) {
      console.error('Failed to get signed URL:', response.statusText);
      return NextResponse.json({ error: 'Failed to sign URL' }, { status: 500 });
    }

    const data = await response.json();
    const signedUrl = data.signedUrls?.[0];

    if (!signedUrl) {
      return NextResponse.json({ error: 'No signed URL returned' }, { status: 500 });
    }

    // Fetch the actual image from the signed URL
    const imageResponse = await fetch(signedUrl);
    
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

