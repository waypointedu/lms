export type LessonType = "lesson" | "lab" | "quiz" | "live";

export interface Lesson {
  title: string;
  duration: string;
  type: LessonType;
}

export interface Course {
  slug: string;
  title: string;
  description: string;
  level: "Foundations" | "Intermediate" | "Advanced";
  duration: string;
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
    repository: "waypointedu/lms",
    tags: ["Next.js", "Supabase", "GitHub"],
    lessons: [
      { title: "Design tokens & Waypoint UI kit", duration: "40m", type: "lesson" },
      { title: "Authoring courses in Markdown/MDX", duration: "30m", type: "lesson" },
      { title: "Repository workflows & CI gates", duration: "35m", type: "lab" },
      { title: "Deployments with Vercel & previews", duration: "45m", type: "lesson" },
      { title: "Quiz: GitHub-centered workflows", duration: "15m", type: "quiz" },
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
    repository: "waypointedu/lms",
    tags: ["Live", "Cohorts", "Analytics"],
    lessons: [
      { title: "Session playbooks & facilitator toolkit", duration: "30m", type: "lesson" },
      { title: "Check-ins and attendance tracking", duration: "25m", type: "lab" },
      { title: "Media uploads to Supabase storage", duration: "20m", type: "lab" },
      { title: "Quiz: Learner analytics", duration: "15m", type: "quiz" },
      { title: "Live session practicum", duration: "50m", type: "live" },
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
    repository: "waypointedu/lms",
    tags: ["Stripe", "Automation", "QA"],
    lessons: [
      { title: "Entitlement gating with Stripe", duration: "35m", type: "lesson" },
      { title: "QA pipelines for MDX content", duration: "25m", type: "lab" },
      { title: "Quiz: security & governance", duration: "15m", type: "quiz" },
      { title: "Release automation with GitHub Actions", duration: "40m", type: "lesson" },
      { title: "Live capstone review", duration: "45m", type: "live" },
    ],
    outcomes: [
      "Automate enrollments with Stripe webhooks",
      "Ship content changes safely via pull requests",
      "Monitor platform health with built-in analytics",
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
    prompt: "What did you ship yesterday, and what’s the next GitHub issue you’re closing today?",
  },
  {
    title: "Confidence pulse",
    prompt: "Rate your confidence with Supabase auth + storage and share one blocker for today’s session.",
  },
  {
    title: "Reflection",
    prompt: "Link a PR you’re proud of this week and describe the feedback you incorporated.",
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
