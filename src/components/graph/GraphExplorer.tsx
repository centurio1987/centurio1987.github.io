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
  /** 호버 시 펼쳐지는 연관 키워드(그래프 개념 상위 N, 없으면 태그) */
  keywords: string[];
  /** 제목·태그·전체 개념 라벨을 접어 넣은 검색용 소문자 텍스트 */
  searchText: string;
}
export interface GraphViewLink {
  source: string;
  target: string;
  /** 0~1. 선 굵기와 링크 거리를 정한다 */
  strength: number;
  kinds: ("concept" | "cites" | "series")[];
  shared: string[];
  seriesLabel?: string;
}
export interface GraphViewData {
  posts: GraphViewPost[];
  links: GraphViewLink[];
  legend: { label: string; color: string }[];
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  slug: string;
  label: string;
  categoryLabel: string;
  color: string;
  r: number;
  keywords: string[];
}
interface SimLink extends SimulationLinkDatum<SimNode> {
  strength: number;
  seriesOnly: boolean;
}

const W = 900;
const H = 640;

// 호버 시 펼쳐지는 키워드 부채(fan) 기하
const KW_GAP = 22; // 키워드 간 세로 간격
const KW_BASE = 100; // 노드에서 첫 키워드까지 가로 거리
const KW_BULGE = 12; // 가운데 키워드를 더 밀어내 호(arc)를 만든다
const KW_LABEL_W = 150; // 키워드 라벨 폭 추정치(부채가 뷰 밖으로 나가는지 판정용)

