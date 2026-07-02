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
  tags: string[];
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

  // ── 필터: 카테고리 토글(OR) × 태그 토글(OR) × 키워드 검색(교집합) ──
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  const [tagsExpanded, setTagsExpanded] = useState(false);

  const allTags = useMemo(() => {
    const freq = new Map<string, number>();
    for (const p of data.posts)
      for (const t of p.tags) freq.set(t, (freq.get(t) ?? 0) + 1);
    // localeCompare는 서버/브라우저 collation이 달라 hydration mismatch를 낸다 — 코드포인트 비교 고정
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
      .map(([t]) => t);
  }, [data.posts]);

  const TAG_PREVIEW = 14;
  const shownTags =
    tagsExpanded || allTags.length <= TAG_PREVIEW
      ? allTags
      : allTags.slice(0, TAG_PREVIEW).concat([...selectedTags].filter((t) => !allTags.slice(0, TAG_PREVIEW).includes(t)));

  const visibleIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    const noFilter =
      selectedCats.size === 0 && selectedTags.size === 0 && q === "";
    if (noFilter) return null; // null = 전체 표시

    // 1) 카테고리(OR) × 태그(OR) 필터 통과한 글
    const tagPosts = data.posts.filter(
      (p) =>
        (selectedCats.size === 0 || selectedCats.has(p.categoryLabel)) &&
        (selectedTags.size === 0 || p.tags.some((t) => selectedTags.has(t))),
    );
    const tagSlugs = new Set(tagPosts.map((p) => p.slug));

    // 2) 키워드: 글(제목·태그) 또는 개념(라벨) 매칭 + 소속 맥락 유지
    const ids = new Set<string>();
    if (q === "") {
      for (const p of tagPosts) ids.add(`post:${p.slug}`);
      for (const c of data.concepts)
        if (c.postSlug && tagSlugs.has(c.postSlug)) ids.add(c.id);
    } else {
      const matchedPosts = tagPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
      const matchedConcepts = data.concepts.filter(
        (c) =>
          (c.postSlug === null || tagSlugs.has(c.postSlug)) &&
          c.label.toLowerCase().includes(q),
      );
      for (const p of matchedPosts) ids.add(`post:${p.slug}`);
      for (const c of matchedConcepts) {
        ids.add(c.id);
        if (c.postSlug) ids.add(`post:${c.postSlug}`); // 매칭 개념의 소속 글
      }
      const matchedSlugs = new Set(matchedPosts.map((p) => p.slug));
      for (const c of data.concepts)
        if (c.postSlug && matchedSlugs.has(c.postSlug)) ids.add(c.id); // 매칭 글의 개념들
    }
    return ids;
  }, [data, selectedCats, selectedTags, query]);

  const filterActive = visibleIds !== null;
  const isVisible = (id: string) => visibleIds === null || visibleIds.has(id);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
    setSelected(null);
    setHovered(null);
  }
  function toggleCat(label: string) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
    setSelected(null);
    setHovered(null);
  }
  function resetFilters() {
    setSelectedCats(new Set());
    setSelectedTags(new Set());
    setQuery("");
    setSelected(null);
    setHovered(null);
  }

  const visibleCounts = useMemo(() => {
    let posts = 0;
    let concepts = 0;
    for (const n of nodes) {
      if (!isVisible(n.id)) continue;
      if (n.kind === "post") posts++;
      else concepts++;
    }
    return { posts, concepts };
  }, [nodes, visibleIds]);

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

  // 필터로 추려진 클러스터를 뷰포트 중앙으로 (레이아웃은 그대로, 뷰만 이동)
  let viewTransform = "translate(0px, 0px) scale(1)";
  if (filterActive) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const n of nodes) {
      if (!isVisible(n.id) || n.x == null || n.y == null) continue;
      minX = Math.min(minX, n.x - n.r);
      maxX = Math.max(maxX, n.x + n.r);
      minY = Math.min(minY, n.y - n.r);
      maxY = Math.max(maxY, n.y + n.r + 26); // 노드 아래 라벨 여유
    }
    if (minX !== Infinity) {
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      // 라벨(가로 최대 ±150px)이 잘리지 않을 만큼만 확대
      const fit = Math.min(W / (maxX - minX + 300), H / (maxY - minY + 80));
      const scale = Math.max(1, Math.min(1.5, fit));
      viewTransform = `translate(${W / 2}px, ${H / 2}px) scale(${scale}) translate(${-cx}px, ${-cy}px)`;
    }
  }

  return (
    <div className="graph-explorer">
      <div className="graph-toolbar">
        <input
          type="search"
          className="graph-search"
          placeholder="키워드로 찾기 (제목·태그·개념)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setHovered(null);
          }}
          aria-label="글·개념 키워드 검색"
        />
        {filterActive && (
          <span className="graph-count">
            글 {visibleCounts.posts} · 개념 {visibleCounts.concepts}
            <button type="button" className="graph-reset" onClick={resetFilters}>
              초기화 ×
            </button>
          </span>
        )}
      </div>
      <div className="graph-legend" role="group" aria-label="카테고리 필터">
        {data.legend.map((l) => (
          <button
            type="button"
            key={l.label}
            className={`legend-chip${selectedCats.has(l.label) ? " on" : ""}`}
            onClick={() => toggleCat(l.label)}
            aria-pressed={selectedCats.has(l.label)}
          >
            <span className="legend-dot" style={{ background: l.color }} />
            {l.label}
          </button>
        ))}
      </div>
      <div className="graph-tags">
        {shownTags.map((t) => (
          <button
            type="button"
            key={t}
            className={`tag-chip${selectedTags.has(t) ? " on" : ""}`}
            onClick={() => toggleTag(t)}
            aria-pressed={selectedTags.has(t)}
          >
            {t}
          </button>
        ))}
        {allTags.length > TAG_PREVIEW && (
          <button
            type="button"
            className="tag-chip tag-more"
            onClick={() => setTagsExpanded((v) => !v)}
          >
            {tagsExpanded ? "접기 ↑" : `+${allTags.length - TAG_PREVIEW} 더 보기`}
          </button>
        )}
      </div>
      {filterActive && visibleCounts.posts + visibleCounts.concepts === 0 && (
        <p className="graph-empty">일치하는 글·개념이 없어요. 다른 키워드나 태그를 시도해 보세요.</p>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="블로그 글·개념 지도"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        <g
          className="graph-viewport"
          style={{ transform: viewTransform, transformOrigin: "0 0" }}
        >
          <g>
            {links.map((l, i) => {
              const s = l.source as SimNode;
              const t = l.target as SimNode;
              if (s.x == null || t.x == null) return null;
              if (!isVisible(s.id) || !isVisible(t.id)) return null;
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
              if (!isVisible(n.id)) return null;
              const lit = litNodes ? litNodes.has(n.id) : true;
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
                </g>
              );
            })}
          </g>
          {/* 라벨은 별도 레이어 — 개념 라벨 위에 글 제목이 오도록 글 라벨을 맨 나중에 그린다 */}
          <g aria-hidden="true">
            {nodes.map((n) => {
              if (n.x == null || n.kind !== "concept") return null;
              if (!isVisible(n.id)) return null;
              const showLabel =
                filterActive || // 필터로 추려진 상태에선 개념 라벨을 모두 노출
                (litNodes ? litNodes.has(n.id) : n.r - 6 >= Math.min(labelThreshold, 8));
              if (!showLabel) return null;
              const lit = litNodes ? litNodes.has(n.id) : true;
              return (
                <text
                  key={n.id}
                  x={n.x}
                  y={(n.y ?? 0) + n.r + 14}
                  textAnchor="middle"
                  className="node-label"
                  opacity={lit ? 1 : 0.2}
                >
                  {n.label}
                </text>
              );
            })}
            {nodes.map((n) => {
              if (n.x == null || n.kind !== "post") return null;
              if (!isVisible(n.id)) return null;
              const lit = litNodes ? litNodes.has(n.id) : true;
              return (
                <text
                  key={n.id}
                  x={n.x}
                  y={(n.y ?? 0) + n.r + 14}
                  textAnchor="middle"
                  className="node-label-post"
                  opacity={lit ? 1 : 0.2}
                >
                  {n.label.length > 24 ? n.label.slice(0, 23) + "…" : n.label}
                </text>
              );
            })}
          </g>
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
        .graph-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .graph-search {
          flex: 1 1 240px;
          max-width: 340px;
          font: inherit;
          font-size: 14px;
          color: var(--ink);
          padding: 8px 14px;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 999px;
          outline: none;
          transition: border-color var(--dur) var(--ease);
        }
        .graph-search:focus {
          border-color: var(--accent);
        }
        .graph-count {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--ink-2);
        }
        .graph-reset {
          font: inherit;
          font-size: 12px;
          color: var(--ink-2);
          padding: 3px 10px;
          border: 1px dashed var(--border);
          border-radius: 999px;
          background: var(--surface);
          cursor: pointer;
          transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease);
        }
        .graph-reset:hover {
          color: var(--accent);
          border-color: var(--accent);
        }
        .graph-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }
        .tag-chip {
          font: inherit;
          font-size: 12px;
          color: var(--ink-2);
          padding: 3px 11px;
          border: 1px dashed var(--border);
          border-radius: 999px;
          background: var(--surface);
          cursor: pointer;
          transition: all var(--dur) var(--ease);
        }
        .tag-chip:hover {
          color: var(--ink);
          border-color: var(--ink-3);
        }
        .tag-chip.on {
          color: var(--accent);
          border: 1.5px solid var(--accent);
          background: color-mix(in srgb, var(--accent) 10%, var(--surface));
        }
        .tag-more {
          color: var(--ink-3);
          border-style: solid;
        }
        .graph-empty {
          margin: 0 0 10px;
          font-size: 14px;
          color: var(--ink-3);
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
          font: inherit;
          font-size: 12px;
          color: var(--ink-2);
          padding: 3px 11px;
          border: 1px dashed var(--border);
          border-radius: 999px;
          background: var(--surface);
          cursor: pointer;
          transition: all var(--dur) var(--ease);
        }
        .legend-chip:hover {
          color: var(--ink);
          border-color: var(--ink-3);
        }
        .legend-chip.on {
          color: var(--accent);
          border: 1.5px solid var(--accent);
          background: color-mix(in srgb, var(--accent) 10%, var(--surface));
        }
        .graph-viewport {
          transition: transform 0.45s var(--ease, ease);
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
