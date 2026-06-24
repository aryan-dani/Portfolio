import { memo, useMemo, useState } from "react";

function buildGraph(skills, projects) {
  const skillNodes = skills.map((skill) => ({
    id: `skill:${skill.id}`,
    type: "skill",
    label: skill.name,
    item: skill,
  }));

  const skillIds = new Set(skills.map((skill) => skill.id));
  const connectedProjects = projects.filter((project) =>
    project.skillIds?.some((skillId) => skillIds.has(skillId)),
  );

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

function GraphPanel({ graph, hoveredId, setHoveredId, onSkillClick, onProjectClick }) {
  const skills = graph.nodes.filter((node) => node.type === "skill").slice(0, 18);
  const projects = graph.nodes.filter((node) => node.type === "project").slice(0, 12);

  const activeProjectIds = new Set(
    hoveredId
      ? graph.edges
          .filter((edge) => edge.source === hoveredId || edge.target === hoveredId)
          .map((edge) => (edge.source.startsWith("project:") ? edge.source : edge.target))
      : [],
  );

  return (
    <div className="border-4 border-outline bg-[var(--color-surface)] p-5 md:p-7 shadow-[8px_8px_0_var(--shadow-color)]">
      <div className="mb-5 flex items-center justify-between border-b-4 border-outline pb-4">
        <h3 className="font-headline-md text-2xl uppercase text-[var(--color-on-surface)]">
          Knowledge Graph
        </h3>
        <span className="border-2 border-outline bg-[var(--color-primary-container)] px-2 py-1 font-label-bold text-[10px] uppercase text-[var(--color-on-primary-container)]">
          Linked Data
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-wrap gap-2">
          {skills.map((node) => (
            <button
              key={node.id}
              onClick={() => onSkillClick(node.item)}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="border-2 border-outline bg-[var(--color-primary-container)] px-3 py-2 font-label-bold text-xs uppercase text-[var(--color-on-primary-container)] shadow-[2px_2px_0_var(--shadow-color)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              {node.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {projects.map((node) => (
            <button
              key={node.id}
              onClick={() => onProjectClick(node.item.id)}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`border-2 border-outline px-3 py-2 font-label-bold text-xs uppercase shadow-[2px_2px_0_var(--shadow-color)] transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 ${
                activeProjectIds.has(node.id) || hoveredId === node.id
                  ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                  : "bg-[var(--color-on-background)] text-[var(--color-background)]"
              }`}
            >
              {node.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const SkillsGraph = memo(function SkillsGraph({ skills, projects, onSkillClick, onProjectClick }) {
  const [hoveredId, setHoveredId] = useState(null);
  const graph = useMemo(() => buildGraph(skills, projects), [skills, projects]);

  return (
    <section className="relative">
      <GraphPanel
        graph={graph}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        onSkillClick={onSkillClick}
        onProjectClick={onProjectClick}
      />
      <div className="absolute left-4 top-4 border-4 border-outline bg-[var(--color-surface)] px-3 py-2 font-label-bold text-[10px] uppercase tracking-[0.22em] text-[var(--color-on-surface)] shadow-[4px_4px_0_var(--shadow-color)]">
        Skills <span className="text-[var(--color-on-background)]">x</span> Projects
      </div>
      <div className="absolute bottom-4 right-4 border-4 border-outline bg-[var(--color-on-background)] px-3 py-2 font-label-bold text-[10px] uppercase tracking-[0.22em] text-[var(--color-background)]">
        Hover + Click Nodes
      </div>
    </section>
  );
});

export default SkillsGraph;
