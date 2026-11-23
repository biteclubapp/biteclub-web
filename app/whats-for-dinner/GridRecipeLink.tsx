'use client';

import { capture } from '@/lib/webAnalytics';
import type { DinnerCard } from '@/lib/whatsForDinner/resolve';

export default function GridRecipeLink({
  card,
  position,
  className,
  children,
}: {
  card: DinnerCard;
  position: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={card.href}
      className={className}
      onClick={() => capture('web:wfd_picker_action', {
        action: 'open_recipe',
        filter: 'any',
        recipe_id: card.id,
        position,
        source: 'grid',
        event_version: 1,
      })}
    >
      {children}
    </a>
  );
}
