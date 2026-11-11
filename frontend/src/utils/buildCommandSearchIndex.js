import {
  HiOutlineFolderOpen,
  HiOutlineCode,
  HiOutlineBriefcase,
  HiOutlineLink,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineBadgeCheck,
  HiOutlineCash,
  HiOutlineBookOpen,
} from "react-icons/hi";
import { projects } from "../data/projects";
import { getAllSkills } from "../data/skills";
import { experiences, socialLinks, aboutInfo } from "../data/experience";
import { CASE_STUDIES } from "../data/caseStudies";
import { SERVICES_GUIDES, SERVICES_PACKAGES, WEB_PACKAGES } from "../data/services";
import { researchPapers } from "../data/research";
import { certifications } from "../data/certifications";
import { staticNavCommands } from "./commandPaletteStatic";

export function buildCommandSearchIndex() {
  const index = [...staticNavCommands];

  projects.forEach((project) => {
    index.push({
      id: `project-${project.id}`,
      label: project.title,
      action: `/projects?highlight=${project.id}`,
      type: "project",
      icon: HiOutlineFolderOpen,
      keywords: `${(project.tags || []).join(" ")} ${project.description || ""}`,
    });
  });

  CASE_STUDIES.forEach((study) => {
    index.push({
      id: `work-${study.slug}`,
      label: `Case study: ${study.title}`,
      action: `/work/${study.slug}`,
      type: "case-study",
      icon: HiOutlineDocumentText,
      keywords: `${(study.stack || []).join(" ")} ${study.oneLiner || ""} ${study.problem || ""} case study work`,
    });
  });

  SERVICES_GUIDES.forEach((guide) => {
    index.push({
      id: `guide-${guide.slug}`,
      label: guide.title,
      action: `/guides/${guide.slug}`,
      type: "guide",
      icon: HiOutlineBookOpen,
      keywords: `${guide.description || ""} guide services website`,
    });
  });

  [...SERVICES_PACKAGES, ...WEB_PACKAGES].forEach((pkg) => {
    index.push({
      id: `package-${pkg.id}`,
      label: pkg.name,
      action: "/services",
      type: "service",
      icon: HiOutlineCash,
      keywords: `${pkg.forWho || ""} ${pkg.timeline || ""} ${(pkg.includes || []).join(" ")} hire services package`,
    });
  });

  researchPapers.forEach((paper) => {
    index.push({
      id: `research-${paper.id}`,
      label: paper.title,
      action: "/research",
      type: "research",
      icon: HiOutlineAcademicCap,
      keywords: `${paper.summary || ""} ${paper.category || ""} ${(paper.keywords || []).join(" ")} research paper`,
    });
  });

  certifications.forEach((cert) => {
    index.push({
      id: `cert-${cert.id}`,
      label: cert.title,
      action: "/certifications",
      type: "certification",
      icon: HiOutlineBadgeCheck,
      keywords: `${cert.issuer || ""} ${cert.description || ""} ${cert.badge || ""} ${cert.tag || ""}`,
    });
  });

  getAllSkills().forEach((skill) => {
    index.push({
      id: `skill-${skill.id}`,
      label: skill.name,
      action: `/skills?skill=${skill.id}`,
      type: "skill",
      icon: HiOutlineCode,
      keywords: skill.description || "",
    });
  });

  experiences.forEach((experience) => {
    index.push({
      id: `exp-${experience.id}`,
      label: `${experience.position} at ${experience.company}`,
      action: "/experience",
      type: "experience",
      icon: HiOutlineBriefcase,
      keywords: `${(experience.technologies || []).join(" ")} ${(experience.responsibilities || []).join(" ")}`,
    });
  });

  socialLinks.forEach((social) => {
    index.push({
      id: `social-${social.name}`,
      label: social.name,
      action: social.url,
      type: "link",
      icon: HiOutlineLink,
      isExternal: true,
    });
  });

  if (aboutInfo.resumeUrl) {
    index.push({
      id: "doc-resume",
      label: "Resume",
      action: aboutInfo.resumeUrl,
      type: "document",
      icon: HiOutlineDocumentText,
      isExternal: true,
    });
  }

  return index;
}
