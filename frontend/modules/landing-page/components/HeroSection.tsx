import {
    ArrowRight,
    Briefcase,
    ChevronRight,
    Clock,
    TrendingUp,
    Users,
    Sparkles,
} from "lucide-react";
import {
    Badge,
    StatusBadge,
    CategoryBadge,
} from "@/modules/shared/components/badge";
import { SmartAvatarGroup } from "@/modules/shared/components/avatar";
import type { ProjectCategory, ProjectStatus } from "@/modules/project/shared";

interface ProjectCard {
    category: ProjectCategory;
    title: string;
    budget: string;
    bids: number;
    deadline: string;
    skills: string[];
    status: ProjectStatus;
}

const LIVE_PROJECTS: ProjectCard[] = [
    {
        category: "WEB_DEV",
        title: "Spring Boot REST API with JWT Auth & PostgreSQL",
        budget: "$500 – $2,000",
        bids: 12,
        deadline: "Jun 30, 2026",
        skills: ["Java", "Spring Boot"],
        status: "OPEN",
    },
    {
        category: "MOBILE",
        title: "React Native Delivery App — Full Stack",
        budget: "$1,200 – $4,000",
        bids: 7,
        deadline: "Jul 15, 2026",
        skills: ["React Native", "Node.js"],
        status: "OPEN",
    },
    {
        category: "DESIGN",
        title: "Brand Identity & UI Kit for FinTech Startup",
        budget: "$800 – $2,500",
        bids: 5,
        deadline: "May 1, 2026",
        skills: ["Figma", "Brand Design"],
        status: "OPEN",
    },
    {
        category: "DATA_SCIENCE",
        title: "Build ML Model for Sales Forecasting",
        budget: "$1,000 – $3,000",
        bids: 9,
        deadline: "Aug 10, 2026",
        skills: ["Python", "Pandas"],
        status: "OPEN",
    },
    {
        category: "DEVOPS",
        title: "CI/CD Pipeline with Docker & GitHub Actions",
        budget: "$600 – $1,800",
        bids: 6,
        deadline: "Jun 20, 2026",
        skills: ["Docker", "GitHub Actions"],
        status: "OPEN",
    },
];

