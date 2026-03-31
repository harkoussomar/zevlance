import type {
  ProjectResponse,
  ProjectSummaryResponse,
  BidResponse,
  ContractResponse,
  MilestoneResponse,
  ReviewResponse,
  FreelancerProfile,
  ClientProfile,
} from "@/types";

// ─── Mock Users ───────────────────────────────────────────────────────────────

export const MOCK_FREELANCER: FreelancerProfile = {
  id: "09104f6e-41d3-4bbd-a07e-f4ad6f17ed94",
  name: "Sara Dev",
  email: "sara@dev.com",
  bio: "Full-stack developer with 6+ years building production-grade APIs and web apps. Specialist in Java/Spring Boot, React, and cloud infrastructure. I value clean code, clear communication, and shipping on time.",
  hourlyRate: 75,
  skills: ["Java", "Spring Boot", "React", "TypeScript", "PostgreSQL", "AWS", "Docker"],
  rating: 4.9,
  profilePicture: null,
  phone: "+212 600-000-000",
  reviewCount: 23,
  completedContracts: 28,
};

export const MOCK_CLIENT: ClientProfile = {
  id: "fd6fb26c-f4d0-4b93-a731-8ac9a348615f",
  name: "Omar K.",
  email: "omar@omartech.com",
  companyName: "OmarTech",
  companyDescription: "We build SaaS products for the MENA startup ecosystem.",
  website: "https://omartech.com",
  phone: "+212 600-111-111",
  rating: 4.7,
  reviewCount: 12,
  totalProjectsPosted: 15,
};

