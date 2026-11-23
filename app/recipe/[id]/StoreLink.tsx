'use client';

import { capture } from '@/lib/webAnalytics';

type Props = {
  page?: 'recipe' | 'thanksgiving' | 'whats_for_dinner';
  href: string;
  ct: string;
  shareId: string | null;
  placement: 'header' | 'inline' | 'banner';
  className?: string;
  children: React.ReactNode;
};

/** Tagged App Store link that reports web:store_button_tapped (BIT-597, Campaign links). */
export default function StoreLink({ page = 'recipe', href, ct, shareId, placement, className, children }: Props) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => capture('web:store_button_tapped', { page, ct, share_id: shareId, placement, event_version: 1 })}
    >
      {children}
    </a>
  );
}
