import { SectionLabel } from "@/modules/shared/components/section-label";
import { Card } from "@/modules/shared/components/card";
import { Avatar } from "@/modules/shared/components/avatar";
import { BadgeCheck, Star } from "lucide-react";

interface TestimonialItem {
    quote: string;
    author: string;
    role: string;
    rating: number;
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
        quote: "I've used three other platforms. FreelanceHub is the only one that feels built for professionals — clean contracts, honest reviews, and no gig chaos.",
        author: "Layla M.",
        role: "Product Designer",
        rating: 5,
    },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div
            className="flex gap-1"
            aria-label={`Rated ${rating} out of 5 stars`}
        >
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 transition-colors duration-200 ${
                        i < rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                    }`}
                />
            ))}
        </div>
    );
}

export function TestimonialsSection() {
    return (
        <section className="py-24 bg-muted/30 border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header section enhanced for better visual pacing */}
                <div className="max-w-2xl mb-16">
                    <SectionLabel>Testimonials</SectionLabel>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mt-4 mb-4">
                        Trusted by builders
                        <br />
                        <span className="text-primary">and clients alike.</span>
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Don&apos;t just take our word for it. Hear from the
                        professionals who use FreelanceHub to do their best work
                        without the usual friction.
                    </p>
                </div>

                {/* Grid gap increased to gap-8 (32px) to match DS comfortable density rules */}
                <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <TestimonialCard key={i} testimonial={t} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
    return (
        <Card
            variant="interactive"
            className="group relative p-8 flex flex-col justify-between h-full"
        >
            {/* Semantic watermark quote mark */}
            <div className="absolute top-6 right-6 text-7xl font-bold text-muted/20 leading-none select-none group-hover:text-primary/10 transition-colors duration-300 font-sans">
                &ldquo;
            </div>

            <div className="relative z-10">
                <StarRating rating={testimonial.rating} />

                {/* Changed to text-base to respect the Typography scale for body paragraphs */}
                <p className="text-foreground text-base leading-relaxed mt-6 mb-8">
                    &ldquo;{testimonial.quote}&rdquo;
                </p>
            </div>

            {/* Footer proximity grouping */}
            <div className="flex items-center gap-4 pt-6 border-t border-border mt-auto">
                <Avatar name={testimonial.author} size="sm" />

                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">
                        {testimonial.author}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                        {testimonial.role}
                    </div>
                </div>

                {/* Verified badge uses text-success (Emerald) as per Status Palette for verified/successful states */}
                <BadgeCheck
                    className="w-5 h-5 text-success shrink-0"
                    aria-label="Verified User"
                />
            </div>
        </Card>
    );
}
