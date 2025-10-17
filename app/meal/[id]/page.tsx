import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import StickyBanner from './StickyBanner';

const APP_STORE_URL = 'https://apps.apple.com/app/id6748471652';

interface Meal {
  id: string;
  name?: string;
  created_at: string;
  user_id: string;
  recipe_id?: string;
  users?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  recipes?: {
    title?: string;
    description?: string;
  };
  meal_media?: Array<{
    media_uri: string;
    media_type: string | null;
  }>;
}

async function getMeal(id: string): Promise<Meal | null> {
  console.log('🔍 Fetching meal:', id);
  
  const { data, error } = await supabase
    .from('meals')
    .select(`
      *,
      users!meals_user_id_fkey (
        username,
        full_name,
        avatar_url
      ),
      recipes!meals_recipe_id_fkey (
        title,
        description
      ),
      meal_media (
        media_uri,
        media_type
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('❌ Supabase error:', error);
    return null;
  }
  
  if (!data) {
    console.log('❌ No meal found for ID:', id);
    return null;
  }

  console.log('✅ Meal found');
  return data as Meal;
}

// Generate Open Graph metadata for social sharing
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const meal = await getMeal(id);

  if (!meal) {
    return {
      title: 'Meal not found | BiteClub',
    };
  }

  const author = meal.users?.username || meal.users?.full_name || 'BiteClub User';
  const mealTitle = meal.recipes?.title || meal.name || 'Delicious Meal';
  const title = `${mealTitle} | BiteClub`;
  const description = meal.recipes?.description || `Check out this meal from ${author} on BiteClub`;
  
  // Use image proxy to serve private images
  const imageUri = meal.meal_media?.[0]?.media_uri;
  const imageUrl = imageUri 
    ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://biteclub.fun'}/api/image-proxy?uri=${encodeURIComponent(imageUri)}`
    : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://biteclub.fun'}/tomato.png`;

  return {
    title,
    description,
    openGraph: {
      title: mealTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: mealTitle,
        },
      ],
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://biteclub.fun'}/meal/${id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: mealTitle,
      description,
      images: [imageUrl],
    },
  };
}

export default async function MealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meal = await getMeal(id);

  if (!meal) {
    notFound();
  }

  // Use image proxy for private Cloudflare images
  const imageUri = meal.meal_media?.[0]?.media_uri;
  const imageUrl = imageUri 
    ? `/api/image-proxy?uri=${encodeURIComponent(imageUri)}`
    : null;

  const author = meal.users?.username || meal.users?.full_name || 'BiteClub User';
  const mealTitle = meal.recipes?.title || meal.name || 'Delicious Meal';

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

      {/* Meal Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Meal Image */}
        {imageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden">
            <img 
              src={imageUrl} 
              alt={mealTitle}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        {/* Meal Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            {meal.users?.avatar_url ? (
              <img 
                src={meal.users.avatar_url} 
                alt={author}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#c71c39] flex items-center justify-center text-white font-semibold text-sm">
                {author[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium" style={{ color: '#3D352E' }}>{author}</p>
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: '#3D352E' }}>{mealTitle}</h1>
          
          {meal.recipes?.description && (
            <p className="text-base mb-4" style={{ color: '#3D352E', opacity: 0.7 }}>{meal.recipes.description}</p>
          )}
        </div>

        {/* CTA */}
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#3D352E' }}>
            Want to see the full recipe?
          </h2>
          <p className="text-base mb-6" style={{ color: '#3D352E', opacity: 0.7 }}>
            Open BiteClub to view ingredients, instructions, and more delicious recipes.
          </p>
          <a 
            href={APP_STORE_URL}
            className="inline-block px-8 py-4 bg-[#c71c39] text-white rounded-full font-semibold text-base hover:opacity-90 transition-opacity"
          >
            Get the App
          </a>
        </div>
      </main>

      {/* Sticky Bottom Banner */}
      <StickyBanner />

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 px-6 py-6 bg-white mb-20">
        <div className="max-w-4xl mx-auto text-center text-sm" style={{ color: '#3D352E', opacity: 0.5 }}>
          <p>© 2024 BiteClub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