// ─── Mock Projects ────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: ProjectResponse[] = [
  {
    id: "3c55e080-1111-4bbd-a07e-111111111111",
    title: "Spring Boot REST API with JWT Auth & PostgreSQL",
    description:
      "We need a production-grade REST API built with Spring Boot 3.x. The API must include JWT-based authentication, role-based access control (USER, ADMIN), PostgreSQL integration via JPA/Hibernate, and proper exception handling with RFC-7807 error responses. Swagger/OpenAPI documentation is required. Docker-compose setup for local dev is a plus.",
    budgetMin: 500,
    budgetMax: 2000,
    status: "OPEN",
    category: "WEB_DEV",
    requiredSkills: ["Java", "Spring Boot", "PostgreSQL", "JWT", "Docker"],
    deadline: "2026-06-30",
    clientId: "fd6fb26c-f4d0-4b93-a731-8ac9a348615f",
    clientName: "Omar K.",
    clientCompany: "OmarTech",
    bidCount: 12,
    createdAt: "2026-03-20T10:41:37.275284",
  },
  {
    id: "3c55e080-2222-4bbd-a07e-222222222222",
    title: "React Native Delivery App — Full Stack",
    description:
      "Looking for a full-stack developer to build a food delivery mobile app using React Native (Expo). The backend should be Node.js/Express with real-time order tracking via WebSockets. Includes driver app, customer app, and restaurant dashboard.",
    budgetMin: 1200,
    budgetMax: 4000,
    status: "OPEN",
    category: "MOBILE",
    requiredSkills: ["React Native", "Node.js", "WebSocket", "Firebase", "Expo"],
    deadline: "2026-07-15",
    clientId: "fd6fb26c-f4d0-4b93-a731-8ac9a348615f",
    clientName: "Omar K.",
    clientCompany: "OmarTech",
    bidCount: 7,
    createdAt: "2026-03-22T08:00:00.000000",
  },
  {
    id: "3c55e080-3333-4bbd-a07e-333333333333",
    title: "Brand Identity & UI Kit for FinTech Startup",
    description:
      "We are a FinTech startup launching a B2B payments platform. We need a complete brand identity (logo, colors, typography, guidelines) and a design system in Figma including 40+ UI components, light/dark modes, and mobile-responsive variants.",
    budgetMin: 800,
    budgetMax: 2500,
    status: "OPEN",
    category: "DESIGN",
    requiredSkills: ["Figma", "Brand Design", "UI/UX", "Design System"],
    deadline: "2026-05-01",
    clientId: "aaa00000-f4d0-4b93-a731-000000000aaa",
    clientName: "Layla M.",
    clientCompany: "PayFlow",
    bidCount: 5,
    createdAt: "2026-03-18T14:00:00.000000",
  },
  {
    id: "3c55e080-4444-4bbd-a07e-444444444444",
    title: "ML Pipeline for E-commerce Recommendation Engine",
    description:
      "We need a machine learning engineer to design and implement a product recommendation system. The system should use collaborative filtering + content-based approaches. Must deploy to AWS SageMaker. Expected to handle 100K+ daily users.",
    budgetMin: 2000,
    budgetMax: 5000,
    status: "OPEN",
    category: "DATA_SCIENCE",
    requiredSkills: ["Python", "PyTorch", "AWS", "Scikit-learn", "Kafka"],
    deadline: "2026-08-01",
    clientId: "bbb00000-f4d0-4b93-a731-000000000bbb",
    clientName: "Ahmed S.",
    clientCompany: "ShopSmart",
    bidCount: 3,
    createdAt: "2026-03-25T09:00:00.000000",
  },
  {
    id: "3c55e080-5555-4bbd-a07e-555555555555",
    title: "Kubernetes Migration & CI/CD Pipeline Setup",
    description:
      "Migrate our existing Docker Compose-based deployment to a Kubernetes cluster on GKE. Set up ArgoCD for GitOps, configure horizontal pod autoscaling, set up monitoring with Prometheus/Grafana, and document everything thoroughly.",
    budgetMin: 1000,
    budgetMax: 3000,
    status: "OPEN",
    category: "DEVOPS",
    requiredSkills: ["Kubernetes", "GKE", "ArgoCD", "Helm", "Prometheus"],
    deadline: "2026-04-30",
    clientId: "ccc00000-f4d0-4b93-a731-000000000ccc",
    clientName: "Youssef G.",
    clientCompany: "ScaleUp",
    bidCount: 9,
    createdAt: "2026-03-24T11:00:00.000000",
  },
  {
    id: "3c55e080-6666-4bbd-a07e-666666666666",
    title: "Technical Blog Content — 10 Articles on Clean Architecture",
    description:
      "We need a senior developer who can write 10 in-depth technical articles (2,000–3,000 words each) on Clean Architecture, DDD, and SOLID principles. Each article must include code examples in Java and TypeScript. SEO-optimized with meta descriptions.",
    budgetMin: 300,
    budgetMax: 800,
    status: "OPEN",
    category: "WRITING",
    requiredSkills: ["Technical Writing", "Java", "TypeScript", "Clean Architecture"],
    deadline: "2026-05-15",
    clientId: "ddd00000-f4d0-4b93-a731-000000000ddd",
    clientName: "Sara B.",
    clientCompany: "DevHub",
    bidCount: 4,
    createdAt: "2026-03-26T15:00:00.000000",
  },
  {
    id: "3c55e080-7777-4bbd-a07e-777777777777",
    title: "Next.js 15 E-commerce Platform with Stripe Integration",
    description:
      "Full e-commerce platform using Next.js 15 App Router, Stripe Checkout, Prisma + PostgreSQL, Zustand for cart state, and Cloudinary for image uploads. Must include admin dashboard, inventory management, and order tracking.",
    budgetMin: 1500,
    budgetMax: 4500,
    status: "IN_PROGRESS",
    category: "WEB_DEV",
    requiredSkills: ["Next.js", "Stripe", "Prisma", "TypeScript", "Tailwind"],
    deadline: "2026-06-01",
    clientId: "eee00000-f4d0-4b93-a731-000000000eee",
    clientName: "Fatima Z.",
    clientCompany: "ModaMart",
    bidCount: 11,
    createdAt: "2026-02-10T09:00:00.000000",
  },
  {
    id: "3c55e080-8888-4bbd-a07e-888888888888",
    title: "Android App — Gym Management System",
    description:
      "Native Android app (Kotlin, Jetpack Compose) for gym management. Features: membership plans, attendance QR scanning, trainer scheduling, payment tracking, and analytics dashboard. Backend already exists (Spring Boot REST API).",
    budgetMin: 800,
    budgetMax: 2200,
    status: "COMPLETED",
    category: "MOBILE",
    requiredSkills: ["Kotlin", "Jetpack Compose", "Android", "REST API"],
    deadline: "2026-01-31",
    clientId: "fff00000-f4d0-4b93-a731-000000000fff",
    clientName: "Karim B.",
    clientCompany: "FitLife",
    bidCount: 6,
    createdAt: "2025-11-15T09:00:00.000000",
  },
];

// ─── Mock Bids ────────────────────────────────────────────────────────────────

