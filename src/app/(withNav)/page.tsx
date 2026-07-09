"use client";

import { memo } from "react";
import HomePage from "@/components/home/HomeFirstPage";
import AboutUs from "@/components/home/homeSecondElementAboutUs";
import StatsSection from "@/components/home/StatsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import SubmissionFlowchart from "@/components/home/SubmissionFlowchart";
import CallForPapers from "@/components/home/CallForPapers";
import NewsletterSection from "@/components/home/NewsletterSection";

const MemoizedHomePage = memo(HomePage);
const MemoizedAboutUs = memo(AboutUs);
const MemoizedStatsSection = memo(StatsSection);
const MemoizedSubmissionFlowchart = memo(SubmissionFlowchart);

export default function Home() {
  return (
    <div className="w-full max-w-full overflow-x-hidden scroll-smooth">
      <MemoizedHomePage />
      <MemoizedStatsSection />
      <MemoizedAboutUs />
      <FeaturesSection />
      <MemoizedSubmissionFlowchart />
      <CallForPapers />
      <NewsletterSection />
    </div>
  );
}
