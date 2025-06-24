"use client";

import Footer from "@/components/home/Footer";
import HomePage from "@/components/home/HomeFirstPage";
import AboutUs from "@/components/home/homeSecondElementAboutUs";
import Navbar from "@/components/home/Navbar";
import Timeline from "@/components/home/timeline";


export default function Home() {
   
  return (
    <div className="w-screen h-screen overflow-x-hidden">
 

      <HomePage />
      <AboutUs />
      <Timeline/>
    </div>
  );
}
