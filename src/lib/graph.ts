// graphify 증류 데이터(src/data/graph.json)의 타입과 안전 로더.
// 파일이 없어도 빌드가 깨지지 않도록 정적 import 대신 glob을 쓴다.

export interface GraphPost {
  slug: string;
  conceptCount: number;
}

export interface GraphConcept {
  id: string;
  label: string;
  postSlug: string | null;
  community: number;
  communityName: string;
  degree: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
  confidence: "EXTRACTED" | "INFERRED" | "AMBIGUOUS";
}

export interface PostPair {
  a: string;
  b: string;
  score: number;
  edgeCount: number;
  sharedConcepts: string[];
}

export interface GraphData {
  generatedAt: string;
  builtAtCommit?: string;
  posts: GraphPost[];
  concepts: GraphConcept[];
  conceptEdges: GraphEdge[];
  postPairs: PostPair[];
}

const EMPTY_GRAPH: GraphData = {
  generatedAt: "",
  posts: [],
  concepts: [],
  conceptEdges: [],
  postPairs: [],
};

const mods = import.meta.glob<{ default: GraphData }>("../data/graph.json", {
  eager: true,
});
export const graphData: GraphData =
  Object.values(mods)[0]?.default ?? EMPTY_GRAPH;

export const hasGraphData = graphData.posts.length > 0;

// 두 포스트 slug 간 그래프 연관 정보 조회 (a<b 캐논).
const pairBySlugs = new Map(
  graphData.postPairs.map((p) => [`${p.a} ${p.b}`, p]),
);
export function getPostPair(slugA: string, slugB: string): PostPair | null {
  const [a, b] = [slugA, slugB].sort();
  return pairBySlugs.get(`${a} ${b}`) ?? null;
}