export const MOCK_MY_BIDS: BidResponse[] = [
  {
    id: "bid-0001-1111-1111-1111-111111111111",
    projectId: "3c55e080-1111-4bbd-a07e-111111111111",
    projectTitle: "Spring Boot REST API with JWT Auth & PostgreSQL",
    freelancerId: "09104f6e-41d3-4bbd-a07e-f4ad6f17ed94",
    freelancerName: "Sara Dev",
    proposedPrice: 1400,
    coverLetter:
      "I have built 12+ Spring Boot APIs in production, including a banking API serving 50K+ daily requests. I'll deliver clean, well-tested code with 90%+ coverage, full Swagger docs, and a docker-compose for local dev. Happy to jump on a call to discuss the requirements in detail.",
    estimatedDays: 14,
    status: "PENDING",
    submittedAt: "2026-03-21T10:00:00.000000",
  },
  {
    id: "bid-0002-2222-2222-2222-222222222222",
    projectId: "3c55e080-7777-4bbd-a07e-777777777777",
    projectTitle: "Next.js 15 E-commerce Platform with Stripe Integration",
    freelancerId: "09104f6e-41d3-4bbd-a07e-f4ad6f17ed94",
    freelancerName: "Sara Dev",
    proposedPrice: 3200,
    coverLetter:
      "Next.js is my primary stack. I've built 3 e-commerce platforms with Stripe integration in the past 18 months. My approach: clean component architecture, server actions for mutations, edge-ready for Vercel. Deliverables include the full codebase, deployment setup, and a handoff doc.",
    estimatedDays: 28,
    status: "ACCEPTED",
    submittedAt: "2026-02-12T14:30:00.000000",
  },
  {
    id: "bid-0003-3333-3333-3333-333333333333",
    projectId: "3c55e080-4444-4bbd-a07e-444444444444",
    projectTitle: "ML Pipeline for E-commerce Recommendation Engine",
    freelancerId: "09104f6e-41d3-4bbd-a07e-f4ad6f17ed94",
    freelancerName: "Sara Dev",
    proposedPrice: 4000,
    coverLetter:
      "Solid experience with PyTorch recommendation systems and AWS SageMaker deployments. Previous system achieved 23% CTR improvement at a retail client.",
    estimatedDays: 45,
    status: "REJECTED",
    submittedAt: "2026-03-26T09:00:00.000000",
  },
  {
    id: "bid-0004-4444-4444-4444-444444444444",
    projectId: "3c55e080-5555-4bbd-a07e-555555555555",
    projectTitle: "Kubernetes Migration & CI/CD Pipeline Setup",
    freelancerId: "09104f6e-41d3-4bbd-a07e-f4ad6f17ed94",
    freelancerName: "Sara Dev",
    proposedPrice: 2500,
    coverLetter:
      "I've migrated 4 production services to Kubernetes on GKE. ArgoCD + Helm is my preferred setup. Will include full monitoring stack and runbook.",
    estimatedDays: 18,
    status: "WITHDRAWN",
    submittedAt: "2026-03-10T08:00:00.000000",
  },
];

// ─── Mock Project Bids (for client view) ─────────────────────────────────────

export const MOCK_PROJECT_BIDS: BidResponse[] = [
  {
    id: "bid-0010-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    projectId: "3c55e080-1111-4bbd-a07e-111111111111",
    projectTitle: "Spring Boot REST API with JWT Auth & PostgreSQL",
    freelancerId: "09104f6e-41d3-4bbd-a07e-f4ad6f17ed94",
    freelancerName: "Sara Dev",
    proposedPrice: 1400,
    coverLetter:
      "I have built 12+ Spring Boot APIs in production, including a banking API serving 50K+ daily requests. I'll deliver clean, well-tested code with 90%+ coverage, full Swagger docs, and docker-compose for local dev.",
    estimatedDays: 14,
    status: "PENDING",
    submittedAt: "2026-03-21T10:00:00.000000",
  },
  {
    id: "bid-0011-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    projectId: "3c55e080-1111-4bbd-a07e-111111111111",
    projectTitle: "Spring Boot REST API with JWT Auth & PostgreSQL",
    freelancerId: "aaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    freelancerName: "Karim B.",
    proposedPrice: 900,
    coverLetter:
      "5 years of Java development, with 2 specifically in Spring Boot ecosystem. Have delivered similar API projects for fintech and healthcare clients. References available.",
    estimatedDays: 21,
    status: "PENDING",
    submittedAt: "2026-03-22T09:15:00.000000",
  },
  {
    id: "bid-0012-cccc-cccc-cccc-cccccccccccc",
    projectId: "3c55e080-1111-4bbd-a07e-111111111111",
    projectTitle: "Spring Boot REST API with JWT Auth & PostgreSQL",
    freelancerId: "bbbb-cccc-dddd-eeee-ffffffffffff",
    freelancerName: "Ahmed N.",
    proposedPrice: 1800,
    coverLetter:
      "Senior backend engineer, 8 years experience. I specialize in high-performance Spring Boot APIs. Will include load testing reports and performance tuning documentation alongside the deliverable.",
    estimatedDays: 10,
    status: "PENDING",
    submittedAt: "2026-03-23T11:30:00.000000",
  },
];

