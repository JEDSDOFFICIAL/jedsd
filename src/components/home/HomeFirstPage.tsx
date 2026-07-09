"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FileText, Upload, ArrowRight, Award, ShieldCheck } from "lucide-react";

function HomePage() {
  const { data: session } = useSession();

  return (
    <section
      className="relative w-full min-h-[calc(100vh-88px)] flex flex-col items-center justify-center overflow-hidden bg-[#070b19] py-12"
    >
      {/* Premium SVG Grid Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative Radial Ambient Glows */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl px-4 sm:px-6 lg:px-8 text-center gap-8 mt-12">
        
        {/* ISSN & Quality Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 backdrop-blur-md tracking-wider uppercase animate-fade-in-up">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ISSN: 2583-9152 (Online)
          <span className="text-white/20">•</span>
          Peer-Reviewed
          <span className="text-white/20">•</span>
          Open Access
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl text-white font-extrabold tracking-tight leading-[1.1] max-w-4xl animate-fade-in-up">
          Advancing Research in <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-200 to-teal-300">
            Embedded &amp; Digital Systems
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          The Journal of Embedded and Digital System Design (JEDSD) publishes peer-reviewed,
          high-quality research at the intersection of electronic engineering, computer systems, and emerging digital technologies.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 mt-4 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300"
              >
                Dashboard
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dashboard/paper/upload"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold px-8 py-3.5 rounded-xl backdrop-blur-md transition-all duration-300"
              >
                <Upload className="size-4 text-gray-300" />
                Upload Paper
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/paper"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300"
              >
                Explore Papers
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dashboard/paper/upload"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold px-8 py-3.5 rounded-xl backdrop-blur-md transition-all duration-300"
              >
                <Upload className="size-4 text-gray-300" />
                Submit Manuscript
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Structured Minimal Stats Bar */}
      <div
        className="relative z-10 w-full max-w-5xl px-4 sm:px-6 lg:px-8 mt-24 mb-12 animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
            
            <div className="pt-0 pb-4 md:py-2">
              <div className="flex justify-center items-center gap-1.5 text-blue-400 mb-1">
                <FileText className="size-4" />
                <span className="text-3xl font-extrabold text-white">500+</span>
              </div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Papers Published</p>
            </div>

            <div className="pt-4 pb-4 md:py-2 md:pl-4">
              <div className="flex justify-center items-center gap-1.5 text-indigo-400 mb-1">
                <ShieldCheck className="size-4" />
                <span className="text-3xl font-extrabold text-white">200+</span>
              </div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Expert Reviewers</p>
            </div>

            <div className="pt-4 pb-4 md:py-2 md:pl-4">
              <div className="flex justify-center items-center gap-1.5 text-teal-400 mb-1">
                <Award className="size-4" />
                <span className="text-3xl font-extrabold text-white">50+</span>
              </div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Countries Represented</p>
            </div>

            <div className="pt-4 pb-0 md:py-2 md:pl-4">
              <div className="flex justify-center items-center gap-1.5 text-purple-400 mb-1">
                <span className="text-3xl font-extrabold text-white">&lt;30</span>
              </div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Days Avg. Review</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
