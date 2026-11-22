import { AVAILABILITY } from "../../data/availability";

export const NAME = "Aryan Dani";

/**
 * The "retrieved documents" the Grounded intro cuts between.
 *
 * Every line is copied or condensed from data this site already publishes
 * (the file is named beside each clip). Nothing is invented: no quotes, no
 * client names, no numbers that are not in the source. If the source data
 * changes, change the clip with it.
 *
 * Shape: two lines above the name, the text either side of it, two lines below.
 * The name itself is rendered once and never moves.
 */
export const CLIPPINGS = [
  {
    // src/data/experience.js → aboutInfo.title, tagline, bio
    source: "about.md",
    above: [
      "Tech Enthusiast, Web Developer and AI Engineer",
      "Building the future, one line of code at a time.",
    ],
    before: "Hey, I'm",
    after: "- a full-stack developer and AI engineer who builds",
    below: [
      "sharp web products and agentic systems that actually ship.",
      "Earlier work includes healthcare AI at Artem HealthTech and a computer-vision capstone at MIT-WPU.",
    ],
  },
  {
    // src/data/research.js → title, subtitle, authors, affiliation, sections.Results
    source: "research-paper.pdf",
    above: [
      "Real-Time Multi-Modal Threat Detection",
      "Integrating YOLOv11 and EfficientNetV2 using an Adaptive Frontend Framework",
    ],
    before: "1st Author:",
    after: "· MIT World Peace University, Pune, India",
    below: [
      "YOLOv11 reports mAP 0.960 at IoU 0.5 and 0.880 at IoU 0.75 across weapon classes.",
      "EfficientNetV2 reaches 99.44% accuracy with a low false-positive rate.",
    ],
  },
  {
    // src/data/experience.js → experiences[0] (ProvaanTech)
    source: "experience/provaantech",
    above: ["ProvaanTech · Remote", "June 2026 - Present"],
    before: "AI/ML Intern:",
    after: "· Python, Machine Learning, Deep Learning",
    below: [
      "real-world client and product problems from day one,",
      "self-learning, research, and practical implementation rather than classroom-scale exercises.",
    ],
  },
  {
    // src/data/caseStudies.js → prism
    source: "work/prism",
    above: [
      "Prism",
      "A local enterprise AI agent that answers only from retrieved passages",
    ],
    before: "Built by",
    after: "· React, FastAPI, Ollama, Chroma, RBAC, RAG",
    below: [
      "filters Chroma chunks by role metadata before the model sees them,",
      "and refuses to invent when retrieval confidence is low.",
    ],
  },
  {
    // src/data/caseStudies.js → swiggy-nexus
    source: "work/swiggy-nexus",
    above: [
      "Swiggy Nexus",
      "A LangGraph agent that stages food, grocery, and dining actions",
    ],
    before: "Built by",
    after: "· Next.js, FastAPI, LangGraph, HITL, MCP",
    below: [
      "and blocks every write until a human approves.",
      "Write tools never fire before Approve.",
    ],
  },
  {
    // src/data/certifications.js → titles and issuers
    source: "certifications",
    above: [
      "Certificate Program in AI & ML · FutureSkills Prime",
      "IBM Data Science Professional Certificate · IBM",
    ],
    before: "Awarded to",
    after: "· Google Student Ambassador Program",
    below: [
      "Inspect Rich Documents with Gemini and Multimodal RAG · Google Cloud",
      "Prompt Design in Vertex AI · Google Cloud",
    ],
  },
  {
    // src/pages/Home (positioning line) + src/data/availability.js
    source: "availability",
    above: [
      "Freelance AI engineer and full-stack developer",
      "Based in Pune and open to remote clients worldwide.",
    ],
    before: "Start a project with",
    after: "· websites, SaaS, and grounded AI",
    below: [`${AVAILABILITY.label}.`, AVAILABILITY.detail],
  },
];

/** Phones get five cuts: about, research, Prism, certifications, availability. */
export const PHONE_CLIP_INDEXES = [0, 1, 3, 5, 6];
