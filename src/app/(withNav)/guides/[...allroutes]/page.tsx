"use client";

import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { data } from '../data';
import { ChevronRight, Home } from 'lucide-react';

const routeMeta: Record<string, { label: string; category: string }> = {
  'about-us': { label: 'About Us', category: 'About' },
  'mission-vision': { label: 'Mission & Vision', category: 'About' },
  'our-team': { label: 'Our Team', category: 'About' },
  'contact-us': { label: 'Contact Us', category: 'About' },
  'submission-guidelines': { label: 'Submission Guidelines', category: 'Guidelines' },
  'author-guidelines': { label: 'Author Guidelines', category: 'Guidelines' },
  'ethical-guidelines': { label: 'Ethical Guidelines', category: 'Guidelines' },
  'conflict-of-interest': { label: 'Conflict of Interest', category: 'Guidelines' },
  'publishing-model': { label: 'Publishing Model', category: 'Publishing' },
  'call-for-papers': { label: 'Call for Papers', category: 'Publishing' },
  'how-we-publish': { label: 'How We Publish', category: 'Publishing' },
  'templates': { label: 'Templates', category: 'Publishing' },
  'peer-review-process': { label: 'Peer Review Process', category: 'Publishing' },
};

export default function Allroute() {
  const pathname = usePathname();
  const router = useRouter();
  const [path, setPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    const currentPath = pathname.split('/').pop() || '';
    const guide = data.find(item => item.title === currentPath);
    if (!guide) {
      router.replace('/guides');
      return;
    }
    setPath(currentPath);
  }, [pathname]);

  const meta = path ? routeMeta[path] : null;

  return (
    <div className="min-h-full bg-[#f8f9fc]">
      {/* Breadcrumb + page header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <button
            onClick={() => router.push('/guides')}
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <Home className="w-3 h-3" /> Guides
          </button>
          {meta && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-400">{meta.category}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-700 font-medium">{meta.label}</span>
            </>
          )}
        </div>
        {/* Title */}
        {meta && (
          <h1 className="text-xl font-bold text-gray-900">{meta.label}</h1>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {path &&
          data
            .filter(item => item.title === path)
            .map((item, index) => (
              <div key={index} className="guide-content">
                {item.content}
              </div>
            ))}
      </div>
    </div>
  );
}
