/**
 * Case studies for /work/:slug.
 * Prism is fully written. Other entries reuse real project facts.
 * Fill `retrospective` when ready; the page omits that section while it is empty.
 */

export const CASE_STUDIES = [
  {
    slug: "prism",
    projectId: 19,
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
    outcome:
      "Offline laptop demo with jury deck, system handbook, and prompt documentation shipped in-repo.",
    retrospective:
      "I would add a public adversarial fixture set earlier, with planted wrong matches and altered quotations, so grounding regressions fail CI instead of relying on manual demos. I would also ship a thinner online mode for evaluators who lack local GPU VRAM, while keeping the offline path as the default for sensitive documents.",
  },
  {
    slug: "swiggy-nexus",
    projectId: 18,
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
    outcome:
      "Live demo with a reviewer path for bundle, grocery checkout, and table booking. Write tools never fire before Approve.",
    retrospective: "",
  },
  {
    slug: "utility",
    projectId: 13,
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
    outcome: "Live product at utilityos.tech with auth, ingestion, and study tools open today.",
    retrospective: "",
  },
  {
    slug: "shadow-instructor",
    projectId: 10,
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
    outcome: "Live dual-agent interview demo with real-time coaching.",
    retrospective: "",
  },
  {
    slug: "fourth-clover",
    projectId: 1,
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
    outcome: "Live writing product with drafts, comments, and an editing surface.",
    retrospective: "",
  },
  {
    slug: "siya-portfolio",
    projectId: 20,
    title: "Siya's Portfolio",
    oneLiner:
      "Client creator portfolio for a Pune UGC creator: editorial layout, reels, rates, and brand inquiry.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "GSAP", "Lenis"],
    live: "https://siyas-portfolio-eight.vercel.app/",
    github: null,
    problem:
      "A UGC creator needed a branded site that shows selected reels, transparent rates, and a clear path for brand collaborations without a stiff agency template.",
    approach:
      "An editorial single-page site with chapter themes, reel gallery, rate cards, and a mailto inquiry flow that carries the selected package into the email subject.",
    architecture:
      "Next.js App Router, TypeScript, Tailwind, GSAP motion, and Lenis smooth scrolling. Private client repository.",
    outcome: "Live client site at siyas-portfolio-eight.vercel.app with rates and inquiry ready for brands.",
    retrospective: "",
  },
  {
    slug: "arbiter",
    projectId: 11,
    title: "Arbiter: RIFT 2026",
    oneLiner:
      "An autonomous CI/CD healing agent built for RIFT 2026 with a multi-agent Gemini pipeline.",
    stack: ["Gemini 2.5", "FastAPI", "LangGraph", "Docker", "Multi-Agent Systems"],
    live: "https://thearbiter.vercel.app/",
    github: "https://github.com/aryan-dani/Arbiter",
    problem:
      "Broken CI pipelines waste review time when agents cannot safely inspect repositories and propose fixes inside sandboxes.",
    approach:
      "A multi-agent state machine with Discovery, Testing, Anchor-based Debugging, and Git operations, powered by Gemini 2.5 Flash inside Docker sandboxes.",
    architecture:
      "FastAPI backend with LangGraph orchestration, Docker sandboxes for untrusted repair work, and a web UI for reviewing proposed fixes.",
    outcome: "RIFT 2026 build with a live demo at thearbiter.vercel.app.",
    retrospective: "",
  },
  {
    slug: "debatebot",
    projectId: 2,
    title: "DebateBot",
    oneLiner:
      "A debating platform with dual-AI stages, live arena challenges, and scored feedback on argument quality.",
    stack: ["Python", "FastAPI", "React", "LangGraph", "LLaMA 3.3"],
    live: "https://debate-bot-psi.vercel.app",
    github: "https://github.com/aryan-dani/DebateBot",
    problem:
      "Practice debates need structured stages and feedback on coherence, evidence, and fallacies, not a free-form chatbot.",
    approach:
      "Dual-AI debates with Opening, Rebuttal, and Closing stages, a Live Arena against the model, and scoring with feedback plus streaming replies.",
    architecture:
      "React frontend with FastAPI and LangGraph, LLaMA 3.3 70B for generation, and real-time streaming for argument turns.",
    outcome: "Live demo at debate-bot-psi.vercel.app with staged debates and scoring.",
    retrospective: "",
  },
];

export function getCaseStudyBySlug(slug) {
  return CASE_STUDIES.find((study) => study.slug === slug) || null;
}

export function getCaseStudyByProjectId(projectId) {
  return CASE_STUDIES.find((study) => study.projectId === projectId) || null;
}

export function caseStudyPaths() {
  return CASE_STUDIES.map((study) => `/work/${study.slug}`);
}
