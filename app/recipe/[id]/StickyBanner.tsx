'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

const APP_STORE_URL = 'https://apps.apple.com/app/id6748471652';

export default function StickyBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-40 animate-slide-up">
      <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <h3 className="text-base font-bold flex-1" style={{ color: '#3D352E' }}>
          Want to see more recipes like this?
        </h3>
        <a 
          href={APP_STORE_URL}
          className="px-5 py-2.5 bg-[#c71c39] text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Get the App
        </a>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" style={{ color: '#3D352E', opacity: 0.5 }} />
        </button>
      </div>
    </div>
  );
}