// ─── Mock Contracts ───────────────────────────────────────────────────────────

export const MOCK_CONTRACTS: ContractResponse[] = [
  {
    id: "contract-1111-aaaa-bbbb-cccc-111111111111",
    bidId: "bid-0002-2222-2222-2222-222222222222",
    projectId: "3c55e080-7777-4bbd-a07e-777777777777",
    projectTitle: "Next.js 15 E-commerce Platform with Stripe Integration",
    freelancerId: "09104f6e-41d3-4bbd-a07e-f4ad6f17ed94",
    freelancerName: "Sara Dev",
    clientId: "eee00000-f4d0-4b93-a731-000000000eee",
    clientName: "Fatima Z.",
    status: "ACTIVE",
    agreedPrice: 3200,
    startDate: "2026-02-15",
    endDate: null,
    createdAt: "2026-02-15T10:00:00.000000",
  },
  {
    id: "contract-2222-aaaa-bbbb-cccc-222222222222",
    bidId: "bid-old-1",
    projectId: "3c55e080-8888-4bbd-a07e-888888888888",
    projectTitle: "Android App — Gym Management System",
    freelancerId: "09104f6e-41d3-4bbd-a07e-f4ad6f17ed94",
    freelancerName: "Sara Dev",
    clientId: "fff00000-f4d0-4b93-a731-000000000fff",
    clientName: "Karim B.",
    status: "COMPLETED",
    agreedPrice: 1800,
    startDate: "2025-12-01",
    endDate: "2026-01-31",
    createdAt: "2025-12-01T09:00:00.000000",
  },
  {
    id: "contract-3333-aaaa-bbbb-cccc-333333333333",
    bidId: "bid-old-2",
    projectId: "proj-old-1",
    projectTitle: "SaaS Admin Dashboard — React + tRPC",
    freelancerId: "09104f6e-41d3-4bbd-a07e-f4ad6f17ed94",
    freelancerName: "Sara Dev",
    clientId: "ggg00000-f4d0-4b93-a731-000000000ggg",
    clientName: "Nadia R.",
    status: "COMPLETED",
    agreedPrice: 2400,
    startDate: "2025-09-01",
    endDate: "2025-11-15",
    createdAt: "2025-09-01T09:00:00.000000",
  },
];

// ─── Mock Milestones ──────────────────────────────────────────────────────────

export const MOCK_MILESTONES: MilestoneResponse[] = [
  {
    id: "ms-0001",
    contractId: "contract-1111-aaaa-bbbb-cccc-111111111111",
    title: "Project Setup & Architecture",
    description:
      "Next.js 15 project setup with App Router, TypeScript strict mode, Tailwind, Prisma schema, auth with NextAuth, and CI/CD pipeline. Deliverable: GitHub repo with documented architecture decisions.",
    amount: 600,
    status: "APPROVED",
    dueDate: "2026-02-28",
    deliverableUrl: "https://github.com/sara/modamart-ecom/tree/milestone-1",
  },
  {
    id: "ms-0002",
    contractId: "contract-1111-aaaa-bbbb-cccc-111111111111",
    title: "Product Catalog & Search",
    description:
      "Full product listing, category browsing, search with Algolia, product detail pages with image gallery, variant selection, and inventory tracking.",
    amount: 800,
    status: "APPROVED",
    dueDate: "2026-03-15",
    deliverableUrl: "https://github.com/sara/modamart-ecom/tree/milestone-2",
  },
  {
    id: "ms-0003",
    contractId: "contract-1111-aaaa-bbbb-cccc-111111111111",
    title: "Cart, Checkout & Stripe Integration",
    description:
      "Zustand-based cart, Stripe Checkout session creation, webhook handling for payment events, order confirmation emails via Resend.",
    amount: 900,
    status: "SUBMITTED",
    dueDate: "2026-04-01",
    deliverableUrl: "https://github.com/sara/modamart-ecom/tree/milestone-3",
  },
  {
    id: "ms-0004",
    contractId: "contract-1111-aaaa-bbbb-cccc-111111111111",
    title: "Admin Dashboard & Deployment",
    description:
      "Admin panel for inventory, orders, and analytics. Vercel deployment with preview environments. Full documentation and handoff.",
    amount: 900,
    status: "PENDING",
    dueDate: "2026-05-01",
    deliverableUrl: null,
  },
];

