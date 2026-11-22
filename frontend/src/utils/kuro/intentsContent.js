/**
 * Portfolio-content intents: bio, projects, skills, experience, research, certifications,
 * achievements, site help, and page navigation. Data comes only from src/data modules.
 */
import { scoreRules, send, go, ext, CHIP, lastProjectInHistory } from "./context.js";
import { contentTokens, joinList, plural, truncate, firstSentences, stem } from "./text.js";
import {
  aboutInfo,
  socialLinks,
  projects,
  experiences,
  certifications,
  researchPapers,
  ACHIEVEMENTS,
  PAGE_WORD_STEMS,
  PAGE_VERB_STEMS,
  findPages,
  navigateAction,
  findProjects,
  projectCard,
  projectPath,
  caseStudyFor,
  projectsLive,
  projectsWithCaseStudy,
  filterProjectsByUtterance,
  findSkills,
  findSkillCategory,
  skillProjects,
  skillCategoryLabel,
  skillsByCategory,
  skillCategories,
  findExperience,
  currentExperience,
  experienceDetail,
  experienceLine,
  findCertifications,
  achievementCounts,
} from "./knowledge.js";
import { getAllSkills } from "../../data/skills.js";
import { KURO_LOCATION, KURO_PERSONAL_LINE, KURO_SITE_STACK } from "../../data/kuroFacts.js";
import { AVAILABILITY } from "../../data/availability.js";

const EMAIL = aboutInfo.email;
const NAV_VERBS = ["go", "take", "navigate", "open", "show", "visit", "bring", "head", "jump", "switch", "see", "load", "goto", "launch", "view", "read"];
const NAV_FILLER = new Set(["the", "a", "an", "page", "please", "kuro", "pls", "my", "your", "his", "now", "quickly", "again", "back", "there", "here", "right", "asap", "ok", "section", "tab", "me", "to"]);
const SKILL_TRIGGERS = ["know", "use", "used", "using", "experience", "familiar", "proficient", "skilled", "expert", "good", "work", "worked", "built", "build", "stack", "strong", "comfortable", "learn", "does", "do", "can", "has", "have"];
const UNKNOWN_SKILL_IGNORE = new Set(["know", "knows", "use", "uses", "used", "using", "experience", "familiar", "proficient", "skilled", "aryan", "dani", "anything", "build", "make", "create", "design", "develop", "code", "work", "worked", "good", "does", "have", "has"]);

