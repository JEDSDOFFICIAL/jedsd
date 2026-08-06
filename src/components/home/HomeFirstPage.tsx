"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Upload, ArrowRight, BookOpen, Cpu, Award, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";

function HomePage() {
  const { data: session } = useSession();

  const focusAreas = [
    "Embedded Hardware",
    "IoT & Edge AI",
    "System-on-Chip (SoC)",
    "VLSI Design",
    "Digital Architecture",
    "Cyber-Physical Systems"
  ];

  return (
    <section
      className="relative w-full min-h-[calc(100vh-88px)] flex items-center justify-center overflow-hidden overflow-x-clip bg-slate-50 py-2 h-full"
    >
      {/* Premium SVG Grid Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none hidden lg:block">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative Radial Ambient Glows */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 hidden lg:block w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 hidden lg:block w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Container */}
      <div className="relative z- h-full py-2 w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center min-w-0">
        
        {/* Left Column - Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-3 sm:gap-8 min-w-0">
          
          {/* ISSN & Quality Badge */}
          <div className="inline-flex flex-wrap items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-md tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ISSN: 2583-9152 (Online)</span>
            <span className="text-slate-300">•</span>
            <span>Peer-Reviewed</span>
            <span className="text-slate-300">•</span>
            <span>Open Access</span>
          </div>

          {/* Headline (Responsive font-sans, highlighting 'Embedded' and 'Design') */}
          <div className="md:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-900 font-extrabold tracking-tight leading-[1.15] max-w-2xl font-sans">
              Journal of{" "}
              <span className="text-blue-600">Embedded</span> and Digital System{" "}
              <span className="text-blue-600">Design</span>
            </h1>
            <svg
              className="w-full max-w-2xl h-6 md:h-8 text-blue-600 fill-current opacity-85 mt-3"
              viewBox="0 0 200 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 11C40 4.5 120 1.5 198 6.5C140 2 60 7 2 11Z"
                fill="currentColor"
              />
            </svg>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
            JEDSD publishes peer-reviewed, high-quality research at the intersection of electronic engineering, computer systems, and emerging digital technologies. We bridge scientific innovation with implementation.
          </p>

          {/* Key Covered Focus Areas to fill vertical space nicely and look content-rich */}
          <div className="w-full max-w-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area, index) => (
                <div key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/50 border border-slate-200/60 rounded-lg text-xs font-semibold text-slate-600 transition-colors duration-200 cursor-default">
                  <CheckCircle2 className="size-3.5 text-blue-500" />
                  {area}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Dashboard
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/dashboard/paper/upload"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-8 py-3.5 rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <Upload className="size-4 text-slate-500" />
                  Upload Paper
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/paper"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Explore Papers
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/dashboard/paper/upload"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-8 py-3.5 rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <Upload className="size-4 text-slate-500" />
                  Submit Manuscript
                </Link>
              </>
            )}
          </div>

          {/* Quick Metrics / Highlights Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/60 w-full max-w-2xl">
            <div className="flex flex-col gap-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-800 bg-clip-text">4.8</span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Impact Factor</span>
            </div>
            <div className="flex flex-col gap-1 border-l border-slate-200/80 pl-4">
              <span className="text-xl sm:text-2xl font-bold text-slate-800">30d</span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. Review Time</span>
            </div>
            <div className="flex flex-col gap-1 border-l border-slate-200/80 pl-4">
              <span className="text-xl sm:text-2xl font-bold text-slate-800">100%</span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Access</span>
            </div>
          </div>

        </div>

        {/* Right Column - Premium Graphic/Card */}
        <div className="lg:col-span-5 flex items-center justify-center relative w-full pt-8 lg:pt-0 min-w-0">
          
          {/* Main Visual Card wrapper */}
          <div className="relative w-full max-w-sm mx-auto aspect-square lg:aspect-auto lg:h-[450px] flex items-center justify-center">
            
            {/* Interactive Mock Journal Cover / Card */}
            <div className="relative w-full bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-2xl transition-all duration-500 hover:translate-y-[-6px] hover:shadow-indigo-500/10 hover:border-indigo-200/80 flex flex-col gap-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Cpu className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">JEDSD</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Vol. 4, Issue 2 (2026)</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100">
                  Featured
                </span>
              </div>
              
              {/* Article Content */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Research Article</span>
                <h4 className="font-extrabold text-slate-900 text-base leading-snug hover:text-blue-600 transition-colors cursor-pointer">
                  Design and Analysis of Ultra-Low-Power Edge AI Hardware Accelerators for IoT Node Architectures
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Exploring novel microarchitectural paradigms to optimize multiply-accumulate units for highly constrained energy budgets at the edge.
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-4 mt-auto">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-700">Author:</span> Dr. Sarah Jenkins
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-medium">
                  <ShieldCheck className="size-3.5" /> Verified
                </div>
              </div>
            </div>

            {/* Floating Badge 1 - Impact */}
            <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md border border-slate-150 p-3 rounded-xl shadow-lg flex items-center gap-3 hover:scale-105 transition-transform duration-300">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Award className="size-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Indexed</div>
                <div className="text-[9px] text-slate-400 font-medium">Scopus / Web of Science</div>
              </div>
            </div>

            {/* Floating Badge 2 - Rapid decision */}
            <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md border border-slate-150 p-3 rounded-xl shadow-lg flex items-center gap-3 hover:scale-105 transition-transform duration-300">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <Zap className="size-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Rapid Publishing</div>
                <div className="text-[9px] text-slate-400 font-medium">Fast-track option</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default HomePage;
