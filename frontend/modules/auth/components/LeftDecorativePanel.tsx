import { Briefcase } from "lucide-react";

export const LeftDecorativePanel = () => {
    return (
        <div className="hidden lg:flex flex-col justify-between w-120 bg-foreground text-background p-12 shrink-0">
            <div>
                <div className="flex items-center gap-2.5 mb-16">
                    <div className="w-8 h-8 rounded-lg bg-background/15 flex items-center justify-center">
                        <Briefcase className="w-4.5 h-4.5 text-background" />
                    </div>
                    <span className="text-lg font-bold">FreelanceHub</span>
                </div>
                <h1 className="text-3xl font-bold leading-tight mb-4">
                    Start your journey with serious work.
                </h1>
                <p className="text-background/60 leading-relaxed">
                    Join 14,000+ freelancers and clients building great things
                    together.
                </p>
            </div>

            {/* Testimonial */}
            <div className="bg-background/8 rounded-xl p-5 border border-background/10">
                <p className="text-sm text-background/80 italic leading-relaxed mb-4">
                    &ldquo;The milestone system changed how I work with remote
                    clients. Deliverables unlock payments automatically.&ldquo;
                </p>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center text-sm font-bold">
                        S
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Sara Dev</p>
                        <p className="text-xs text-background/50">
                            Full-Stack Developer
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
