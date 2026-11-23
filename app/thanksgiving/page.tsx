import type { Metadata } from 'next';
import Image from 'next/image';
import { campaignCt, shareId } from '@/lib/campaign';
import { storeUrl } from '@/lib/pick/logic';
import { FALLBACK_IMAGE_URL, kitchenRecipeHref, publishedKitchenRecipe, recipeCoverUrl, siteUrl } from '@/lib/seo';
import { menu, THANKSGIVING_CT, THANKSGIVING_PATH } from '@/lib/thanksgiving/menu';
import { liveThanksgivingRecipes } from '@/lib/thanksgiving/live';
import StoreLink from '../recipe/[id]/StoreLink';
import GroceryList from './GroceryList';

export const dynamic = 'force-dynamic';
const title = 'A Thanksgiving menu from @kitchen | BiteClub';
const description = '13 recipes for a smaller Thanksgiving table, leftovers and two pies, with a combined grocery list you can copy, share or check off.';

export async function generateMetadata(): Promise<Metadata> {
  const rows = await liveThanksgivingRecipes();
  const turkey = publishedKitchenRecipe(menu[0].title, rows);
  const image = turkey ? recipeCoverUrl(turkey.id) : siteUrl('/og-image.png');
  return {
    title, description,
    alternates: { canonical: siteUrl(THANKSGIVING_PATH) },
    openGraph: { title, description, type: 'website', url: siteUrl(THANKSGIVING_PATH), images: [{ url: image, alt: 'Thanksgiving with BiteClub' }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

type Query = Record<string, string | string[] | undefined>;
export default async function ThanksgivingPage({ searchParams }: { searchParams: Promise<Query> }) {
  const [query, rows] = await Promise.all([searchParams, liveThanksgivingRecipes()]);
  const ct = campaignCt(query, THANKSGIVING_CT);
  const attribution = { href: storeUrl(ct), ct, shareId: shareId(query.s), page: 'thanksgiving' as const };
  const button = 'inline-block rounded-full bg-[#c71c39] text-white px-5 py-3 font-semibold hover:opacity-90';
  return <div className="bg-white text-[#3D352E] min-h-screen">
    <header className="border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <a href="/" aria-label="BiteClub home" className="flex items-center gap-2">
          <Image src="/icon.png" alt="" width={40} height={40} />
          <Image src="/text-logo.png" alt="BiteClub" width={100} height={30} className="h-7 w-auto" />
        </a>
        <StoreLink {...attribution} placement="header" className={`${button} text-sm`}>Get the App</StoreLink>
      </div>
    </header>
    <main className="max-w-4xl mx-auto px-5 py-10 sm:py-14">
      <section className="mb-12 max-w-2xl">
        <p className="text-sm font-semibold text-[#c71c39] mb-3">13 recipes · one grocery list</p>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">A Thanksgiving menu from @kitchen.</h1>
        <p className="text-lg leading-relaxed">Plan a smaller table with turkey breast, sides, leftovers and two pies. There is no mashed-potatoes recipe in this pack.</p>
        <a href="#groceries" className="inline-block mt-6 text-[#c71c39] font-semibold underline underline-offset-4">Jump to the grocery list ↓</a>
      </section>
      {([['table', 'The table'], ['leftovers', 'After the meal'], ['desserts', 'Desserts']] as const).map(([section, heading]) => <section key={section} className="mb-12" aria-labelledby={section}>
        <h2 id={section} className="text-2xl font-bold mb-5">{heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {menu.filter(dish => dish.section === section).map(dish => {
            const live = publishedKitchenRecipe(dish.title, rows);
            const href = kitchenRecipeHref(dish.title, rows);
            const content = <>
              <img src={live ? recipeCoverUrl(live.id) : FALLBACK_IMAGE_URL} alt={live ? dish.title : ''} className={`w-full h-44 ${live ? 'object-cover' : 'object-contain p-10 bg-stone-50'}`} />
              <div className="p-4">
                <h3 className="font-bold text-lg leading-snug mb-2">{dish.title}</h3>
                <p className="text-sm text-stone-600">{dish.servings} servings · {dish.prep_time}m prep · {dish.cook_time}m cook</p>
                {dish.slug === 'wild-rice-stuffed-butternut-squash' && <p className="text-sm mt-2">Vegetarian main · contains tree nuts</p>}
                <p className="text-sm mt-3 text-[#c71c39]">{href ? 'View recipe →' : 'Recipe coming soon'}</p>
              </div>
            </>;
            return <article key={dish.slug} className="rounded-2xl border border-stone-200 overflow-hidden">{href ? <a href={href} className="block h-full hover:bg-stone-50">{content}</a> : content}</article>;
          })}
        </div>
      </section>)}
      <section id="groceries" className="scroll-mt-6 mb-12" aria-labelledby="grocery-heading">
        <h2 id="grocery-heading" className="text-2xl font-bold mb-3">Grocery list</h2>
        <p className="leading-relaxed">For all 13 recipes at their stated servings, including both mains and both pies. Amounts are shown by dish so you can shop for what you plan to cook.</p>
        <p className="mt-3 leading-relaxed">Reserve cooked turkey and cranberry sauce for the leftover dishes; these are listed as reminders, not extra purchases. The turkey breast may not leave enough for all three leftover recipes. Water is omitted.</p>
        <p className="mt-3 text-sm text-stone-600">Checks stay in this browser only. Copy, share and download include the full list.</p>
        <GroceryList />
      </section>
      <section className="border-t pt-8 mb-10" aria-labelledby="allergens">
        <h2 id="allergens" className="text-2xl font-bold mb-3">Allergens</h2>
        <p className="leading-relaxed">The pack includes wheat, milk, eggs, soy and tree nuts. The vegetarian main, Wild Rice Stuffed Butternut Squash, contains pecans (tree nuts). Check each recipe and packaged ingredient label for your needs; substitutions can change allergens.</p>
      </section>
      <section className="rounded-2xl bg-stone-50 p-6 sm:p-8" aria-labelledby="app-heading">
        <h2 id="app-heading" className="text-2xl font-bold mb-3">Cook with BiteClub</h2>
        <p className="mb-5 leading-relaxed">Cook these recipes in BiteClub as they go live, or swipe in Decide to pick tonight’s meal.</p>
        <StoreLink {...attribution} placement="inline" className={button}>Open in BiteClub</StoreLink>
        <p className="mt-6 leading-relaxed"><a href="/whats-for-dinner" className="text-[#c71c39] font-semibold underline underline-offset-4">For the other nights: what’s for dinner tonight →</a></p>
      </section>
    </main>
    <footer className="border-t p-6 text-center text-sm text-stone-600"><a href="/">BiteClub</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></footer>
  </div>;
}