const RULES = {
  who_aryan: {
    kw: { aryan: 2.5, dani: 2.5, bio: 5, biography: 6 },
    ph: {
      "who is aryan": 9, "who is aryan dani": 9, "who is he": 7.5, "tell me about aryan": 9, "about aryan": 7.5,
      "about him": 6.5, "aryan bio": 8, "who built this": 8.5, "who made this": 8.5, "who is the developer": 8.5,
      "who is behind": 8, "who is the owner": 8, "who designed": 7.5, "who created this": 8.5,
      "about the developer": 8, "tell me about him": 8, "introduce aryan": 8, "who is dani": 8, "who is this guy": 7,
      "who is the builder": 8, "who built the site": 8.5, "who built the portfolio": 8.5, "who made the portfolio": 8.5,
    },
    neg: {
      projects: 5, project: 5, skills: 5, skill: 5, experience: 5, services: 5, price: 5, pricing: 5, research: 5,
      certifications: 5, certificate: 5, resume: 5, hire: 5, email: 5, github: 5, linkedin: 5,
    },
  },
  education: {
    kw: { education: 6, college: 5, university: 5, degree: 6, studied: 6, graduate: 5, qualification: 6, student: 3 },
    ph: { "alma mater": 6, "what does he study": 7, "where did he study": 8, "is he a student": 7, "is aryan a student": 7 },
  },
  personal: {
    kw: { hobbies: 6, hobby: 6, interests: 5, anime: 5.5, haikyu: 6 },
    ph: { "free time": 6, "outside work": 6, "for fun": 4, "what does he like": 5, "fun fact about aryan": 7 },
  },
  projects: {
    kw: { project: 5, demo: 5, portfolio: 1.5, built: 2, repos: 3, repositories: 4, featured: 4, flagship: 4 },
    ph: {
      "what has he built": 8, "what have you built": 8, "what did he build": 8, "what has aryan built": 8,
      "what has he made": 8, "what projects": 2, "work samples": 7, "your work": 5, "his work": 5, "case study": 6.5,
      "live demo": 1, "how many projects": 3.5, "latest project": 3, "recent work": 5, "best project": 3, "side projects": 2, "open source": 4,
      "what have you made": 8, "show me your work": 7, "show your work": 7, "what did you build": 8, "what have you done": 6,
    },
    neg: { "new project": 5, "have a project": 5, "start a project": 6, "my project": 4, "project management": 5 },
  },
  skills: {
    kw: {
      skill: 6, skillset: 6.5, technology: 5, framework: 4.5, tool: 3, stack: 3, proficient: 4, expertise: 5,
      strengths: 5, languages: 3.5,
    },
    ph: {
      "tech stack": 7.5, "what does he use": 6.5, "what do you use": 6, "what is he good at": 6,
      "does he use": 3.5, "do you use": 3.5, "does aryan use": 3.5,
      "programming languages": 4, "what languages": 3, "what technologies": 2,
    },
    neg: { "full stack developer": 3 },
  },
  experience: {
    kw: { experience: 5.5, career: 4.5, internship: 4.5, intern: 3, job: 3, employer: 3, worked: 3, roles: 3 },
    ph: {
      "work history": 7, "where does he work": 8, "where did he work": 8, "where has he worked": 8,
      "current role": 8, "current job": 8, "currently working": 8, "where do you work": 8, "what does he do now": 7,
      "how long has he": 3, "years of experience": 3,
    },
    neg: { "open to work": 6, "full time": 4, "looking for": 3 },
  },
  certifications: {
    kw: { certification: 6.5, certificate: 6.5, certs: 6, cert: 6, credential: 5, certified: 5, course: 3.5, nptel: 5, coursera: 5 },
  },
  research: {
    kw: { research: 6, paper: 6, publication: 6, published: 5, journal: 4, thesis: 4, abstract: 4, ieee: 3 },
  },
  achievements: {
    kw: { achievement: 7, badge: 4.5, trophy: 6, unlock: 3 },
  },
};

/* ------------------------------------------------------------------ helpers */

const categoryCounts = () => ({
  ai: projects.filter((p) => p.category === "ai-ml").length,
  web: projects.filter((p) => p.category === "web-dev").length,
});

function projectNames(list, max = 6) {
  const names = list.slice(0, max).map((p) => `**${p.title}**`);
  const more = list.length - max;
  return more > 0 ? `${names.join(", ")}, and ${more} more` : joinList(names);
}

function leftoverTokens(ctx) {
  const ignore = new Set([...NAV_VERBS, ...NAV_FILLER, "aryan", "dani", "card", "project"]);
  return contentTokens(ctx.tokens).filter((t) => !ignore.has(t));
}

/** One concise project reply, specialised by what the user asked. */
function projectReply(project, ctx) {
  const study = caseStudyFor(project);
  const live = project.links?.preview;
  const github = project.links?.github;
  const tags = (project.tags || []).slice(0, 6).join(", ");
  const card = projectCard(project);
  const openVerb = ctx.any("open", "go", "take", "navigate", "visit", "bring", "jump", "card");
  // The card already carries Open / Case study / Live / GitHub buttons, so chips are follow-ups.
  const baseChips = [send("More projects", "Show me the projects"), CHIP.hire, CHIP.pricing];
  const meta = { projectId: project.id };

  if (ctx.phrase("case study")) {
    if (study) {
      return {
        reply: `Case study for **${project.title}**: ${study.oneLiner}`,
        actions: [{ type: "navigate", page: "work", path: `/work/${study.slug}`, label: `${project.title} case study` }],
        cards: [card], chips: baseChips, meta,
      };
    }
    return { reply: `**${project.title}** has no written case study yet. The project card has the details.`, cards: [card], chips: baseChips, meta };
  }
  if (ctx.any("github", "repo", "repository", "source", "code")) {
    return {
      reply: github ? `**${project.title}** code: [GitHub](${github}).` : `**${project.title}** has no public repository listed.`,
      cards: [card], chips: baseChips, meta,
    };
  }
  if (ctx.any("live", "demo", "link", "try", "website", "deployed", "url") && !ctx.has("about")) {
    return {
      reply: live ? `**${project.title}** is live: [open the demo](${live}).` : `**${project.title}** has no live demo.${github ? ` Code: [GitHub](${github}).` : ""}`,
      cards: [card], chips: baseChips, meta,
    };
  }
  if (ctx.any("stack", "tech", "technologies", "built", "made", "using", "framework")) {
    return { reply: `**${project.title}** stack: ${tags}.`, cards: [card], chips: baseChips, meta };
  }
  if (openVerb) {
    return {
      reply: `Taking you to **${project.title}**.`,
      actions: [{ type: "navigate", page: "projects", path: projectPath(project), label: project.title }],
      cards: [card], chips: baseChips, meta,
    };
  }
  return {
    reply: `**${project.title}** (${project.year}). ${firstSentences(project.description, 2, 300)} Stack: ${tags}.`,
    cards: [card], chips: baseChips, meta,
  };
}

