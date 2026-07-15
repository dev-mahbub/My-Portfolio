/**
 * Centralised seed data for the portfolio.
 * Used by:
 *   - db/seed.js           (Postgres seeding)
 *   - lib/jsonStore.js     (filesystem fallback)
 *
 * NOTE: This is the *online CV text* content (stored in dashboard_content).
 * The standalone downloadable CV PDF is handled separately in public_files
 * and is generated as an ATS-friendly PDF by db/seed.js / lib/cvPdf.js.
 */

export const SEED_PROFILE = {
  name: "MAHBUB HASAN",
  headline: "Front-End Developer | React.js • Next.js • TypeScript",
  location: "Mirpur, Dhaka, Bangladesh",
  avatar:
    "https://ui-avatars.com/api/?name=Mahbub+Hasan&size=240&background=0a66c2&color=fff&bold=true",
  cover:
    "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80",
  about:
    "Passionate Front-End Developer with 2 years of experience building responsive, user-friendly web applications using React.js, Next.js, and TypeScript. Skilled in scalable component design, UI/UX optimization, RESTful APIs, and delivering clean, maintainable code.",
  aboutExtra:
    "Quick learner with the ability to adapt to new tools and technologies. I enjoy solving real-world problems through elegant interfaces and collaborating with teams to build products that users love.",
  stats: { connections: 500, experience: "2+", projects: "10+" },
  cvFile: null,
  website: "https://mahbub-portfolio.vercel.app",
};

export const SEED_SKILLS = [
  {
    id: "sk1",
    name: "JavaScript",
    level: 90,
    desc: "ES6+, async/await, DOM manipulation, and modern JS patterns.",
    projects: ["TRX-Gold", "Inventual", "Manez"],
  },
  {
    id: "sk2",
    name: "React.js",
    level: 88,
    desc: "Hooks, context, component architecture, and state management with Zustand.",
    projects: ["TRX-Gold", "Inventual", "Manez"],
  },
  {
    id: "sk3",
    name: "Next.js",
    level: 85,
    desc: "App Router, SSR/SSG, API routes, and full-stack features.",
    projects: ["Inventual", "Manez"],
  },
  {
    id: "sk4",
    name: "TypeScript",
    level: 82,
    desc: "Type-safe development, interfaces, generics, and strict mode.",
    projects: ["Inventual", "Manez"],
  },
  {
    id: "sk5",
    name: "Tailwind CSS",
    level: 90,
    desc: "Utility-first CSS for rapid, responsive, and consistent UIs.",
    projects: ["TRX-Gold", "Inventual", "Manez"],
  },
  {
    id: "sk6",
    name: "Node.js",
    level: 75,
    desc: "REST APIs with Express.js, MongoDB integration, and backend logic.",
    projects: ["TRX-Gold"],
  },
  {
    id: "sk7",
    name: "Material UI",
    level: 80,
    desc: "Component library for clean, modular, and intuitive interfaces.",
    projects: ["Inventual", "Manez"],
  },
  {
    id: "sk8",
    name: "MongoDB",
    level: 72,
    desc: "NoSQL database design with Mongoose ODM and aggregation pipelines.",
    projects: ["TRX-Gold"],
  },
];

export const SEED_EXPERIENCE = [
  {
    id: "ex1",
    role: "React Developer",
    company: "BDevs Tech Company",
    location: "Mirpur, Dhaka, Bangladesh",
    period: "Nov 2023 - Mar 2025",
    desc: "Contributed to a large-scale School ERP project, working on frontend development. Collaborated with team members to build and optimize scalable web applications. Developed scalable user interfaces with React, Next.js, and TypeScript. Implemented responsive UIs using SCSS, Tailwind CSS, and Material UI.",
  },
];

