// All project content lives here. Edit this file to update the site.
// Verified against each project's README and source code (Nov 2026). Keep it honest:
// only features that exist in the code; planned items are not listed.

export const projects = [
  {
    slug: "fitmate",
    image: "/photos/fitmate.jpg",
    device: "desktop",
    name: "FitMate",
    featured: true,
    problem: "I kept dropping my workout and diet plans after a week.",
    tagline: "You made the plan. FitMate makes it easy to follow.",
    summary:
      "Workouts, meals, form videos, music and reminders in one daily checklist, with streaks that make showing up feel like a win. Works without internet and syncs when you're back online.",
    highlights: [
      "Streaks with freezes (earn one every 7 days), plus progressive overload in 4-week training blocks",
      "Diet that adapts: weekly menu rotation, macro gap tips, calories adjusted from your weight trend",
      "Works without internet (IndexedDB) and syncs to Supabase, with Web Push reminders",
    ],
    features: [
      "Daily checklist for workouts and meals",
      "Streaks with freezes: earn one every 7 days, hold up to 2",
      "Progressive overload: +reps, then weight or a set, in 4-week blocks with a lighter week and a block review",
      "Adaptive diet: weekly menu rotation, macro gap tips, ±150 kcal changes from your weight trend",
      "Web Push reminders, scheduled every 15 minutes with pg_cron",
      "AI plan builder: writes a prompt for your own ChatGPT, Claude or Gemini, then imports the plan (also from JSON or PDF)",
      "YouTube videos for exercise form and recipes, plus a built-in music player",
      "Grocery lists you can share to WhatsApp",
      "Works without internet (Dexie / IndexedDB) and syncs to Supabase",
    ],
    stack: ["Next.js 15", "React 19", "Tailwind 4", "Supabase (Postgres, RLS, pg_cron, Vault)", "Dexie", "Web Push", "YouTube Data API"],
    live: "https://fitmateapp.vercel.app",
    repos: [{ label: "Code", url: "https://github.com/sanskardev9/Fitmate" }],
    accent: "#22c55e",
  },
  {
    slug: "jobchain",
    image: "/photos/jobchain.jpg",
    device: "desktop",
    name: "JobChain",
    featured: true,
    problem: "Applying to jobs one by one was eating my evenings.",
    tagline: "Find jobs, track every application, and apply faster.",
    summary:
      "Search remote jobs and live listings across Europe, track every application, and let JobPilot score jobs and draft tailored emails that you approve before they're sent from your own Gmail.",
    highlights: [
      "Remote jobs (Remotive) plus a live Europe-wide search (EURES, Arbeitnow), several job titles at once",
      "JobPilot: a Python worker with transparent rules (no AI) that scores jobs Strong / Possible / Unlikely and shows why",
      "Drafts tailored emails with your CV attached; you approve each one and it's sent from your own Gmail (send-only access)",
    ],
    features: [
      "Remote jobs from Remotive and a live Europe-wide search via EURES and Arbeitnow",
      "Search several job titles at once with merged results, plus bookmarks",
      "Application tracker: applied → interview → offer / rejected",
      "JobPilot scores jobs with transparent rules (Strong / Possible / Unlikely) and shows the reasons",
      "Drafts tailored emails with your CV attached; you approve every draft, with a cap per run",
      "Sends from your own Gmail with send-only access; tokens stored encrypted",
      "Shared job pool refreshed every 6 hours by a Python worker on Render",
      "CVs in private storage, data protected with row-level security; installable on phones",
    ],
    stack: ["Next.js 15", "React 19", "Tailwind 4", "Supabase (RLS, private storage)", "Python", "Selenium", "Docker on Render", "Gmail API"],
    live: "https://job-chain.vercel.app",
    repos: [{ label: "Code", url: "https://github.com/sanskardev9/Job-Chain" }],
    accent: "#3b82f6",
  },
  {
    slug: "ridemate",
    image: "/photos/ridemate-map.jpg",
    device: "phone",
    name: "RideMate",
    featured: true,
    problem: "On group motorcycle rides, we kept losing each other.",
    tagline: "Ride together. Stay together. Stay safe.",
    summary:
      "Every rider live on one map, with group chat, voice calls and one-tap SOS. Built for the road: the screen stays awake and location keeps flowing when you switch apps.",
    highlights: [
      "Every rider live on one map, updated in real time over WebSockets",
      "Group chat and WebRTC voice calls while riding",
      "One-tap SOS that shares your live location with the group",
    ],
    features: [
      "Live group map (Leaflet with CARTO tiles)",
      "Groups you join with an invite code",
      "Group chat over WebSockets, with an HTTP fallback when the socket drops",
      "WebRTC voice calls with ringtone and an in-ride call bar",
      "One-tap SOS with live location and an alarm, cancelled just as fast",
      "Ride sessions: duration and distance worked out from recorded GPS tracks",
      "Screen stays on mid-ride, and location keeps sending on Android when you switch apps",
    ],
    stack: ["React 19", "TypeScript", "Vite", "Tailwind 4", "Leaflet", "Node.js", "Express", "ws", "PostgreSQL", "JWT"],
    live: "https://ride-mate-frontend-r1lp.vercel.app",
    repos: [
      { label: "Frontend", url: "https://github.com/sanskardev9/RideMate-Frontend" },
      { label: "Backend", url: "https://github.com/sanskardev9/RideMate-Backend" },
    ],
    accent: "#f97316",
  },
  // RouteMate hidden for now (from CV, no public repo/demo yet). Uncomment to show it again.
  // {
  //   slug: "routemate",
  //   name: "RouteMate",
  //   featured: false,
  //   problem: null,
  //   tagline: "Route planning and map-based vehicle simulation.",
  //   summary:
  //     "Create optimized routes on a self-hosted Valhalla routing engine with toll and highway avoidance, draw no-entry zones, and watch vehicles move along the route on an interactive map.",
  //   highlights: [
  //     "Optimized routes from a Valhalla routing engine, with toll and highway avoidance",
  //     "Interactive MapLibre map with route rendering and vehicle movement simulation",
  //     "User-defined no-entry zones handled with Supabase and Shapely",
  //   ],
  //   features: [
  //     "Route creation flow that generates optimized routes with Valhalla",
  //     "Request–response pipeline for constraint-based routing (toll / highway avoidance)",
  //     "Interactive MapLibre map with route rendering",
  //     "Vehicle movement simulation along the route",
  //     "User-defined geospatial constraints (no-entry zones) with Supabase and Shapely",
  //   ],
  //   stack: ["Valhalla", "MapLibre", "Supabase", "Shapely", "Python"],
  //   live: null,
  //   repos: [],
  //   accent: "#a855f7",
  // },
  {
    slug: "realtimerivals",
    image: "/photos/realtimerivals.jpg",
    device: "phone",
    name: "RealTimeRivals",
    featured: false,
    problem: null,
    tagline: "A fast 1v1 fighting game in the browser.",
    summary:
      "Host a private room, share a 6-character code and fight a friend directly between browsers, or take on the computer. The host's browser decides hits, with voice chat while you play.",
    highlights: [
      "Two players kept in sync browser to browser over WebRTC, with the host deciding hits and results",
      "Canvas-drawn arena with hit detection and a charge-beam attack",
      "Voice chat, a computer opponent (3 levels), tutorial and rematches",
    ],
    features: [
      "Private rooms joined with a 6-character code",
      "Browser-to-browser match over WebRTC data channels",
      "Host decides hits and results",
      "Voice chat with mute",
      "Computer opponent with easy, medium and hard levels",
      "Tutorial and rematch accept / reject",
      "Canvas arena, health bars and a charge meter that builds to a beam attack",
    ],
    stack: ["React 19", "Vite", "Tailwind 4", "HTML5 Canvas", "WebRTC", "Python (FastAPI WebSockets)"],
    live: "https://real-time-rivals.vercel.app",
    demo: "https://youtu.be/ph4oxrqVMrw",
    repos: [{ label: "Code", url: "https://github.com/sanskardev9/RealTime-Rivals" }],
    accent: "#ef4444",
  },
  {
    slug: "moneymate",
    image: "/photos/moneymate.jpg",
    device: "phone",
    name: "MoneyMate",
    featured: false,
    status: "In development",
    problem: "I kept losing track of where my money went.",
    tagline: "A personal finance habit builder (in development).",
    summary:
      "A mobile app for building a money habit: set your income and budget categories, log expenses, and see where it all went in a spending chart, with repayment reminders.",
    highlights: [
      "Monthly income and budget categories",
      "Expense logging with history per category",
      "Reports with a spending chart, plus repayment reminders",
    ],
    features: [
      "Sign in with Supabase auth",
      "Monthly income and budget categories",
      "Expense logging and history, including per category",
      "Reports screen with a spending donut chart",
      "Repayment reminders",
      "Theme and profile settings",
    ],
    stack: ["React Native", "Expo", "Supabase"],
    live: "https://money-mate-xi-ten.vercel.app",
    repos: [{ label: "Code", url: "https://github.com/sanskardev9/MoneyMate" }],
    accent: "#eab308",
  },
];

// Problem -> app pairs for "the story" section, in the order he tells it.
export const story = ["moneymate", "ridemate", "jobchain", "fitmate"];

export const getProject = (slug) => projects.find((p) => p.slug === slug);
