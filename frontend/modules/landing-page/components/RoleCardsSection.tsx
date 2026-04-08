import { Card } from "@/modules/shared/components/card";
import { ArrowRight, Briefcase, DollarSign, Check } from "lucide-react";

export function RoleCardsSection() {
    return (
        <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Client card */}
                    <Card
                        variant="interactive"
                        className="group relative overflow-hidden p-10 border-border"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors duration-slow" />

                        <div className="relative z-10">
                            <div className="inline-flex p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary mb-8">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4">
                                For Clients
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-4 leading-tight">
                                Hire world-class talent
                            </h3>
                            <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                                Post your project and receive structured
                                proposals within hours. Manage milestones and
                                payments in one secure place.
                            </p>
                            <ul className="space-y-3 mb-10">
                                {[
                                    "Verified experts only",
                                    "Milestone-based payments",
                                    "Direct communication",
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center gap-3 text-sm text-foreground/80 font-medium"
                                    >
                                        <Check className="w-4 h-4 text-success" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background font-bold text-sm hover:bg-foreground/90 transition-all duration-base"
                            >
                                Post a Project
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </Card>

                    {/* Freelancer card */}
                    <Card
                        variant="interactive"
                        className="group relative overflow-hidden p-10 border-border"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full translate-x-16 -translate-y-16 group-hover:bg-success/10 transition-colors duration-slow" />

                        <div className="relative z-10">
                            <div className="inline-flex p-3 rounded-xl bg-success/10 border border-success/20 text-success mb-8">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="text-xs font-bold tracking-widest uppercase text-success mb-4">
                                For Freelancers
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-4 leading-tight">
                                Find high-value work
                            </h3>
                            <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                                Browse open projects and submit proposals that
                                stand out. Get paid automatically as you hit
                                your milestones.
                            </p>
                            <ul className="space-y-3 mb-10">
                                {[
                                    "No bidding wars",
                                    "Guaranteed payments",
                                    "Build your reputation",
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center gap-3 text-sm text-foreground/80 font-medium"
                                    >
                                        <Check className="w-4 h-4 text-success" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-background text-foreground font-bold text-sm hover:bg-muted transition-all duration-base"
                            >
                                Browse Projects
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