function pageBlurb(id) {
  const counts = categoryCounts();
  switch (id) {
    case "projects":
      return `${plural(projects.length, "project")}: ${counts.ai} AI and ML, ${counts.web} web.`;
    case "experience": {
      const now = currentExperience();
      return `Now: ${now.position} at ${now.company}.`;
    }
    case "skills":
      return `${plural(getAllSkills().length, "skill")} with the projects that use them.`;
    case "certifications":
      return `${plural(certifications.length, "certification")}.`;
    case "research":
      return `${plural(researchPapers.length, "paper")}, with the PDF.`;
    case "achievements":
      return `${plural(ACHIEVEMENTS.length, "badge")} to hunt.`;
    case "services":
      return `Packages, process, FAQs and the inquiry form. ${AVAILABILITY.label}.`;
    case "contact":
      return `Replies within 24 hours, or email ${EMAIL}.`;
    case "about":
      return "Bio and live GitHub stats.";
    case "playground":
      return "Type help.";
    case "guestbook":
      return "Leave a message on the wall.";
    default:
      return "";
  }
}

function pageChips(id) {
  switch (id) {
    case "projects":
      return [send("AI projects"), send("Web projects"), send("Live demos", "Which projects have a live demo?")];
    case "services":
    case "contact":
      return [CHIP.pricing, CHIP.availability, CHIP.hire];
    case "experience":
      return [CHIP.resume, send("Current role", "What is his current role?")];
    case "skills":
      return [send("AI skills"), send("Web skills")];
    case "about":
      return [CHIP.resume, CHIP.contact];
    default:
      return [CHIP.help];
  }
}

/* ------------------------------------------------------------------ intents */

