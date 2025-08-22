"use client";

import React from 'react';
import { GuidesSidebar } from './components/GuidesSidebar';

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen h-fit bg-gray-50 overflow-hidden">
      <GuidesSidebar />
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden scrollbar-thin">
        {children}
      </main>
    </div>
  );
}
