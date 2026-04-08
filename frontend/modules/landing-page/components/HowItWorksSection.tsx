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
            "Freelancers submit structured proposals with their price, estimated timeline, and a real cover letter. Clients review, compare, and accept the best fit — creating a contract instantly.",
    },
    {
        number: "03",
        title: "Build & Get Paid",
        description:
            "Milestone-based contracts track every deliverable. Submit work, get it approved, funds release automatically. Both parties review each other when the contract closes.",
    },
];

export function HowItWorksSection() {
    return (
        <section className="py-24 bg-muted/30 border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <SectionLabel>Process</SectionLabel>
                        <h2 className="text-5xl font-bold tracking-tight text-foreground mt-4 mb-6">
                            Three steps.
                            <br />
                            <span className="text-primary">Zero friction.</span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-sm">
                            From posting to payment — a clear, professional flow
                            for both clients and freelancers. No hidden steps,
                            no surprises.
                        </p>
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:gap-3 transition-all duration-base"
                        >
                            See how it works in detail
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="space-y-0">
                        {HOW_IT_WORKS.map((step, i) => (
                            <StepItem
                                key={i}
                                step={step}
                                isLast={i === HOW_IT_WORKS.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function StepItem({ step, isLast }: { step: StepItem; isLast: boolean }) {
    return (
        <div className="relative flex gap-8 group">
            {/* Connector line */}
            {!isLast && (
                <div className="absolute left-6 top-14 bottom-0 w-px bg-border group-hover:bg-primary/40 transition-colors duration-slow" />
            )}

            {/* Step circle */}
            <div className="shrink-0 w-12 h-12 rounded-full border-2 border-border bg-background flex items-center justify-center z-10 group-hover:border-primary group-hover:bg-primary/5 transition-all duration-base">
                <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">
                    {step.number}
                </span>
            </div>

            {/* Content */}
            <div className={`pb-12 ${isLast ? "pb-0" : ""}`}>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-base">
                    {step.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                    {step.description}
                </p>
            </div>
        </div>
    );
}
