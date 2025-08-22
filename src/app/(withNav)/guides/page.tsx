"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  ArrowRight,
  Star,
  ExternalLink,
  MapPin,
  Clock
} from 'lucide-react';

interface GuideCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  featured?: boolean;
  badge?: string;
}

const guideCards: GuideCard[] = [
  // Featured Guides
  { id: 'about-us', title: 'About JEDSD', description: 'Learn about our journal, mission, and commitment to advancing embedded and digital system design research.', icon: BookOpen, category: 'About', featured: true },
  { id: 'submission-guidelines', title: 'Submission Guidelines', description: 'Comprehensive guidelines for authors submitting manuscripts to JEDSD.', icon: FileText, category: 'Guidelines', featured: true },
  { id: 'call-for-papers', title: 'Call for Papers', description: 'Current calls for paper submissions and special issues.', icon: Phone, category: 'Publishing', featured: true, badge: 'Active' },
  
  // About Section
  { id: 'mission-vision', title: 'Mission & Vision', description: 'Our goals and aspirations for advancing research in digital system design.', icon: Target, category: 'About' },
  { id: 'our-team', title: 'Editorial Board', description: 'Meet our distinguished editorial board and advisory committee members.', icon: Users, category: 'About' },
  { id: 'contact-us', title: 'Contact Information', description: 'Get in touch with our editorial team and support staff.', icon: Mail, category: 'About' },
  
  // Guidelines
  { id: 'author-guidelines', title: 'Author Guidelines', description: 'Detailed guidelines for manuscript preparation and formatting.', icon: UserCheck, category: 'Guidelines' },
  { id: 'ethical-guidelines', title: 'Research Ethics', description: 'Ethical standards and guidelines for research integrity.', icon: Shield, category: 'Guidelines' },
  { id: 'conflict-of-interest', title: 'Conflict of Interest', description: 'Policies and procedures for managing conflicts of interest.', icon: AlertTriangle, category: 'Guidelines' },
  
  // Publishing
  { id: 'publishing-model', title: 'Publishing Model', description: 'Our open-access publishing approach and policies.', icon: Globe, category: 'Publishing' },
  { id: 'how-we-publish', title: 'Publication Process', description: 'Step-by-step guide to our publication workflow.', icon: BookOpenCheck, category: 'Publishing' },
  { id: 'templates', title: 'Templates & Resources', description: 'Download manuscript templates and formatting resources.', icon: Download, category: 'Publishing' },
  { id: 'peer-review-process', title: 'Peer Review', description: 'Our rigorous peer review methodology and standards.', icon: Search, category: 'Publishing' },
];

const categories = ['About', 'Guidelines', 'Publishing'];

export default function GuidesHome() {
  const router = useRouter();

  const handleCardClick = (guideId: string) => {
    router.push(`/guides/${guideId}`);
  };

  const featuredGuides = guideCards.filter(guide => guide.featured);
  const regularGuides = guideCards.filter(guide => !guide.featured);

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">JEDSD Guidelines & Resources</h1>
              <p className="text-blue-100 text-lg mt-2">
                Your comprehensive guide to publishing with the Journal of Embedded and Digital System Design
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">13+</div>
              <div className="text-blue-100">Comprehensive Guides</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">Open Access</div>
              <div className="text-blue-100">Publishing Model</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">Peer Reviewed</div>
              <div className="text-blue-100">Quality Assurance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8 space-y-12">
          
          {/* Featured Guides */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Featured Guides</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredGuides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <Card 
                    key={guide.id}
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
                    onClick={() => handleCardClick(guide.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        {guide.badge && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {guide.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{guide.title}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {guide.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full justify-between group">
                        Read Guide
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* All Guides by Category */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Guides</h2>
            {categories.map((category) => (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-blue-600 rounded"></div>
                  {category}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularGuides
                    .filter((guide) => guide.category === category)
                    .map((guide) => {
                      const Icon = guide.icon;
                      return (
                        <Card 
                          key={guide.id}
                          className="hover:shadow-md transition-all duration-300 cursor-pointer hover:border-blue-300"
                          onClick={() => handleCardClick(guide.id)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg leading-tight">{guide.title}</CardTitle>
                                <CardDescription className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {guide.description}
                                </CardDescription>
                              </div>
                              {guide.badge && (
                                <Badge variant="outline" className="text-xs">
                                  {guide.badge}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
          </section>

          {/* Quick Links */}
          <section className="bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">For Authors</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => router.push('/guides/submission-guidelines')}>
                      → Submission Guidelines
                    </Button>
                  </li>
                  <li>
                    <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => router.push('/guides/author-guidelines')}>
                      → Author Guidelines
                    </Button>
                  </li>
                  <li>
                    <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => router.push('/guides/templates')}>
                      → Download Templates
                    </Button>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">For Reviewers</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => router.push('/guides/peer-review-process')}>
                      → Peer Review Process
                    </Button>
                  </li>
                  <li>
                    <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => router.push('/guides/ethical-guidelines')}>
                      → Ethical Guidelines
                    </Button>
                  </li>
                  <li>
                    <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => router.push('/guides/conflict-of-interest')}>
                      → Conflict of Interest
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
  );
}
