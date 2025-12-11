import { getClub } from '@/lib/supabase';
import { signImageUrl } from '@/lib/imageUrl';
import { Users, ChefHat, Lock, Unlock } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import StickyBanner from './StickyBanner';

const APP_STORE_URL = 'https://apps.apple.com/app/id6748471652';

// Generate Open Graph metadata for social sharing
export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invite?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const club = await getClub(id);

  if (!club) {
    return {
      title: 'Club not found | BiteClub',
    };
  }

  const title = `Join ${club.name} on BiteClub`;
  const description = club.description || `Join ${club.name} and cook together!`;

  // Generate signed URL for club avatar
  let imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://biteclub.fun'}/tomato.png`;
  if (club.avatar_url) {
    try {
      imageUrl = await signImageUrl(club.avatar_url);
    } catch (error) {
      console.error('Failed to sign image URL:', error);
      // Fall back to tomato.png on error
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: club.name,
        },
      ],
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://biteclub.fun'}/club/${id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ClubPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const { id } = await params;
  const { invite: inviteCode } = await searchParams;
  const club = await getClub(id);

  if (!club) {
    notFound();
  }

  // Generate signed URL for club avatar
  let avatarUrl: string | null = null;
  if (club.avatar_url) {
    try {
      avatarUrl = await signImageUrl(club.avatar_url);
    } catch (error) {
      console.error('Failed to sign avatar URL for display:', error);
      // avatarUrl remains null, fallback will be used
    }
  }

  // Build deep link URL
  const appUrl = inviteCode
    ? `biteclub://club/${id}?invite=${inviteCode}`
    : `biteclub://club/${id}`;

  const headChef = club.profiles?.full_name || club.profiles?.username || 'BiteClub User';

  // Check if this is a private club without an invite code
  const isPrivateWithoutInvite = !club.is_public && !inviteCode;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="BiteClub"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <Image
              src="/text-logo.png"
              alt="BiteClub"
              width={100}
              height={30}
              className="h-7 w-auto"
            />
          </div>
          <a
            href={APP_STORE_URL}
            className="px-5 py-2.5 bg-[#c71c39] text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Get the App
          </a>
        </div>
      </header>

      {/* Club Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Club Avatar */}
        <div className="flex justify-center mb-6">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={club.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-[#c71c39] flex items-center justify-center text-white font-bold text-4xl border-4 border-gray-100">
              {club.name[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Club Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <h1 className="text-3xl lg:text-4xl font-bold" style={{ color: '#3D352E' }}>
              {club.name}
            </h1>
            {club.is_public ? (
              <Unlock className="w-6 h-6" style={{ color: '#3D352E', opacity: 0.4 }} />
            ) : (
              <Lock className="w-6 h-6" style={{ color: '#3D352E', opacity: 0.4 }} />
            )}
          </div>

          {club.description && (
            <p className="text-lg mb-4 max-w-2xl mx-auto" style={{ color: '#3D352E', opacity: 0.7 }}>
              {club.description}
            </p>
          )}

          {/* Club Stats */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5" style={{ color: '#3D352E', opacity: 0.6 }} />
              <span className="text-base" style={{ color: '#3D352E' }}>
                <span className="font-semibold">{club.member_count}</span> {club.member_count === 1 ? 'member' : 'members'}
              </span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
              <ChefHat className="w-5 h-5" style={{ color: '#3D352E', opacity: 0.6 }} />
              <span className="text-base" style={{ color: '#3D352E' }}>
                Head Chef: <span className="font-semibold">{headChef}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Private Club Notice or CTA */}
        {isPrivateWithoutInvite ? (
          <div className="max-w-md mx-auto text-center p-8 bg-gray-50 rounded-2xl">
            <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: '#3D352E', opacity: 0.4 }} />
            <h2 className="text-xl font-bold mb-3" style={{ color: '#3D352E' }}>
              This is a Private Club
            </h2>
            <p className="text-base mb-6" style={{ color: '#3D352E', opacity: 0.7 }}>
              You need an invite link to join this club. Ask the head chef or a member to share an invite with you.
            </p>
            <a
              href={APP_STORE_URL}
              className="inline-block px-6 py-3 bg-[#c71c39] text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Download BiteClub
            </a>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center space-y-4">
            {/* Open in App Button */}
            <a
              href={appUrl}
              className="block w-full px-6 py-4 bg-[#c71c39] text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity"
            >
              {inviteCode ? 'Join Club in App' : 'Open in BiteClub App'}
            </a>

            {/* Download App Button */}
            <a
              href={APP_STORE_URL}
              className="block w-full px-6 py-4 bg-gray-100 text-gray-900 rounded-2xl font-semibold text-base hover:bg-gray-200 transition-colors"
            >
              Download on App Store
            </a>

            {inviteCode && (
              <p className="text-sm" style={{ color: '#3D352E', opacity: 0.6 }}>
                You've been invited! Install the app to join {club.name}.
              </p>
            )}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-bold mb-3" style={{ color: '#3D352E' }}>
              About BiteClub
            </h3>
            <p className="text-base" style={{ color: '#3D352E', opacity: 0.7 }}>
              BiteClub is the social cooking app where you can join clubs, share recipes, plan meals,
              and cook together with friends. Download the app to join {club.name} and start cooking!
            </p>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Banner */}
      <StickyBanner appUrl={appUrl} clubName={club.name} hasInvite={!!inviteCode} />

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 px-6 py-6 bg-white mb-20">
        <div className="max-w-4xl mx-auto text-center text-sm" style={{ color: '#3D352E', opacity: 0.5 }}>
          <p>© 2024 BiteClub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
