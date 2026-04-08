import {
    ArrowRight,
    Briefcase,
    ChevronRight,
    Clock,
    TrendingUp,
    Users,
} from "lucide-react";
import {
    Badge,
    StatusBadge,
    CategoryBadge,
} from "@/modules/shared/components/badge";
import { AvatarGroup } from "@/modules/shared/components/avatar";
import { ProjectCategory, ProjectStatus } from "@/modules/projects/types";

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
        category: "DATA_SCIENCE", 
        title: "Build ML Model for Sales Forecasting",
        budget: "$1,000 – $3,000",
        bids: 9,
        deadline: "Aug 10, 2026",
        skills: ["Python", "Pandas", "Scikit-learn"],
        status: "OPEN",
    },
    {
        category: "DEVOPS",
        title: "CI/CD Pipeline with Docker & GitHub Actions",
        budget: "$600 – $1,800",
        bids: 6,
        deadline: "Jun 20, 2026",
        skills: ["Docker", "GitHub Actions", "AWS"],
        status: "OPEN",
    },
];

function ProjectListItem({ project }: { project: ProjectCard }) {
    return (
        <a
            href="#"
            className="group flex items-start justify-between gap-4 px-5 py-4 hover:bg-muted/40 transition-colors duration-base cursor-pointer"
        >
            <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <CategoryBadge category={project.category} />
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
                        <Badge
                            key={skill}
                            variant="outline"
                            size="sm"
                            className="text-[10px] text-muted-foreground"
                        >
                            {skill}
                        </Badge>
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
                    <Badge
                        variant="success"
                        dot
                        pulse
                        className="bg-success/10 text-success border-success/20"
                    >
                        342 open projects right now
                    </Badge>

                    <div className="space-y-4">
                        {/* Enforced text-6xl for landing H1 as per typography scale */}
                        <h1 className="text-6xl font-extrabold tracking-tight text-foreground leading-none">
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

                    <div className="flex flex-wrap gap-4">
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-all duration-base shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        >
                            <Briefcase className="w-4 h-4" />
                            Post a Project
                        </a>
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-background text-foreground font-medium text-base hover:bg-muted transition-all duration-base hover:-translate-y-0.5"
                        >
                            Browse Work
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </a>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        {/* Refactored to use your Design System AvatarGroup */}
                        <AvatarGroup
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
                    <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-transparent rounded-2xl" />

                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold text-foreground">
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

                        <div className="divide-y divide-border">
                            {LIVE_PROJECTS.map((project, i) => (
                                <ProjectListItem key={i} project={project} />
                            ))}
                        </div>

                        <div className="px-5 py-3 border-t border-border bg-muted/20">
                            <a
                                href="#"
                                className="text-sm font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all duration-base"
                            >
                                View all 342 open projects
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
