'use client';

import { useEffect, useState } from 'react';
import { groceries, groceryGroups, groceryText } from '@/lib/thanksgiving/groceries';
import { menu } from '@/lib/thanksgiving/menu';

const STORAGE_KEY = 'biteclub:thanksgiving:groceries:v1';
const titles = Object.fromEntries(menu.map(dish => [dish.slug, dish.title]));

export default function GroceryList() {
  const [checked, setChecked] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setCanShare(typeof navigator.share === 'function');
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) setChecked(saved.filter((id): id is string => typeof id === 'string' && groceries.some(item => item.id === id)));
    } catch { /* Storage may be disabled. Checkboxes still work for this visit. */ }
  }, []);

  function toggle(id: string) {
    const next = checked.includes(id) ? checked.filter(value => value !== id) : [...checked, id];
    setChecked(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { setMessage('Browser storage is unavailable. Checks will last for this visit.'); }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(groceryText(titles)); setMessage('List copied.'); }
    catch { setMessage('Copy is unavailable. Use Download list to save the text.'); }
  }

  async function share() {
    try { await navigator.share({ title: 'Thanksgiving grocery list', text: groceryText(titles) }); setMessage('List shared.'); }
    catch (error) { if (!(error instanceof Error && error.name === 'AbortError')) setMessage('Sharing is unavailable. Try Copy list or Download list.'); }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([groceryText(titles)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'biteclub-thanksgiving-groceries.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <>
    <div className="flex flex-wrap gap-3 my-5">
      <button type="button" className="rounded-full bg-[#c71c39] text-white px-5 py-3 font-semibold" onClick={copy}>Copy list</button>
      {canShare && <button type="button" className="rounded-full border px-5 py-3 font-semibold" onClick={share}>Share list</button>}
      <button type="button" className="rounded-full border px-5 py-3 font-semibold" onClick={download}>Download list (.txt)</button>
    </div>
    <p role="status" className="text-sm min-h-6">{message}</p>
    <div className="grid md:grid-cols-2 gap-8">
      {groceryGroups.map(group => <section key={group} aria-labelledby={`group-${group}`}>
        <h3 id={`group-${group}`} className="text-xl font-bold capitalize border-b pb-3">{group}</h3>
        <ul className="divide-y divide-stone-200">{groceries.filter(item => item.group === group).map(item => <li key={item.id} className="py-4">
          <label className="flex items-center gap-3 font-semibold cursor-pointer min-h-8">
            <input type="checkbox" className="w-5 h-5 accent-[#c71c39] shrink-0" checked={checked.includes(item.id)} onChange={() => toggle(item.id)} />
            <span className={checked.includes(item.id) ? 'line-through opacity-60' : ''}>{item.name}</span>
          </label>
          <ul className="pl-8 space-y-2 mt-2 text-sm leading-relaxed">{item.requirements.map((line, index) => <li key={index}>
            {line.text}<span className="block text-stone-500">{titles[line.recipe]}</span>
          </li>)}</ul>
        </li>)}</ul>
      </section>)}
    </div>
  </>;
}
