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
        <div className="min-h-screen">
            <Navbar />
            <main>
                <HeroSection />
                <StatsSection />
                <FeaturesSection />
                <HowItWorksSection />
                <RoleCardsSection />
                <TestimonialsSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
