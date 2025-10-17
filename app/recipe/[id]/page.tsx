import { Recipe, supabase } from '@/lib/supabase';
import { ChefHat, Clock, Users } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import StickyBanner from './StickyBanner';

const APP_STORE_URL = 'https://apps.apple.com/app/id6748471652';

async function getRecipe(id: string): Promise<Recipe | null> {
  console.log('🔍 Fetching recipe:', id);
  
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      profiles!recipes_user_id_fkey (
        username,
        full_name,
        avatar_url
      ),
      recipe_media (
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
    console.log('❌ No recipe found for ID:', id);
    return null;
  }

  console.log('✅ Recipe found:', data.title);
  return data as Recipe;
}

// Generate Open Graph metadata for social sharing
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    return {
      title: 'Recipe not found | BiteClub',
    };
  }

  const author = recipe.profiles?.username || recipe.profiles?.full_name || 'BiteClub User';
  const title = `${recipe.title} | BiteClub`;
  const description = recipe.description || `Check out this recipe from ${author} on BiteClub`;
  
  // Use image proxy to serve private images
  const imageUri = recipe.recipe_media?.[0]?.media_uri;
  const imageUrl = imageUri 
    ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://biteclub.fun'}/api/image-proxy?uri=${encodeURIComponent(imageUri)}`
    : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://biteclub.fun'}/tomato.png`;

  return {
    title,
    description,
    openGraph: {
      title: recipe.title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: recipe.title,
        },
      ],
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://biteclub.fun'}/recipe/${id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description,
      images: [imageUrl],
    },
  };
}


export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  // Use image proxy for private Cloudflare images
  const imageUri = recipe.recipe_media?.[0]?.media_uri;
  const imageUrl = imageUri 
    ? `/api/image-proxy?uri=${encodeURIComponent(imageUri)}`
    : null;

  const author = recipe.profiles?.username || recipe.profiles?.full_name || 'BiteClub User';
  
  // Debug logging
  console.log('🔍 Recipe data:', {
    hasImage: !!imageUrl,
    hasInstructions: !!(recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.length > 0),
    hasIngredients: !!(recipe.ingredients_text && recipe.ingredients_text.length > 0),
    instructionsCount: Array.isArray(recipe.instructions) ? recipe.instructions.length : 0,
    ingredientsCount: recipe.ingredients_text?.length || 0,
  });

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

      {/* Recipe Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Recipe Image */}
        {imageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden">
            <img 
              src={imageUrl} 
              alt={recipe.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        {/* Recipe Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            {recipe.profiles?.avatar_url ? (
              <img 
                src={recipe.profiles.avatar_url} 
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

          <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: '#3D352E' }}>{recipe.title}</h1>
          
          {recipe.description && (
            <p className="text-base mb-4" style={{ color: '#3D352E', opacity: 0.7 }}>{recipe.description}</p>
          )}

          {/* Source */}
          {recipe.source && (() => {
            // Extract clean domain name from URL (same logic as mobile app)
            const extractDomainName = (url: string) => {
              try {
                const domain = new URL(url).hostname;
                // Remove www. prefix
                let cleanDomain = domain.replace(/^www\./, '');
                
                // Remove common TLDs but keep the main domain parts
                cleanDomain = cleanDomain.replace(/\.(com|org|net|co\.uk|co\.nz|edu|gov)$/, '');
                
                // Split by dots and take the meaningful parts
                const parts = cleanDomain.split('.');
                
                // For domains like "cooking.nytimes", we want "Nytimes"
                // For domains like "allrecipes", we want "Allrecipes"
                if (parts.length > 1) {
                  // Take the last meaningful part (usually the main brand)
                  const mainPart = parts[parts.length - 1];
                  return mainPart
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
                } else {
                  // Single part domain
                  return parts[0]
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
                }
              } catch {
                return url;
              }
            };
            
            const isUrl = recipe.source.startsWith('http://') || recipe.source.startsWith('https://');
            const displayName = isUrl ? extractDomainName(recipe.source) : recipe.source;
            
            return (
              <div className="mb-3 text-sm flex items-center gap-1" style={{ color: '#3D352E', opacity: 0.7 }}>
                Source: {isUrl ? (
                  <a 
                    href={recipe.source} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1 hover:opacity-100" 
                    style={{ color: '#c71c39' }}
                  >
                    <span className="underline">{displayName}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                ) : displayName}
              </div>
            );
          })()}

          {/* Recipe Stats */}
          <div className="flex flex-wrap gap-3">
            {recipe.prep_time && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <Clock className="w-4 h-4" style={{ color: '#3D352E', opacity: 0.6 }} />
                <span className="text-sm" style={{ color: '#3D352E' }}>
                  <span className="font-semibold">{recipe.prep_time}m</span> prep
                </span>
              </div>
            )}
            {recipe.cook_time && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <ChefHat className="w-4 h-4" style={{ color: '#3D352E', opacity: 0.6 }} />
                <span className="text-sm" style={{ color: '#3D352E' }}>
                  <span className="font-semibold">{recipe.cook_time}m</span> cook
                </span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <Users className="w-4 h-4" style={{ color: '#3D352E', opacity: 0.6 }} />
                <span className="text-sm" style={{ color: '#3D352E' }}>
                  <span className="font-semibold">{recipe.servings}</span> servings
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {recipe.notes && (
          <div className="mb-6 p-5 bg-gray-50 rounded-xl">
            <h2 className="text-xl font-bold mb-3" style={{ color: '#3D352E' }}>Notes</h2>
            <p className="text-base whitespace-pre-wrap" style={{ color: '#3D352E' }}>{recipe.notes}</p>
          </div>
        )}

        {/* Ingredients & Instructions - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Ingredients */}
          {recipe.ingredients_text && recipe.ingredients_text.length > 0 && (
            <div className="p-5 bg-gray-50 rounded-xl">
              <h2 className="text-xl font-bold mb-3" style={{ color: '#3D352E' }}>Ingredients</h2>
              <ul className="space-y-2">
                {recipe.ingredients_text.map((ingredient, index) => {
                  // Handle ingredients that might be stored as JSON objects
                  let displayText = ingredient;
                  if (typeof ingredient === 'string' && ingredient.startsWith('{') && ingredient.includes('"text"')) {
                    try {
                      const parsed = JSON.parse(ingredient);
                      displayText = parsed.text || ingredient;
                    } catch {
                      displayText = ingredient;
                    }
                  }
                  
                  return (
                    <li key={index} className="flex items-start">
                      <span className="mr-3" style={{ color: '#3D352E' }}>•</span>
                      <span className="text-base" style={{ color: '#3D352E' }}>{displayText}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.length > 0 && (
            <div className="p-5 bg-gray-50 rounded-xl">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#3D352E' }}>Instructions</h2>
              <ol className="space-y-3">
                {recipe.instructions.map((instruction: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-7 h-7 bg-[#c71c39] rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-base leading-relaxed pt-0.5" style={{ color: '#3D352E' }}>
                      {typeof instruction === 'string' 
                        ? instruction 
                        : (instruction?.text || String(instruction?.step || ''))}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
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

