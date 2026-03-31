import { BadgeCheck, Star } from "lucide-react";

interface TestimonialItem {
    quote: string;
    author: string;
    role: string;
    rating: number;
    initial: string;
}
const TESTIMONIALS: TestimonialItem[] = [
    {
        quote: "The milestone system changed how I work with remote clients. Deliverables unlock payments automatically — I haven't chased a single invoice since joining.",
        author: "Sara D.",
        role: "Full-Stack Developer",
        rating: 5,
        initial: "S",
    },
    {
        quote: "Posted my first project and had eight qualified proposals in 48 hours. The structured bid format made comparing candidates incredibly straightforward.",
        author: "Omar K.",
        role: "Startup Founder",
        rating: 5,
        initial: "O",
    },
    {
        quote: "I've used three other platforms. FreelanceHub is the only one that feels built for professionals — clean contracts, honest reviews, and no gig chaos.",
        author: "Layla M.",
        role: "Product Designer",
        rating: 5,
        initial: "L",
    },
];


function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-primary" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
                {children}
            </span>
        </div>
    );
}



function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                />
            ))}
        </div>
    );
}



export function TestimonialsSection() {
    return (
        <section className="py-24 bg-muted/30 border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl mb-16">
                    <SectionLabel>Testimonials</SectionLabel>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                        Trusted by builders
                        <br />
                        <span className="text-primary">and clients alike.</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
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
        <div className="relative bg-card border border-border rounded-2xl p-7 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            {/* Quote mark */}
            <div className="absolute top-5 right-6 text-6xl font-bold text-muted/30 leading-none select-none group-hover:text-primary/10 transition-colors duration-300">
                &ldquo;
            </div>

            <div>
                <StarRating rating={testimonial.rating} />
                <p className="text-foreground text-sm leading-relaxed mt-4 mb-6 relative">
                    &ldquo;{testimonial.quote}&ldquo;
                </p>
            </div>

            <div className="flex items-center gap-3 pt-5 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {testimonial.initial}
                </div>
                <div>
                    <div className="text-sm font-bold text-foreground">
                        {testimonial.author}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {testimonial.role}
                    </div>
                </div>
                <BadgeCheck className="w-4 h-4 text-primary ml-auto shrink-0" />
            </div>
        </div>
    );
}