export const SEED_PROJECTS = [
  {
    id: "pr1",
    title: "TRX-Gold — Cryptocurrency Investment Platform",
    meta: "MERN Stack · Apr 2025 - Jul 2025",
    short: "Full-stack cryptocurrency investment platform.",
    long: "Built a full-stack cryptocurrency investment platform using the MERN stack. Developed responsive, user-friendly frontend interfaces and secure backend APIs for investment tracking and user management.",
    tech: ["React", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"],
    cover:
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80",
    link: "#",
  },
  {
    id: "pr2",
    title: "Inventual — Complete POS & Inventory",
    meta: "Next.js · Jun 2024 - Oct 2024",
    short: "Multi-store POS and inventory management platform.",
    long: "Built a multi-store POS and inventory management platform. Utilized Next.js, TypeScript, Material UI, and Tailwind CSS. Designed clean, modular, and intuitive UIs for efficient product management.",
    tech: ["Next.js", "TypeScript", "Material UI", "Tailwind CSS"],
    cover:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    link: "#",
  },
  {
    id: "pr3",
    title: "Manez — HRM & CRM Dashboard",
    meta: "Next.js · Nov 2024 - Dec 2024",
    short: "Admin dashboard with dark/light layouts and RTL support.",
    long: "Created an admin dashboard with dark/light layouts and RTL support. Used Next.js, TypeScript, Material UI, and Tailwind CSS for frontend development with focus on user experience.",
    tech: ["Next.js", "TypeScript", "Material UI", "Tailwind CSS"],
    cover:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    link: "#",
  },
];

export const SEED_EDUCATION = [
  {
    id: "edu1",
    degree: "Diploma in Computer Science and Technology",
    school: "Dhaka, Bangladesh",
    period: "Aug 2016 - Jan 2020",
    desc: "Completed comprehensive diploma covering computer science fundamentals and software development.",
  },
  {
    id: "edu2",
    degree: "Web Development Bootcamp",
    school: "Programming Hero",
    period: "Jun 2022 - Dec 2022",
    desc: "Intensive program focused on modern web development with React, Node.js, and full-stack technologies.",
  },
];

export const SEED_HIGHLIGHTS = [
  "Entry-level problem-solving on HackerRank (C language)",
  "2+ years of professional front-end development experience",
  "Expertise in React, Next.js, and TypeScript",
  "Quick learner adaptable to new tools and technologies",
];

export const SEED_CONTACT = {
  email: "mahbub.devs@gmail.com",
  phone: "+880 1798-883342",
  linkedin: "https://linkedin.com",
  github: "https://github.com",
  website: "https://mahbub-portfolio.vercel.app",
};

export const SEED_LANGUAGES = [
  { name: "Bengali", level: "Native" },
  { name: "English", level: "Professional" },
];

/**
 * Editable Online CV text (rich text block, shown on the public page).
 * This is SEPARATE from the downloadable PDF.
 */
export const SEED_CV_TEXT = `MAHBUB HASAN
Front-End Developer | React.js • Next.js • TypeScript
Mirpur, Dhaka, Bangladesh | +880 1798-883342 | mahbub.devs@gmail.com

PROFESSIONAL SUMMARY
Passionate Front-End Developer with 2+ years of experience building responsive, user-friendly web applications using React.js, Next.js, and TypeScript. Skilled in scalable component design, UI/UX optimization, RESTful API integration, and delivering clean, maintainable code.

CORE SKILLS
JavaScript (ES6+), TypeScript, React.js, Next.js, Tailwind CSS, Material UI, Node.js, REST APIs, Git/GitHub, Responsive Design.

PROFESSIONAL EXPERIENCE
React Developer — BDevs Tech Company, Mirpur, Dhaka (Nov 2023 – Mar 2025)
- Built scalable user interfaces with React, Next.js, and TypeScript for a large-scale School ERP platform.
- Implemented responsive UIs using SCSS, Tailwind CSS, and Material UI.
- Collaborated with cross-functional teams to optimize performance and usability.

EDUCATION
Diploma in Computer Science and Technology — Dhaka, Bangladesh (2016 – 2020)
Web Development Bootcamp — Programming Hero (2022)`;

/**
 * Cover Letter — default template adhering to high-quality global /
 * worldwide professional standards (single column, plain paragraphs,
 * standard business-letter structure).
 */
export const SEED_COVER_LETTER = `[Your Name]
MAHBUB HASAN
Mirpur, Dhaka, Bangladesh
+880 1798-883342  |  mahbub.devs@gmail.com
LinkedIn: https://linkedin.com  |  GitHub: https://github.com

[Date]
Today's Date

[Recipient]
Hiring Manager
[Company Name]
[Company Address]

Subject: Application for [Job Title] — [Your Name]

Dear Hiring Manager,

I am writing to express my strong interest in the [Job Title] position at [Company Name]. With 2+ years of professional experience as a Front-End Developer specializing in React.js, Next.js, and TypeScript, I am confident that my skills in building responsive, scalable, and user-friendly web applications align well with your team's goals.

In my most recent role at BDevs Tech Company, I contributed to a large-scale School ERP platform, developing robust user interfaces with React, Next.js, and TypeScript, and implementing responsive designs with Tailwind CSS and Material UI. I collaborated closely with cross-functional teams to deliver clean, maintainable code and optimize application performance.

I am particularly drawn to [Company Name] because of your commitment to [specific value / product / mission]. I am eager to bring my expertise in modern front-end engineering, attention to detail, and collaborative mindset to help your team achieve its objectives.

Thank you for considering my application. I would welcome the opportunity to discuss how my background and skills can contribute to [Company Name]. I am available for an interview at your earliest convenience and look forward to hearing from you.

Sincerely,
MAHBUB HASAN
mahbub.devs@gmail.com  |  +880 1798-883342`;

/**
 * Aggregate as a single object (legacy shape used by JSON fallback).
 */
export const SEED_DATA = {
  profile: SEED_PROFILE,
  skills: SEED_SKILLS,
  experience: SEED_EXPERIENCE,
  projects: SEED_PROJECTS,
  education: SEED_EDUCATION,
  highlights: SEED_HIGHLIGHTS,
  contact: SEED_CONTACT,
  languages: SEED_LANGUAGES,
  cv_text: SEED_CV_TEXT,
  cover_letter: SEED_COVER_LETTER,
};

export default SEED_DATA;
