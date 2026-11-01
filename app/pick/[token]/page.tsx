import type { Metadata } from 'next';
import PickClient from './PickClient';

// D6 (Guard): no poll data in SSR. The page shell is static; the browser loads the poll itself,
// so the RPC rate limits see the voter's IP and link previews never read or count the poll.
export const metadata: Metadata = {
  title: 'Help pick dinner | BiteClub',
  description: "Tap the one you'd eat. No app needed.",
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
  alternates: { canonical: null },
  openGraph: {
    title: 'Help pick dinner',
    description: "Tap the one you'd eat. No app needed.",
    siteName: 'BiteClub - Eat Together',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'BiteClub' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help pick dinner',
    description: "Tap the one you'd eat. No app needed.",
    images: ['/og-image.png'],
  },
  other: { 'apple-itunes-app': 'app-id=6748471652' },
};

export default async function PickPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PickClient token={token} />;
}
