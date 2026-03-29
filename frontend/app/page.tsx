// src/app/page.tsx
// FreelanceHub — Landing Page
// Stack: Next.js 16+ · TypeScript · Tailwind v4 · shadcn CSS vars · lucide-react
// Add to layout.tsx: import { Libre_Baskerville, Epilogue } from "next/font/google"

import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  Scale,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StatItem {
  value: string;
  label: string;
  suffix?: string;
}

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: "primary" | "green" | "amber" | "rose";
}

interface ProjectCard {
  category: string;
  title: string;
  budget: string;
  bids: number;
  deadline: string;
  skills: string[];
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED";
}

interface StepItem {
  number: string;
  title: string;
  description: string;
}

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  rating: number;
  initial: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const STATS: StatItem[] = [
  { value: "14,243", label: "Verified Freelancers" },
  { value: "$2.4M", label: "Paid to Talent" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "48h", label: "Avg First Bid" },
];

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

const FEATURES: FeatureItem[] = [
  {
    icon: <GitBranch className="w-5 h-5" />,
    title: "Milestone Contracts",
    description:
      "Break any project into paid milestones. Submit deliverables, get client approval, release funds. No invoice chasing — ever.",
    accent: "primary",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Structured Bidding",
    description:
      "Every proposal includes price, estimated timeline, and a cover letter. Clients compare apples to apples — not chaos to chaos.",
    accent: "green",
  },
  {
    icon: <BadgeCheck className="w-5 h-5" />,
    title: "Verified Profiles",
    description:
      "Skill badges, ratings, and work history from real completed contracts. Trust is earned here, not assumed or bought.",
    accent: "amber",
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: "Dispute Resolution",
    description:
      "Fair mediation when contracts hit complications. Both parties get a voice. Outcomes are equitable and documented.",
    accent: "rose",
  },
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    title: "Contract Dashboard",
    description:
      "Track every active contract, milestone status, and payment history from a single, clean dashboard view.",
    accent: "primary",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Secure Payments",
    description:
      "Milestone funds are held safely until deliverables are approved. Neither party can be blindsided.",
    accent: "green",
  },
];

const HOW_IT_WORKS: StepItem[] = [
  {
    number: "01",
    title: "Post or Browse",
    description:
      "Clients post detailed project briefs with category, budget range, and required skills. Freelancers browse freely — no subscriptions or paywalls blocking discovery.",
  },
  {
    number: "02",
    title: "Bid & Select",
    description:
      "Freelancers submit structured proposals with their price, estimated timeline, and a real cover letter. Clients review, compare, and accept the best fit — creating a contract instantly.",
  },
  {
    number: "03",
    title: "Build & Get Paid",
    description:
      "Milestone-based contracts track every deliverable. Submit work, get it approved, funds release automatically. Both parties review each other when the contract closes.",
  },
];

const TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      "The milestone system changed how I work with remote clients. Deliverables unlock payments automatically — I haven't chased a single invoice since joining.",
    author: "Sara D.",
    role: "Full-Stack Developer",
    rating: 5,
    initial: "S",
  },
  {
    quote:
      "Posted my first project and had eight qualified proposals in 48 hours. The structured bid format made comparing candidates incredibly straightforward.",
    author: "Omar K.",
    role: "Startup Founder",
    rating: 5,
    initial: "O",
  },
  {
    quote:
      "I've used three other platforms. FreelanceHub is the only one that feels built for professionals — clean contracts, honest reviews, and no gig chaos.",
    author: "Layla M.",
    role: "Product Designer",
    rating: 5,
    initial: "L",
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

// ─── Accent color map ────────────────────────────────────────────────────────

const accentMap = {
  primary:
    "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/15",
  green:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/15",
  amber:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:bg-amber-500/15",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 group-hover:bg-rose-500/15",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${className}`}
    >
      {children}
    </span>
  );
}

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

function StatusBadge({ status }: { status: ProjectCard["status"] }) {
  const variants = {
    OPEN: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    IN_PROGRESS: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    COMPLETED: "bg-muted text-muted-foreground border-border",
  };
  const labels = { OPEN: "Open", IN_PROGRESS: "In Progress", COMPLETED: "Completed" };
  return (
    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${variants[status]}`}>
      {labels[status]}
    </span>
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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 pb-0.5"
    >
      {children}
    </a>
  );
}

// ─── Section: Navbar ─────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground tracking-tight">
            Freelance<span className="text-primary">Hub</span>
          </span>
        </a>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="#">Projects</NavLink>
          <NavLink href="#">Talent</NavLink>
          <NavLink href="#">Contracts</NavLink>
          <NavLink href="#">Pricing</NavLink>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors duration-200"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </nav>
    </header>
  );
}

// ─── Section: Hero ───────────────────────────────────────────────────────────

