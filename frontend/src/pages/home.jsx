import { useState } from "react";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import ImpactStats from "@/components/impact-stats";
import MissionSection from "@/components/mission-section";
import FeaturedProjects from "@/components/featured-projects";
import UserTypeSelection from "@/components/user-type-selection";
import MobileAppPromo from "@/components/mobile-app-promo";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <MissionSection />
      <FeaturedProjects />
      <UserTypeSelection />
      <ImpactStats />
      <MobileAppPromo />
      <Footer />
    </div>
  );
}
