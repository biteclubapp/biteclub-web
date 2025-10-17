/**
 * Signs a Cloudflare Image URL with an expiration timestamp.
 * This allows direct access to private Cloudflare Images without proxying.
 *
 * Based on: https://developers.cloudflare.com/images/url-format#signed-urls
 */
export async function signImageUrl(imageId: string): Promise<string> {
  const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH;
  const keyValue = process.env.CLOUDFLARE_IMAGES_KEY_VALUE;

  if (!accountHash) {
    throw new Error('Missing NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH environment variable');
  }

  if (!keyValue) {
    throw new Error('Missing CLOUDFLARE_IMAGES_KEY_VALUE environment variable');
  }

  // Build the base URL
  const url = `https://imagedelivery.net/${accountHash}/${imageId}/public`;

  // Set expiration to 1 hour from now
  const expiry = Math.floor(Date.now() / 1000) + 3600;

  // Create URL with expiry parameter
  const urlToSign = new URL(url);
  urlToSign.searchParams.set('exp', String(expiry));

  // Sign the path + query string
  const stringToSign = urlToSign.pathname + urlToSign.search;

  // Import the key for HMAC-SHA256 signing
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyValue);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Generate signature
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(stringToSign)
  );

  // Convert signature to hex string
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Add signature to URL
  urlToSign.searchParams.set('sig', signatureHex);

  return urlToSign.toString();
}
