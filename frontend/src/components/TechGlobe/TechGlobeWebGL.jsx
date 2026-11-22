import { memo, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSkills } from "../../data/skills";
import { useTheme } from "../../context/ThemeContext";
import { useMotionPolicy } from "../../hooks/useMotionPolicy";

const MAX_NODES = 28;
const DOT_COUNT = 1400;

function cssColor(name, fallback) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}

function buildNodes(skills) {
  const curated = skills
    .filter((skill) => skill.level >= 50 || skill.projectIds?.length)
    .sort(
      (a, b) =>
        (b.projectIds?.length || 0) - (a.projectIds?.length || 0) || b.level - a.level,
    )
    .slice(0, MAX_NODES);

  const golden = Math.PI * (3 - Math.sqrt(5));
  return curated.map((skill, index) => {
    const y = 1 - (index / Math.max(curated.length - 1, 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * index;
    return {
      id: skill.id,
      label: skill.name,
      projectIds: skill.projectIds || [],
      strength: Math.min(1, 0.5 + skill.level / 140),
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
    };
  });
}

function sharedProjects(a, b) {
  if (!a.projectIds.length || !b.projectIds.length) return 0;
  const set = new Set(a.projectIds);
  return b.projectIds.reduce((n, id) => n + (set.has(id) ? 1 : 0), 0);
}

/**
 * Halftone WebGL skills globe. Lazy-loaded; pauses offscreen.
 */
const TechGlobeWebGL = memo(function TechGlobeWebGL() {
  const mountRef = useRef(null);
  const labelRef = useRef(null);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const policy = useMotionPolicy();
  const nodes = useMemo(() => buildNodes(getAllSkills()), []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || policy === "reduced") return undefined;

    let disposed = false;
    let raf = 0;
    let renderer;
    let scene;
    let camera;
    let sphere;
    let nodeGroup;
    let lineGroup;
    let three;
    let raycaster;
    let pointer = { x: 0, y: 0, down: false, lx: 0, ly: 0, vx: 0, vy: 0 };
    let rot = { x: -0.28, y: 0.4, vx: 0.0032, vy: 0 };
    let hovered = null;
    let inView = true;
    let width = 1;
    let height = 1;

    const nodeMeshes = [];

    const setLabel = (text) => {
      if (labelRef.current) labelRef.current.textContent = text || "Skills × projects";
    };

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      if (!renderer || !camera) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const paint = () => {
      if (!renderer || !scene || !camera || !sphere) return;
      if (!pointer.down) {
        rot.y += rot.vx;
        rot.x += rot.vy;
        rot.vx += (0.0032 - rot.vx) * 0.02;
        rot.vy *= 0.94;
      }
      rot.x = Math.max(-0.9, Math.min(0.9, rot.x));
      sphere.rotation.y = rot.y;
      sphere.rotation.x = rot.x;
      if (nodeGroup) {
        nodeGroup.rotation.y = rot.y;
        nodeGroup.rotation.x = rot.x;
      }
      if (lineGroup) {
        lineGroup.rotation.y = rot.y;
        lineGroup.rotation.x = rot.x;
      }
      // Nodes breathe out of phase so the stack feels alive; the hovered one pops.
      const now = performance.now() / 1000;
      nodeMeshes.forEach((mesh, i) => {
        const base = 0.7 + (mesh.userData.strength || 0.5) * 0.55;
        const target = mesh === hovered ? 1.75 : base * (1 + Math.sin(now * 1.6 + i * 0.9) * 0.1);
        mesh.scale.setScalar(mesh.scale.x + (target - mesh.scale.x) * 0.18);
      });
      renderer.render(scene, camera);
    };

    const loop = () => {
      raf = 0;
      if (disposed || !inView || document.hidden) return;
      paint();
      raf = requestAnimationFrame(loop);
    };

    const ensure = () => {
      if (!raf && inView && !document.hidden && !disposed) {
        raf = requestAnimationFrame(loop);
      }
    };

    const boot = async () => {
      three = await import("three");
      if (disposed) return;

      const {
        Scene,
        PerspectiveCamera,
        WebGLRenderer,
        Color,
        BufferGeometry,
        Float32BufferAttribute,
        PointsMaterial,
        Points,
        Group,
        SphereGeometry,
        MeshBasicMaterial,
        Mesh,
        LineBasicMaterial,
        LineSegments,
        Raycaster,
        Vector2,
      } = three;

      scene = new Scene();
      camera = new PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.z = 4.2;

      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);
      renderer.domElement.className = "block h-full w-full touch-none cursor-none";
      renderer.domElement.setAttribute("aria-label", "Interactive skills globe");
      renderer.domElement.setAttribute("role", "img");

      raycaster = new Raycaster();
      raycaster.params.Points = { threshold: 0.08 };

      const ink = hexToRgb(cssColor("--color-on-surface", "#131316"));
      const accent = hexToRgb(cssColor("--color-brand-accent", "#e4b41a"));
      const muted = hexToRgb(cssColor("--color-text-muted", "#65646a"));

      // Halftone shell
      const positions = new Float32Array(DOT_COUNT * 3);
      const sizes = new Float32Array(DOT_COUNT);
      for (let i = 0; i < DOT_COUNT; i += 1) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 1.35;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        sizes[i] = 0.6 + Math.random() * 1.4;
      }
      const shellGeo = new BufferGeometry();
      shellGeo.setAttribute("position", new Float32BufferAttribute(positions, 3));
      const shellMat = new PointsMaterial({
        color: new Color(ink[0], ink[1], ink[2]),
        size: 0.028,
        sizeAttenuation: true,
        transparent: true,
        opacity: theme === "dark" ? 0.55 : 0.42,
        depthWrite: false,
      });
      sphere = new Points(shellGeo, shellMat);
      scene.add(sphere);

      nodeGroup = new Group();
      lineGroup = new Group();
      scene.add(lineGroup);
      scene.add(nodeGroup);

      const nodeGeo = new SphereGeometry(0.045, 12, 12);
      nodes.forEach((node) => {
        const mat = new MeshBasicMaterial({
          color: new Color(ink[0], ink[1], ink[2]),
        });
        const mesh = new Mesh(nodeGeo, mat);
        mesh.position.set(node.x * 1.42, node.y * 1.42, node.z * 1.42);
        mesh.userData = node;
        mesh.scale.setScalar(0.7 + node.strength * 0.55);
        nodeGroup.add(mesh);
        nodeMeshes.push(mesh);
      });

      const linePositions = [];
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const share = sharedProjects(nodes[i], nodes[j]);
          if (!share) continue;
          const a = nodes[i];
          const b = nodes[j];
          linePositions.push(
            a.x * 1.42,
            a.y * 1.42,
            a.z * 1.42,
            b.x * 1.42,
            b.y * 1.42,
            b.z * 1.42,
          );
        }
      }
      if (linePositions.length) {
        const lineGeo = new BufferGeometry();
        lineGeo.setAttribute("position", new Float32BufferAttribute(new Float32Array(linePositions), 3));
        const lineMat = new LineBasicMaterial({
          color: new Color(muted[0], muted[1], muted[2]),
          transparent: true,
          opacity: 0.35,
        });
        lineGroup.add(new LineSegments(lineGeo, lineMat));
      }

      const accentColor = new Color(accent[0], accent[1], accent[2]);
      const inkColor = new Color(ink[0], ink[1], ink[2]);

      const pick = (clientX, clientY) => {
        const rect = renderer.domElement.getBoundingClientRect();
        const ndc = new Vector2(
          ((clientX - rect.left) / rect.width) * 2 - 1,
          -((clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(nodeMeshes, false);
        return hits[0]?.object || null;
      };

      const setHover = (mesh) => {
        if (hovered === mesh) return;
        if (hovered) {
          hovered.material.color.copy(inkColor);
        }
        hovered = mesh;
        if (hovered) {
          hovered.material.color.copy(accentColor);
          setLabel(hovered.userData.label);
        } else {
          setLabel(null);
        }
      };

      const onPointerDown = (event) => {
        pointer.down = true;
        pointer.lx = event.clientX;
        pointer.ly = event.clientY;
        pointer.vx = 0;
        pointer.vy = 0;
        renderer.domElement.setPointerCapture?.(event.pointerId);
        ensure();
      };
      const onPointerMove = (event) => {
        if (pointer.down) {
          const dx = event.clientX - pointer.lx;
          const dy = event.clientY - pointer.ly;
          rot.y += dx * 0.005;
          rot.x += dy * 0.0035;
          pointer.vx = dx * 0.0007;
          pointer.vy = dy * 0.00045;
          pointer.lx = event.clientX;
          pointer.ly = event.clientY;
        } else {
          setHover(pick(event.clientX, event.clientY));
        }
        ensure();
      };
      const onPointerUp = () => {
        pointer.down = false;
        rot.vx = pointer.vx || 0.0032;
        rot.vy = pointer.vy || 0;
      };
      const onClick = (event) => {
        const mesh = pick(event.clientX, event.clientY);
        if (mesh?.userData?.id) {
          navigate(`/skills?skill=${encodeURIComponent(mesh.userData.id)}`);
        }
      };

      renderer.domElement.addEventListener("pointerdown", onPointerDown);
      renderer.domElement.addEventListener("pointermove", onPointerMove);
      renderer.domElement.addEventListener("pointerup", onPointerUp);
      renderer.domElement.addEventListener("pointerleave", () => {
        setHover(null);
        onPointerUp();
      });
      renderer.domElement.addEventListener("click", onClick);

      const observer = new IntersectionObserver(
        ([entry]) => {
          inView = Boolean(entry?.isIntersecting);
          if (inView) ensure();
        },
        { threshold: 0.12 },
      );
      observer.observe(mount);

      const onVisibility = () => {
        if (!document.hidden) ensure();
      };
      document.addEventListener("visibilitychange", onVisibility);

      const ro = new ResizeObserver(resize);
      ro.observe(mount);
      resize();
      ensure();

      mount.__cleanup = () => {
        renderer.domElement.removeEventListener("pointerdown", onPointerDown);
        renderer.domElement.removeEventListener("pointermove", onPointerMove);
        renderer.domElement.removeEventListener("pointerup", onPointerUp);
        renderer.domElement.removeEventListener("click", onClick);
        document.removeEventListener("visibilitychange", onVisibility);
        observer.disconnect();
        ro.disconnect();
      };
    };

    boot();

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      mount.__cleanup?.();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
      nodeMeshes.forEach((mesh) => {
        mesh.geometry?.dispose?.();
        mesh.material?.dispose?.();
      });
    };
  }, [navigate, nodes, policy, theme]);

  return (
    <div className="relative w-full max-w-[640px] aspect-[1.15] min-h-[340px]">
      <div
        ref={mountRef}
        className="absolute inset-0 lg:-right-12 xl:-right-20"
        data-intro-globe-target
      />
      <div className="pointer-events-none absolute left-0 top-0 flex flex-col gap-2">
        <span className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-text-muted">
          Live stack
        </span>
        <span
          ref={labelRef}
          className="font-headline-md text-sm md:text-base normal-case tracking-tight text-on-background"
        >
          Skills × projects
        </span>
      </div>
      <p className="pointer-events-none absolute bottom-0 left-0 font-label-bold text-[10px] uppercase tracking-[0.16em] text-text-muted">
        Drag · click a node
      </p>
    </div>
  );
});

export default TechGlobeWebGL;