// ─── Mock Reviews ─────────────────────────────────────────────────────────────

export const MOCK_REVIEWS: ReviewResponse[] = [
  {
    id: "review-0001",
    contractId: "contract-2222-aaaa-bbbb-cccc-222222222222",
    reviewerId: "fff00000-f4d0-4b93-a731-000000000fff",
    reviewerName: "Karim B.",
    revieweeId: "09104f6e-41d3-4bbd-a07e-f4ad6f17ed94",
    revieweeName: "Sara Dev",
    rating: 5,
    comment:
      "Sara delivered an exceptional Android app. Communication was excellent throughout, she proactively flagged issues and always proposed solutions. The code quality is outstanding — well-structured, documented, and thoroughly tested.",
    createdAt: "2026-02-03T10:00:00.000000",
  },
  {
    id: "review-0002",
    contractId: "contract-3333-aaaa-bbbb-cccc-333333333333",
    reviewerId: "ggg00000-f4d0-4b93-a731-000000000ggg",
    reviewerName: "Nadia R.",
    revieweeId: "09104f6e-41d3-4bbd-a07e-f4ad6f17ed94",
    revieweeName: "Sara Dev",
    rating: 5,
    comment:
      "Best freelancer I've worked with. The dashboard UI is clean, fast, and exactly what we specified. Sara also went above and beyond by documenting the tRPC API contracts.",
    createdAt: "2025-11-20T14:00:00.000000",
  },
];

// ─── My Posted Projects (client view) ────────────────────────────────────────

export const MOCK_MY_PROJECTS: ProjectSummaryResponse[] = [
  {
    id: "3c55e080-1111-4bbd-a07e-111111111111",
    title: "Spring Boot REST API with JWT Auth & PostgreSQL",
    budgetMin: 500,
    budgetMax: 2000,
    status: "OPEN",
    category: "WEB_DEV",
    requiredSkills: ["Java", "Spring Boot", "PostgreSQL"],
    deadline: "2026-06-30",
    clientId: "fd6fb26c-f4d0-4b93-a731-8ac9a348615f",
    clientName: "Omar K.",
    bidCount: 12,
    createdAt: "2026-03-20T10:41:37.275284",
  },
  {
    id: "3c55e080-2222-4bbd-a07e-222222222222",
    title: "React Native Delivery App — Full Stack",
    budgetMin: 1200,
    budgetMax: 4000,
    status: "OPEN",
    category: "MOBILE",
    requiredSkills: ["React Native", "Node.js", "Firebase"],
    deadline: "2026-07-15",
    clientId: "fd6fb26c-f4d0-4b93-a731-8ac9a348615f",
    clientName: "Omar K.",
    bidCount: 7,
    createdAt: "2026-03-22T08:00:00.000000",
  },
  {
    id: "3c55e080-7777-4bbd-a07e-777777777777",
    title: "Next.js 15 E-commerce Platform with Stripe Integration",
    budgetMin: 1500,
    budgetMax: 4500,
    status: "IN_PROGRESS",
    category: "WEB_DEV",
    requiredSkills: ["Next.js", "Stripe", "Prisma"],
    deadline: "2026-06-01",
    clientId: "fd6fb26c-f4d0-4b93-a731-8ac9a348615f",
    clientName: "Omar K.",
    bidCount: 11,
    createdAt: "2026-02-10T09:00:00.000000",
  },
  {
    id: "3c55e080-8888-4bbd-a07e-888888888888",
    title: "Android App — Gym Management System",
    budgetMin: 800,
    budgetMax: 2200,
    status: "COMPLETED",
    category: "MOBILE",
    requiredSkills: ["Kotlin", "Jetpack Compose"],
    deadline: "2026-01-31",
    clientId: "fd6fb26c-f4d0-4b93-a731-8ac9a348615f",
    clientName: "Omar K.",
    bidCount: 6,
    createdAt: "2025-11-15T09:00:00.000000",
  },
];