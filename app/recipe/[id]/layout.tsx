import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';

// Helper to create engaging description
function createDescription(recipe: any): string {
  const authorName = recipe.users?.full_name || recipe.users?.username || 'a home cook';
  const parts: string[] = [];
  
  // Add custom description or default intro
  if (recipe.description) {
    parts.push(recipe.description.substring(0, 100));
  } else {
    parts.push(`Shared by ${authorName} on BiteClub.`);
  }
  
  // Add time info if available
  if (recipe.prep_time || recipe.cook_time) {
    const prepTime = recipe.prep_time ? `${recipe.prep_time} min prep` : '';
    const cookTime = recipe.cook_time ? `${recipe.cook_time} min cook` : '';
    const timeInfo = [prepTime, cookTime].filter(Boolean).join(', ');
    if (timeInfo) parts.push(timeInfo);
  }
  
  // Add first few ingredients if available
  if (recipe.ingredients_text && Array.isArray(recipe.ingredients_text) && recipe.ingredients_text.length > 0) {
    const ingredients = recipe.ingredients_text.slice(0, 3).map((ing: any) => {
      if (typeof ing === 'string') {
        try {
          const parsed = JSON.parse(ing);
          return parsed.text || ing;
        } catch {
          return ing;
        }
      }
      return ing.text || String(ing);
    });
    
    if (ingredients.length > 0) {
      parts.push(`Ingredients: ${ingredients.join(', ')}${recipe.ingredients_text.length > 3 ? '...' : ''}`);
    }
  }
  
  return parts.join(' • ').substring(0, 200);
}

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
  const description = createDescription(recipe);
  
  // Use recipe image if available, otherwise fallback to logo
  let imageUrl = 'https://biteclub.fun/logo.png';
  
  if (recipe.recipe_media?.[0]?.media_uri) {
    // Use the image proxy to serve the recipe image publicly
    const mediaUri = encodeURIComponent(recipe.recipe_media[0].media_uri);
    imageUrl = `https://biteclub.fun/api/image-proxy?uri=${mediaUri}`;
  }

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

