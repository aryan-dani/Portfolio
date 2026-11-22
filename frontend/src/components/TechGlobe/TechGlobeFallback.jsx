import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllSkills } from "../../data/skills";
import { Tag } from "../ui";

const TechGlobeFallback = memo(function TechGlobeFallback() {
  const topSkills = useMemo(
    () =>
      getAllSkills()
        .sort(
          (a, b) =>
            (b.projectIds?.length || 0) - (a.projectIds?.length || 0) || b.level - a.level,
        )
        .slice(0, 16),
    [],
  );

  return (
    <div
      className="relative w-full max-w-[620px] min-h-[280px] sm:min-h-[320px] border border-outline-variant bg-surface p-5 flex flex-col gap-4"
      data-intro-globe-target
    >
      <div className="flex items-end justify-between gap-3 border-b border-outline pb-3">
        <div className="flex flex-col gap-1">
          <span className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-text-muted">
            Live stack
          </span>
          <span className="font-headline-md text-base normal-case tracking-tight">
            Skills × projects
          </span>
        </div>
        <span className="font-label-bold text-[10px] uppercase tracking-[0.16em] text-text-muted">
          Tap a skill
        </span>
      </div>
      <div className="flex flex-wrap gap-2 content-start flex-1">
        {topSkills.map((skill) => (
          <Link key={skill.id} to={`/skills?skill=${encodeURIComponent(skill.id)}`}>
            <Tag className="hover:bg-primary-container hover:text-on-primary-container transition-colors">
              {skill.name}
            </Tag>
          </Link>
        ))}
      </div>
    </div>
  );
});

export default TechGlobeFallback;
