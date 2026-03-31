import { ArrowRight, Briefcase, DollarSign } from "lucide-react";

export function RoleCardsSection() {
    return (
        <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Client card */}
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 group hover:border-primary/40 hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-primary/10 to-transparent rounded-full translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500" />
                        <div className="relative">
                            <div className="inline-flex p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary mb-6">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div className="text-xs font-bold tracking-widest uppercase text-primary mb-3">
                                For Clients
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-3 leading-tight">
                                Hire world-class talent
                            </h3>
                            <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
                                Post your project in 5 minutes. Receive
                                structured proposals from vetted freelancers.
                                Accept the best fit, create the contract, and
                                build with confidence.
                            </p>
                            <ul className="space-y-2 mb-8">
                                {[
                                    "Post projects in any category",
                                    "Compare structured proposals",
                                    "Milestone-protected contracts",
                                    "Rate your freelancer",
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center gap-2 text-sm text-muted-foreground"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-all hover:-translate-y-0.5 duration-200"
                            >
                                Post a Project
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Freelancer card */}
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 group hover:border-primary/40 hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-emerald-500/8 to-transparent rounded-full translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500" />
                        <div className="relative">
                            <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-6">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="text-xs font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 mb-3">
                                For Freelancers
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-3 leading-tight">
                                Get paid for great work
                            </h3>
                            <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
                                Browse hundreds of open projects with clear
                                budgets and real deadlines. Submit smart
                                proposals, get accepted, and work under
                                milestone-protected contracts.
                            </p>
                            <ul className="space-y-2 mb-8">
                                {[
                                    "Browse all projects for free",
                                    "Submit structured proposals",
                                    "Milestone payment protection",
                                    "Build your verified rating",
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center gap-2 text-sm text-muted-foreground"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-background text-foreground font-semibold text-sm hover:bg-muted transition-all hover:-translate-y-0.5 duration-200"
                            >
                                Browse Projects
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}