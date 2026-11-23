import { instructionSteps, recipePath, recipeVisibility, type RecipeRow } from '../seo.ts';
import { dinnerTimeLabel, pool, type PinnedDinner } from './pool.ts';

export type DinnerCard = {
  id: string;
  title: string;
  href: string;
  totalMin: number;
  servings: number | null;
  username: string;
  timeLabel: string;
};

function isPositiveMinutes(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function isLiveEligible(row: RecipeRow): boolean {
  return recipeVisibility(row) === 'indexable'
    && instructionSteps(row.instructions).length >= 1
    && isPositiveMinutes(row.prep_time)
    && isPositiveMinutes(row.cook_time);
}

export function fallbackCard(dish: PinnedDinner): DinnerCard {
  return {
    id: dish.id,
    title: dish.title,
    href: recipePath(dish.id),
    totalMin: dish.total_min,
    servings: dish.servings,
    username: 'will',
    timeLabel: dinnerTimeLabel(dish.total_min, dish.servings),
  };
}

/**
 * Live indexable rows with steps and both times win. A bad id is dropped when the
 * query succeeded. On a fetch error, the pinned titles/times/links are used so the
 * page still renders.
 */
export function resolveDinnerPool(rows: readonly RecipeRow[], failed: boolean): DinnerCard[] {
  if (failed) return pool.map(fallbackCard);
  const byId = new Map(rows.map(row => [row.id, row]));
  const cards: DinnerCard[] = [];
  for (const dish of pool) {
    const row = byId.get(dish.id);
    if (!row || !isLiveEligible(row)) continue;
    const prep = row.prep_time;
    const cook = row.cook_time;
    if (!isPositiveMinutes(prep) || !isPositiveMinutes(cook)) continue;
    const totalMin = prep + cook;
    const servings = typeof row.servings === 'number' && row.servings > 0 ? row.servings : dish.servings;
    const username = String(row.profiles?.username ?? 'will').replace(/^@/, '') || 'will';
    cards.push({
      id: row.id,
      title: String(row.title ?? dish.title).trim() || dish.title,
      href: recipePath(row.id),
      totalMin,
      servings,
      username,
      timeLabel: dinnerTimeLabel(totalMin, servings),
    });
  }
  return cards;
}
