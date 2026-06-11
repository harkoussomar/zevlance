import { SectionLabel } from "@/modules/shared/components/section-label";
import { Card } from "@/modules/shared/components/card";
import { SmartAvatar } from "@/modules/shared/components/avatar";
import { BadgeCheck } from "lucide-react";

interface TestimonialItem {
    quote: string;
    author: string;
    role: string;
    rating: number;
    index?: number;
}

const TESTIMONIALS: TestimonialItem[] = [
    {
        quote: "The milestone system changed how I work with remote clients. Deliverables unlock payments automatically — I haven't chased a single invoice since joining.",
        author: "Sara D.",
        role: "Full-Stack Developer",
        rating: 5,
    },
    {
        quote: "Posted my first project and had eight qualified proposals in 48 hours. The structured bid format made comparing candidates incredibly straightforward.",
        author: "Omar K.",
        role: "Startup Founder",
        rating: 5,
    },
    {
        quote: "I've used three other platforms. Zevlance is the only one that feels built for professionals — clean contracts, honest reviews, and no gig chaos.",
        author: "Layla M.",
        role: "Product Designer",
        rating: 5,
    },
];

function StarRow({ rating }: { rating: number }) {
    return (
        <div
            className="flex gap-0.5"
            aria-label={`Rated ${rating} out of 5 stars`}
        >
            {Array.from({ length: 5 }).map((_, i) => (
                <svg
                    key={i}
                    className={`w-4 h-4 ${i < rating ? "text-warning" : "text-muted"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function TestimonialCard({
    testimonial,
    featured,
}: {
    testimonial: TestimonialItem;
    featured?: boolean;
}) {
    return (
        <Card
            className={`group relative p-7 sm:p-8 flex flex-col h-full overflow-hidden transition-all duration-[var(--duration-slow)] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] ${featured ? "md:p-10" : ""}`}
        >
            {/* Decorative large quote */}
            <div
                aria-hidden="true"
                className="absolute top-4 right-5 font-display text-[6rem] font-black leading-none select-none text-muted/20 group-hover:text-primary/10 transition-colors duration-[var(--duration-slow)]"
            >
                &ldquo;
            </div>

            <div className="relative z-10 flex flex-col flex-1">
                <StarRow rating={testimonial.rating} />

                <p className="text-foreground text-base leading-relaxed mt-5 mb-8 flex-1">
                    &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3.5 pt-5 border-t border-border mt-auto">
                    <SmartAvatar name={testimonial.author} size="sm" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate leading-tight">
                            {testimonial.author}
                        </p>
                        <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                            {testimonial.role}
                        </p>
                    </div>
                    <BadgeCheck
                        className="w-5 h-5 text-success shrink-0"
                        aria-label="Verified User"
                    />
                </div>
            </div>
        </Card>
    );
}

export function TestimonialsSection() {
    return (
        <section className="py-24 lg:py-32 bg-muted/20 border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="grid lg:grid-cols-2 gap-8 items-end mb-14">
                    <div>
                        <SectionLabel>Testimonials</SectionLabel>
                        <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold tracking-tight text-foreground mt-4 leading-[1.05]">
                            Trusted by builders
                            <br />
                            <span className="text-gradient-primary">
                                and clients alike.
                            </span>
                        </h2>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed lg:max-w-sm lg:self-end lg:pb-1">
                        Hear from professionals who use Zevlance to do their
                        best work without the usual friction.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-5">
                    {TESTIMONIALS.map((t, i) => (
                        <TestimonialCard
                            key={i}
                            testimonial={t}
                            featured={i === 1}
                        />
                    ))}
                </div>

                {/* Bottom trust signal */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-8 border-t border-border/50">
                    {[
                        { value: "4.9/5", label: "Average rating" },
                        { value: "2,400+", label: "Reviews written" },
                        { value: "100%", label: "Verified contracts" },
                    ].map((item) => (
                        <div key={item.label} className="text-center">
                            <div className="font-display text-2xl font-extrabold text-foreground tracking-tight tabular-nums">
                                {item.value}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium mt-0.5 uppercase tracking-widest">
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