function ProjectListItem({
    project,
}: {
    project: ProjectCard;
    index: number;
}) {
    return (
        <a
            href="#"
            className="group flex items-start justify-between gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors duration-(--duration-base) cursor-pointer"
        >
            <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <CategoryBadge category={project.category} />
                    <StatusBadge status={project.status} />
                </div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-(--duration-base) line-clamp-1 leading-snug">
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
                <div className="text-sm font-bold text-foreground tabular-nums">
                    {project.budget}
                </div>
                <div className="flex gap-1 mt-1.5 justify-end">
                    {project.skills.slice(0, 2).map((skill) => (
                        <span
                            key={skill}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border"
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
        <section className="relative pt-16 min-h-screen flex flex-col overflow-hidden mesh-hero">
            {/* Decorative geometry */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <svg
                    className="absolute -top-32 -right-32 w-140 h-140 opacity-[0.035] text-primary hidden sm:block"
                    viewBox="0 0 560 560"
                    fill="none"
                >
                    <circle
                        cx="280"
                        cy="280"
                        r="260"
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                    <circle
                        cx="280"
                        cy="280"
                        r="200"
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                    <circle
                        cx="280"
                        cy="280"
                        r="140"
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                    <line
                        x1="280"
                        y1="20"
                        x2="280"
                        y2="540"
                        stroke="currentColor"
                        strokeWidth="0.5"
                    />
                    <line
                        x1="20"
                        y1="280"
                        x2="540"
                        y2="280"
                        stroke="currentColor"
                        strokeWidth="0.5"
                    />
                    <line
                        x1="96"
                        y1="96"
                        x2="464"
                        y2="464"
                        stroke="currentColor"
                        strokeWidth="0.5"
                    />
                    <line
                        x1="464"
                        y1="96"
                        x2="96"
                        y2="464"
                        stroke="currentColor"
                        strokeWidth="0.5"
                    />
                </svg>
                <svg
                    className="absolute -bottom-16 -left-16 w-72 h-72 opacity-[0.05] text-foreground"
                    viewBox="0 0 288 288"
                >
                    {Array.from({ length: 7 }).map((_, row) =>
                        Array.from({ length: 7 }).map((_, col) => (
                            <circle
                                key={`${row}-${col}`}
                                cx={col * 40 + 24}
                                cy={row * 40 + 24}
                                r="1.5"
                                fill="currentColor"
                            />
                        )),
                    )}
                </svg>
            </div>

            <div className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_500px] gap-10 xl:gap-20 items-center py-16 lg:py-24">
                {/* Left: Copy */}
                <div className="space-y-7 animate-slide-up">
                    <Badge
                        variant="success"
                        dot
                        pulse
                        className="bg-success/10 text-success border-success/20 font-semibold"
                    >
                        342 open projects right now
                    </Badge>

                    <div>
                        <h1 className="font-display font-extrabold tracking-tight text-foreground leading-[0.93] text-[clamp(2.75rem,6.5vw,5.25rem)]">
                            Where great
                            <br />
                            <span className="text-gradient-primary">
                                work
                            </span>{" "}
                            gets
                            <br />
                            done.
                        </h1>
                    </div>

                    <p className="text-lg text-muted-foreground leading-relaxed max-w-105">
                        Connect with elite freelancers or land contracts with
                        clients who value craftsmanship. Milestone contracts,
                        structured bids, no noise.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-(--duration-base) shadow-sm hover:shadow-(--shadow-glow) hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                            <Briefcase className="w-4 h-4" />
                            Post a Project
                        </a>
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-background/60 backdrop-blur-sm text-foreground font-semibold text-sm hover:bg-muted transition-all duration-(--duration-base) hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                            Browse Work
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </a>
                    </div>

                    <div className="flex items-center gap-4">
                        <SmartAvatarGroup
                            items={[
                                { name: "Sara" },
                                { name: "Omar" },
                                { name: "Layla" },
                                { name: "Mehdi" },
                                { name: "Amina" },
                            ]}
                            max={5}
                            size="sm"
                        />
                        <p className="text-sm text-muted-foreground">
                            <span className="font-bold text-foreground">
                                14,000+
                            </span>{" "}
                            freelancers ·{" "}
                            <span className="font-bold text-foreground">
                                98%
                            </span>{" "}
                            satisfaction
                        </p>
                    </div>
                </div>

                {/* Right: Project feed */}
                <div
                    className="relative lg:justify-self-end w-full animate-slide-up"
                    style={{ animationDelay: "160ms" }}
                >
                    {/* Soft glow behind card */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-4 -z-10 blur-3xl opacity-[0.15] bg-primary rounded-3xl"
                    />

                    <div className="glass-heavy rounded-2xl overflow-hidden shadow-xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/20">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className="text-sm font-bold text-foreground">
                                    Live Projects
                                </span>
                            </div>
                            <Badge
                                variant="success"
                                dot
                                pulse
                                size="sm"
                                uppercase
                            >
                                Live
                            </Badge>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-border/50">
                            {LIVE_PROJECTS.map((project, i) => (
                                <ProjectListItem
                                    key={i}
                                    project={project}
                                    index={i}
                                />
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3.5 border-t border-border/60 bg-muted/10">
                            <a
                                href="#"
                                className="text-sm font-semibold text-primary flex items-center gap-1.5 group hover:gap-2.5 transition-all duration-(--duration-base)"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                View all 342 open projects
                                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-(--duration-base) group-hover:translate-x-0.5" />
                            </a>
                        </div>
                    </div>

                    {/* Floating trust badge */}
                    <div className="absolute -bottom-4 -left-3 sm:-left-5 z-10 bg-card border border-border rounded-xl px-3 py-2.5 shadow-md flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                            <span className="text-success text-sm font-bold leading-none">
                                ✓
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground leading-tight">
                                Milestone protected
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                Funds held securely
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
