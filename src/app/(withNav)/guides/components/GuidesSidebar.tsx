"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  Home
} from 'lucide-react';

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

const categories = ['About', 'Guidelines', 'Publishing'];

export function GuidesSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState<string>('about-us');

  useEffect(() => {
    const currentPath = pathname.split('/').pop() || 'about-us';
    setActiveRoute(currentPath);
  }, [pathname]);

  const handleRouteClick = (routeId: string) => {
    router.push(`/guides/${routeId}`);
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
     

      {/* Navigation */}
      <ScrollArea className="flex-1 bg-white min-h-full">
        <div className="p-4 space-y-6">
          {/* Home Link */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-left p-3 h-auto",
                "hover:bg-blue-50 hover:text-blue-700 transition-all duration-200",
                pathname === '/guides' && "bg-blue-100 text-blue-700 border-l-4 border-blue-600"
              )}
              onClick={() => router.push('/guides')}
            >
              <Home className="w-5 h-5 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">Guides Home</div>
                <div className="text-xs text-gray-500 truncate">Overview of all guides</div>
              </div>
            </Button>
          </div>

          <Separator />

          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider px-2">
                {category}
              </h3>
              <div className="space-y-1">
                {guideRoutes
                  .filter((route) => route.category === category)
                  .map((route) => {
                    const Icon = route.icon;
                    const isActive = activeRoute === route.id;
                    
                    return (
                      <Button
                        key={route.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left p-3 h-auto",
                          "hover:bg-blue-50 hover:text-blue-700 transition-all duration-200",
                          "group relative",
                          isActive && "bg-blue-100 text-blue-700 border-l-4 border-blue-600"
                        )}
                        onClick={() => handleRouteClick(route.id)}
                      >
                        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium flex items-center gap-2">
                            {route.title}
                            {route.badge && (
                              <Badge variant="secondary" className="text-xs px-2 py-0">
                                {route.badge}
                              </Badge>
                            )}
                          </div>
                          {route.description && (
                            <div className="text-xs text-gray-500 truncate">
                              {route.description}
                            </div>
                          )}
                        </div>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 ml-2 flex-shrink-0" />
                        )}
                      </Button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Journal of Embedded and Digital System Design
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © 2025 JEDSD. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 bg-white border-r border-gray-200 shadow-lg flex-col h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="fixed top-0 left-0 w-80 h-screen bg-white z-50 md:hidden shadow-2xl flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
