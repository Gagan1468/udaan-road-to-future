// All homepage copy that describes the business lives here so it can be corrected without touching components.
// Only claims that are true for this repository are made. Items marked CONFIRM need the owner's input.

export const SERVICES = [
  { id: "ai", enquiry: "AI & Intelligent Agents", title: "AI & Intelligent Agents", lead: "Systems that reason over your data and take action.",
    points: ["Custom AI integrations", "Workflow automation", "Business-specific AI assistants", "API and model integrations"] },
  { id: "digital", enquiry: "Digital Experiences", title: "Digital Experiences", lead: "Interfaces people remember and can actually use.",
    points: ["Premium websites", "Interactive 3D experiences", "Modern web applications", "Product interfaces and dashboards"] },
  { id: "engineering", enquiry: "Engineering & Automation", title: "Engineering & Automation", lead: "The backend that keeps the front end honest.",
    points: ["Backend systems and APIs", "Database-driven applications", "Business workflow automation", "Technical integration and deployment"] },
];

// "real" = exists in this repository today. Concepts are labelled as such on the page.
export const WORK = [
  { id: "rtf", kind: "real", name: "Road to Future", category: "Digital Experiences · Engineering", to: "/courses/road-to-future",
    text: "Udaan's course platform: account sign-up with Google or email, course registration linked to each account, and an admin dashboard with search and CSV/JSON export. Built on React, FastAPI and PostgreSQL." },
  { id: "c1", kind: "concept", name: "Operations Assistant", category: "AI & Intelligent Agents",
    text: "A concept exploring how an AI assistant could triage internal requests and route them into existing tools. Not a client project." },
  { id: "c2", kind: "concept", name: "Live Systems Dashboard", category: "Digital Experiences",
    text: "A concept interface for monitoring workflows and data pipelines in one calm, readable view. Not a client project." },
];

export const PROCESS = [
  { n: "01", title: "Discover", text: "Understand the business, users, and actual problem." },
  { n: "02", title: "Design", text: "Define the experience, architecture, and solution." },
  { n: "03", title: "Engineer", text: "Build, integrate, test, and refine." },
  { n: "04", title: "Launch", text: "Deploy, measure, and improve." },
];

// CONFIRM: the repository contains no product other than the course platform. Statuses below are
// deliberately conservative. Edit this list when real products exist.
export const PRODUCTS = [
  { id: "courses", name: "Udaan Courses", status: "Available", text: "Practical AI learning for students. Road to Future registration is open now.", cta: { label: "View courses", to: "/courses" } },
  { id: "next", name: "Next product", status: "To be announced", text: "We haven't announced our next product yet. If you want to be told when we do, say so in the form and we'll note it.", cta: { label: "Ask for early access", section: "contact", service: "Early access" } },
];

export const GITHUB_URL = "https://github.com/Gagan1468/udaan-road-to-future";
