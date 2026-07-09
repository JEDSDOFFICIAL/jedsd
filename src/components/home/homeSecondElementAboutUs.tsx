'use client';

import React from 'react';
import Link from 'next/link';
import { Target, BookOpen, Cpu, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pillars = [
  {
    title: 'Our Foundation',
    description:
      'Focusing on secure, fast, and reliable digital hardware platforms that serve as the backbone of modern digital infrastructure.',
    icon: Cpu,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-100 dark:border-blue-900/50',
    hoverBorderColor: 'hover:border-blue-300 dark:hover:border-blue-700',
    shadowColor: 'hover:shadow-blue-100/50 dark:hover:shadow-blue-950/20',
  },
  {
    title: 'Our Platform',
    description:
      'An open-access space publishing full-length manuscripts on emerging design techniques, embedded technologies, and digital architectures.',
    icon: BookOpen,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-100 dark:border-emerald-900/50',
    hoverBorderColor: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    shadowColor: 'hover:shadow-emerald-100/50 dark:hover:shadow-emerald-950/20',
  },
  {
    title: 'Our Objective',
    description:
      'Motivating students and inspiring researchers to share novel ideas globally, bridging graduation to global professional impact.',
    icon: Target,
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-100 dark:border-purple-900/50',
    hoverBorderColor: 'hover:border-purple-300 dark:hover:border-purple-700',
    shadowColor: 'hover:shadow-purple-100/50 dark:hover:shadow-purple-950/20',
  },
];

export default function HomeSecondElementAboutUs() {
  return (
    <section className="bg-white py-24 px-4 sm:px-6 md:px-10 lg:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column — Text Content & Mission (takes 5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-3">
              ABOUT JEDSD
            </p>
            <h2 className="chicle-regular text-3xl sm:text-4xl text-gray-900 leading-tight mb-5">
              Pioneering Research in Embedded &amp; Digital Systems
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The Journal of Embedded and Digital System Design (JEDSD) is a
                pioneering platform dedicated to advancing the fields of embedded
                and digital system design. We bridge the gap between innovation and
                application through cutting-edge research and expert analysis.
              </p>
              <p>
                Our platform empowers professionals, researchers, and enthusiasts
                with the knowledge they need to thrive in the ever-evolving world
                of microelectronics, IoT architectures, and digital hardware.
              </p>
            </div>
          </div>

          {/* Mission Card */}
          <div className="bg-gradient-to-r from-blue-50/80 to-teal-50/80 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border border-blue-100/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                <Target className="size-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                  Our Mission
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  To provide a global platform that fosters knowledge sharing, pushes boundaries in electronic design, and paves the way for revolutionary technologies.
                </p>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-2 flex flex-wrap gap-4">
            <Link href="/guides/about-us">
              <Button className="group bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                Learn More About Us
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/guides/submission-guidelines">
              <Button variant="outline" className="border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-6 py-5 rounded-xl transition-all duration-300">
                Author Guidelines
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column — Pillars Stack (takes 7 cols on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative">
            {/* Visual element / vertical line connecting the cards */}
            <div className="absolute left-8 top-8 bottom-8 w-[2px] bg-gradient-to-b from-blue-500/20 via-emerald-500/20 to-purple-500/20 hidden md:block" />

            <div className="space-y-6">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={idx}
                    className={`relative md:ml-4 flex flex-col md:flex-row gap-5 p-6 bg-white dark:bg-slate-900 border ${pillar.borderColor} ${pillar.hoverBorderColor} rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${pillar.shadowColor} group`}
                  >
                    {/* Icon Container with hover effects */}
                    <div className={`p-4 rounded-xl ${pillar.bgColor} ${pillar.iconColor} w-max h-max transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}>
                      <Icon className="size-6" />
                    </div>

                    {/* Card Text */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
