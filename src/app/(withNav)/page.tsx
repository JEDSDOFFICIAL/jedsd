import HomePage from "@/components/home/HomeFirstPage";
import AboutUs from "@/components/home/homeSecondElementAboutUs";
import FeaturesSection from "@/components/home/FeaturesSection";
import SubmissionFlowchart from "@/components/home/SubmissionFlowchart";
import CallForPapers from "@/components/home/CallForPapers";
import EditorialTeamSection from "@/components/home/EditorialTeamSection";
import LatestArticlesSection from "@/components/home/LatestArticlesSection";

export default function Home() {
  return (
    <div className="w-full max-w-full overflow-x-hidden scroll-smooth">
      <HomePage />
      <AboutUs />
      <LatestArticlesSection />
      <EditorialTeamSection />
      <FeaturesSection />
      <SubmissionFlowchart />
      <CallForPapers />
    </div>
  );
}

