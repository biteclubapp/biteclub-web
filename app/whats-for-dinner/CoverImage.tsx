'use client';

import { useEffect, useRef } from 'react';
import { FALLBACK_IMAGE_URL } from '@/lib/seo';

const FALLBACK_CLASS = 'w-full h-full object-contain p-10 bg-stone-50';

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function applyFallback(img: HTMLImageElement): void {
  if (img.getAttribute('data-fallback') === '1') return;
  img.onerror = null;
  img.setAttribute('data-fallback', '1');
  img.src = FALLBACK_IMAGE_URL;
  img.className = FALLBACK_CLASS;
}

/** Recipe cover with the same tomato fallback as /thanksgiving if the image fails to load.
 *  A native `onerror` is written into the HTML so a first-paint failure never waits on hydration.
 *  After mount, also swap if the image already completed with naturalWidth 0. */
export default function CoverImage({
  src,
  alt,
  width,
  height,
  className,
  loading,
  fetchPriority,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const alreadyFallback = src === FALLBACK_IMAGE_URL;
  const classNames = alreadyFallback ? FALLBACK_CLASS : (className ?? '');
  const onerror = alreadyFallback
    ? ''
    : ` onerror="this.onerror=null;this.src='${FALLBACK_IMAGE_URL}';this.className='${FALLBACK_CLASS}';this.setAttribute('data-fallback','1')"`;
  const html = `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" width="${width}" height="${height}"${loading ? ` loading="${loading}"` : ''}${fetchPriority ? ` fetchpriority="${fetchPriority}"` : ''} class="${escapeAttr(classNames)}"${alreadyFallback ? ' data-fallback="1"' : ''}${onerror} />`;

  useEffect(() => {
    const img = wrapRef.current?.querySelector('img');
    if (!img) return;
    if (img.complete && img.naturalWidth === 0) applyFallback(img);
  }, [src]);

  return <span ref={wrapRef} dangerouslySetInnerHTML={{ __html: html }} />;
}
