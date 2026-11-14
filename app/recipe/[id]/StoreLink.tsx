'use client';

import { capture } from '@/lib/webAnalytics';

type Props = {
  href: string;
  ct: string;
  shareId: string | null;
  placement: 'header' | 'inline' | 'banner';
  className?: string;
  children: React.ReactNode;
};

/** Tagged App Store link that reports web:store_button_tapped (BIT-597, Campaign links). */
export default function StoreLink({ href, ct, shareId, placement, className, children }: Props) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => capture('web:store_button_tapped', { page: 'recipe', ct, share_id: shareId, placement })}
    >
      {children}
    </a>
  );
}