function HeroSection() {
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
              Connect with elite freelancers or land contracts with clients who value craftsmanship. Milestone contracts, structured bids, no noise.
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
              <span className="font-semibold text-foreground">14,000+</span> freelancers · <span className="font-semibold text-foreground">98%</span> satisfaction
            </div>
          </div>
        </div>

        {/* Right: Project Feed */}
        <div className="relative">
          {/* Decorative background */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-2xl" />

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            {/* Feed header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Live Projects</span>
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
              <a href="#" className="text-xs font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
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
          <span className="text-xs font-semibold text-muted-foreground flex-shrink-0 mr-2">Browse by:</span>
          {CATEGORIES.map((cat) => (
            <a
              key={cat.label}
              href="#"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-background hover:border-primary/50 hover:text-primary transition-all duration-200 text-muted-foreground"
            >
              {cat.label}
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{cat.count}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectListItem({ project }: { project: ProjectCard }) {
  const categoryColors: Record<string, string> = {
    WEB_DEV: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
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
          <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${categoryColors[project.category] || "text-muted-foreground bg-muted border-border"}`}>
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
      <div className="flex-shrink-0 text-right">
        <div className="text-sm font-bold text-foreground">{project.budget}</div>
        <div className="flex gap-1 mt-1.5 justify-end flex-wrap">
          {project.skills.slice(0, 2).map((skill) => (
            <span key={skill} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

// ─── Section: Stats ───────────────────────────────────────────────────────────

function StatsSection() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {STATS.map((stat, i) => (
            <div key={i} className="py-10 px-6 text-center group hover:bg-muted/40 transition-colors duration-200">
              <div className="text-4xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1.5 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Features ────────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <SectionLabel>Platform</SectionLabel>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Built for serious work.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every feature designed around one principle: protect your work, your time, and your money — on both sides of the contract.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  const accent = feature.accent ?? "primary";
  const iconClass = accentMap[accent];

  return (
    <div className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-6 right-6 h-px rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${accent === "primary" ? "bg-primary" : accent === "green" ? "bg-emerald-500" : accent === "amber" ? "bg-amber-500" : "bg-rose-500"}`} />

      {/* Number */}
      <div className="text-[10px] font-bold tracking-widest text-muted-foreground/50 mb-4">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Icon */}
      <div className={`inline-flex p-2.5 rounded-lg border mb-4 transition-all duration-300 ${iconClass}`}>
        {feature.icon}
      </div>

      <h3 className="text-base font-bold text-foreground mb-2">{feature.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
    </div>
  );
}

// ─── Section: How It Works ───────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <section className="py-24 bg-muted/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left text */}
          <div>
            <SectionLabel>Process</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Three steps.
              <br />
              <span className="text-primary">Zero friction.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-sm">
              From posting to payment — a clear, professional flow for both clients and freelancers. No hidden steps, no surprises.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all duration-200"
            >
              See how it works in detail
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Right steps */}
          <div className="space-y-0">
            {HOW_IT_WORKS.map((step, i) => (
              <StepItem key={i} step={step} index={i} isLast={i === HOW_IT_WORKS.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepItem({ step, index, isLast }: { step: StepItem; index: number; isLast: boolean }) {
  return (
    <div className="relative flex gap-6 group">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-[19px] top-12 bottom-0 w-px bg-border group-hover:bg-primary/30 transition-colors duration-300" />
      )}

      {/* Step circle */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-border bg-background flex items-center justify-center z-10 group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300">
        <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
          {step.number}
        </span>
      </div>

      {/* Content */}
      <div className={`pb-10 ${isLast ? "" : ""}`}>
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
          {step.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
}

// ─── Section: Roles CTA ───────────────────────────────────────────────────────

function RoleCardsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Client card */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 group hover:border-primary/40 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500" />
            <div className="relative">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary mb-6">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold tracking-widest uppercase text-primary mb-3">For Clients</div>
              <h3 className="text-3xl font-bold text-foreground mb-3 leading-tight">
                Hire world-class talent
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
                Post your project in 5 minutes. Receive structured proposals from vetted freelancers. Accept the best fit, create the contract, and build with confidence.
              </p>
              <ul className="space-y-2 mb-8">
                {["Post projects in any category", "Compare structured proposals", "Milestone-protected contracts", "Rate your freelancer"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/8 to-transparent rounded-full translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500" />
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
                Browse hundreds of open projects with clear budgets and real deadlines. Submit smart proposals, get accepted, and work under milestone-protected contracts.
              </p>
              <ul className="space-y-2 mb-8">
                {["Browse all projects for free", "Submit structured proposals", "Milestone payment protection", "Build your verified rating"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
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

// ─── Section: Testimonials ────────────────────────────────────────────────────

function TestimonialsSection() {
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
        "
      </div>

      <div>
        <StarRating rating={testimonial.rating} />
        <p className="text-foreground text-sm leading-relaxed mt-4 mb-6 relative">
          "{testimonial.quote}"
        </p>
      </div>

      <div className="flex items-center gap-3 pt-5 border-t border-border">
        <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
          {testimonial.initial}
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">{testimonial.author}</div>
          <div className="text-xs text-muted-foreground">{testimonial.role}</div>
        </div>
        <BadgeCheck className="w-4 h-4 text-primary ml-auto flex-shrink-0" />
      </div>
    </div>
  );
}

// ─── Section: CTA Banner ─────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-foreground text-background p-12 md:p-16">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/20" />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-background/50 mb-4">
                — Ready to start?
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-background mb-4 leading-tight">
                The future of freelancing
                <br />
                is structured.
              </h2>
              <p className="text-background/70 text-lg leading-relaxed">
                Join 14,000+ professionals who chose quality over chaos. Real contracts, real milestones, real results.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-background text-foreground font-semibold text-sm hover:bg-background/90 transition-all hover:-translate-y-0.5 duration-200 shadow-lg"
                >
                  <Briefcase className="w-4 h-4" />
                  Post a Project
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-background/30 text-background font-semibold text-sm hover:bg-background/10 transition-all hover:-translate-y-0.5 duration-200"
                >
                  Browse Work
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { icon: <Zap className="w-3.5 h-3.5" />, text: "Free to browse" },
                  { icon: <Shield className="w-3.5 h-3.5" />, text: "Milestone protection" },
                  { icon: <MessageSquare className="w-3.5 h-3.5" />, text: "Direct messaging" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-background/60 font-medium">
                    {item.icon}
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Footer ──────────────────────────────────────────────────────────

function Footer() {
  const footerLinks = {
    Platform: ["Browse Projects", "Post a Project", "Find Talent", "Pricing"],
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
                Freelance<span className="text-primary">Hub</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <RoleCardsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}