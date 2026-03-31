import { Briefcase } from "lucide-react";

export function Footer() {
    const footerLinks = {
        Platform: [
            "Browse Projects",
            "Post a Project",
            "Find Talent",
            "Pricing",
        ],
        Company: ["About", "Blog", "Careers", "Press"],
        Legal: ["Terms", "Privacy", "Cookies", "Security"],
        Support: ["Help Center", "Contact", "Status", "Community"],
    };

    return (
        <footer className="border-t border-border bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Brand col */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-foreground">
                                Freelance
                                <span className="text-primary">Hub</span>
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-50">
                            Where serious clients meet world-class freelancers.
                        </p>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([group, links]) => (
                        <div key={group}>
                            <div className="text-xs font-bold tracking-widest uppercase text-foreground mb-4">
                                {group}
                            </div>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © 2026 FreelanceHub. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        All systems operational
                    </div>
                </div>
            </div>
        </footer>
    );
}