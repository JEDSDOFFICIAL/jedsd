"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, Target, Mail, FileText, UserCheck,
  Shield, AlertTriangle, Globe, Phone, BookOpenCheck,
  Download, Search, ArrowRight, Star, Sparkles, Clock
} from 'lucide-react';

interface GuideCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  featured?: boolean;
  badge?: string;
  color: string;
  bg: string;
}

const guideCards: GuideCard[] = [
  { id: 'about-us', title: 'About JEDSD', description: 'Learn about our journal, mission, and commitment to advancing embedded and digital system design research.', icon: BookOpen, category: 'About', featured: true, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'submission-guidelines', title: 'Submission Guidelines', description: 'Everything you need to know before submitting your manuscript to JEDSD.', icon: FileText, category: 'Guidelines', featured: true, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'call-for-papers', title: 'Call for Papers', description: 'Current calls for paper submissions and special issues.', icon: Phone, category: 'Publishing', featured: true, badge: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-50' },

  { id: 'mission-vision', title: 'Mission & Vision', description: 'Our goals and aspirations for advancing research in digital system design.', icon: Target, category: 'About', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'our-team', title: 'Editorial Board', description: 'Meet our distinguished editorial board and advisory committee members.', icon: Users, category: 'About', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'contact-us', title: 'Contact', description: 'Get in touch with our editorial team and support staff.', icon: Mail, category: 'About', color: 'text-blue-600', bg: 'bg-blue-50' },

  { id: 'author-guidelines', title: 'Author Guidelines', description: 'Detailed guidelines for manuscript preparation and formatting.', icon: UserCheck, category: 'Guidelines', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'ethical-guidelines', title: 'Research Ethics', description: 'Ethical standards and guidelines for research integrity.', icon: Shield, category: 'Guidelines', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'conflict-of-interest', title: 'Conflict of Interest', description: 'Policies and procedures for managing conflicts of interest.', icon: AlertTriangle, category: 'Guidelines', color: 'text-purple-600', bg: 'bg-purple-50' },

  { id: 'publishing-model', title: 'Publishing Model', description: 'Our open-access publishing approach and policies.', icon: Globe, category: 'Publishing', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'how-we-publish', title: 'Publication Process', description: 'Step-by-step guide to our publication workflow.', icon: BookOpenCheck, category: 'Publishing', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'templates', title: 'Templates', description: 'Download manuscript templates and formatting resources.', icon: Download, category: 'Publishing', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'peer-review-process', title: 'Peer Review', description: 'Our rigorous peer review methodology and standards.', icon: Search, category: 'Publishing', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const categories = [
  { key: 'About', label: 'About JEDSD', dot: 'bg-blue-500', border: 'border-blue-200', header: 'bg-blue-50' },
  { key: 'Guidelines', label: 'Author Guidelines', dot: 'bg-purple-500', border: 'border-purple-200', header: 'bg-purple-50' },
  { key: 'Publishing', label: 'Publishing', dot: 'bg-emerald-500', border: 'border-emerald-200', header: 'bg-emerald-50' },
];

export default function GuidesHome() {
  const router = useRouter();
  const featuredGuides = guideCards.filter(g => g.featured);
  const nonFeatured = guideCards.filter(g => !g.featured);

  return (
    <div className="min-h-full bg-[#f8f9fc]">

      {/* ── Hero Banner ── */}
      <div className="bg-white border-b border-gray-200 px-8 py-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-blue-600 mb-3">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Documentation</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            JEDSD Guidelines & Resources
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-2xl">
            Your comprehensive guide to publishing with the Journal of Embedded and Digital System Design.
            Find everything from submission guidelines to editorial policies.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 rounded-full px-4 py-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Open Access</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 rounded-full px-4 py-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Double-blind Peer Review</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 rounded-full px-4 py-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Fast Track Publication</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">

        {/* ── Featured Guides ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider">Start Here</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {featuredGuides.map(guide => {
              const Icon = guide.icon;
              return (
                <button
                  key={guide.id}
                  onClick={() => router.push(`/guides/${guide.id}`)}
                  className="group text-left bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 ${guide.bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${guide.color}`} />
                    </div>
                    {guide.badge && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {guide.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{guide.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read guide <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── All Guides by Category ── */}
        {categories.map(cat => {
          const catGuides = nonFeatured.filter(g => g.category === cat.key);
          return (
            <section key={cat.key}>
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-2 h-2 rounded-full ${cat.dot}`} />
                <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider">{cat.label}</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {catGuides.map(guide => {
                  const Icon = guide.icon;
                  return (
                    <button
                      key={guide.id}
                      onClick={() => router.push(`/guides/${guide.id}`)}
                      className="group text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200 flex items-start gap-3"
                    >
                      <div className={`w-9 h-9 ${guide.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${guide.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium text-gray-800 text-sm group-hover:text-blue-600 transition-colors leading-tight">
                            {guide.title}
                          </h3>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{guide.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* ── Quick Links strip ── */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Links</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">For Authors</h3>
              <ul className="space-y-1.5">
                {['submission-guidelines', 'author-guidelines', 'templates'].map(id => {
                  const g = guideCards.find(x => x.id === id)!;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => router.push(`/guides/${id}`)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3" /> {g.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">For Reviewers</h3>
              <ul className="space-y-1.5">
                {['peer-review-process', 'ethical-guidelines', 'conflict-of-interest'].map(id => {
                  const g = guideCards.find(x => x.id === id)!;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => router.push(`/guides/${id}`)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3" /> {g.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