const TITLE_MAX = 18; // 제목 라벨은 짧게 — 길면 이웃 노드 라벨과 겹친다
const TITLE_PAD = 88; // 가운데 정렬 제목이 뷰박스 밖으로 잘리지 않을 좌우 여백

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export default function GraphExplorer({ data }: { data: GraphViewData }) {
  const { nodes, links } = useMemo(() => {
    const degree = new Map<string, number>();
    for (const l of data.links) {
      degree.set(l.source, (degree.get(l.source) ?? 0) + 1);
      degree.set(l.target, (degree.get(l.target) ?? 0) + 1);
    }
    const nodes: SimNode[] = data.posts.map((p) => ({
      id: `post:${p.slug}`,
      slug: p.slug,
      label: p.title,
      categoryLabel: p.categoryLabel,
      color: p.color,
      r: 18 + Math.min(degree.get(`post:${p.slug}`) ?? 0, 5) * 1.4,
      keywords: p.keywords,
    }));
    const ids = new Set(nodes.map((n) => n.id));
    const links: SimLink[] = data.links
      .filter((l) => ids.has(l.source) && ids.has(l.target))
      .map((l) => ({
        source: l.source,
        target: l.target,
        strength: l.strength,
        seriesOnly: l.kinds.length === 1 && l.kinds[0] === "series",
      }));
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
          .distance((l) => 190 - 90 * l.strength)
          .strength((l) => 0.12 + 0.5 * l.strength),
      )
      .force("charge", forceManyBody().strength(-720))
      .force("collide", forceCollide<SimNode>().radius((d) => d.r + 46))
      .force("center", forceCenter(W / 2, H / 2))
      .force("x", forceX(W / 2).strength(0.05))
      .force("y", forceY(H / 2).strength(0.07));

    // 노드를 뷰박스 안으로 클램핑. 제목은 노드 아래 가운데 정렬이라 좌우로도
    // 라벨 절반만큼(TITLE_PAD) 여백을 둬야 가장자리 글 제목이 잘리지 않는다.
    const clamp = () => {
      for (const n of nodes) {
        const padX = Math.max(n.r + 8, TITLE_PAD);
        n.x = Math.max(padX, Math.min(W - padX, n.x ?? W / 2));
        n.y = Math.max(n.r + 8, Math.min(H - n.r - 26, n.y ?? H / 2));
      }
    };

    // reduced-motion 가드(Phase C): settle 애니를 생략하고 고정 횟수만큼 즉시 tick 한 뒤
    // 정지 → 정적 배치 1회 렌더. d3 기본 시드는 결정적이라 배치가 재현 가능하다.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      sim.stop(); // 내부 타이머 즉시 정지(rAF/타이머 tick 루프 미실행)
      // settle 애니를 생략하되, 애니 경로와 **동일하게 매 tick 클램핑**하며 동기로 감는다.
      // (sim.tick(300)은 tick 사이 훅이 없어 한 번에 감기면 노드가 경계 밖으로 튀었다가
      //  끝에서 한꺼번에 경계로 눌려 배치가 달라진다 → 반드시 tick마다 clamp.)
      // 기본 alpha 감쇠의 자연 tick 수(≈300)만큼 감아 애니 최종 배치를 그대로 재현한다.
      for (let i = 0; i < 300; i++) {
        sim.tick();
        clamp();
      }
      simDone.current = true;
      setTick((t) => t + 1); // 정적 배치 1회 렌더
      return () => {
        sim.stop();
      };
    }

    sim.on("tick", () => {
      clamp();
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
      : allTags
          .slice(0, TAG_PREVIEW)
          .concat(
            [...selectedTags].filter(
              (t) => !allTags.slice(0, TAG_PREVIEW).includes(t),
            ),
          );

  const visibleIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    const noFilter =
      selectedCats.size === 0 && selectedTags.size === 0 && q === "";
    if (noFilter) return null; // null = 전체 표시

    // 카테고리(OR) × 태그(OR) × 검색어(제목·태그·개념 라벨) 교집합
    const ids = new Set<string>();
    for (const p of data.posts) {
      if (selectedCats.size > 0 && !selectedCats.has(p.categoryLabel)) continue;
      if (selectedTags.size > 0 && !p.tags.some((t) => selectedTags.has(t)))
        continue;
      if (q !== "" && !p.searchText.includes(q)) continue;
      ids.add(`post:${p.slug}`);
    }
    return ids;
  }, [data.posts, selectedCats, selectedTags, query]);

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

  const filterActive = visibleIds !== null;
  const isVisible = (id: string) => (visibleIds ? visibleIds.has(id) : true);

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

  const visibleCount = visibleIds ? visibleIds.size : nodes.length;

  const coarsePointer =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none)").matches;

  function openPost(n: SimNode) {
    window.location.assign(`/posts/${n.slug}`);
  }
  function onNodeClick(n: SimNode) {
    // 터치 기기: 첫 탭은 키워드 펼치기, 같은 노드 두 번째 탭에 이동
    if (coarsePointer && selected !== n.id) {
      setSelected(n.id);
      return;
    }
    openPost(n);
  }

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

  // ── 활성 글의 연관 키워드 부채 ──
  // 노드 옆으로 세로 정렬 + 가운데가 볼록한 호. 세로 간격이 고정이라 키워드끼리는 겹치지 않고,
  // 펼칠 방향(좌/우)은 **뷰박스를 벗어나지 않으면서 다른 글 노드를 적게 덮는 쪽**으로 고른다.
  // 노드 좌표는 tick마다 제자리에서 바뀌므로(참조 불변) memo 하지 않고 렌더마다 계산한다.
  function buildKeywordFan() {
    if (!active) return null;
    const node = nodes.find((n) => n.id === active);
    if (!node || node.x == null || node.y == null) return null;
    if (!isVisible(node.id)) return null;
    const kws = node.keywords;
    if (kws.length === 0) return null;

    const mid = (kws.length - 1) / 2;
    const reach = KW_BASE + KW_BULGE * mid;
    let shift = 0;
    const top = node.y - mid * KW_GAP;
    const bottom = node.y + mid * KW_GAP;
    if (top < 18) shift = 18 - top;
    else if (bottom > H - 18) shift = H - 18 - bottom;

    const cost = (s: 1 | -1) => {
      const far = node.x! + s * (reach + KW_LABEL_W);
      let c = far < 0 || far > W ? 100 : 0; // 뷰박스 밖은 사실상 금지
      for (const other of nodes) {
        if (other.id === node.id || other.x == null || other.y == null) continue;
        if (!isVisible(other.id)) continue;
        const dx = (other.x - node.x!) * s;
        if (dx < KW_BASE - 40 || dx > reach + KW_LABEL_W) continue;
        if (Math.abs(other.y - (node.y! + shift)) > mid * KW_GAP + 24) continue;
        c += 1;
      }
      return c;
    };
    const side: 1 | -1 = cost(1) <= cost(-1) ? 1 : -1;

    return {
      side,
      color: node.color,
      ox: node.x,
      oy: node.y,
      r: node.r,
      items: kws.map((label, i) => ({
        label,
        x: node.x! + side * (KW_BASE + KW_BULGE * (mid - Math.abs(i - mid))),
        y: node.y! + (i - mid) * KW_GAP + shift,
      })),
    };
  }
  const keywordFan = buildKeywordFan();

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
          aria-label="글 키워드 검색"
        />
        {filterActive && (
          <span className="graph-count">
            글 {visibleCount}
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
      <p className="graph-hint">
        선이 굵을수록 두 글의 연관이 강해요. 점선은 같은 시리즈의 이웃 화입니다.
        글에 포인터를 올리면 연관 키워드가 펼쳐집니다.
      </p>
      {filterActive && visibleCount === 0 && (
        <p className="graph-empty">일치하는 글이 없어요. 다른 키워드나 태그를 시도해 보세요.</p>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="group"
        aria-label="블로그 글 지도"
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
                  strokeWidth={1 + 2.4 * l.strength}
                  strokeDasharray={l.seriesOnly ? "6 5" : undefined}
                  strokeLinecap="round"
                  opacity={lit ? 0.3 + 0.45 * l.strength : 0.08}
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
                  className="post-node"
                  transform={`translate(${n.x},${n.y})`}
                  opacity={lit ? 1 : 0.14}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.label} — ${n.categoryLabel}`}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(n.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() => onNodeClick(n)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openPost(n);
                    }
                  }}
                >
                  <circle
                    r={n.r}
                    fill={n.color}
                    stroke="var(--ink)"
                    strokeWidth={2}
                  />
                </g>
              );
            })}
          </g>
          {/* 글 제목 라벨 */}
          <g aria-hidden="true">
            {nodes.map((n) => {
              if (n.x == null) return null;
              if (!isVisible(n.id)) return null;
              const lit = litNodes ? litNodes.has(n.id) : true;
              return (
                <text
                  key={n.id}
                  x={n.x}
                  y={(n.y ?? 0) + n.r + 14}
                  textAnchor="middle"
                  className="node-label-post"
                  opacity={lit ? 1 : 0.14}
                >
                  {truncate(n.label, TITLE_MAX)}
                </text>
              );
            })}
          </g>
          {/* 연관 키워드 부채 — 활성 글에만, 맨 위 레이어 */}
          {keywordFan && (
            <g className="kw-fan" key={active} aria-hidden="true">
              {keywordFan.items.map((k) => (
                <line
                  key={`l-${k.label}`}
                  x1={keywordFan.ox + keywordFan.side * keywordFan.r}
                  y1={keywordFan.oy}
                  x2={k.x}
                  y2={k.y}
                  stroke={keywordFan.color}
                  strokeWidth={1}
                  strokeLinecap="round"
                  opacity={0.45}
                />
              ))}
              {keywordFan.items.map((k) => (
                <circle
                  key={`c-${k.label}`}
                  cx={k.x}
                  cy={k.y}
                  r={3.5}
                  fill={keywordFan.color}
                  stroke="var(--surface)"
                  strokeWidth={1}
                />
              ))}
              {keywordFan.items.map((k) => (
                <text
                  key={`t-${k.label}`}
                  x={k.x + keywordFan.side * 9}
                  y={k.y + 4}
                  textAnchor={keywordFan.side === 1 ? "start" : "end"}
                  className="kw-label"
                >
                  {truncate(k.label, 22)}
                </text>
              ))}
            </g>
          )}
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
        .graph-hint {
          margin: 0 0 10px;
          font-size: 13px;
          color: var(--ink-3);
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
        .graph-explorer .post-node {
          cursor: pointer;
          outline: none;
        }
        .graph-explorer .post-node:focus-visible circle {
          stroke: var(--accent);
          stroke-width: 3.5;
        }
        .graph-explorer .node-label-post,
        .graph-explorer .kw-label {
          pointer-events: none;
        }
        .graph-explorer .node-label-post {
          font-family: var(--font-display);
          font-size: 12px;
          fill: var(--ink);
          paint-order: stroke;
          stroke: var(--surface);
          stroke-width: 4px;
          stroke-linejoin: round;
        }
        /* 키워드 부채는 표시 전용 — 포인터를 가로채면 호버가 깜빡인다 */
        .graph-explorer .kw-fan {
          pointer-events: none;
          animation: kw-in 200ms var(--ease, ease) both;
        }
        .graph-explorer .kw-label {
          font-size: 11.5px;
          fill: var(--ink-2);
          paint-order: stroke;
          stroke: var(--surface);
          stroke-width: 4.5px;
          stroke-linejoin: round;
        }
        @keyframes kw-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .graph-explorer .kw-fan { animation: none; }
          .graph-viewport { transition: none; }
        }
      `}</style>
    </div>
  );
}
