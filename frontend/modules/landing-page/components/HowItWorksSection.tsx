import { SectionLabel } from "@/modules/shared/components/section-label";
import { ArrowRight } from "lucide-react";

interface StepItem {
    number: string;
    title: string;
    description: string;
}

const HOW_IT_WORKS: StepItem[] = [
    {
        number: "01",
        title: "Post or Browse",
        description:
            "Clients post detailed project briefs with category, budget range, and required skills. Freelancers browse freely — no subscriptions or paywalls blocking discovery.",
    },
    {
        number: "02",
        title: "Bid & Select",
        description:
            "Freelancers submit structured proposals with price, timeline, and a real cover letter. Clients compare, review, and accept the best fit — creating a contract instantly.",
    },
    {
        number: "03",
        title: "Build & Get Paid",
        description:
            "Milestone-based contracts track every deliverable. Submit work, get approved, funds release automatically. Both parties review when the contract closes.",
    },
];

export function HowItWorksSection() {
    return (
        <section className="py-24 lg:py-32 bg-muted/20 border-y border-border overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-16 lg:mb-20">
                    <div>
                        <SectionLabel>Process</SectionLabel>
                        <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold tracking-tight text-foreground mt-4 leading-[1.05]">
                            Three steps.<br />
                            <span className="text-gradient-primary">Zero friction.</span>
                        </h2>
                    </div>
                    <div className="flex flex-col justify-end lg:pt-8">
                        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                            From posting to payment — a clear, professional flow for both clients
                            and freelancers. No hidden steps, no surprises.
                        </p>
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all duration-[var(--duration-base)] w-fit group"
                        >
                            See how it works in detail
                            <ArrowRight className="w-4 h-4 transition-transform duration-[var(--duration-base)] group-hover:translate-x-0.5" />
                        </a>
                    </div>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-0 relative">
                    {HOW_IT_WORKS.map((step, i) => (
                        <div key={i} className="relative group">
                            {/* Mobile connector */}
                            {i < HOW_IT_WORKS.length - 1 && (
                                <div className="md:hidden absolute left-8 top-20 bottom-0 w-px bg-border z-0" />
                            )}

                            <div className="relative z-10 p-6 sm:p-8 md:p-10 rounded-2xl transition-all duration-[var(--duration-slow)] hover:bg-background hover:shadow-[var(--shadow-md)] group/card h-full">
                                {/* Huge decorative number */}
                                <div className="relative mb-6 flex md:block items-center gap-5 md:gap-0">
                                    <div
                                        aria-hidden="true"
                                        className="absolute -top-3 -left-2 font-display font-black text-[clamp(5rem,10vw,8rem)] leading-none text-foreground/[0.04] select-none pointer-events-none hidden md:block"
                                    >
                                        {step.number}
                                    </div>
                                    {/* Step circle */}
                                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-border bg-background flex items-center justify-center shrink-0 group-hover/card:border-primary group-hover/card:bg-primary/5 group-hover/card:shadow-[var(--shadow-glow)] transition-all duration-[var(--duration-base)]">
                                        <span className="font-display text-sm font-bold text-muted-foreground group-hover/card:text-primary transition-colors duration-[var(--duration-base)]">
                                            {step.number}
                                        </span>
                                    </div>
                                    {/* Mobile label beside circle */}
                                    <h3 className="md:hidden font-display text-xl font-bold text-foreground group-hover/card:text-primary transition-colors duration-[var(--duration-base)]">
                                        {step.title}
                                    </h3>
                                </div>

                                <h3 className="hidden md:block font-display text-xl font-bold text-foreground mb-3 group-hover/card:text-primary transition-colors duration-[var(--duration-base)] mt-10">
                                    {step.title}
                                </h3>
                                <p className="text-base text-muted-foreground leading-relaxed mt-3 md:mt-0">
                                    {step.description}
                                </p>

                                {/* Bottom accent */}
                                <div className="mt-6 h-0.5 w-0 bg-primary rounded-full group-hover/card:w-10 transition-all duration-[var(--duration-slow)] ease-[var(--ease-decelerate)]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}