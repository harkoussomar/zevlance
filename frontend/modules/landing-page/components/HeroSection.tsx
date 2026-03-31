import { ArrowRight, Briefcase, ChevronRight, Clock, TrendingUp, Users } from "lucide-react";

interface ProjectCard {
    category: string;
    title: string;
    budget: string;
    bids: number;
    deadline: string;
    skills: string[];
    status: "OPEN" | "IN_PROGRESS" | "COMPLETED";
}


const LIVE_PROJECTS: ProjectCard[] = [
    {
        category: "WEB_DEV",
        title: "Spring Boot REST API with JWT Auth & PostgreSQL",
        budget: "$500 – $2,000",
        bids: 12,
        deadline: "Jun 30, 2026",
        skills: ["Java", "Spring Boot", "PostgreSQL"],
        status: "OPEN",
    },
    {
        category: "MOBILE",
        title: "React Native Delivery App — Full Stack",
        budget: "$1,200 – $4,000",
        bids: 7,
        deadline: "Jul 15, 2026",
        skills: ["React Native", "Node.js", "Firebase"],
        status: "OPEN",
    },
    {
        category: "DESIGN",
        title: "Brand Identity & UI Kit for FinTech Startup",
        budget: "$800 – $2,500",
        bids: 5,
        deadline: "May 1, 2026",
        skills: ["Figma", "Brand Design", "UI/UX"],
        status: "OPEN",
    },
    {
        category: "DATA",
        title: "ML Pipeline for E-commerce Recommendations",
        budget: "$2,000 – $5,000",
        bids: 3,
        deadline: "Aug 1, 2026",
        skills: ["Python", "PyTorch", "AWS"],
        status: "OPEN",
    },
];

const CATEGORIES = [
    { label: "Web Dev", count: 142 },
    { label: "Mobile", count: 89 },
    { label: "Design", count: 76 },
    { label: "Data Science", count: 54 },
    { label: "DevOps", count: 43 },
    { label: "Writing", count: 38 },
];

function Badge({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${className}`}
        >
            {children}
        </span>
    );
}

function StatusBadge({ status }: { status: ProjectCard["status"] }) {
    const variants = {
        OPEN: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        IN_PROGRESS:
            "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        COMPLETED: "bg-muted text-muted-foreground border-border",
    };
    const labels = {
        OPEN: "Open",
        IN_PROGRESS: "In Progress",
        COMPLETED: "Completed",
    };
    return (
        <span
            className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${variants[status]}`}
        >
            {labels[status]}
        </span>
    );
}


function ProjectListItem({ project }: { project: ProjectCard }) {
    const categoryColors: Record<string, string> = {
        WEB_DEV:
            "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
        MOBILE: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
        DESIGN: "text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20",
        DATA: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    };
    return (
        <a
            href="#"
            className="group flex items-start justify-between gap-4 px-5 py-4 hover:bg-muted/40 transition-colors duration-150 cursor-pointer"
        >
            <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${categoryColors[project.category] || "text-muted-foreground bg-muted border-border"}`}
                    >
                        {project.category}
                    </span>
                    <StatusBadge status={project.status} />
                </div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {project.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.bids} bids
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {project.deadline}
                    </span>
                </div>
            </div>
            <div className="shrink-0 text-right">
                <div className="text-sm font-bold text-foreground">
                    {project.budget}
                </div>
                <div className="flex gap-1 mt-1.5 justify-end flex-wrap">
                    {project.skills.slice(0, 2).map((skill) => (
                        <span
                            key={skill}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </a>
    );
}




export function HeroSection() {
    return (
        <section className="pt-16 min-h-screen flex flex-col">
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center py-20">
                {/* Left: Copy */}
                <div className="space-y-8">
                    {/* Eyebrow badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 text-xs font-semibold text-muted-foreground">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        342 open projects right now
                    </div>

                    {/* Headline */}
                    <div className="space-y-3">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[0.95]">
                            Where great
                            <br />
                            <span className="text-primary">work</span> gets
                            <br />
                            done.
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-md pt-2">
                            Connect with elite freelancers or land contracts
                            with clients who value craftsmanship. Milestone
                            contracts, structured bids, no noise.
                        </p>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        >
                            <Briefcase className="w-4 h-4" />
                            Post a Project
                        </a>
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-background text-foreground font-semibold text-sm hover:bg-muted transition-all duration-200 hover:-translate-y-0.5"
                        >
                            Browse Work
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </a>
                    </div>

                    {/* Social proof row */}
                    <div className="flex items-center gap-4 pt-2">
                        <div className="flex -space-x-2">
                            {["S", "O", "L", "M", "A"].map((initial, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary"
                                    style={{ zIndex: 5 - i }}
                                >
                                    {initial}
                                </div>
                            ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                14,000+
                            </span>{" "}
                            freelancers ·{" "}
                            <span className="font-semibold text-foreground">
                                98%
                            </span>{" "}
                            satisfaction
                        </div>
                    </div>
                </div>

                {/* Right: Project Feed */}
                <div className="relative">
                    {/* Decorative background */}
                    <div className="absolute inset-0 -z-10 `bg-linear-to-br from-primary/5 via-transparent to-transparent rounded-2xl" />

                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                        {/* Feed header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold text-foreground">
                                    Live Projects
                                </span>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Live
                            </Badge>
                        </div>

                        {/* Project list */}
                        <div className="divide-y divide-border">
                            {LIVE_PROJECTS.map((project, i) => (
                                <ProjectListItem key={i} project={project} />
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-border bg-muted/20">
                            <a
                                href="#"
                                className="text-xs font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                            >
                                View all 342 open projects
                                <ArrowRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category quick-filters */}
            <div className="border-t border-border bg-muted/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
                    <span className="text-xs font-semibold text-muted-foreground shrink-0 mr-2">
                        Browse by:
                    </span>
                    {CATEGORIES.map((cat) => (
                        <a
                            key={cat.label}
                            href="#"
                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-background hover:border-primary/50 hover:text-primary transition-all duration-200 text-muted-foreground"
                        >
                            {cat.label}
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                                {cat.count}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

