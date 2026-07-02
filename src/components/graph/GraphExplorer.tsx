import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

export interface GraphViewPost {
  slug: string;
  title: string;
  categoryLabel: string;
  color: string;
}
export interface GraphViewConcept {
  id: string;
  label: string;
  postSlug: string | null;
  degree: number;
  communityName: string;
  color: string;
}
export interface GraphViewEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
  confidence: string;
}
export interface GraphViewData {
  posts: GraphViewPost[];
  concepts: GraphViewConcept[];
  edges: GraphViewEdge[];
  legend: { label: string; color: string }[];
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  kind: "post" | "concept";
  label: string;
  color: string;
  r: number;
  slug: string | null; // 이동 대상 포스트
  communityName?: string;
}
interface SimLink extends SimulationLinkDatum<SimNode> {
  relation: string;
  weight: number;
  confidence: string;
  ownership: boolean;
}

const W = 900;
const H = 640;

export default function GraphExplorer({ data }: { data: GraphViewData }) {
  const { nodes, links } = useMemo(() => {
    const nodes: SimNode[] = [
      ...data.posts.map((p) => ({
        id: `post:${p.slug}`,
        kind: "post" as const,
        label: p.title,
        color: p.color,
        r: 20,
        slug: p.slug,
      })),
      ...data.concepts.map((c) => ({
        id: c.id,
        kind: "concept" as const,
        label: c.label,
        color: c.color,
        r: 6 + Math.min(c.degree, 8),
        slug: c.postSlug,
        communityName: c.communityName,
      })),
    ];
    const ids = new Set(nodes.map((n) => n.id));
    const pairSeen = new Set<string>();
    const links: SimLink[] = [];
    for (const e of data.edges) {
      if (!ids.has(e.source) || !ids.has(e.target)) continue;
      pairSeen.add([e.source, e.target].sort().join("|"));
      links.push({
        source: e.source,
        target: e.target,
        relation: e.relation,
        weight: e.weight,
        confidence: e.confidence,
        ownership: e.source.startsWith("post:") || e.target.startsWith("post:"),
      });
    }
    // 명시 엣지가 없는 개념도 소속 포스트에 붙인다(소유 엣지 합성).
    for (const c of data.concepts) {
      if (!c.postSlug || !ids.has(`post:${c.postSlug}`)) continue;
      const key = [c.id, `post:${c.postSlug}`].sort().join("|");
      if (pairSeen.has(key)) continue;
      pairSeen.add(key);
      links.push({
        source: `post:${c.postSlug}`,
        target: c.id,
        relation: "owns",
        weight: 1,
        confidence: "EXTRACTED",
        ownership: true,
      });
    }
    return { nodes, links };
  }, [data]);

  const [, setTick] = useState(0);
  const simDone = useRef(false);

  useEffect(() => {
    const sim = forceSimulation<SimNode>(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance((l) => (l.ownership ? 55 : 110))
          .strength((l) => (l.ownership ? 0.8 : 0.3)),
      )
      .force("charge", forceManyBody().strength(-120))
      .force("collide", forceCollide<SimNode>().radius((d) => d.r + 6))
      .force("center", forceCenter(W / 2, H / 2))
      .force("x", forceX(W / 2).strength(0.06))
      .force("y", forceY(H / 2).strength(0.08));
    sim.on("tick", () => {
      for (const n of nodes) {
        n.x = Math.max(n.r + 4, Math.min(W - n.r - 4, n.x ?? W / 2));
        n.y = Math.max(n.r + 4, Math.min(H - n.r - 4, n.y ?? H / 2));
      }
      setTick((t) => t + 1);
    });
    sim.on("end", () => {
      simDone.current = true;
    });
    return () => {
      sim.stop();
    };
  }, [nodes, links]);

  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const active = hovered ?? selected;

  // 하이라이트 집합: 활성 노드 + 이웃 + 그 사이 엣지
  const { litNodes, litLinks } = useMemo(() => {
    if (!active) return { litNodes: null, litLinks: null };
    const litNodes = new Set<string>([active]);
    const litLinks = new Set<SimLink>();
    for (const l of links) {
      const s = (l.source as SimNode).id ?? (l.source as unknown as string);
      const t = (l.target as SimNode).id ?? (l.target as unknown as string);
      if (s === active || t === active) {
        litNodes.add(s);
        litNodes.add(t);
        litLinks.add(l);
      }
    }
    return { litNodes, litLinks };
  }, [active, links]);

  const coarsePointer =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none)").matches;

  function onNodeClick(n: SimNode) {
    if (n.kind === "post") {
      // 터치 기기: 첫 탭은 하이라이트, 같은 노드 두 번째 탭에 이동
      if (coarsePointer && selected !== n.id) {
        setSelected(n.id);
        return;
      }
      window.location.assign(`/posts/${n.slug}`);
    } else {
      setSelected(selected === n.id ? null : n.id);
    }
  }

  const labelThreshold = useMemo(() => {
    const degrees = data.concepts.map((c) => c.degree).sort((a, b) => a - b);
    if (degrees.length === 0) return Infinity;
    return degrees[Math.floor(degrees.length * 0.75)];
  }, [data.concepts]);

  return (
    <div className="graph-explorer">
      <div className="graph-legend" aria-hidden="true">
        {data.legend.map((l) => (
          <span key={l.label} className="legend-chip">
            <span className="legend-dot" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="블로그 글·개념 지도"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        <g>
          {links.map((l, i) => {
            const s = l.source as SimNode;
            const t = l.target as SimNode;
            if (s.x == null || t.x == null) return null;
            const lit = litLinks ? litLinks.has(l) : true;
            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="var(--ink-3)"
                strokeWidth={l.ownership ? 1 : 1.5}
                strokeDasharray={
                  l.ownership ? "2 5" : l.confidence === "INFERRED" ? "6 4" : undefined
                }
                strokeLinecap="round"
                opacity={lit ? (l.ownership ? 0.35 : 0.3 + 0.4 * Math.min(l.weight, 1)) : 0.06}
              />
            );
          })}
        </g>
        <g>
          {nodes.map((n) => {
            if (n.x == null) return null;
            const lit = litNodes ? litNodes.has(n.id) : true;
            const showLabel =
              n.kind === "post" ||
              (litNodes ? litNodes.has(n.id) : n.r - 6 >= Math.min(labelThreshold, 8));
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                opacity={lit ? 1 : 0.2}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onNodeClick(n)}
                style={{ cursor: n.kind === "post" ? "pointer" : "default" }}
              >
                <circle
                  r={n.r}
                  fill={n.color}
                  fillOpacity={n.kind === "post" ? 1 : 0.45}
                  stroke="var(--ink)"
                  strokeWidth={n.kind === "post" ? 2 : 1.2}
                />
                {showLabel && (
                  <text
                    y={n.r + 14}
                    textAnchor="middle"
                    className={n.kind === "post" ? "node-label-post" : "node-label"}
                  >
                    {n.kind === "post" && n.label.length > 24
                      ? n.label.slice(0, 23) + "…"
                      : n.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <style>{`
        .graph-explorer svg {
          width: 100%;
          height: auto;
          min-height: 420px;
          display: block;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: var(--card-radius, 12px);
        }
        .graph-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        .legend-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--ink-2);
          padding: 2px 10px;
          border: 1px dashed var(--border);
          border-radius: 999px;
          background: var(--surface);
        }
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid var(--ink);
        }
        .graph-explorer .node-label,
        .graph-explorer .node-label-post {
          pointer-events: none;
        }
        .graph-explorer .node-label {
          font-size: 11px;
          fill: var(--ink-2);
          paint-order: stroke;
          stroke: var(--surface);
          stroke-width: 3px;
          stroke-linejoin: round;
        }
        .graph-explorer .node-label-post {
          font-family: var(--font-display);
          font-size: 13px;
          fill: var(--ink);
          paint-order: stroke;
          stroke: var(--surface);
          stroke-width: 4px;
          stroke-linejoin: round;
        }
      `}</style>
    </div>
  );
}
