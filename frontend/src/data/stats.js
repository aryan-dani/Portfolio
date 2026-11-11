import { projects } from "./projects";
import { getAllSkills } from "./skills";
import { certifications } from "./certifications";

/** Counts for Home stats, derived from live data arrays. */
export const portfolioStats = {
  projects: projects.length,
  skills: getAllSkills().length,
  certifications: certifications.length,
};
