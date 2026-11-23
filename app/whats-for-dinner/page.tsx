import type { Metadata } from 'next';
import Image from 'next/image';
import { jsonLdScript, recipeCanonical, recipeCoverUrl, siteUrl } from '@/lib/seo';
import {
  WFD_APP_ALREADY,
  WFD_APP_H2,
  WFD_BANNER,
  WFD_DESCRIPTION,
  WFD_EXPLAINER_H2,
  WFD_EXPLAINER_STEPS,
  WFD_FAQ,
  WFD_H1,
  WFD_KICKER,
  WFD_LEDE,
  WFD_OG_DESCRIPTION,
  WFD_OG_TITLE,
  WFD_PATH,
  WFD_SHORTLIST_H2,
  WFD_TITLE,
  appCopy,
  defaultPickIndex,
} from '@/lib/whatsForDinner/pool';
import { loadDinnerPool } from '@/lib/whatsForDinner/live';
import type { DinnerCard } from '@/lib/whatsForDinner/resolve';
import DinnerPicker from './DinnerPicker';
import WfdStoreLink from './WfdStoreLink';
import GridRecipeLink from './GridRecipeLink';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const recipes = await loadDinnerPool();
  const first = recipes[defaultPickIndex(recipes.length)];
  const image = first ? recipeCoverUrl(first.id) : siteUrl('/og-image.png');
  return {
    title: WFD_TITLE,
    description: WFD_DESCRIPTION,
    alternates: { canonical: siteUrl(WFD_PATH) },
    openGraph: {
      title: WFD_OG_TITLE,
      description: WFD_OG_DESCRIPTION,
      type: 'website',
      url: siteUrl(WFD_PATH),
      images: [{ url: image, alt: WFD_H1 }],
    },
    twitter: { card: 'summary_large_image', title: WFD_OG_TITLE, description: WFD_OG_DESCRIPTION, images: [image] },
    other: { 'apple-itunes-app': WFD_BANNER },
  };
}

function pageJsonLd(recipes: DinnerCard[]): string {
  const canonical = siteUrl(WFD_PATH);
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        name: WFD_H1,
        description: WFD_DESCRIPTION,
        url: canonical,
      },
      {
        '@type': 'ItemList',
        itemListElement: recipes.map((recipe, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: recipeCanonical(recipe.id),
        })),
      },
    ],
  });
}

const button = 'inline-flex items-center justify-center min-h-11 rounded-full bg-[#c71c39] text-white px-5 py-3 font-semibold hover:opacity-90';
const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c71c39]';

export default async function WhatsForDinnerPage() {
  const recipes = await loadDinnerPool();
  const initialIndex = defaultPickIndex(recipes.length);
  const copy = appCopy();
  return <div className="bg-white text-[#3D352E] min-h-screen">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageJsonLd(recipes) }} />
    <header className="border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <a href="/" aria-label="BiteClub home" className={`flex items-center gap-2 ${focusRing}`}>
          <Image src="/icon.png" alt="" width={40} height={40} />
          <Image src="/text-logo.png" alt="BiteClub" width={100} height={30} className="h-7 w-auto" />
        </a>
        <WfdStoreLink placement="header" className={`${button} text-sm`}>Get the App</WfdStoreLink>
      </div>
    </header>
    <main className="max-w-4xl mx-auto px-5 py-10 sm:py-14">
      <section className="mb-12" aria-labelledby="wfd-h1">
        <p className="text-sm font-semibold text-[#c71c39] mb-3">{WFD_KICKER}</p>
        <h1 id="wfd-h1" className="text-4xl sm:text-5xl font-bold leading-tight mb-5">{WFD_H1}</h1>
        <p className="text-lg leading-relaxed max-w-2xl mb-8">{WFD_LEDE}</p>
        {recipes.length > 0 && <DinnerPicker recipes={recipes} initialIndex={initialIndex} />}
      </section>
      {recipes.length > 0 && (
        <section className="mb-12" aria-labelledby="shortlist">
          <h2 id="shortlist" className="text-2xl font-bold mb-5">{WFD_SHORTLIST_H2}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map((card, i) => (
              <article key={card.id} className="rounded-2xl border border-stone-200 overflow-hidden">
                <GridRecipeLink card={card} position={i + 1} className={`block h-full hover:bg-stone-50 ${focusRing}`}>
                  <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
                    <img
                      src={recipeCoverUrl(card.id)}
                      alt={card.title}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg leading-snug mb-2">{card.title}</h3>
                    <p className="text-sm text-stone-600">{card.timeLabel}</p>
                  </div>
                </GridRecipeLink>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="mb-12 max-w-2xl" aria-labelledby="explainer">
        <h2 id="explainer" className="text-2xl font-bold mb-5">{WFD_EXPLAINER_H2}</h2>
        <ol className="list-decimal pl-5 space-y-3 leading-relaxed">
          {WFD_EXPLAINER_STEPS.map(step => <li key={step}>{step}</li>)}
        </ol>
      </section>
      <section className="rounded-2xl bg-stone-50 p-6 sm:p-8 mb-12" aria-labelledby="app-heading">
        <h2 id="app-heading" className="text-2xl font-bold mb-3">{WFD_APP_H2}</h2>
        <p className="mb-5 leading-relaxed">{copy.body}</p>
        <WfdStoreLink placement="inline" className={button}>{copy.button}</WfdStoreLink>
        <p className="mt-4 text-sm text-stone-600">{WFD_APP_ALREADY}</p>
      </section>
      <section className="mb-4 max-w-2xl" aria-labelledby="faq">
        <h2 id="faq" className="sr-only">FAQ</h2>
        {WFD_FAQ.map(item => (
          <div key={item.q} className="mb-5">
            <h3 className="font-bold mb-2">{item.q}</h3>
            <p className="leading-relaxed">{item.a}</p>
          </div>
        ))}
      </section>
    </main>
    <footer className="border-t p-6 text-center text-sm text-stone-600">
      <a href="/" className={focusRing}>BiteClub</a>
      {' · '}
      <a href="/thanksgiving" className={focusRing}>Thanksgiving menu</a>
      {' · '}
      <a href="/privacy" className={focusRing}>Privacy</a>
      {' · '}
      <a href="/terms" className={focusRing}>Terms</a>
    </footer>
  </div>;
}
