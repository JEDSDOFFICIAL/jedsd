"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { InteractiveHoverButton } from "../magicui/interactive-hover-button";
import { TextAnimate } from "../magicui/text-animate";

import { RetroGrid } from "../magicui/retro-grid";

function HomePage() {
  const { data: session } = useSession();

  return (
    <section
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{background: "linear-gradient(210deg,rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 64, 0.84) 56%, rgba(0, 151, 181, 1) 100%)"}}
    >
      {/* Decorative Background Grid - Only render on larger screens for performance */}
      <div className="absolute inset-0 z-0 overflow-hidden hidden md:block">
        <RetroGrid opacity={0.2} />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-start w-full max-w-screen-xl text-center gap-6 pt-0 transform-gpu will-change-transform"
           style={{ backfaceVisibility: 'hidden' }}>
        <TextAnimate className="text-5xl md:text-6xl lg:text-9xl text-white font-bold chicle-regular">
          Welcome to
        </TextAnimate>
        <TextAnimate className="text-2xl md:text-4xl lg:text-7xl text-white font-bold chicle-regular">
          Journal of Embedded and Digital System Design
        </TextAnimate>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          {session?.user ? (
            <>
              <Link href="/dashboard">
                <InteractiveHoverButton className="bg-white text-black hover:bg-gray-200 transition-all px-6 py-3 rounded-lg">
                  Dashboard
                </InteractiveHoverButton>
              </Link>
              <Link href="/dashboard/paper/upload">
                <InteractiveHoverButton className="bg-white text-black hover:bg-gray-200 transition-all px-6 py-3 rounded-lg">
                  Upload Paper
                </InteractiveHoverButton>
              </Link>
            </>
          ) : (
            <>
              <Link href="/paper">
                <InteractiveHoverButton className="bg-white text-black hover:bg-gray-200 transition-all px-6 py-3 rounded-lg">
                  Explore
                </InteractiveHoverButton>
              </Link>
              <Link href="/signup">
                <InteractiveHoverButton className="bg-white text-black hover:bg-gray-200 transition-all px-6 py-3 rounded-lg">
                  Sign Up
                </InteractiveHoverButton>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Marquee Section */}
     
    </section>
  );
}

export default HomePage;
