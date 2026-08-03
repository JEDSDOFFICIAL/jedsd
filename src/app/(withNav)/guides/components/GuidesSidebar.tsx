"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import {
  BookOpen,
  Users,
  Target,
  Mail,
  FileText,
  UserCheck,
  Shield,
  AlertTriangle,
  Globe,
  Phone,
  BookOpenCheck,
  Download,
  Search,
  Menu,
  X,
  ChevronRight,
  Home,
  ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GuideRoute {
  id: string;
  title: string;
  icon: React.ElementType;
  category: string;
  description?: string;
  badge?: string;
}

const guideRoutes: GuideRoute[] = [
  // About Section
  { id: 'about-us', title: 'About Us', icon: BookOpen, category: 'About', description: 'Learn about JEDSD' },
  { id: 'mission-vision', title: 'Mission & Vision', icon: Target, category: 'About', description: 'Our goals and aspirations' },
  { id: 'our-team', title: 'Our Team', icon: Users, category: 'About', description: 'Meet our editorial board' },
  { id: 'contact-us', title: 'Contact Us', icon: Mail, category: 'About', description: 'Get in touch with us' },

  // Submission Guidelines
  { id: 'submission-guidelines', title: 'Submission Guidelines', icon: FileText, category: 'Guidelines', description: 'How to submit your paper' },
  { id: 'author-guidelines', title: 'Author Guidelines', icon: UserCheck, category: 'Guidelines', description: 'Guidelines for authors' },
  { id: 'ethical-guidelines', title: 'Ethical Guidelines', icon: Shield, category: 'Guidelines', description: 'Research ethics and standards' },
  { id: 'conflict-of-interest', title: 'Conflict of Interest', icon: AlertTriangle, category: 'Guidelines', description: 'COI policies and procedures' },

  // Publishing
  { id: 'publishing-model', title: 'Publishing Model', icon: Globe, category: 'Publishing', description: 'Our publishing approach' },
  { id: 'call-for-papers', title: 'Call for Papers', icon: Phone, category: 'Publishing', description: 'Current calls for submissions', badge: 'Active' },
  { id: 'how-we-publish', title: 'How We Publish', icon: BookOpenCheck, category: 'Publishing', description: 'Publication process' },
  { id: 'templates', title: 'Templates', icon: Download, category: 'Publishing', description: 'Download templates' },
  { id: 'peer-review-process', title: 'Peer Review Process', icon: Search, category: 'Publishing', description: 'Review methodology' },
];

const categories: { label: string; key: string }[] = [
  { label: 'About', key: 'About' },
  { label: 'Guidelines', key: 'Guidelines' },
  { label: 'Publishing', key: 'Publishing' },
];

const categoryColors: Record<string, string> = {
  About: 'bg-blue-500',
  Guidelines: 'bg-purple-500',
  Publishing: 'bg-emerald-500',
};

export function GuidesSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState<string>('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    About: true, Guidelines: true, Publishing: true
  });

  useEffect(() => {
    const segments = pathname.split('/');
    const last = segments[segments.length - 1];
    setActiveRoute(last === 'guides' ? '' : last);
  }, [pathname]);

  const toggleCategory = (key: string) =>
    setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }));

  const handleRouteClick = (routeId: string) => {
    router.push(`/guides/${routeId}`);
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <button
          onClick={() => { router.push('/guides'); setIsMobileOpen(false); }}
          className="flex items-center gap-3 w-full group"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-700 transition-colors">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900 leading-none">JEDSD Guides</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-none">Documentation & Resources</p>
          </div>
        </button>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 py-4 space-y-1">
          {/* Overview link */}
          <button
            onClick={() => { router.push('/guides'); setIsMobileOpen(false); }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
              activeRoute === ''
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            Overview
          </button>

          <div className="pt-2 space-y-4">
            {categories.map(({ label, key }) => {
              const routes = guideRoutes.filter(r => r.category === key);
              const isOpen = openCategories[key];
              return (
                <div key={key}>
                  <button
                    onClick={() => toggleCategory(key)}
                    className="w-full flex items-center justify-between px-2 py-1 mb-1 group"
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn('w-1.5 h-1.5 rounded-full', categoryColors[key])} />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-700 transition-colors">
                        {label}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-3 h-3 text-gray-400 transition-transform duration-200',
                        !isOpen && '-rotate-90'
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="space-y-0.5">
                      {routes.map(route => {
                        const Icon = route.icon;
                        const isActive = activeRoute === route.id;
                        return (
                          <button
                            key={route.id}
                            onClick={() => handleRouteClick(route.id)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left group relative',
                              isActive
                                ? 'bg-blue-50 text-blue-700 font-medium border border-blue-100'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            )}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full" />
                            )}
                            <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600')} />
                            <span className="flex-1 leading-tight">{route.title}</span>
                            {route.badge && (
                              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-100 text-emerald-700 border-0 font-medium">
                                {route.badge}
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          © 2025 JEDSD · All rights reserved
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger — only on small screens */}
      <button
        className="fixed bottom-6 right-6 z-50 md:hidden w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-200 flex-col flex-shrink-0 sticky top-0" style={{ height: 'calc(100dvh - 64px)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="fixed top-0 left-0 w-72 h-full bg-white z-50 md:hidden shadow-2xl flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
