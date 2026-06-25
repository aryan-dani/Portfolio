import {
  HiOutlineFolderOpen,
  HiOutlineCode,
  HiOutlineBriefcase,
  HiOutlineLink,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { projects } from "../data/projects";
import { getAllSkills } from "../data/skills";
import { experiences, socialLinks, aboutInfo } from "../data/experience";
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
