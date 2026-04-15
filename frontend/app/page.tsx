import { CTASection } from "@/modules/landing-page/components/CTASection";
import { FeaturesSection } from "@/modules/landing-page/components/FeaturesSection";
import { Footer } from "@/modules/landing-page/components/Footer";
import { HeroSection } from "@/modules/landing-page/components/HeroSection";
import { HowItWorksSection } from "@/modules/landing-page/components/HowItWorksSection";
import { Navbar } from "@/modules/landing-page/components/Navbar";
import { RoleCardsSection } from "@/modules/landing-page/components/RoleCardsSection";
import { StatsSection } from "@/modules/landing-page/components/StatsSection";
import { TestimonialsSection } from "@/modules/landing-page/components/TestimonialsSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <StatsSection />
        <RoleCardsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
