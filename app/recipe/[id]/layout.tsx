import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  
  // Fetch recipe data for metadata
  const { data: recipe } = await supabase
    .from('recipes')
    .select(`
      *,
      users:user_id (
        username,
        full_name
      ),
      recipe_media (
        media_uri
      )
    `)
    .eq('id', id)
    .single();

  if (!recipe) {
    return {
      title: 'Recipe Not Found',
      description: 'This recipe could not be found on BiteClub',
    };
  }

  const recipeTitle = recipe.title || 'Delicious Recipe';
  const authorName = recipe.users?.full_name || recipe.users?.username || 'A home cook';
  const description = recipe.description 
    ? recipe.description.substring(0, 160) 
    : `Check out ${recipeTitle} by ${authorName} on BiteClub - discover and share recipes from home cooks around the world`;
  
  // Get the first image if available
  const imageUrl = recipe.recipe_media?.[0]?.media_uri 
    ? recipe.recipe_media[0].media_uri
    : 'https://biteclub.fun/icon.png'; // Fallback to your logo

  const url = `https://biteclub.fun/recipe/${id}`;

  return {
    title: `${recipeTitle} | BiteClub`,
    description,
    openGraph: {
      title: recipeTitle,
      description,
      url,
      siteName: 'BiteClub',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: recipeTitle,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: recipeTitle,
      description,
      images: [imageUrl],
    },
  };
}

export default function RecipeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

