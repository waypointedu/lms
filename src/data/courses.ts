export type LessonType = "lesson" | "reflection" | "lab" | "live";

export interface Lesson {
  title: string;
  duration: string;
  type: LessonType;
  slug?: string;
}

export interface CheckpointPlan {
  week: number;
  title: string;
  focus: string;
  requirements: string[];
}

export interface Course {
  slug: string;
  title: string;
  description: string;
  level: "Pathway";
  duration: string;
  language?: string;
  lessons: Lesson[];
  outcomes: string[];
  checkpoints: CheckpointPlan[];
}

export const courses: Course[] = [
  {
    slug: "year-one-biblical-formation",
    title: "Year One / Certificate in Biblical Formation",
    description:
      "A guided learning pathway through Scripture, doctrine, culture, and mission with checkpoints and a capstone conversation.",
    level: "Pathway",
    duration: "32 weeks",
    language: "en",
    lessons: [
      { title: "Living into the biblical story", duration: "25m", type: "lesson", slug: "scripture-story" },
      { title: "Reading the Gospels in community", duration: "22m", type: "lesson", slug: "gospels-community" },
      { title: "Core doctrines for Year One", duration: "28m", type: "lesson", slug: "doctrine-basics" },
      { title: "Prayer, Sabbath, and community rhythms", duration: "24m", type: "reflection", slug: "formation-rhythms" },
      { title: "Listening to culture with wisdom", duration: "26m", type: "lab", slug: "culture-listening" },
      { title: "Everyday mission experiments", duration: "30m", type: "lab", slug: "mission-practice" },
      { title: "Preparing for your capstone conversation", duration: "18m", type: "lesson", slug: "capstone-prep" },
      { title: "Sharing your story and testimony", duration: "18m", type: "lesson", slug: "capstone-testimony" },
    ],
    checkpoints: [
      {
        week: 1,
        title: "Story of Scripture",
        focus: "Genesis 1–3 reflection + community Gospel reading",
        requirements: ["Submit a short reflection", "Name one question for office hours"],
      },
      {
        week: 4,
        title: "Practicing Sabbath",
        focus: "Sabbath journal + prayer rhythm plan",
        requirements: ["Share your Sabbath experience", "Post your weekly prayer rhythm"],
      },
      {
        week: 8,
        title: "Culture listening lab",
        focus: "Neighbor interview and insights",
        requirements: ["Upload a 2-minute voice note", "Post two quotes you heard"],
      },
      {
        week: 12,
        title: "Capstone readiness",
        focus: "Schedule and prep for the capstone conversation",
        requirements: ["Request a capstone time", "Attach your testimony outline"],
      },
    ],
    outcomes: [
      "Read Scripture in community and connect it to daily life.",
      "Adopt weekly rhythms of prayer, Sabbath, and hospitality.",
      "Listen to culture with humility and design simple mission experiments.",
      "Share a capstone testimony that weaves Scripture, doctrine, and practice.",
    ],
  },
];

export const liveSessions = [
  {
    title: "Weekly cohort circle",
    facilitator: "Waypoint Faculty",
    cadence: "Weekly",
    focus: "Guided discussion on the current checkpoint",
  },
  {
    title: "Faculty office hours",
    facilitator: "Reviewer pool",
    cadence: "Twice weekly",
    focus: "Questions about readings, checkpoints, and capstone prep",
  },
];

export const checkInPrompts = [
  {
    title: "Weekly reflection",
    prompt: "What did you practice this week? Where did you sense God’s presence?",
  },
  {
    title: "Checkpoint prep",
    prompt: "What do you need to finish before the next checkpoint due date?",
  },
  {
    title: "Capstone pulse",
    prompt: "How ready do you feel for your capstone conversation? What support would help?",
  },
];

export interface DashboardProgress {
  course: string;
  completed: number;
  total: number;
  status: "on-track" | "behind" | "ready";
  nextCheckpoint?: string;
}

export const dashboardProgress: DashboardProgress[] = [
  { course: "Year One / Certificate in Biblical Formation", completed: 3, total: 8, status: "on-track", nextCheckpoint: "Week 4: Practicing Sabbath" },
];
