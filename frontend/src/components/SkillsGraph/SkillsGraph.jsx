import { memo, useMemo, useState } from "react";
import { useMotionPolicy } from "../../hooks/useMotionPolicy";

const MAX_SKILLS = 18;
const MAX_PROJECTS = 12;
const WIDTH = 960;
const HEIGHT = 520;
const PAD_Y = 36;
const SKILL_X = 160;
const PROJECT_X = 800;

function buildGraph(skills, projects) {
  const skillSlice = skills.slice(0, MAX_SKILLS);
  const skillNodes = skillSlice.map((skill) => ({
    id: `skill:${skill.id}`,
    type: "skill",
    label: skill.name,
    item: skill,
  }));

  const skillIds = new Set(skillSlice.map((skill) => skill.id));
  const connectedProjects = projects
    .filter((project) => project.skillIds?.some((skillId) => skillIds.has(skillId)))
    .slice(0, MAX_PROJECTS);

  const projectNodes = connectedProjects.map((project) => ({
    id: `project:${project.id}`,
    type: "project",
    label: project.title,
    item: project,
  }));

  const edges = [];
  connectedProjects.forEach((project) => {
    project.skillIds?.forEach((skillId) => {
      if (!skillIds.has(skillId)) return;
      edges.push({
        source: `skill:${skillId}`,
        target: `project:${project.id}`,
      });
    });
  });

  return { nodes: [...skillNodes, ...projectNodes], edges };
}

function layoutNodes(nodes) {
  const skills = nodes.filter((n) => n.type === "skill");
  const projects = nodes.filter((n) => n.type === "project");
  const place = (list, x) => {
    const n = Math.max(list.length, 1);
    const span = HEIGHT - PAD_Y * 2;
    return list.map((node, i) => ({
      ...node,
      x,
      y: PAD_Y + (n === 1 ? span / 2 : (i / (n - 1)) * span),
    }));
  };
  return [...place(skills, SKILL_X), ...place(projects, PROJECT_X)];
}

function TagFallback({ graph, hoveredId, setHoveredId, onSkillClick, onProjectClick }) {
  const skills = graph.nodes.filter((node) => node.type === "skill");
  const projects = graph.nodes.filter((node) => node.type === "project");
  const activeIds = useMemo(() => {
    if (!hoveredId) return new Set();
    return new Set(
      graph.edges
        .filter((edge) => edge.source === hoveredId || edge.target === hoveredId)
        .flatMap((edge) => [edge.source, edge.target]),
    );
  }, [graph.edges, hoveredId]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-wrap gap-2">
        {skills.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => onSkillClick(node.item)}
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="border-2 border-outline bg-primary-container px-3 py-2 font-label-bold text-xs text-on-primary-container shadow-[2px_2px_0_var(--shadow-color)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            {node.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {projects.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => onProjectClick(node.item.id)}
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`border-2 border-outline px-3 py-2 font-label-bold text-xs shadow-[2px_2px_0_var(--shadow-color)] transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 ${
              activeIds.has(node.id) || hoveredId === node.id
                ? "bg-primary-container text-on-primary-container"
                : "bg-on-background text-background"
            }`}
          >
            {node.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SvgGraph({ laidOut, edges, hoveredId, setHoveredId, onSkillClick, onProjectClick }) {
  const byId = useMemo(() => {
    const map = new Map();
    laidOut.forEach((n) => map.set(n.id, n));
    return map;
  }, [laidOut]);

  const linked = useMemo(() => {
    if (!hoveredId) return null;
    const ids = new Set([hoveredId]);
    edges.forEach((edge) => {
      if (edge.source === hoveredId || edge.target === hoveredId) {
        ids.add(edge.source);
        ids.add(edge.target);
      }
    });
    return ids;
  }, [edges, hoveredId]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-auto min-h-[320px] touch-manipulation"
      role="img"
      aria-label="Skills linked to projects"
    >
      <title>Skills linked to projects</title>
      {edges.map((edge) => {
        const a = byId.get(edge.source);
        const b = byId.get(edge.target);
        if (!a || !b) return null;
        const active = !linked || (linked.has(edge.source) && linked.has(edge.target));
        return (
          <path
            key={`${edge.source}-${edge.target}`}
            d={`M ${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x} ${b.y}`}
            fill="none"
            stroke="var(--color-outline)"
            strokeWidth={active ? 2.5 : 1}
            opacity={active ? 0.85 : 0.18}
          />
        );
      })}
      {laidOut.map((node) => {
        const isSkill = node.type === "skill";
        const active = !linked || linked.has(node.id);
        const w = Math.min(168, 18 + node.label.length * 7.2);
        const h = 28;
        return (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            opacity={active ? 1 : 0.28}
            className="cursor-none"
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => {
              if (isSkill) onSkillClick(node.item);
              else onProjectClick(node.item.id);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (isSkill) onSkillClick(node.item);
                else onProjectClick(node.item.id);
              }
            }}
          >
            <rect
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              fill={
                isSkill
                  ? "var(--color-primary-container)"
                  : "var(--color-on-background)"
              }
              stroke="var(--color-outline)"
              strokeWidth="2"
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fill={
                isSkill
                  ? "var(--color-on-primary-container)"
                  : "var(--color-background)"
              }
              style={{
                fontFamily: "var(--font-label-bold)",
                fontSize: 11,
                fontWeight: 700,
                pointerEvents: "none",
              }}
            >
              {node.label.length > 18 ? `${node.label.slice(0, 16)}…` : node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const SkillsGraph = memo(function SkillsGraph({ skills, projects, onSkillClick, onProjectClick }) {
  const [hoveredId, setHoveredId] = useState(null);
  const policy = useMotionPolicy();
  const graph = useMemo(() => buildGraph(skills, projects), [skills, projects]);
  const laidOut = useMemo(() => layoutNodes(graph.nodes), [graph.nodes]);
  const lite = policy !== "full";

  return (
    <section className="relative border-4 border-outline bg-surface p-5 md:p-7 shadow-[8px_8px_0_var(--shadow-color)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b-4 border-outline pb-4">
        <h3 className="font-headline-md text-2xl text-on-surface">Skills × Projects</h3>
        <span className="border-2 border-outline bg-primary-container px-2 py-1 font-label-bold text-[10px] text-on-primary-container">
          {lite ? "Linked list" : "Hover + click nodes"}
        </span>
      </div>

      {lite ? (
        <TagFallback
          graph={graph}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          onSkillClick={onSkillClick}
          onProjectClick={onProjectClick}
        />
      ) : (
        <SvgGraph
          laidOut={laidOut}
          edges={graph.edges}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          onSkillClick={onSkillClick}
          onProjectClick={onProjectClick}
        />
      )}
    </section>
  );
});

export default SkillsGraph;
