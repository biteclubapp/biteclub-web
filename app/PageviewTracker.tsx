'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { capture } from '@/lib/webAnalytics';

/** Cookieless $pageview on every route change (BIT-597). /pick/* is skipped inside buildCapture. */
export default function PageviewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    capture('$pageview');
  }, [pathname]);
  return null;
}
