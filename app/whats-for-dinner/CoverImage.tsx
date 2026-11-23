'use client';

import { useState } from 'react';
import { FALLBACK_IMAGE_URL } from '@/lib/seo';

/** Recipe cover with the same tomato fallback as /thanksgiving if the image fails to load. */
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
  const [url, setUrl] = useState(src);
  const fallback = url === FALLBACK_IMAGE_URL;
  return (
    <img
      src={url}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      className={fallback ? 'w-full h-full object-contain p-10 bg-stone-50' : className}
      onError={() => { if (!fallback) setUrl(FALLBACK_IMAGE_URL); }}
    />
  );
}
