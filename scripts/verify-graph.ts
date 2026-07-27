#!/usr/bin/env bun
/**
 * graphify 추출 결과 검증 — 커밋해도 되는 graph.json 인지 판정한다.
 *
 * graphify 는 청크가 실패해도 **성공처럼 종료**한다(KAN-008). 그래서 세 겹으로 본다:
 *   ⓪ 추출 로그의 `n/m semantic chunk(s) failed` WARNING — 뜨면 그 자체로 폐기.
 *   ① 커버리지: 모든 글이 자기 source_file 로 그래프에 등장할 것.
 *   ② 알맹이:   글마다 노드가 2개 이상일 것(문서 노드만 남고 개념 0개인 **껍데기** 배제).
 *   ③ 증류:     src/data/graph.json 의 posts 에 모든 글이 있을 것(있을 때만).
 *
 * ②가 핵심이다 — 청크가 실패하면 글이 그래프에서 사라지는 게 아니라 껍데기가 되어
 * 커버리지 검사를 거짓 통과한 뒤 연관 글·/graph 에서 투명인간이 된다.
 *
 * 노드 ID 충돌(`the second node will be dropped`)은 **실패로 보지 않는다**(KAN-028).
 * 시리즈 글이 서로를 인용하면 참조 문서 노드와 진짜 문서 노드가 같은 id 를 갖는데,
 * 둘은 같은 글을 가리키는 같은 실체라 병합이 옳고 엣지도 survivor 로 재배선된다.
 * build-graph-data.ts 가 문서 노드를 **가리키는 글**로 정규화하므로 무해하다.
 * 다만 몇 건이나 났는지는 정보로 보고한다.
 *
 * 사용: bun scripts/verify-graph.ts [--graph <path>] [--log <extract.log>]
 */
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { basename } from "node:path";

const argv = process.argv.slice(2);
const argOf = (flag: string) => {
  const i = argv.indexOf(flag);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null;
};
const GRAPH = argOf("--graph") ?? "graphify-out/graph.json";
const LOG = argOf("--log");
const POSTS_DIR = "src/content/posts";
const DISTILLED = "src/data/graph.json";
const MIN_NODES_PER_POST = 2; // 문서 노드 1개뿐 = 개념·관계가 0개인 껍데기

if (!existsSync(GRAPH)) {
  console.error(`✗ ${GRAPH} 가 없다 — graphify extract 를 먼저 돌려라.`);
  process.exit(1);
}

const posts = (await readdir(POSTS_DIR))
  .filter((f) => /\.(md|mdx)$/.test(f))
  .sort();
const raw = JSON.parse(await readFile(GRAPH, "utf-8"));
const nodes: { source_file?: string | null; file_type?: string }[] = raw.nodes ?? [];

// source_file 은 스캔 루트 기준 상대경로("tauri-2.mdx")이거나 레포루트 기준
// ("src/content/posts/tauri-2.mdx")일 수 있다 — 파일명으로 접어서 비교한다.
const nodesPerPost = new Map<string, number>();
for (const n of nodes) {
  const f = n.source_file ? basename(n.source_file) : null;
  if (f && posts.includes(f)) nodesPerPost.set(f, (nodesPerPost.get(f) ?? 0) + 1);
}

const failures: string[] = [];
const notes: string[] = [];

// ⓪ 추출 로그의 청크 실패 — 단일 판정 기준.
if (LOG) {
  if (!existsSync(LOG)) {
    failures.push(`⓪ 로그 파일이 없다: ${LOG}`);
  } else {
    const log = await readFile(LOG, "utf-8");
    const failed = log.match(/^.*semantic chunk\(s\) failed.*$/m);
    if (failed) failures.push(`⓪ 청크 실패 — 이 graph.json 은 폐기해야 한다:\n     ${failed[0].trim()}`);
    const collisions = log.match(/collides with/g)?.length ?? 0;
    if (collisions) notes.push(`노드 ID 충돌 ${collisions}건 — 정규화가 흡수하므로 무해(KAN-028).`);
  }
} else {
  notes.push("추출 로그(--log)를 안 넘겨 청크 실패 검사 ⓪를 건너뛰었다.");
}

// ① 커버리지 · ② 알맹이
const missing = posts.filter((p) => !nodesPerPost.has(p));
const hollow = posts.filter((p) => {
  const c = nodesPerPost.get(p);
  return c !== undefined && c < MIN_NODES_PER_POST;
});
if (missing.length) failures.push(`① 그래프에서 빠진 글 ${missing.length}편: ${missing.join(", ")}`);
if (hollow.length) failures.push(`② 껍데기 글(노드 <${MIN_NODES_PER_POST}) ${hollow.length}편: ${hollow.join(", ")}`);

// ③ 증류 산출물 커버리지
if (existsSync(DISTILLED)) {
  const distilled = JSON.parse(await readFile(DISTILLED, "utf-8"));
  const slugs = new Set<string>((distilled.posts ?? []).map((p: { slug: string }) => p.slug));
  const gone = posts
    .map((p) => p.replace(/\.(md|mdx)$/, ""))
    .filter((s) => !slugs.has(s));
  if (gone.length) failures.push(`③ ${DISTILLED} 에 없는 글 ${gone.length}편: ${gone.join(", ")}`);
} else {
  notes.push(`${DISTILLED} 가 아직 없다 — bun scripts/build-graph-data.ts 를 돌려라(③ 생략).`);
}

console.log(`글 ${posts.length}편 / 그래프 노드 ${nodes.length}개 (${GRAPH})`);
const counts = [...nodesPerPost.entries()].sort((a, b) => a[1] - b[1]);
if (counts.length) console.log(`글당 노드: 최소 ${counts[0][1]}(${counts[0][0]}) · 최대 ${counts.at(-1)![1]}`);
for (const n of notes) console.log(`  · ${n}`);

if (failures.length) {
  console.error("\n✗ 검증 실패 — 이 graph.json 은 커밋하지 마라.");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log("\n✓ 검증 통과 — 커밋 가능.");
