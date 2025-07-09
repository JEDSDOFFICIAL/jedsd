"use client";

import { memo } from "react";
import Footer from "@/components/home/Footer";
import HomePage from "@/components/home/HomeFirstPage";
import AboutUs from "@/components/home/homeSecondElementAboutUs";
import Timeline from "@/components/home/timeline";
import Navbar from "@/components/home/Navbar";

const MemoizedHomePage = memo(HomePage);
const MemoizedNavbar = memo(Navbar);
const MemoizedAboutUs = memo(AboutUs);
const MemoizedTimeline = memo(Timeline);
const MemoizedFooter = memo(Footer);

export default function Home() {
   
  return (
    <div className="w-full min-h-screen overflow-x-hidden scroll-smooth">
      <MemoizedNavbar/>
      <MemoizedHomePage />
      <MemoizedAboutUs />
      <MemoizedTimeline />
      <MemoizedFooter />
    </div>
  );
}
