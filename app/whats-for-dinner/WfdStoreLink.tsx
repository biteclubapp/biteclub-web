'use client';

import { useEffect, useState } from 'react';
import { campaignCt, shareId } from '@/lib/campaign';
import { showInstallButton, storeUrl } from '@/lib/pick/logic';
import { WFD_ANDROID_NOTE, WFD_CT, WFD_PAGE } from '@/lib/whatsForDinner/pool';
import StoreLink from '../recipe/[id]/StoreLink';

/** Default ct is rendered for ISR; a mount effect swaps in an allowlisted incoming ct/s and hides the button on Android. */
export default function WfdStoreLink({
  placement,
  className,
  children,
}: {
  placement: 'header' | 'inline';
  className?: string;
  children: React.ReactNode;
}) {
  const [ct, setCt] = useState(WFD_CT);
  const [sid, setSid] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const query = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    setCt(campaignCt(query, WFD_CT));
    setSid(shareId(query.s));
    setVisible(showInstallButton(navigator.userAgent));
  }, []);

  if (!visible) return <p className="text-sm text-stone-600">{WFD_ANDROID_NOTE}</p>;

  return (
    <StoreLink
      page={WFD_PAGE}
      href={storeUrl(ct)}
      ct={ct}
      shareId={sid}
      placement={placement}
      className={className}
    >
      {children}
    </StoreLink>
  );
}
