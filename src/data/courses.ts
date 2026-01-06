export type LessonType = "lesson" | "lab" | "quiz" | "live";

export interface Lesson {
  title: string;
  duration: string;
  type: LessonType;
  slug?: string;
}

export interface Course {
  slug: string;
  title: string;
  description: string;
  level: "Foundations" | "Intermediate" | "Advanced";
  duration: string;
  language?: string;
  repository: string;
  tags: string[];
  lessons: Lesson[];
  outcomes: string[];
}

export const courses: Course[] = [
  {
    slug: "waypoint-foundations",
    title: "Waypoint Foundations",
    description:
      "Build confidence with GitHub-centered authoring, Next.js foundations, and Supabase basics for auth, storage, and data access.",
    level: "Foundations",
    duration: "2 weeks",
    language: "en",
    repository: "waypointedu/lms",
    tags: ["Next.js", "Supabase", "GitHub"],
    lessons: [
      { title: "Design tokens & Waypoint UI kit", duration: "40m", type: "lesson", slug: "design-system" },
      { title: "Authoring courses in Markdown/MDX", duration: "30m", type: "lesson", slug: "content-repo" },
      { title: "Repository workflows & CI gates", duration: "35m", type: "lab", slug: "repo-workflows" },
      { title: "Deployments with Vercel & previews", duration: "45m", type: "lesson", slug: "deployments" },
      { title: "Quiz: GitHub-centered workflows", duration: "15m", type: "quiz", slug: "workflows-quiz" },
    ],
    outcomes: [
      "Set up Supabase auth, storage, and RLS policies",
      "Publish content directly from GitHub using Markdown and MDX",
      "Ship a responsive, Waypoint-branded LMS shell on Vercel",
    ],
  },
  {
    slug: "live-learning-tracks",
    title: "Live Learning Tracks",
    description:
      "Plan and run live cohorts with session templates, breakout rooms, and submission reviews tied to Supabase storage.",
    level: "Intermediate",
    duration: "3 weeks",
    language: "en",
    repository: "waypointedu/lms",
    tags: ["Live", "Cohorts", "Analytics"],
    lessons: [
      { title: "Session playbooks & facilitator toolkit", duration: "30m", type: "lesson", slug: "playbooks" },
      { title: "Check-ins and attendance tracking", duration: "25m", type: "lab", slug: "check-ins" },
      { title: "Media uploads to Supabase storage", duration: "20m", type: "lab", slug: "uploads" },
      { title: "Quiz: Learner analytics", duration: "15m", type: "quiz", slug: "analytics-quiz" },
      { title: "Live session practicum", duration: "50m", type: "live", slug: "live-practicum" },
    ],
    outcomes: [
      "Design weekly live sessions with reusable agendas",
      "Streamline learner check-ins and attendance",
      "Collect submissions and store assets securely",
    ],
  },
  {
    slug: "advanced-insights",
    title: "Advanced Insights & Automation",
    description:
      "Scale your academy with automation hooks, Stripe entitlements, and GitHub Actions for content QA and deployments.",
    level: "Advanced",
    duration: "4 weeks",
    language: "en",
    repository: "waypointedu/lms",
    tags: ["Stripe", "Automation", "QA"],
    lessons: [
      { title: "Entitlement gating with Stripe", duration: "35m", type: "lesson", slug: "stripe-entitlements" },
      { title: "QA pipelines for MDX content", duration: "25m", type: "lab", slug: "qa-pipelines" },
      { title: "Quiz: security & governance", duration: "15m", type: "quiz", slug: "security-quiz" },
      { title: "Release automation with GitHub Actions", duration: "40m", type: "lesson", slug: "release-automation" },
      { title: "Live capstone review", duration: "45m", type: "live", slug: "capstone-review" },
    ],
    outcomes: [
      "Automate enrollments with Stripe webhooks",
      "Ship content changes safely via pull requests",
      "Monitor platform health with built-in analytics",
    ],
  },
  {
    slug: "fundamentos-waypoint-es",
    title: "Fundamentos Waypoint (ES)",
    description: "Versión en español del curso base: tokens de diseño, contenido en GitHub y Supabase listo para cohorts.",
    level: "Foundations",
    duration: "2 semanas",
    language: "es",
    repository: "waypointedu/lms",
    tags: ["Next.js", "Supabase", "Contenido"],
    lessons: [
      { title: "Sistema de diseño Waypoint", duration: "35m", type: "lesson", slug: "diseno" },
      { title: "MDX y flujos de GitHub", duration: "30m", type: "lesson", slug: "mdx-github" },
      { title: "Auth y almacenamiento en Supabase", duration: "35m", type: "lesson", slug: "supabase" },
    ],
    outcomes: [
      "Aplicar tokens Waypoint en Tailwind",
      "Publicar contenido MDX desde GitHub",
      "Configurar Supabase para cohorts con RLS",
    ],
  },
];

export const liveSessions = [
  {
    title: "Weekly Instructor Standup",
    facilitator: "Jordan Kim",
    cadence: "Mondays @ 10:00 AM PT",
    focus: "Roadmap, blockers, and GitHub issue triage",
  },
  {
    title: "Learner Office Hours",
    facilitator: "Samira Patel",
    cadence: "Wednesdays @ 12:00 PM PT",
    focus: "Code reviews, Supabase troubleshooting, and quiz prep",
  },
  {
    title: "Launch Readiness Review",
    facilitator: "Waypoint Crew",
    cadence: "Fridays @ 9:00 AM PT",
    focus: "Release checklist, observability, and content QA",
  },
];

export const checkInPrompts = [
  {
    title: "Daily check-in",
    prompt: "What did you finish yesterday, and what will you tackle today?",
  },
  {
    title: "Confidence pulse",
    prompt: "How confident do you feel right now? Share one thing that needs support today.",
  },
  {
    title: "Reflection",
    prompt: "Share a win from this week and how it helped you learn.",
  },
];

export interface DashboardProgress {
  course: string;
  completed: number;
  total: number;
  status: "on-track" | "at-risk" | "off-track";
}

export const dashboardProgress: DashboardProgress[] = [
  { course: "Waypoint Foundations", completed: 6, total: 9, status: "on-track" },
  { course: "Live Learning Tracks", completed: 2, total: 8, status: "at-risk" },
  { course: "Advanced Insights & Automation", completed: 1, total: 7, status: "off-track" },
];
