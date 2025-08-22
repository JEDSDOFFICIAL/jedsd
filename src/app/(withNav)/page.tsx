"use client";

import { memo } from "react";
import HomePage from "@/components/home/HomeFirstPage";
import AboutUs from "@/components/home/homeSecondElementAboutUs";
import Timeline from "@/components/home/timeline";

const MemoizedHomePage = memo(HomePage);
const MemoizedAboutUs = memo(AboutUs);
const MemoizedTimeline = memo(Timeline);

export default function Home() {
   
  return (
    <div className="w-full max-w-full overflow-x-hidden scroll-smooth">
      <MemoizedHomePage />
      <MemoizedAboutUs />
      <MemoizedTimeline />
    </div>
  );
}
