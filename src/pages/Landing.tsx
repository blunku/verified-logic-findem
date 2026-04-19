import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import FooterSection from "@/components/landing/FooterSection";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <FooterSection />
      </main>
    </div>
  );
};

export default Landing;
