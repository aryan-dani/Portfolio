/**
 * Case studies for /work/:slug.
 * Prism is fully written. Other entries reuse real project facts.
 * Fill `retrospective` when ready; the page omits that section while it is empty.
 */

export const CASE_STUDIES = [
  {
    slug: "prism",
    title: "Prism",
    oneLiner:
      "A local enterprise AI agent that answers only from retrieved passages and refuses when support is weak.",
    stack: ["React", "FastAPI", "Ollama", "Chroma", "RBAC", "RAG"],
    live: null,
    github: "https://github.com/aryan-dani/Prism",
    problem:
      "Enterprise Q and A is often split across brittle domain bots or cloud RAG that leaks documents and ignores role boundaries at retrieval time. Teams need one conversational surface that stays honest about what it knows.",
    approach:
      "Prism routes one query across curated domains plus session uploads, filters Chroma chunks by role metadata before the model sees them, and refuses to invent when retrieval confidence is low. The same grounded answer can be exported as prose, JSON, XML, Excel, or email without asking the model again.",
    architecture:
      "React and Vite UI with a FastAPI backend, embedded Chroma, Ollama embeddings and generation, session memory, and demo RBAC logins. A CanonicalAnswer object fans out to multiple export formats from one retrieval pass.",
    retrospective:
      "I would add a public adversarial fixture set earlier, with planted wrong matches and altered quotations, so grounding regressions fail CI instead of relying on manual demos. I would also ship a thinner online mode for evaluators who lack local GPU VRAM, while keeping the offline path as the default for sensitive documents.",
  },
  {
    slug: "swiggy-nexus",
    title: "Swiggy Nexus",
    oneLiner:
      "A LangGraph agent that stages food, grocery, and dining actions and blocks every write until a human approves.",
    stack: ["Next.js", "FastAPI", "LangGraph", "HITL", "MCP", "Groq"],
    live: "https://swiggy-nexus.vercel.app/",
    github: "https://github.com/aryan-dani/Swiggy_Nexus",
    problem:
      "Cross-vertical food, grocery, and dining intent is usually split across chatbots and brittle REST calls, so an agent can hallucinate orders or skip consent before money moves.",
    approach:
      "Nexus uses a Planner, Executor, and Synth loop: stage carts and table slots with read-only MCP tools, require human-in-the-loop approval, then run write tools. Calendar signals and quality-of-life context feed the same graph.",
    architecture:
      "Next.js Concierge UI streams SSE tool traces. FastAPI plus LangGraph StateGraph with HITL interrupts. Local mock MCP or a remote MCP endpoint. Independent proof of concept, not affiliated with Swiggy.",
    // Fill retrospective when ready; the page hides this section while empty.
    retrospective: "",
  },
  {
    slug: "utility",
    title: "Utility",
    oneLiner: "A live academic OS with document intelligence, RAG, auth, and study tools.",
    stack: ["Next.js", "Supabase", "TypeScript", "Tailwind", "RAG"],
    live: "https://utilityos.tech",
    github: "https://github.com/aryan-dani/Utility",
    problem:
      "Students juggle notes, documents, timers, and GPA math across disconnected tools with little document intelligence.",
    approach:
      "Utility ships a minimalist academic workspace: document ingestion and RAG, parallel indexing, Supabase auth and storage, a focus timer, GPA calculator, and study tools in one product students can open today.",
    architecture:
      "Next.js and Tailwind frontend on Vercel, Supabase for auth and storage, and a document-intelligence path that retrieves over uploaded materials.",
    // Fill retrospective when ready; the page hides this section while empty.
    retrospective: "",
  },
  {
    slug: "shadow-instructor",
    title: "The Shadow Instructor",
    oneLiner:
      "A dual-agent mock interview platform where one agent speaks and a second agent only reviews.",
    stack: ["Next.js", "FastAPI", "Gemini", "WebSockets"],
    live: "https://the-shadow-instructor.vercel.app/",
    github: "https://github.com/aryan-dani/The_Shadow_Instructor",
    problem:
      "Practice interviews either feel scripted or give feedback too late to change the conversation mid-session.",
    approach:
      "An Interviewer agent handles low-latency conversation while a Shadow agent analyzes technical accuracy, communication, and confidence in parallel. Resume parsing shapes the session.",
    architecture:
      "Next.js frontend with FastAPI and WebSockets, Gemini Flash for the interviewer and Gemini Pro for the silent coach.",
    // Fill retrospective when ready; the page hides this section while empty.
    retrospective: "",
  },
  {
    slug: "fourth-clover",
    title: "The Fourth Clover",
    oneLiner: "A writing and editor product with drafts, comments, auth, and image upload.",
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind"],
    live: "https://thefourthclover.netlify.app/",
    github: "https://github.com/aryan-dani/The-Fourth-Clover",
    problem:
      "Writers need a focused drafting surface with auto-save, comments, and auth without a heavy CMS.",
    approach:
      "The Fourth Clover ships a minimalist blogging platform: real-time auto-save, threaded comments, Google OAuth, and Supabase Storage for images.",
    architecture:
      "Next.js App Router, TypeScript, Supabase auth and storage, Tailwind, and React Hook Form.",
    // Fill retrospective when ready; the page hides this section while empty.
    retrospective: "",
  },
];

export function getCaseStudyBySlug(slug) {
  return CASE_STUDIES.find((study) => study.slug === slug) || null;
}

export function caseStudyPaths() {
  return CASE_STUDIES.map((study) => `/work/${study.slug}`);
}
