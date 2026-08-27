import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  // DOM 전역(WheelEvent 등)을 가리지 않도록 별칭으로 받는다 — 601행이 진짜 DOM WheelEvent 를 쓴다.
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
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
  /** 기간 버킷 키. 활성 눈금 단위 기준 한 개만 — "2026" 또는 "2026-07" (KAN-051) */
  periodKey: string;
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
  /**
   * 기간 범위 게이지의 눈금 (KAN-051). **오름차순 연속** 도메인이라 글이 없는 칸도
   * count 0 으로 들어 있다 — 빠뜨리면 5월과 9월이 나란히 붙어 시간축이 거짓말을 한다.
   * 라벨·정렬·집계까지 서버에서 끝낸 상태로 온다(클라이언트 포맷은 hydration 위험).
   */
  periodBuckets: { key: string; label: string; count: number }[];
  /** 36개월(3년)까지는 "month", 넘으면 "year"로 접힌다 */
  periodMode: "year" | "month";
  /** 카운터 분모 — "글 12/29" */
  totalPosts: number;
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

/** 후보로 내보내는 키워드 수. 나머지는 커맨드 바에 입력해서 좁혀 찾는다. */
const KW_TOP = 10;

const bound = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/** 도움말(`?`) 본문. 상시 노출하면 지도가 첫 화면에서 밀려난다. */
const HELP_LINES = [
  "· 축은 서로 겹쳐 적용돼요 — 기간 AND 분류 AND 키워드. 키워드를 여러 개 고르면 모두 가진 글만 남습니다.",
  "· 원 하나가 글, 선은 두 글의 연관이고 굵을수록 강해요. 점선은 같은 시리즈의 이웃 화입니다.",
  "· 글에 포인터를 올리면 연관 키워드가 펼쳐지고, 누르면 바로 이동합니다.",
  "· 지도는 끌어서 옮기고, Ctrl(⌘)+휠이나 오른쪽 아래 버튼으로 확대·축소할 수 있어요.",
];

const TITLE_MAX = 18; // 제목 라벨은 짧게 — 길면 이웃 노드 라벨과 겹친다
const TITLE_PAD = 88; // 가운데 정렬 제목이 뷰박스 밖으로 잘리지 않을 좌우 여백

/**
 * 사용자 카메라 (KAN-049). 필터 fit 위에 한 겹 더 얹히는 변환이라 화면 좌표는
 * `p = k·(fit(world)) + (x,y)` 로 합성된다. 초기값은 반드시 순수 상수여야 한다 —
 * client:load 라 SSR/CSR 초기 렌더가 다르면 hydration 이 깨진다.
 */
interface View {
  k: number;
  x: number;
  y: number;
}
const IDENT_VIEW: View = { k: 1, x: 0, y: 0 };
const ZOOM_MAX = 4; // 합성 배율 K 의 상한
const LABEL_MIN_K = 0.7; // 이보다 축소하면 제목 라벨을 접는다(읽히지 않는 노이즈)

/**
 * 월드(레이아웃 공간) 크기 배율 (KAN-049).
 *
 * 원래 레이아웃은 매 tick 노드를 뷰포트(900×640) 안으로 눌러 담았다. 그래서 글이
 * 늘어도 지도가 넓어지지 않고 같은 상자에 더 빽빽하게 낄 뿐이었다 — 카드가 말하는
 * "확장돼도 조감"이 성립하려면 월드가 자라야 한다.
 *
 * 면적 ∝ 글 수 이므로 선형 배율은 sqrt. 하한 1 덕에 BASE_N 이하에서는 정확히
 * 900×640 이라 기존 배치가 그대로 재현된다(29편인 현재가 여기 해당).
 */
const BASE_N = 30;
const MAX_WORLD_SCALE = 3;
const worldScale = (n: number) =>
  Math.min(MAX_WORLD_SCALE, Math.max(1, Math.sqrt(n / BASE_N)));

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

/**
 * 키워드 라벨의 렌더 폭 추정(11.5px 기준). 한글·한자·가나는 글자 하나가 거의 한 em 을
 * 차지하지만 라틴/숫자는 절반쯤이라, 글자 수만 세면 한글 라벨을 크게 과소평가한다.
 * 측정이 아니라 문자열만 보고 계산하므로 SSR/CSR 결과가 같다.
 */
const KW_FONT = 11.5;
function estimateLabelWidth(s: string) {
  let em = 0;
  for (const ch of s) em += /[ᄀ-ᇿ　-鿿가-힯＀-｠]/.test(ch) ? 1 : 0.55;
  return em * KW_FONT;
}