export const contentIntents = [
  {
    id: "who_aryan",
    priority: 62,
    score: (ctx) => scoreRules(ctx, RULES.who_aryan),
    run() {
      const now = currentExperience();
      const bioLine = aboutInfo.bio.match(/I'm Aryan Dani\s*-\s*([^.]+)\./);
      const google = aboutInfo.highlights.find((h) => /google/i.test(h.title));
      return {
        reply: [
          `**${aboutInfo.name}** is ${bioLine ? bioLine[1] : aboutInfo.title.toLowerCase()}.`,
          `Right now: ${now.position} at ${now.company} (${now.period}).`,
          google ? `${google.description.split(" - ")[0]}.` : "",
          `Based in ${KURO_LOCATION.city}, ${KURO_LOCATION.country}.`,
        ].filter(Boolean).join(" "),
        chips: [CHIP.projects, CHIP.experience, CHIP.resume, CHIP.contact],
      };
    },
  },
  {
    id: "education",
    priority: 50,
    score: (ctx) => scoreRules(ctx, RULES.education),
    run() {
      const mit = experiences.find((e) => /MIT-WPU/.test(e.company));
      const paper = researchPapers[0];
      return {
        reply: [
          "The site doesn't list a degree, and I won't guess one. What it does show:",
          mit ? `- ${mit.company}: ${mit.position} (${mit.period})` : "",
          paper ? `- Research paper: ${paper.venue} (${paper.year})` : "",
          `- ${plural(certifications.length, "certification")} on the Certifications page`,
          "He takes client work alongside studies and flags academic conflicts early.",
        ].filter(Boolean).join("\n"),
        chips: [go("Certifications", "/certifications"), go("Research", "/research"), CHIP.experience],
      };
    },
  },
  {
    id: "personal",
    priority: 45,
    score: (ctx) => scoreRules(ctx, RULES.personal),
    run() {
      return { reply: KURO_PERSONAL_LINE, chips: [send("Who is Aryan?"), CHIP.projects] };
    },
  },
  {
    id: "projects_list",
    priority: 52,
    score(ctx) {
      const base = scoreRules(ctx, RULES.projects);
      if (!base) return 0;
      return filterProjectsByUtterance(ctx.tokens) && !findProjects(ctx.tokens).length ? base + 2.5 : base;
    },
    run(ctx) {
      const counts = categoryCounts();
      const filter = filterProjectsByUtterance(ctx.tokens);
      const pageChip = go("Open Projects page", "/projects");
      if (ctx.phrase("how many")) {
        return {
          reply: `${plural(projects.length, "project")}: ${counts.ai} AI and ML, ${counts.web} web. ${projectsLive().length} have a live demo and ${projectsWithCaseStudy().length} have a written case study.`,
          chips: [send("AI projects"), send("Web projects"), pageChip],
        };
      }
      if (ctx.any("live", "demo", "deployed")) {
        const list = projectsLive();
        return {
          reply: `${plural(list.length, "project")} with a live demo: ${projectNames(list, 8)}.`,
          cards: list.slice(0, 3).map(projectCard),
          chips: [pageChip, send("Case studies", "Show case studies")],
        };
      }
      if (ctx.phrase("case study")) {
        const list = projectsWithCaseStudy();
        return {
          reply: `${plural(list.length, "written case study", "written case studies")}: ${projectNames(list, 8)}. Ask for any one by name.`,
          cards: list.slice(0, 3).map(projectCard),
          chips: [pageChip],
        };
      }
      if (ctx.any("latest", "newest", "recent", "new") && !filter) {
        const latest = projects[0];
        return {
          reply: `The projects page leads with **${latest.title}** (${latest.year}).`,
          cards: [projectCard(latest)],
          chips: [pageChip, send("Show all projects")],
          meta: { projectId: latest.id },
        };
      }
      if (ctx.any("best", "favorite", "favourite", "flagship", "featured", "top", "impressive", "biggest")) {
        const lead = projects.slice(0, 3);
        return {
          reply: `I won't rank them, but the page leads with ${projectNames(lead, 3)}. Utility and Swiggy Nexus both have live demos.`,
          cards: lead.map(projectCard),
          chips: [pageChip, send("Case studies", "Show case studies")],
        };
      }
      if (filter && filter.list.length) {
        const label = filter.label === "that tag" ? "" : `${filter.label} `;
        return {
          reply: `${plural(filter.list.length, `${label}project`)}: ${projectNames(filter.list, 6)}.`,
          cards: filter.list.slice(0, 3).map(projectCard),
          chips: [pageChip, send("Live demos", "Which projects have a live demo?")],
        };
      }
      if (filter) {
        return { reply: `I don't see a project tagged ${filter.label}. The full list is on the Projects page.`, chips: [pageChip, CHIP.skills] };
      }
      const lead = projects.slice(0, 3);
      return {
        reply: `${plural(projects.length, "project")}: ${counts.ai} AI and ML, ${counts.web} web. Lead picks: ${projectNames(lead, 3)}.`,
        cards: lead.map(projectCard),
        chips: [send("AI projects"), send("Web projects"), send("Live demos", "Which projects have a live demo?"), pageChip],
      };
    },
  },
  {
    id: "project",
    priority: 64,
    score(ctx) {
      const hits = findProjects(ctx.tokens);
      if (!hits.length) return 0;
      const top = hits[0].project;
      if (top.id === 5 && ctx.any("paper", "research", "publication", "pdf")) return 3;
      if (ctx.tokens.length > 16) return 5.5;
      return leftoverTokens(ctx).length <= 5 ? 9 : 6.5;
    },
    run(ctx) {
      const hits = findProjects(ctx.tokens);
      const first = hits[0].project;
      const second = hits[1]?.project;
      if (second && (ctx.any("compare", "vs", "versus", "difference", "between") || ctx.has("and"))) {
        return {
          reply: [`**${first.title}** (${first.year}): ${firstSentences(first.description, 1, 160)}`, `**${second.title}** (${second.year}): ${firstSentences(second.description, 1, 160)}`].join("\n"),
          cards: [projectCard(first), projectCard(second)],
          chips: [go(`Open ${first.title}`, projectPath(first)), go(`Open ${second.title}`, projectPath(second))],
          meta: { projectId: first.id },
        };
      }
      return projectReply(first, ctx);
    },
  },
  {
    id: "project_followup",
    priority: 48,
    score(ctx) {
      if (ctx.tokens.length > 8) return 0;
      const hit = ctx.anyPhrase("tell me more", "more details", "more info", "the card", "go there", "open it", "open that", "take me there", "navigate me to the card", "show me the card", "its stack", "the stack", "live demo", "github link", "case study", "the code", "the link", "how does it work");
      return hit ? 7 : 0;
    },
    run(ctx) {
      const project = lastProjectInHistory(ctx.history);
      if (!project) return { reply: "Which one? Name a project like Utility, Aegis, or Prism.", chips: [CHIP.projects] };
      return projectReply(project, ctx);
    },
  },
  {
    id: "skill_lookup",
    priority: 56,
    score(ctx) {
      const hits = findSkills(ctx.tokens);
      if (hits.length) {
        let score = 6 + (ctx.any(...SKILL_TRIGGERS) ? 2.5 : 0);
        if (ctx.has("project")) score -= 1.5;
        if (findProjects(ctx.tokens).length) score -= 2;
        return Math.min(9.5, score);
      }
      const asks =
        /^(does|do|can|is|has|have|did)\b/.test(ctx.text) &&
        ctx.any("know", "use", "uses", "used", "using", "experience", "familiar", "proficient", "skilled", "knows");
      if (!asks) return 0;
      const rest = contentTokens(ctx.tokens).filter((t) => !UNKNOWN_SKILL_IGNORE.has(t));
      return rest.length === 1 && !findProjects(ctx.tokens).length ? 6.5 : 0;
    },
    run(ctx) {
      const hits = findSkills(ctx.tokens);
      if (!hits.length) {
        const unknown = contentTokens(ctx.tokens).find((t) => !UNKNOWN_SKILL_IGNORE.has(t));
        const top = getAllSkills().sort((a, b) => b.level - a.level).slice(0, 8).map((s) => s.name);
        return {
          reply: `I don't see **${unknown}** in the listed skills. The strongest ones are ${joinList(top)}. Ask on the inquiry form if it matters for a project.`,
          chips: [go("All skills", "/skills"), CHIP.startProject],
        };
      }
      const wanted = hits.length > 1 && hits[1].score >= hits[0].score - 2 ? hits.slice(0, 2) : hits.slice(0, 1);
      const lines = wanted.map(({ skill }) => {
        const list = skillProjects(skill);
        const used = list.length ? `Used in ${projectNames(list, 4)}.` : "Not tied to a listed project yet.";
        return `**${skill.name}** is in the stack (${skillCategoryLabel(skill)}). ${firstSentences(skill.description, 1, 170)} ${used}`;
      });
      const used = skillProjects(wanted[0].skill);
      return {
        reply: lines.join("\n"),
        cards: used.slice(0, ctx.has("project") ? 3 : 2).map(projectCard),
        chips: [go("All skills", "/skills"), send(`Projects using ${wanted[0].skill.name}`), CHIP.projects],
      };
    },
  },
  {
    id: "skills_overview",
    priority: 54,
    score: (ctx) => scoreRules(ctx, RULES.skills),
    run(ctx) {
      const all = getAllSkills();
      const category = findSkillCategory(ctx.tokens);
      if (ctx.phrase("how many")) {
        const split = skillCategories.filter((c) => c.id !== "all").map((c) => `${c.label} (${skillsByCategory(c.id).length})`);
        return { reply: `${plural(all.length, "skill")}: ${joinList(split)}.`, chips: [go("Skills page", "/skills"), CHIP.skills] };
      }
      if (category && category.id !== "all") {
        const list = skillsByCategory(category.id).sort((a, b) => b.level - a.level);
        return {
          reply: `**${category.label}** (${list.length}): ${joinList(list.slice(0, 14).map((s) => s.name))}${list.length > 14 ? ", and more" : ""}.`,
          chips: [go("Skills page", "/skills"), send(`${category.label} projects`, category.id === "machinelearning" ? "AI projects" : "Web projects")],
        };
      }
      const lines = skillCategories
        .filter((c) => c.id !== "all")
        .map((c) => {
          const list = skillsByCategory(c.id).sort((a, b) => b.level - a.level);
          return `- **${c.label}:** ${list.slice(0, 6).map((s) => s.name).join(", ")}`;
        });
      return {
        reply: [`${plural(all.length, "skill")} across three areas:`, ...lines].join("\n"),
        chips: [send("AI skills"), send("Web skills"), send("DevOps skills"), go("Skills page", "/skills")],
      };
    },
  },
  {
    id: "experience",
    priority: 53,
    score(ctx) {
      const base = scoreRules(ctx, RULES.experience);
      return findExperience(ctx.tokens) ? Math.max(base, 7) + 1 : base;
    },
    run(ctx) {
      const company = findExperience(ctx.tokens);
      if (ctx.phrase("how many")) {
        return {
          reply: `${plural(experiences.length, "role")} so far: ${experiences.map((e) => `${e.company} (${e.period})`).join("; ")}.`,
          chips: [go("Experience page", "/experience"), CHIP.resume],
        };
      }
      if (company) {
        return {
          reply: experienceDetail(company),
          chips: [go("Experience page", "/experience"), ...(company.companyUrl ? [ext("Company site", company.companyUrl)] : []), CHIP.resume],
        };
      }
      if (ctx.any("current", "currently", "now", "present", "latest")) {
        return {
          reply: experienceDetail(currentExperience()),
          chips: [go("Experience page", "/experience"), CHIP.resume, CHIP.availability],
        };
      }
      return {
        reply: [`${plural(experiences.length, "role")}, newest first:`, ...experiences.map((e) => `- ${experienceLine(e)}`)].join("\n"),
        chips: [go("Experience page", "/experience"), CHIP.resume, send("Current role", "What is his current role?")],
      };
    },
  },
  {
    id: "certifications",
    priority: 52,
    score: (ctx) => scoreRules(ctx, RULES.certifications),
    run(ctx) {
      const filtered = findCertifications(ctx.tokens);
      const page = go("Certifications page", "/certifications");
      if (ctx.phrase("how many")) {
        const ai = certifications.filter((c) => c.category === "ai-ml").length;
        const web = certifications.filter((c) => c.category === "web-dev").length;
        return { reply: `${plural(certifications.length, "certification")}: ${ai} AI and ML, ${web} web, ${certifications.length - ai - web} other.`, chips: [page] };
      }
      const list = filtered.length ? filtered : certifications;
      const lines = list.slice(0, 5).map((c) => `- ${c.title} (${c.issuer}, ${c.date})`);
      return {
        reply: [
          filtered.length ? `${plural(list.length, "match", "matches")}:` : `${plural(certifications.length, "certification")}, newest first:`,
          ...lines,
          list.length > 5 ? `...and ${list.length - 5} more on the page.` : "",
        ].filter(Boolean).join("\n"),
        chips: [page],
      };
    },
  },
  {
    id: "research",
    priority: 53,
    score: (ctx) => scoreRules(ctx, RULES.research),
    run() {
      const paper = researchPapers[0];
      const stats = (paper.highlights || []).slice(0, 2).map((h) => `${h.label}: ${h.value}`);
      const project = paper.projectId ? projects.find((p) => p.id === paper.projectId) : null;
      return {
        reply: [
          `**${paper.title}**, ${paper.venue} (${paper.year}, ${paper.status}).`,
          truncate(paper.summary, 190),
          stats.length ? `Headline numbers: ${stats.join("; ")}.` : "",
          paper.pdfUrl ? `[Read the PDF](${paper.pdfUrl}).` : "",
        ].filter(Boolean).join(" "),
        cards: project ? [projectCard(project)] : [],
        chips: [go("Research page", "/research"), ...(paper.pdfUrl ? [ext("Paper PDF", paper.pdfUrl)] : [])],
        meta: project ? { projectId: project.id } : undefined,
      };
    },
  },
  {
    id: "achievements",
    priority: 50,
    score: (ctx) => scoreRules(ctx, RULES.achievements),
    run(ctx) {
      const { total, visible, secret } = achievementCounts();
      const page = go("Achievements page", "/achievements");
      if (ctx.phrase("how many")) {
        return { reply: `${plural(total, "achievement")}: ${visible.length} visible and ${secret} secret.`, chips: [page, send("Easter eggs", "Any easter eggs?")] };
      }
      return {
        reply: [`${plural(total, "achievement")} to hunt (${secret} are secret). The visible ones:`, ...visible.slice(0, 8).map((a) => `- ${a.icon} **${a.title}:** ${a.description}`)].join("\n"),
        chips: [page, send("Easter eggs", "Any easter eggs?")],
      };
    },
  },
  {
    id: "site_stack",
    priority: 72,
    score(ctx) {
      const site = ctx.any("site", "website", "portfolio", "page", "app") && !ctx.any("build", "my", "client");
      const how = ctx.any("built", "made", "stack", "tech", "technology", "technologies", "framework", "powered", "coded", "developed", "created", "using");
      const refer = ctx.any("this", "the", "your", "his", "how", "what", "which");
      return site && how && refer && ctx.tokens.length <= 14 ? 8.8 : 0;
    },
    run() {
      const github = socialLinks.find((s) => s.name === "GitHub");
      return {
        reply: `This site runs on ${KURO_SITE_STACK}`,
        chips: [CHIP.skills, CHIP.projects, ...(github ? [ext("GitHub", github.url)] : [])],
      };
    },
  },
  {
    id: "site_help",
    priority: 66,
    score(ctx) {
      if (ctx.has("guestbook") && ctx.any("how", "what", "sign", "leave", "work", "works")) return 8.5;
      if (ctx.any("playground", "terminal", "cli") && ctx.any("how", "what", "use", "work", "works")) return 8.5;
      if (ctx.phrase("sudo hire me") || ctx.phrase("hire me command")) return 9;
      if ((ctx.any("hackmode", "crt", "berserk") || ctx.phrase("hack mode")) && ctx.any("how", "what", "why", "where") && !ctx.has("turn")) return 8.8;
      return 0;
    },
    run(ctx) {
      if (ctx.has("guestbook")) {
        return {
          reply: "The guestbook is a public wall. Leave a short message and it shows up for the next visitor (it also unlocks the **Signed The Wall** badge).",
          chips: [go("Open guestbook", "/guestbook"), CHIP.help],
        };
      }
      if (ctx.phrase("sudo hire me") || ctx.phrase("hire me command")) {
        return {
          reply: "That's a Playground CLI easter egg. Open the Playground and try it yourself.",
          chips: [go("Open Playground", "/playground"), send("Easter eggs", "Any easter eggs?")],
        };
      }
      if (ctx.any("playground", "terminal", "cli")) {
        return {
          reply: "The Playground is a terminal-style CLI. Type **help** to see the commands.",
          chips: [go("Open Playground", "/playground"), send("Easter eggs", "Any easter eggs?")],
        };
      }
      return {
        reply: "Hack mode turns the site into a CRT terminal. Say **hack mode** and I'll flip it, press Ctrl+Alt+H, or enter the Konami code.",
        chips: [send("Hack mode"), send("Normal mode")],
      };
    },
  },
  {
    id: "navigate",
    priority: 90,
    score(ctx) {
      const verb = ctx.any(...NAV_VERBS);
      const pages = findPages(ctx.tokens, { withVerb: verb });
      if (!pages.length || findProjects(ctx.tokens).length) return 0;
      const rest = leftoverTokens(ctx).filter((t) => !PAGE_WORD_STEMS.has(stem(t)) && !PAGE_VERB_STEMS.has(stem(t)));
      if (verb) return rest.length >= 1 ? 4 : 9;
      const onlyPage = ctx.tokens.every((t) => PAGE_WORD_STEMS.has(stem(t)) || NAV_FILLER.has(t));
      if (onlyPage) return 8.5;
      return ctx.has("page") && rest.length <= 1 ? 7 : 0;
    },
    run(ctx) {
      const verb = ctx.any(...NAV_VERBS);
      const page = findPages(ctx.tokens, { withVerb: verb })[0];
      const base = ctx.path.split("?")[0].split("#")[0];
      const already = page.path.split("#")[0] === base && !page.path.includes("#");
      const blurb = pageBlurb(page.id);
      if (already) return { reply: `You're already on **${page.label}**. ${blurb}`.trim(), chips: pageChips(page.id) };
      return {
        reply: `Opening **${page.label}**. ${blurb}`.trim(),
        actions: [navigateAction(page)],
        chips: pageChips(page.id),
      };
    },
  },
];
