export const site = {
  name: "Sanskar Singh",
  role: "Full-Stack Developer",
  tagline: "I build the apps I wish existed, end to end.",
  description:
    "Sanskar Singh is a full-stack developer (React, Next.js, Node.js, Python) who builds apps that solve his own everyday problems, end to end.",
  url: "https://sanskars-portfolio.vercel.app", // update after the first deploy
  email: "sanskar.dev09@gmail.com",
  github: "https://github.com/sanskardev9",
  linkedin: "https://www.linkedin.com/in/sanskar-singh-b17819241",
  cv: "/Sanskar-Singh-CV.pdf",
};

// From Sanskar's CV (Oct 2026)
export const experience = [
  {
    role: "Front End Developer",
    company: "Redcliffe Labs",
    place: "Noida",
    period: "Dec 2025 – Present",
    points: [
      "Enhancing and scaling the consumer web app for booking diagnostic tests and packages (Next.js, MUI, Styled Components)",
      "Shipping new features and improving flows across landing pages and booking journeys",
      "Working on internal CRM systems for support, sales, LIMS and HRMS (React, MUI, Tailwind CSS)",
    ],
  },
  {
    role: "Front End Developer",
    company: "Avaronn",
    place: "Noida",
    period: "May 2025 – Dec 2025",
    points: [
      "Built a real-time fleet tracking dashboard with driver scores, trip summaries and downloadable reports",
      "Created a WarRoom panel to live-track the fleet with Socket.IO, Google Maps API and real-time vehicle data",
      "Designed a Schedule Creator app for booking delivery slots with geolocation and route-based logic",
    ],
  },
  {
    role: "Front End Development Intern",
    company: "EPVI",
    place: "Gurugram",
    period: "Sep 2024 – Nov 2024",
    points: [
      "Built and optimized user interfaces with React and Next.js as part of a team",
      "Made layouts responsive across devices and wired up APIs to live frontend components",
    ],
  },
];

export const extras = {
  hackathon: "Built a tuition fees payment app with Solidity and EAS at the EDU Chain Regional Hackathon (MSIT, Delhi).",
  education: "BCA in Data Science, J.C. Bose University of Science and Technology, Faridabad · CGPA 8.15 · 2024",
};

// `icon` is a simple-icons export name; null shows a generic mark.
export const skills = [
  {
    group: "Frontend",
    items: [
      { name: "React", icon: "siReact" },
      { name: "Next.js", icon: "siNextdotjs" },
      { name: "React Native", icon: "siReact" },
      { name: "TypeScript", icon: "siTypescript" },
      { name: "JavaScript", icon: "siJavascript" },
      { name: "Tailwind CSS", icon: "siTailwindcss" },
      { name: "shadcn/ui", icon: "siShadcnui" },
      { name: "PWA", icon: "siPwa" },
    ],
  },
  {
    group: "Real-time",
    items: [
      { name: "WebRTC", icon: "siWebrtc" },
      { name: "WebSockets", icon: null },
      { name: "Web Push", icon: null },
      { name: "HTML5 Canvas", icon: null },
    ],
  },
  {
    group: "Maps",
    items: [
      { name: "Leaflet", icon: "siLeaflet" },
      { name: "MapLibre", icon: "siMaplibre" },
      { name: "Google Maps", icon: "siGooglemaps" },
      { name: "Valhalla", icon: null },
    ],
  },
  {
    group: "Backend & data",
    items: [
      { name: "Node.js", icon: "siNodedotjs" },
      { name: "Express", icon: "siExpress" },
      { name: "Python", icon: "siPython" },
      { name: "FastAPI", icon: "siFastapi" },
      { name: "Supabase", icon: "siSupabase" },
      { name: "PostgreSQL", icon: "siPostgresql" },
      { name: "MongoDB", icon: "siMongodb" },
      { name: "IndexedDB (Dexie)", icon: null },
    ],
  },
  {
    group: "Infra",
    items: [
      { name: "Docker", icon: "siDocker" },
      { name: "Vercel", icon: "siVercel" },
      { name: "Render", icon: "siRender" },
      { name: "Git", icon: "siGit" },
    ],
  },
];
