"use client";

import React from 'react';
import { GuidesSidebar } from './components/GuidesSidebar';

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-[#f8f9fc]">
      {/* Sidebar — sticky, never scrolls the page */}
      <GuidesSidebar />

      {/* Main content — grows naturally, page scrollbar handles everything */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