export default function GraphExplorer({
  data,
  deco,
  decoFilter,
  decoHelp,
}: {
  data: GraphViewData;
  /**
   * 데코를 얹을 자리에 뚫어 둔 **구멍** 셋. Astro 의 named slot 이 prop 으로 들어온다
   * (`slot="deco"` · `"deco-filter"` · `"deco-help"` → kebab 은 camelCase 로 바뀐다).
   *
   * 아일랜드는 여기 뭐가 들어오는지 모른다 — 데코 부품은 전부 `.astro` 라 React
   * 안에 못 넣고, 바깥에서 절대배치하는 길은 각 블록의 y 가 커맨드 바 토큰 줄바꿈·
   * 도움말 토글·후보 칩 줄 수에 따라 움직여서 막혀 있다(부품이 허공에 뜬다).
   * 그래서 "이 블록과 정확히 같은 자리"라는 좌표계만 열어 주고 내용물은 채우는 쪽
   * (`graph.astro`)이 넘긴다 — `PostList` 의 `first-deco` 와 같은 짜임.
   *
   * 셋 다 같은 `.graph-deco`(inset:0 · pointer-events:none) 를 쓰지만 **지도 판만**
   * 배경(종이)을 깔기 때문에 거기서만 z 를 갈라야 한다(아래 .graph-stage 주석).
   */
  deco?: ReactNode;
  /** 후보 패널(필터 판)에 겹치는 구멍 */
  decoFilter?: ReactNode;
  /** 도움말 패널에 겹치는 구멍 — 패널이 열릴 때만 존재한다 */
  decoHelp?: ReactNode;
}) {
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

  // 월드 크기. 참조가 흔들리면 아래 시뮬 이펙트가 재시작해 배치가 달라지므로 memo 로 고정한다.
  const { worldW, worldH, wScale } = useMemo(() => {
    const s = worldScale(data.posts.length);
    return { worldW: W * s, worldH: H * s, wScale: s };
  }, [data.posts.length]);

  useEffect(() => {
    // 길이형 상수는 월드와 함께 커지고(scale 배), 가운데로 모으는 힘은 옅어진다(1/scale).
    // 이래야 월드가 커져도 노드가 한가운데 덩어리로 뭉치지 않고 넓어진 공간을 채운다.
    // wScale === 1 이면 모든 항이 기존 값과 정확히 같다(x*1 === x, x/1 === x).
    const sim = forceSimulation<SimNode>(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance((l) => (190 - 90 * l.strength) * wScale)
          .strength((l) => 0.12 + 0.5 * l.strength),
      )
      .force("charge", forceManyBody().strength(-720 * wScale))
      .force("collide", forceCollide<SimNode>().radius((d) => d.r + 46 * wScale))
      .force("center", forceCenter(worldW / 2, worldH / 2))
      .force("x", forceX(worldW / 2).strength(0.05 / wScale))
      .force("y", forceY(worldH / 2).strength(0.07 / wScale));

    // 노드를 월드 안으로 클램핑. 제목은 노드 아래 가운데 정렬이라 좌우로도
    // 라벨 절반만큼(TITLE_PAD) 여백을 둬야 가장자리 글 제목이 잘리지 않는다.
    // TITLE_PAD 는 스케일하지 않는다 — 라벨은 월드가 커져도 같은 폭이다.
    const clamp = () => {
      for (const n of nodes) {
        const padX = Math.max(n.r + 8, TITLE_PAD);
        n.x = Math.max(padX, Math.min(worldW - padX, n.x ?? worldW / 2));
        n.y = Math.max(n.r + 8, Math.min(worldH - n.r - 26, n.y ?? worldH / 2));
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
  }, [nodes, links, worldW, worldH, wScale]);

  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const active = hovered ?? selected;

  // ── 사용자 카메라 (KAN-049) ──
  const svgRef = useRef<SVGSVGElement>(null);
  // 월드 전체가 뷰포트에 들어오는 배율. 종횡비를 보존하므로 오프셋은 0이고,
  // 월드 == 뷰포트인 지금(29편)은 정확히 1이라 초기 화면이 예전과 같다.
  const k0 = 1 / wScale;
  const HOME = useMemo<View>(() => ({ k: k0, x: 0, y: 0 }), [k0]);
  const [view, setView] = useState<View>(HOME);

  // ── 필터 (커맨드 바 · 1e) ──
  // 축은 겹쳐 적용(AND): 기간 AND 분류 AND 키워드 AND 검색어.
  // 키워드끼리는 **AND** 다 — 여러 개 고르면 "모두 가진 글"만 남는다. OR 이면 고를수록
  // 결과가 넓어져 좁히는 도구로 읽히지 않는다.
  const buckets = data.periodBuckets;
  const lastIdx = Math.max(0, buckets.length - 1);
  /** null = 전체 구간(= 기간 필터 없음). 인덱스 쌍은 buckets 기준이며 항상 lo ≤ hi. */
  const [range, setRange] = useState<[number, number] | null>(null);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [selectedKws, setSelectedKws] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  const bucketIndex = useMemo(() => {
    const m = new Map<string, number>();
    buckets.forEach((b, i) => m.set(b.key, i));
    return m;
  }, [buckets]);

  const allTags = useMemo(() => {
    const freq = new Map<string, number>();
    for (const p of data.posts)
      for (const t of p.tags) freq.set(t, (freq.get(t) ?? 0) + 1);
    // localeCompare는 서버/브라우저 collation이 달라 hydration mismatch를 낸다 — 코드포인트 비교 고정
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
      .map(([t]) => t);
  }, [data.posts]);

  /** 축 하나를 가정치로 바꿔 세는 프로브. 후보 칩의 "누르면 몇 편" 숫자가 여기서 나온다. */
  const countHits = (cats: Set<string>, kws: Set<string>) => {
    const q = query.trim().toLowerCase();
    const kwList = [...kws];
    let n = 0;
    for (const p of data.posts) {
      if (range) {
        const i = bucketIndex.get(p.periodKey);
        if (i === undefined || i < range[0] || i > range[1]) continue;
      }
      if (cats.size > 0 && !cats.has(p.categoryLabel)) continue;
      if (kwList.length > 0 && !kwList.every((k) => p.tags.includes(k)))
        continue;
      if (q !== "" && !p.searchText.includes(q)) continue;
      n += 1;
    }
    return n;
  };

  const visibleIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    // 새 필터 축을 추가하면 이 조건에도 반드시 넣어야 한다 — 빠뜨리면 그 축만 고른
    // 상태가 null(=전체 표시)로 떨어져 필터가 조용히 무시된다.
    const noFilter =
      range === null &&
      selectedCats.size === 0 &&
      selectedKws.size === 0 &&
      q === "";
    if (noFilter) return null; // null = 전체 표시

    const kwList = [...selectedKws];
    const ids = new Set<string>();
    for (const p of data.posts) {
      if (range) {
        const i = bucketIndex.get(p.periodKey);
        if (i === undefined || i < range[0] || i > range[1]) continue;
      }
      if (selectedCats.size > 0 && !selectedCats.has(p.categoryLabel)) continue;
      if (kwList.length > 0 && !kwList.every((k) => p.tags.includes(k))) continue;
      if (q !== "" && !p.searchText.includes(q)) continue;
      ids.add(`post:${p.slug}`);
    }
    return ids;
  }, [data.posts, range, bucketIndex, selectedCats, selectedKws, query]);

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

  // 필터가 바뀌면 안쪽 fit 이 새 클러스터를 다시 중앙에 맞춘다. 이때 사용자 카메라가
  // 이전 팬 오프셋을 그대로 들고 있으면 새 클러스터가 화면 밖에 놓이므로 함께 되돌린다.
  // deps 는 visibleIds 가 아니라 필터 state 를 직접 나열한다 — visibleIds 는 memo 라
  // 실제로도 tick 에 안 흔들리지만, 그 안전성이 "memo 가 캐시된다"는 간접 추론에 기댄다.
  useEffect(() => {
    setView(HOME); // memo 참조라 이미 HOME 이면 React 가 리렌더를 건너뛴다
  }, [range, selectedCats, selectedKws, query, HOME]);

  function clearFocus() {
    setSelected(null);
    setHovered(null);
  }
  function toggleKw(tag: string) {
    setSelectedKws((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
    clearFocus();
  }
  function toggleCat(label: string) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
    clearFocus();
  }

  // ── 기간 범위 게이지 ──
  // 칩 토글이 아니라 "끌어서 구간을 잡는" 컨트롤이다. 잡는 대상이 셋이라 down 시점에
  // 무엇을 잡았는지 먼저 판정한다 — 구간 밖이면 새 구간 시작, 양 끝이면 그 손잡이,
  // 안쪽이면 구간 통째 이동.
  const [drag, setDrag] = useState<null | "lo" | "hi" | "band" | "new">(null);
  /** 손잡이를 한 번이라도 건드리면 유도 펄스를 끈다 */
  const [touched, setTouched] = useState(false);
  /**
   * 드래그 중 손끝의 연속 위치(칸 경계 단위, 0..칸수). 값은 칸에 스냅하지만 선은 이걸
   * 그린다 — 스냅 위치만 그리면 칸 하나(여기선 수백 px)만큼 커서와 벌어져 "안 따라온다".
   */
  const [live, setLive] = useState<number | null>(null);
  const grabRef = useRef<null | "lo" | "hi" | "band" | "new">(null);
  const anchorRef = useRef(0);
  /** 잡은 지점과 손잡이 사이의 간격. 빼주지 않으면 down 하는 순간 선이 손끝으로 튄다. */
  const offsetRef = useRef(0);
  /** 밴드 이동은 누적이 아니라 잡은 시점 기준 절대값으로 센다 — 반올림 드리프트가 없다. */
  const bandRef = useRef({ pos: 0, lo: 0, hi: 0 });
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [rLo, rHi] = range ?? [0, lastIdx];

  /** 전체 구간이면 null 로 접는다 — "전체 = 필터 없음"이 한 곳에서만 정의되도록. */
  function applyRange(lo: number, hi: number) {
    const a = Math.max(0, Math.min(lastIdx, lo));
    const b = Math.max(0, Math.min(lastIdx, hi));
    setRange(a === 0 && b === lastIdx ? null : [a, b]);
    clearFocus();
  }

  /** 트랙 안 포인터 위치를 '칸 경계' 연속 좌표(0..칸수)로. 정수면 칸과 칸 사이다. */
  function gaugePos(clientX: number) {
    const el = trackRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return bound((clientX - r.left) / (r.width || 1), 0, 1) * buckets.length;
  }

  function gaugeMove(clientX: number) {
    const raw = gaugePos(clientX);
    const grab = grabRef.current;
    if (raw == null || !grab) return;
    setLive(raw);
    if (grab === "band") {
      // 구간 길이를 유지한 채 평행 이동. 양 끝에서 멈추도록 델타를 먼저 가둔다.
      const b = bandRef.current;
      const d = bound(Math.round(raw - b.pos), -b.lo, lastIdx - b.hi);
      if (b.lo + d !== rLo) applyRange(b.lo + d, b.hi + d);
      return;
    }
    const p = raw - offsetRef.current;
    if (grab === "new") {
      const idx = bound(Math.floor(p), 0, lastIdx);
      const lo = Math.min(anchorRef.current, idx);
      const hi = Math.max(anchorRef.current, idx);
      if (lo !== rLo || hi !== rHi) applyRange(lo, hi);
      return;
    }
    // 손잡이가 서는 곳은 칸이 아니라 '가장 가까운 칸 경계'다. 칸 포함으로 재면 hi 손잡이가
    // 칸의 오른쪽 끝에 그려지는 탓에 언제나 한 칸씩 뒤처진다.
    const b = Math.round(p);
    if (grab === "lo") {
      const v = bound(b, 0, rHi);
      if (v !== rLo) applyRange(v, rHi);
    } else {
      const v = bound(b - 1, rLo, lastIdx);
      if (v !== rHi) applyRange(rLo, v);
    }
  }

  /** 손잡이를 잡을 때 손끝과 손잡이의 어긋남을 기록한다 — 잡는 순간 튀지 않도록. */
  function startHandle(side: "lo" | "hi", raw: number) {
    grabRef.current = side;
    offsetRef.current = raw - (side === "lo" ? rLo : rHi + 1);
    setDrag(side);
    setLive(raw);
    setTouched(true);
  }

  function gaugeDown(e: ReactPointerEvent<HTMLElement>) {
    const raw = gaugePos(e.clientX);
    if (raw == null) return;
    const idx = Math.min(lastIdx, Math.floor(raw));
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setTouched(true);
    if (idx < rLo || idx > rHi) {
      grabRef.current = "new";
      anchorRef.current = idx;
      offsetRef.current = 0;
      setDrag("new");
      setLive(raw);
      applyRange(idx, idx);
      return;
    }
    if (idx === rLo || idx === rHi) {
      startHandle(idx === rLo ? "lo" : "hi", raw);
      return;
    }
    grabRef.current = "band";
    offsetRef.current = 0;
    bandRef.current = { pos: raw, lo: rLo, hi: rHi };
    setDrag("band");
    setLive(raw);
  }

  function grabHandle(e: ReactPointerEvent<HTMLElement>, side: "lo" | "hi") {
    // 손잡이는 트랙 위에 얹혀 있다 — 전파를 끊지 않으면 트랙이 "칸 클릭"으로 덮어쓴다.
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    startHandle(side, gaugePos(e.clientX) ?? (side === "lo" ? rLo : rHi + 1));
  }

  function gaugeUp() {
    grabRef.current = null;
    offsetRef.current = 0;
    setDrag(null);
    setLive(null);
  }

  function nudge(side: "lo" | "hi", d: number) {
    if (side === "lo") applyRange(Math.min(Math.max(0, rLo + d), rHi), rHi);
    else applyRange(rLo, Math.max(Math.min(lastIdx, rHi + d), rLo));
  }

  /** 트랙 포커스: ←/→ 는 구간 통째 이동, Shift+←/→ 는 끝점만. 손잡이 포커스는 그 끝만. */
  function gaugeKey(e: ReactKeyboardEvent, side?: "lo" | "hi") {
    const d = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    setTouched(true);
    if (side) return nudge(side, d);
    if (e.shiftKey) return nudge("hi", d);
    const dd = Math.max(-rLo, Math.min(lastIdx - rHi, d));
    if (dd) applyRange(rLo + dd, rHi + dd);
  }

  const visibleCount = visibleIds ? visibleIds.size : nodes.length;

  const coarsePointer =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none)").matches;

  function openPost(n: SimNode) {
    window.location.assign(`/posts/${n.slug}`);
  }
  function onNodeClick(n: SimNode) {
    if (suppressClickRef.current) return; // 노드 위에서 시작한 팬 드래그였다
    // 터치 기기: 첫 탭은 키워드 펼치기, 같은 노드 두 번째 탭에 이동
    if (coarsePointer && selected !== n.id) {
      setSelected(n.id);
      return;
    }
    openPost(n);
  }

  // 필터로 추려진 클러스터를 뷰포트 중앙으로 (레이아웃은 그대로, 뷰만 이동).
  //
  // 이건 사용자 카메라(view)와 다른 슬롯이다 — 여기는 렌더마다 노드 좌표에서 다시
  // 계산하는 순수 파생값이라 settle 중 움직이는 클러스터를 저절로 따라간다. state 로
  // 굳히면 그 성질을 잃고, tick 마다 state 로 밀어넣으면 사용자 팬을 매 프레임 덮어쓴다.
  // 그래서 둘을 <g> 두 겹으로 합성한다: screen = 사용자카메라(필터fit(world)).
  let fitK = 1;
  let fitTx = 0;
  let fitTy = 0;
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
      // translate(W/2,H/2) scale(s) translate(-cx,-cy) 를 평탄화 → p = s·w + t
      fitK = scale;
      fitTx = W / 2 - scale * cx;
      fitTy = H / 2 - scale * cy;
    }
  }
  const viewTransform = `translate(${fitTx}px, ${fitTy}px) scale(${fitK})`;

  /**
   * 사용자 카메라를 유효 범위로 가둔다. 판정 기준은 사용자 배율 k 가 아니라 필터 fit 까지
   * 곱한 **합성 배율 K = k·fitK** 다 — 그래야 필터로 이미 확대된 상태에서 한 번 더 확대해도
   * 상한이 일관된다. 팬도 같은 기준이라 월드 바깥의 빈 공간이 화면에 들어오지 않는다.
   * 월드 == 뷰포트인 지금은 K 하한과 상한 사이 팬 구간이 한 점이라 줌1에서 이동량이 0이다.
   */
  function clampView(v: View): View {
    const kMin = k0 / fitK;
    const kMax = ZOOM_MAX / fitK;
    const k = Math.max(kMin, Math.min(kMax, v.k));
    // 월드가 stage(=fit 적용 후) 좌표에서 차지하는 구간
    const q0 = fitTx;
    const q1 = fitTx + worldW * fitK;
    const r0 = fitTy;
    const r1 = fitTy + worldH * fitK;
    // 화면 [0,W] 가 월드 안에 머무르도록: 0 ≥ k·q0 + x 이고 W ≤ k·q1 + x
    const xMin = W - k * q1;
    const xMax = -k * q0;
    const yMin = H - k * r1;
    const yMax = -k * r0;
    return {
      k,
      x: xMin <= xMax ? Math.max(xMin, Math.min(xMax, v.x)) : (xMin + xMax) / 2,
      y: yMin <= yMax ? Math.max(yMin, Math.min(yMax, v.y)) : (yMin + yMax) / 2,
    };
  }

  // 최신 카메라·클램프를 리스너에서 읽기 위한 통로. wheel 은 아래에서 non-passive 로
  // 직접 등록하는데, view 를 클로저로 잡으면 오래된 배율로 확대하게 된다.
  const clampRef = useRef(clampView);
  clampRef.current = clampView;

  /** 화면 좌표(clientX/Y)를 viewBox 단위로. min-height 때문에 레터박스가 생길 수 있어
   *  rect.width 로 나누는 수동 환산은 틀린다 — CTM 역행렬을 쓴다. */
  function toViewBox(clientX: number, clientY: number) {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  }

  /** 포인터 밑의 지점을 고정한 채 배율만 바꾼다. */
  function zoomAt(clientX: number, clientY: number, factor: number) {
    const p = toViewBox(clientX, clientY);
    setView((v) => {
      const k = v.k * factor;
      if (!p) return clampRef.current({ ...v, k });
      // 화면상 같은 점이 유지되려면 stage 좌표 q 가 불변이어야 한다: q = (p - t)/k
      const qx = (p.x - v.x) / v.k;
      const qy = (p.y - v.y) / v.k;
      return clampRef.current({ k, x: p.x - qx * k, y: p.y - qy * k });
    });
  }

  /** 버튼 줌 — 뷰포트 한가운데를 기준으로. */
  const [animating, setAnimating] = useState(false);
  function zoomByButton(factor: number) {
    setAnimating(true);
    setView((v) => {
      const k = v.k * factor;
      const qx = (W / 2 - v.x) / v.k;
      const qy = (H / 2 - v.y) / v.k;
      return clampRef.current({ k, x: W / 2 - qx * k, y: H / 2 - qy * k });
    });
  }
  function resetView() {
    setAnimating(true);
    setView(HOME);
  }

  // 휠은 ctrl/meta 를 눌렀을 때만 줌으로 쓴다. 평소 휠까지 가로채면 글 페이지에서
  // 스크롤이 지도에 갇힌다. 맥 트랙패드 핀치가 ctrl+wheel 로 합성되므로 확대가 공짜로 붙는다.
  // React 는 root 에 wheel 을 passive 로 걸어 onWheel 안의 preventDefault 가 무시된다 →
  // 반드시 직접 등록한다. view 는 클로저 대신 setView 함수형 업데이트로 최신값을 받는다.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // 평 휠은 페이지 스크롤로 통과
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.002));
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 드래그 팬 ──
  // 팬 드래그가 끝나면 click 이 뒤따라 발생해 글이 열려버린다. 이동 거리가 임계값을
  // 넘은 순간에만 드래그로 판정하고 그 click 을 억제한다. 캡처도 그때 건다 —
  // pointerdown 에서 바로 캡처하면 mouseup 타깃이 svg 로 바뀌어 노드 클릭이 통째로 죽는다.
  const DRAG_THRESHOLD = 5; // client px
  const dragRef = useRef<{
    id: number;
    cx: number;
    cy: number;
    vx: number;
    vy: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  function endDrag() {
    const svg = svgRef.current;
    const d = dragRef.current;
    if (d && svg?.hasPointerCapture?.(d.id)) svg.releasePointerCapture(d.id);
    dragRef.current = null;
    setDragging(false);
  }

  // 지금 화면에 보이는 월드 영역. 화면 p = K·world + T (K = view.k·fitK) 를 뒤집어 얻는다.
  // 부채가 "밖으로 나갔는지"를 판정하는 기준은 고정된 뷰박스가 아니라 이 사각형이다 —
  // 확대·이동하면 보이는 범위가 달라지므로 W·H 를 그대로 쓰면 부채가 화면을 벗어난다.
  const K = view.k * fitK;
  const TX = view.x + view.k * fitTx;
  const TY = view.y + view.k * fitTy;
  const viewRect = {
    x0: -TX / K,
    x1: (W - TX) / K,
    y0: -TY / K,
    y1: (H - TY) / K,
  };

  /** 키보드로 옮겨온 노드가 화면 밖이면 최소한으로 끌어당긴다(포커스 시점 1회, 추적 안 함). */
  function ensureVisible(n: SimNode) {
    if (n.x == null || n.y == null) return;
    const pad = n.r + 40;
    let dx = 0;
    let dy = 0;
    if (n.x - pad < viewRect.x0) dx = viewRect.x0 - (n.x - pad);
    else if (n.x + pad > viewRect.x1) dx = viewRect.x1 - (n.x + pad);
    if (n.y - pad < viewRect.y0) dy = viewRect.y0 - (n.y - pad);
    else if (n.y + pad > viewRect.y1) dy = viewRect.y1 - (n.y + pad);
    if (dx === 0 && dy === 0) return;
    // viewRect 는 월드 단위 → 화면 이동량은 합성 배율 K 를 곱한 값이다.
    setAnimating(true);
    setView((v) => clampRef.current({ ...v, x: v.x + dx * K, y: v.y + dy * K }));
  }

  // ── 활성 글의 연관 키워드 부채 ──
  // 노드 옆으로 세로 정렬 + 가운데가 볼록한 호. 세로 간격이 고정이라 키워드끼리는 겹치지 않고,
  // 펼칠 방향(좌/우)은 **보이는 영역을 벗어나지 않으면서 다른 글 노드를 적게 덮는 쪽**으로 고른다.
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
    if (top < viewRect.y0 + 18) shift = viewRect.y0 + 18 - top;
    else if (bottom > viewRect.y1 - 18) shift = viewRect.y1 - 18 - bottom;

    // 이탈은 "밖이냐 아니냐"가 아니라 **얼마나** 밖인지로 매긴다. 많이 확대하면 보이는
    // 폭이 부채 폭의 두 배가 안 돼 좌우 어느 쪽도 다 못 담는데, 이분법이면 그때 두 쪽이
    // 동점이 되어 아무 쪽이나 골라 버린다. 등급을 매겨야 덜 나쁜 쪽을 고른다.
    const overflowOf = (s: 1 | -1) => {
      const far = node.x! + s * (reach + KW_LABEL_W);
      return s === 1
        ? Math.max(0, far - viewRect.x1)
        : Math.max(0, viewRect.x0 - far);
    };
    const cost = (s: 1 | -1) => {
      // 노드 하나를 덮는 비용(=1)보다 이탈을 확실히 무겁게 두되 포화시키지 않는다.
      let c = overflowOf(s) * 0.5;
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

    // 고른 쪽이 여전히 넘치면(확대해서 보이는 폭이 좁을 때) 부채 전체를 안쪽으로 당긴다.
    // 세로 shift 와 같은 처리이고, 연결선이 짧아질 뿐 라벨은 화면 안에 남는다.
    // 되당김만은 KW_LABEL_W 추정치 대신 **이 글의 실제 라벨**로 재는데, 한글 라벨은
    // 그 추정치를 크게 넘겨서(22자면 두 배 가까이) 추정치로 당기면 여전히 잘린다.
    // 방향 선택에는 계속 KW_LABEL_W 를 쓴다 — 기존 배치를 흔들지 않기 위해서다.
    const realFar =
      reach + 9 + Math.max(...kws.map((l) => estimateLabelWidth(truncate(l, 22))));
    const realOverflow =
      side === 1
        ? Math.max(0, node.x + realFar - viewRect.x1)
        : Math.max(0, viewRect.x0 - (node.x - realFar));
    // 노드 위로 올라타지 않을 만큼만 — 그 이상 당기면 오히려 읽기 나빠진다.
    const maxPull = Math.max(0, KW_BASE - (node.r + 10));
    const xShift = -side * Math.min(realOverflow, maxPull);

    return {
      side,
      color: node.color,
      ox: node.x,
      oy: node.y,
      r: node.r,
      items: kws.map((label, i) => {
        const x =
          node.x! +
          side * (KW_BASE + KW_BULGE * (mid - Math.abs(i - mid))) +
          xShift;
        // 되당김은 노드를 덮지 않는 선까지만 가능하다. 그러고도 모자라면 남은 폭에
        // 맞춰 글자를 자른다 — 부채는 원래도 22자에서 자르므로 같은 수단의 연장이고,
        // 잘린 꼬리를 화면 밖에 두는 것보다 말줄임이 정직하다.
        const edge = side === 1 ? viewRect.x1 : viewRect.x0;
        const avail = Math.abs(edge - (x + side * 9));
        let text = truncate(label, 22);
        while (text.length > 1 && estimateLabelWidth(text) > avail) {
          text = truncate(text, text.length - 1);
        }
        return { label, text, x, y: node.y! + (i - mid) * KW_GAP + shift };
      }),
    };
  }
  const keywordFan = buildKeywordFan();

  // ── 커맨드 바 파생값 ──
  // 토큰 순서는 Set 순회가 아니라 legend/allTags 순회로 뽑는다 — 삽입 순서에 기대면
  // 같은 필터 조합이 조작 이력에 따라 다른 순서로 그려진다.
  const tokens: {
    axis: string;
    label: string;
    color?: string;
    remove: () => void;
  }[] = [];
  if (range) {
    tokens.push({
      axis: "기간",
      label:
        rLo === rHi
          ? buckets[rLo].label
          : `${buckets[rLo].label} – ${buckets[rHi].label}`,
      remove: () => {
        setRange(null);
        clearFocus();
      },
    });
  }
  for (const l of data.legend) {
    if (selectedCats.has(l.label))
      tokens.push({
        axis: "분류",
        label: l.label,
        color: l.color,
        remove: () => toggleCat(l.label),
      });
  }
  for (const t of allTags) {
    if (selectedKws.has(t))
      tokens.push({ axis: "키워드", label: t, remove: () => toggleKw(t) });
  }

  // 게이지 눈금. 칸이 많아지면 라벨이 겹치므로 1월·양 끝만 남기고 나머지는 점으로 접는다.
  const gLen = buckets.length;
  const gaugeCells = buckets.map((b, i) => {
    const jan = b.key.endsWith("-01");
    const show =
      data.periodMode === "year" || gLen <= 8 || jan || i === 0 || i === gLen - 1;
    const text =
      data.periodMode === "year"
        ? b.label
        : jan && gLen > 8
          ? b.key.slice(0, 4)
          : b.label.slice(2); // "2026.07" → "26.07"
    return {
      key: b.key,
      count: b.count,
      inR: i >= rLo && i <= rHi,
      cell: show ? text : "·",
    };
  });
  const pct = (n: number) => `${(n / gLen) * 100}%`;
  // 선이 서는 자리(칸 경계 단위). 드래그 중에는 커밋된 칸이 아니라 손끝을 그린다 —
  // 값은 칸에 스냅해도 밴드와 손잡이는 즉시 따라오고, 칸 강조가 뒤에서 스냅한다.
  const [vLo, vHi] = ((): [number, number] => {
    if (live == null || !drag) return [rLo, rHi + 1];
    if (drag === "band") {
      const b = bandRef.current;
      const d = bound(live - b.pos, -b.lo, lastIdx - b.hi);
      return [b.lo + d, b.hi + 1 + d];
    }
    const p = live - offsetRef.current;
    if (drag === "lo") return [bound(p, 0, rHi), rHi + 1];
    if (drag === "hi") return [rLo, bound(p, rLo + 1, gLen)];
    const a = anchorRef.current; // new: 앵커 칸에서 손끝 쪽으로 자란다
    return p >= a + 1 ? [a, bound(p, a + 1, gLen)] : [bound(p, 0, a), a + 1];
  })();
  // 구간 안 글 수는 다른 축과 무관하게 센다 — "이 범위를 잡으면 최대 몇 편"의 감각.
  const rangeCount = data.posts.filter((p) => {
    const i = bucketIndex.get(p.periodKey);
    return i !== undefined && i >= rLo && i <= rHi;
  }).length;
  const unitLabel = data.periodMode === "year" ? "연 단위" : "월 단위";
  const unitNote =
    data.periodMode === "year"
      ? `${gLen}년 · 3년을 넘으면 연 단위로 접힙니다`
      : `${gLen}개월 · 3년까지는 월 단위`;

  // 입력은 검색어이자 후보 필터다 — 치면 분류·키워드 후보가 함께 좁혀진다.
  const q = query.trim().toLowerCase();
  const hitq = (s: string) => q === "" || s.toLowerCase().includes(q);
  const catCands = data.legend
    .filter((l) => hitq(l.label))
    .map((l) => ({ ...l, n: countHits(new Set([l.label]), selectedKws) }));
  const kwCands = allTags
    .filter(hitq)
    .slice(0, KW_TOP)
    .map((t) => ({
      t,
      n: countHits(selectedCats, new Set([...selectedKws, t])),
    }));

  return (
    <div className="graph-explorer">
      {/* ── 커맨드 바 ──
          축마다 한 줄씩 늘어놓는 대신, 입력 하나에 고른 것을 토큰으로 쌓는다. 축이
          늘어도 세로가 늘지 않고, "지금 걸린 필터"가 한 곳에 모여 읽힌다. 토큰의
          작은 축 라벨(기간·분류·키워드)이 그 값의 출처를 말하므로 축별 행이 필요 없다. */}
      <div className="graph-cmd">
        <div className="cmd-bar">
          <span className="cmd-caret" aria-hidden="true">
            ›
          </span>
          {tokens.map((t) => (
            <button
              type="button"
              key={`${t.axis}:${t.label}`}
              className="cmd-token"
              style={{ "--tok": t.color ?? "var(--accent)" } as CSSProperties}
              onClick={t.remove}
              aria-label={`${t.axis} ${t.label} 지우기`}
            >
              <span className="tok-axis" aria-hidden="true">
                {t.axis}
              </span>
              {t.color && (
                <span className="tok-dot" style={{ background: t.color }} />
              )}
              {t.label}
              <span className="tok-x" aria-hidden="true">
                ×
              </span>
            </button>
          ))}
          <input
            type="text"
            className="cmd-input"
            placeholder="입력하면 기간·분류·키워드 후보가 나옵니다"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              clearFocus();
            }}
            aria-label="글 검색 · 후보 좁히기"
          />
        </div>
        <span className="graph-count">
          글 {visibleCount}
          <span className="count-total">/{data.totalPosts}</span>
        </span>
        <button
          type="button"
          className="graph-help-btn"
          onClick={() => setHelpOpen((v) => !v)}
          aria-expanded={helpOpen}
          aria-label="도움말"
        >
          ?
        </button>
      </div>
      {/* 설명 카피는 상시 노출 대신 도움말 안으로 — 지도가 첫 화면을 차지하도록. */}
      {/* 여닫이를 `helpOpen && …` 가 아니라 `hidden` 으로 하는 이유는 **슬롯이
          살아남게 하려는 것**이다. Astro 는 SSR 때 이 컴포넌트를 한 번 그리고,
          하이드레이션 스크립트는 그 결과에 남은 `<astro-slot>` 엘리먼트에서 슬롯
          HTML 을 되찾는다. 조건부로 감싸면 SSR 시점(helpOpen=false)에 astro-slot 이
          아예 안 나와서 decoHelp 가 클라이언트에 **영영 도착하지 못한다** — 처음만
          비는 게 아니라 열어도 끝까지 빈다(실측으로 잡았다).
          `hidden` 은 UA 기본이 display:none 이고 이 파일 어디도 .graph-help 의
          display 를 지정하지 않으므로 닫힘 상태의 레이아웃 비용은 그대로 0 이다. */}
      <div className="graph-help" hidden={!helpOpen}>
        {HELP_LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {decoHelp && <div className="graph-deco">{decoHelp}</div>}
      </div>

      {/* ── 후보 패널 ── 커맨드 바에 무엇을 넣을 수 있는지 항상 열어 둔다. */}
      <div className="graph-cands">
        {buckets.length >= 2 && (
          <div className="cand-period">
            <div className="cand-period-head">
              <span className="cand-label">기간 범위 · {unitLabel}</span>
              <div className="gauge-read">
                <span className={`read-span${drag ? " on" : ""}`}>
                  {buckets[rLo].label}
                  <span className="read-dash">—</span>
                  {buckets[rHi].label}
                </span>
                <span className="read-count">{rangeCount}편</span>
                <button
                  type="button"
                  className="gauge-clear"
                  onClick={() => {
                    setRange(null);
                    clearFocus();
                  }}
                  disabled={range === null}
                >
                  전체
                </button>
              </div>
            </div>
            {/* 칩 토글이 아니라 구간을 끌어 잡는 게이지. touch-action:none 은 이 트랙
                위에서만이고 지도(pan-y)와 겹치지 않는다. */}
            <div
              className="gauge-track"
              role="group"
              aria-label="기간 범위"
              tabIndex={0}
              onPointerDown={gaugeDown}
              onPointerMove={(e) => grabRef.current && gaugeMove(e.clientX)}
              onPointerUp={gaugeUp}
              onPointerCancel={gaugeUp}
              onKeyDown={(e) => gaugeKey(e)}
              style={{ cursor: drag ? "grabbing" : "col-resize" }}
            >
              <div
                className={`gauge-cells${drag ? " dragging" : ""}`}
                ref={trackRef}
              >
                {gaugeCells.map((c, i) => (
                  <span
                    key={c.key}
                    className={`gauge-cell${c.inR ? " in" : ""}${c.count ? "" : " empty"}${i === gaugeCells.length - 1 ? " last" : ""}`}
                  >
                    {c.cell}
                  </span>
                ))}
                <span
                  className={`gauge-band${drag ? " on" : ""}`}
                  style={{ left: pct(vLo), width: pct(vHi - vLo) }}
                  aria-hidden="true"
                />
                <span
                  role="slider"
                  className={`gauge-handle${drag === "lo" ? " on" : ""}${touched ? "" : " hint"}`}
                  style={{ left: pct(vLo) }}
                  tabIndex={0}
                  aria-label="시작 시점"
                  aria-valuemin={0}
                  aria-valuemax={lastIdx}
                  aria-valuenow={rLo}
                  aria-valuetext={buckets[rLo].label}
                  onPointerDown={(e) => grabHandle(e, "lo")}
                  onPointerMove={(e) => grabRef.current && gaugeMove(e.clientX)}
                  onPointerUp={gaugeUp}
                  onPointerCancel={gaugeUp}
                  onKeyDown={(e) => gaugeKey(e, "lo")}
                >
                  ‹
                </span>
                <span
                  role="slider"
                  className={`gauge-handle${drag === "hi" ? " on" : ""}${touched ? "" : " hint"}`}
                  style={{ left: pct(vHi) }}
                  tabIndex={0}
                  aria-label="끝 시점"
                  aria-valuemin={0}
                  aria-valuemax={lastIdx}
                  aria-valuenow={rHi}
                  aria-valuetext={buckets[rHi].label}
                  onPointerDown={(e) => grabHandle(e, "hi")}
                  onPointerMove={(e) => grabRef.current && gaugeMove(e.clientX)}
                  onPointerUp={gaugeUp}
                  onPointerCancel={gaugeUp}
                  onKeyDown={(e) => gaugeKey(e, "hi")}
                >
                  ›
                </span>
              </div>
            </div>
            <p className="gauge-note">
              {unitNote} · ‹ › 를 끌어 범위, 밴드는 잡아 이동 · 트랙 ←/→ 이동,
              손잡이 ←/→ 끝 조절
            </p>
          </div>
        )}
        {catCands.length > 0 && (
          <div className="cand-group">
            <div className="cand-label">분류</div>
            <div className="cand-chips">
              {catCands.map((c) => (
                <button
                  type="button"
                  key={c.label}
                  className={`cand-chip${selectedCats.has(c.label) ? " on" : ""}${c.n === 0 && !selectedCats.has(c.label) ? " zero" : ""}`}
                  style={{ "--cand": c.color } as CSSProperties}
                  onClick={() => toggleCat(c.label)}
                  aria-pressed={selectedCats.has(c.label)}
                  aria-label={`${c.label} ${c.n}편`}
                >
                  <span className="cand-dot" style={{ background: c.color }} />
                  {c.label}
                  <span className="cand-n" aria-hidden="true">
                    {c.n}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {kwCands.length > 0 && (
          <div className="cand-group">
            <div className="cand-label">키워드 · 전체 {allTags.length}</div>
            <div className="cand-chips">
              {kwCands.map((c) => (
                <button
                  type="button"
                  key={c.t}
                  className={`cand-chip${selectedKws.has(c.t) ? " on" : ""}${c.n === 0 && !selectedKws.has(c.t) ? " zero" : ""}`}
                  onClick={() => toggleKw(c.t)}
                  aria-pressed={selectedKws.has(c.t)}
                  aria-label={`${c.t} ${c.n}편`}
                >
                  {c.t}
                  <span className="cand-n" aria-hidden="true">
                    {c.n}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {catCands.length === 0 && kwCands.length === 0 && (
          <p className="cand-none">후보가 없어요. 다른 말로 적어보세요.</p>
        )}
        {decoFilter && <div className="graph-deco">{decoFilter}</div>}
      </div>
      {filterActive && visibleCount === 0 && (
        <p className="graph-empty">
          일치하는 글이 없어요. 범위를 넓히거나 토큰을 하나 지워 보세요.
        </p>
      )}
      {/* 제스처 없이도 확대·축소·복귀가 가능한 유일한 경로 — 키보드 사용자와
          트랙패드가 없는 환경을 위해 반드시 함께 낸다. */}
      <div className="graph-zoom" role="group" aria-label="지도 확대·축소">
        <button
          type="button"
          onClick={() => zoomByButton(1.4)}
          disabled={view.k * fitK >= ZOOM_MAX - 1e-6}
          aria-label="확대"
        >
          ＋
        </button>
        <button
          type="button"
          onClick={() => zoomByButton(1 / 1.4)}
          disabled={view.k * fitK <= k0 + 1e-6}
          aria-label="축소"
        >
          －
        </button>
        <button type="button" onClick={resetView} aria-label="전체 보기">
          ⤢
        </button>
      </div>
      {/* 판 = 지도 상자. deco 구멍이 여기에 겹쳐 앉는다(위 prop 주석). */}
      <div className="graph-stage">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="group"
        aria-label="블로그 글 지도"
        className={dragging ? "dragging" : undefined}
        onPointerDown={(e) => {
          if (dragRef.current) return; // 두 번째 손가락은 팬을 이어받지 않는다
          suppressClickRef.current = false; // 새 제스처 시작 — 이전 판정을 지운다
          dragRef.current = {
            id: e.pointerId,
            cx: e.clientX,
            cy: e.clientY,
            vx: view.x,
            vy: view.y,
            moved: false,
          };
        }}
        onPointerMove={(e) => {
          const d = dragRef.current;
          if (!d || d.id !== e.pointerId) return;
          const dx = e.clientX - d.cx;
          const dy = e.clientY - d.cy;
          if (!d.moved) {
            if (Math.hypot(dx, dy) <= DRAG_THRESHOLD) return;
            d.moved = true;
            // 포인터가 이미 놓였거나 브라우저가 가져간 뒤면 NotFoundError 를 던진다.
            // 캡처는 포인터가 밖으로 나가도 이벤트를 계속 받기 위한 편의일 뿐이라,
            // 실패해도 팬 자체는 계속 도는 게 맞다.
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              /* 캡처 없이 진행 */
            }
            setDragging(true);
            setHovered(null); // 끌고 다니는 동안 호버가 깜빡이지 않게
          }
          // client px → viewBox 단위. CTM 의 a/d 가 현재 스케일이다.
          const ctm = svgRef.current?.getScreenCTM();
          const sx = ctm?.a || 1;
          const sy = ctm?.d || 1;
          setView((v) =>
            clampRef.current({ ...v, x: d.vx + dx / sx, y: d.vy + dy / sy }),
          );
        }}
        onPointerUp={(e) => {
          const d = dragRef.current;
          if (!d || d.id !== e.pointerId) return;
          suppressClickRef.current = d.moved;
          endDrag();
        }}
        onPointerCancel={() => {
          // 브라우저가 제스처를 세로 스크롤로 가져갈 때 온다 — 상태를 반드시 되돌린다
          suppressClickRef.current = false;
          endDrag();
        }}
        onLostPointerCapture={() => endDrag()}
        onClick={(e) => {
          if (suppressClickRef.current) return; // 끌고 놓은 것은 클릭이 아니다
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        {/* 바깥 = 사용자 카메라(SVG transform 속성, 드래그가 즉시 따라오게 transition 없음)
            안쪽 = 필터 fit(CSS transform, 필터 전환 애니 유지). 둘을 겹쳐 합성한다. */}
        <g
          className={`graph-pan${animating ? " animating" : ""}`}
          transform={`translate(${view.x},${view.y}) scale(${view.k})`}
          onTransitionEnd={() => setAnimating(false)}
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
                  onFocus={(e) => {
                    setHovered(n.id);
                    // Tab 으로 옮겨온 포커스만 화면을 따라가게 한다. 마우스 클릭도
                    // 포커스를 주므로 무조건 돌면 클릭할 때마다 지도가 튄다.
                    if (e.currentTarget.matches(":focus-visible")) ensureVisible(n);
                  }}
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
          {/* 글 제목 라벨 — 많이 축소한 조감 상태에서는 읽히지도 않는 노이즈라 접는다 */}
          <g aria-hidden="true">
            {K >= LABEL_MIN_K && nodes.map((n) => {
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
                  {k.text}
                </text>
              ))}
            </g>
          )}
        </g>
        </g>
      </svg>
        {deco && <div className="graph-deco">{deco}</div>}
      </div>
      <style>{`
        /* pan-y: 한 손가락 세로 스와이프는 브라우저의 페이지 스크롤로 남겨두고,
           가로 드래그와 멀티터치만 우리가 받는다. none 으로 두면 지도 위에서
           페이지가 멈춰 글을 읽다가 갇힌다. */
        .graph-explorer svg {
          touch-action: pan-y;
          cursor: grab;
        }
        .graph-explorer svg.dragging {
          cursor: grabbing;
        }
        .graph-explorer svg {
          width: 100%;
          height: auto;
          min-height: 420px;
          display: block;
          background: var(--surface);
          border: var(--stroke) solid var(--border);
          border-radius: var(--card-radius);
        }
        /* ── 판과 그 위의 구멍 ──
           .graph-stage 는 지도 상자와 정확히 같은 크기의 배치 좌표계다(딸린 것은
           svg 하나뿐이라 높이가 svg 를 그대로 따른다). 구멍은 그 위에 inset:0 으로
           겹치고, 지도는 z-index 1 로 한 겹 들린다 — 구멍에 들어온 것 중 **배경**
           (판·종이)은 지도 밑으로, **모서리에 걸치는 것**(z를 스스로 올리는 부품)은
           지도 위로 갈리게 하는 유일한 짜임이다.

           그래서 이 아일랜드의 z 눈금은 이렇게 읽는다:
             auto  구멍의 배경(판·종이)   1  지도   2  줌 컨트롤   3+  판 모서리 부품
           줌이 2 인 건 지도가 1 로 올라온 결과다 — 둘 다 1 이면 DOM 뒤쪽인 지도가
           이겨서 버튼이 통째로 덮인다(실측: Playwright 가 "svg intercepts pointer
           events" 로 클릭을 거부했다).

           pointer-events:none 은 규칙 9 — 지도는 드래그(pan) 표면이라 그 위에
           얹힌 것이 포인터를 한 점이라도 먹으면 그 자리에서 팬이 죽는다. */
        .graph-stage {
          position: relative;
        }
        .graph-stage > svg {
          position: relative;
          z-index: 1;
        }
        .graph-deco {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        /* ── 커맨드 바 ──
           입력·토큰·카운터가 한 덩어리다. 바 테두리만 --ink(진하게)이고 나머지
           표면은 --border(연하게)라, 페이지에서 "여기에 입력한다"가 한눈에 잡힌다. */
        .graph-cmd {
          display: flex;
          align-items: flex-start;
          gap: var(--space-10);
          margin-bottom: var(--space-10);
        }
        .cmd-bar {
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--space-6);
          padding: var(--space-8) var(--space-12);
          background: var(--surface);
          border: var(--stroke) solid var(--ink);
          border-radius: var(--card-radius);
          transition: box-shadow var(--dur) var(--ease);
        }
        .cmd-bar:focus-within {
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
        }
        .cmd-caret {
          font-family: var(--font-mono);
          font-size: var(--text-label);
          color: var(--ink-3);
        }
        /* 토큰은 알약이 아니라 각진 모서리(--radius-sm) — 아래 후보 칩과 같은 어휘이고,
           지도 노드(원)와도 구분된다. */
        .cmd-token {
          display: inline-flex;
          align-items: center;
          gap: var(--space-6);
          font: inherit;
          font-size: var(--text-label);
          font-weight: 500;
          padding: var(--space-2) var(--space-8);
          border-radius: var(--radius-sm);
          border: var(--stroke) solid var(--ink);
          background: color-mix(in srgb, var(--tok, var(--accent)) 14%, var(--surface));
          color: color-mix(in srgb, var(--tok, var(--accent)) 76%, var(--ink));
          cursor: pointer;
          transition: all var(--dur) var(--ease);
        }
        .cmd-token:hover {
          background: color-mix(in srgb, var(--tok, var(--accent)) 22%, var(--surface));
        }
        /* 값이 어느 축에서 왔는지 토큰 스스로 밝힌다 — 축별 행이 없어도 읽히는 이유. */
        .tok-axis {
          font-family: var(--font-mono);
          font-size: var(--text-nano);
          letter-spacing: 0.5px;
          opacity: 0.7;
        }
        .tok-dot {
          width: 9px;
          height: 9px;
          border-radius: var(--radius-round);
          border: var(--stroke-hair) solid var(--ink);
        }
        .tok-x {
          font-family: var(--font-mono);
          font-size: var(--text-micro);
          opacity: 0.7;
        }
        .cmd-input {
          flex: 1 1 120px;
          min-width: 120px;
          font: inherit;
          font-size: var(--text-meta);
          color: var(--ink);
          background: transparent;
          border: 0;
          outline: none;
          padding: var(--space-2) 0;
        }
        .graph-count {
          flex: none;
          padding-top: var(--space-8);
          font-family: var(--font-mono);
          font-size: var(--text-label);
          color: var(--ink-2);
          white-space: nowrap;
        }
        .count-total {
          color: var(--ink-3);
        }
        .graph-help-btn {
          flex: none;
          margin-top: var(--space-6);
          width: 24px;
          height: 24px;
          border-radius: var(--radius-round);
          border: var(--stroke) solid var(--border);
          background: transparent;
          color: var(--ink-3);
          font-family: var(--font-mono);
          font-size: var(--text-label);
          cursor: pointer;
          transition: all var(--dur) var(--ease);
        }
        .graph-help-btn:hover,
        .graph-help-btn[aria-expanded="true"] {
          color: var(--accent);
          border-color: var(--accent);
        }
        /* position:relative 는 데코 구멍(.graph-deco)의 배치 기준 — 없으면 구멍이
           조상 중 첫 배치 컨텍스트로 튄다. 이 둘은 지도 판과 달리 배경을 깔지 않고
           부품만 얹으므로 z 를 가를 필요가 없다(부품이 자기 z 로 위에 온다). */
        .graph-help {
          position: relative;
          margin: 0 0 var(--space-10);
          padding: var(--space-10) var(--space-12);
          border: var(--stroke-hair) dashed color-mix(in srgb, var(--accent) 30%, transparent);
          border-radius: var(--radius-sm);
          background: repeating-linear-gradient(
            45deg,
            color-mix(in srgb, var(--accent) 6%, transparent) 0 1px,
            transparent 1px 11px
          );
        }
        .graph-help p {
          margin: 0;
          font-size: var(--text-label);
          line-height: 1.7;
          color: var(--ink-2);
        }

        /* ── 후보 패널 ── 한 단 안쪽으로 들어간 표면(--paper)이라 커맨드 바가 위에 뜬다. */
        .graph-cands {
          position: relative;
          margin-bottom: var(--space-12);
          padding: var(--space-10);
          border: var(--stroke) solid var(--border);
          border-radius: var(--card-radius);
          background: var(--paper);
        }
        .cand-period {
          margin-bottom: var(--space-10);
          padding: 0 var(--space-6) var(--space-10);
          border-bottom: var(--stroke-hair) dashed var(--border);
        }
        .cand-period-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--space-10);
        }
        .cand-label {
          font-family: var(--font-mono);
          font-size: var(--text-nano);
          letter-spacing: 0.5px;
          color: var(--ink-3);
        }
        .gauge-read {
          display: flex;
          align-items: baseline;
          gap: var(--space-8);
          flex: none;
          white-space: nowrap;
        }
        .read-span {
          font-family: var(--font-mono);
          font-size: var(--text-micro);
          color: var(--ink);
          transition: color 140ms var(--ease);
        }
        /* 끄는 동안에는 읽는 값이 accent 로 바뀐다 — 손이 아니라 눈이 보는 피드백. */
        .read-span.on {
          color: var(--accent);
        }
        .read-dash {
          color: var(--ink-3);
        }
        .read-count {
          font-family: var(--font-mono);
          font-size: var(--text-nano);
          color: var(--ink-3);
        }
        .gauge-clear {
          font-family: var(--font-mono);
          font-size: var(--text-nano);
          color: var(--ink-2);
          padding: var(--space-2) var(--space-8);
          border: var(--stroke-hair) dashed var(--border);
          border-radius: var(--btn-radius);
          background: transparent;
          cursor: pointer;
          transition: all var(--dur) var(--ease);
        }
        .gauge-clear:hover:not(:disabled) {
          color: var(--accent);
          border-color: var(--accent);
        }
        .gauge-clear:disabled {
          opacity: 0.4;
          cursor: default;
        }
        /* touch-action:none 은 이 트랙 안에서만. 지도는 pan-y 라 서로 간섭하지 않는다. */
        .gauge-track {
          position: relative;
          margin: var(--space-10) 0 var(--space-8);
          padding: 0 var(--space-2);
          border: var(--stroke) solid var(--border);
          border-radius: var(--btn-radius);
          background: var(--surface);
          touch-action: none;
          user-select: none;
          outline: none;
        }
        .gauge-track:focus-visible {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
        }
        .gauge-cells {
          position: relative;
          display: flex;
        }
        /* 끄는 동안에는 밴드도 손잡이도 손끝에 1:1 로 붙어야 한다. 밴드를 잡아 옮기면
           손잡이 둘이 함께 움직이므로, 끌리는 쪽만 끄면 나머지가 160ms 늦게 따라온다. */
        .gauge-cells.dragging .gauge-band,
        .gauge-cells.dragging .gauge-handle {
          transition: none;
        }
        /* 칸은 균등 분할이다 — 글이 없는 달도 자리를 지켜야 시간축이 정직하다. */
        .gauge-cell {
          flex: 1 1 0;
          min-width: 0;
          box-sizing: border-box;
          padding: var(--space-6) 0 var(--space-4);
          text-align: center;
          font-family: var(--font-mono);
          font-size: var(--text-micro);
          letter-spacing: 0.3px;
          color: color-mix(in srgb, var(--ink-3) 60%, var(--paper));
          border-right: var(--stroke-hair) dashed color-mix(in srgb, var(--ink) 16%, transparent);
          transition:
            color 160ms var(--ease),
            background 160ms var(--ease);
        }
        .gauge-cell.last {
          border-right: 0;
        }
        .gauge-cell.in {
          color: var(--ink);
          background: color-mix(in srgb, var(--accent) 9%, transparent);
        }
        .gauge-cell.in.empty {
          color: var(--ink-3);
          background: transparent;
        }
        .gauge-band {
          position: absolute;
          top: -4px;
          bottom: -4px;
          border-radius: var(--btn-radius);
          border: var(--stroke) solid color-mix(in srgb, var(--accent) 62%, var(--surface));
          background: color-mix(in srgb, var(--accent) 8%, transparent);
          pointer-events: none;
          transition:
            left 160ms var(--ease),
            width 160ms var(--ease);
        }
        .gauge-band.on {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 16%, transparent);
          transition: none;
        }
        .gauge-handle {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 21px;
          box-sizing: border-box;
          border: var(--stroke) solid var(--accent);
          border-radius: var(--btn-radius);
          background: var(--surface);
          color: var(--accent);
          font-family: var(--font-mono);
          font-size: var(--text-micro);
          line-height: 1;
          cursor: ew-resize;
          outline: none;
          transition: left 160ms var(--ease);
        }
        .gauge-handle:hover {
          background: color-mix(in srgb, var(--accent) 14%, var(--surface));
        }
        .gauge-handle.on {
          background: var(--accent);
          color: var(--surface);
          transition: none;
        }
        .gauge-handle:focus-visible {
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 28%, transparent);
        }
        /* 한 번도 안 건드린 손잡이만 맥동한다 — 끌 수 있다는 걸 말없이 알린다. */
        .gauge-handle.hint {
          animation: gauge-hint 2.8s var(--ease) infinite;
        }
        @keyframes gauge-hint {
          0%,
          72%,
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
          84% {
            transform: translate(-50%, -50%) scale(1.22);
          }
        }
        .gauge-note {
          margin: 0;
          font-family: var(--font-mono);
          font-size: var(--text-nano);
          letter-spacing: 0.3px;
          color: color-mix(in srgb, var(--ink-3) 60%, var(--paper));
        }
        .cand-group {
          margin-bottom: var(--space-8);
        }
        .cand-group .cand-label {
          display: block;
          padding: 0 var(--space-6) var(--space-4);
        }
        .cand-chips {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-6);
        }
        .cand-chip {
          display: inline-flex;
          align-items: center;
          gap: var(--space-6);
          font: inherit;
          font-size: var(--text-label);
          font-weight: 500;
          color: var(--ink-2);
          padding: var(--space-4) var(--space-10);
          border: var(--stroke) solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          cursor: pointer;
          transition: all var(--dur) var(--ease);
        }
        .cand-chip:hover {
          color: var(--ink);
          border-color: var(--ink-3);
        }
        .cand-chip.on {
          color: color-mix(in srgb, var(--cand, var(--accent)) 76%, var(--ink));
          border-color: var(--ink);
          background: color-mix(in srgb, var(--cand, var(--accent)) 14%, var(--surface));
        }
        /* 눌러도 0편이 되는 후보는 미리 흐려 둔다 — 눌러본 뒤 빈 지도를 만나지 않도록. */
        .cand-chip.zero {
          opacity: 0.4;
        }
        .cand-dot {
          width: 9px;
          height: 9px;
          border-radius: var(--radius-round);
          border: var(--stroke-hair) solid var(--ink);
        }
        .cand-n {
          font-family: var(--font-mono);
          font-size: var(--text-nano);
          opacity: 0.6;
        }
        .cand-none {
          margin: 0;
          padding: var(--space-8) var(--space-6);
          font-size: var(--text-label);
          color: var(--ink-3);
        }
        .graph-empty {
          margin: 0 0 var(--space-10);
          font-size: var(--text-meta);
          color: var(--ink-3);
        }
        .graph-viewport {
          transition: transform 0.45s var(--ease);
        }
        /* 사용자 카메라는 조작에 1:1로 붙어야 하므로 기본이 transition 없음이다.
           "전체 보기"처럼 의도적으로 애니메이션할 때만 .animating 을 잠깐 얹는다. */
        .graph-pan {
          transition: none;
        }
        .graph-pan.animating {
          transition: transform 0.35s var(--ease);
        }
        .graph-explorer {
          position: relative;
        }
        .graph-zoom {
          position: absolute;
          right: 10px;
          bottom: 10px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .graph-zoom button {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          font: inherit;
          font-size: var(--text-meta);
          line-height: 1;
          color: var(--ink-2);
          background: var(--surface);
          border: var(--stroke-hair) solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--dur) var(--ease);
        }
        .graph-zoom button:hover:not(:disabled) {
          color: var(--accent);
          border-color: var(--accent);
        }
        .graph-zoom button:disabled {
          opacity: 0.38;
          cursor: default;
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
          font-size: var(--text-label);
          fill: var(--ink);
          paint-order: stroke;
          stroke: var(--surface);
          stroke-width: 4px;
          stroke-linejoin: round;
        }
        /* 키워드 부채는 표시 전용 — 포인터를 가로채면 호버가 깜빡인다 */
        .graph-explorer .kw-fan {
          pointer-events: none;
          animation: kw-in 200ms var(--ease) both;
        }
        .graph-explorer .kw-label {
          font-size: var(--text-micro);
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
          .graph-pan, .graph-pan.animating { transition: none; }
        }
      `}</style>
    </div>
  );
}
