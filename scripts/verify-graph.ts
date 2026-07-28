#!/usr/bin/env bun
/**
 * graphify 추출 결과 검증 — 커밋해도 되는 graph.json 인지 판정한다.
 *
 * graphify 는 청크가 실패해도 **성공처럼 종료**한다(KAN-008). 그래서 여러 겹으로 본다:
 *   ⓪ 추출 로그의 `n/m semantic chunk(s) failed` WARNING — 뜨면 그 자체로 폐기.
 *   ① 커버리지: 모든 글이 자기 source_file 로 그래프에 등장할 것.
 *   ② 알맹이:   글마다 노드가 2개 이상일 것(문서 노드만 남고 개념 0개인 **껍데기** 배제).
 *   ③ 증류:     src/data/graph.json 의 posts 에 모든 글이 있을 것(있을 때만).
 *   ④ 증분:     글마다 시맨틱 캐시 항목이 있을 것 + 이번 실행의 캐시 통계(KAN-045).
 *
 * ②가 핵심이다 — 청크가 실패하면 글이 그래프에서 사라지는 게 아니라 껍데기가 되어
 * 커버리지 검사를 거짓 통과한 뒤 연관 글·/graph 에서 투명인간이 된다.
 *
 * ④는 **다음 실행**을 지킨다. `graphify-out/cache/semantic/` 이 증분 추출의 상태
 * 전부다 — 비면 매 발행이 전량 재추출로 되돌아간다(24편 기준 1.26M in / 280k out /
 * 40~60분). 이건 에러가 아니라 "그냥 느림"으로 나타나 몇 달을 조용히 굴러간다.
 * 실제로 이 레포는 캐시가 gitignore 된 채 첫 커밋부터 계속 그렇게 돌았다.
 *
 * 캐시의 **내용**까지 보는 건 seed-graph-cache.py 다(graphify 자신의 해시 함수로
 * 조회해 전 글 적중을 확인). 여기서는 존재·개수만 겹으로 본다.
 *
 * 노드 ID 충돌(`the second node will be dropped`)은 **실패로 보지 않는다**(KAN-028).
 * 시리즈 글이 서로를 인용하면 참조 문서 노드와 진짜 문서 노드가 같은 id 를 갖는데,
 * 둘은 같은 글을 가리키는 같은 실체라 병합이 옳고 엣지도 survivor 로 재배선된다.
 * build-graph-data.ts 가 문서 노드를 **가리키는 글**로 정규화하므로 무해하다.
 * 다만 몇 건이나 났는지는 정보로 보고한다.
 *
 * 사용: bun scripts/verify-graph.ts [--graph <path>] [--log <extract.log>] [--cache <dir>]
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
const CACHE_DIR = argOf("--cache") ?? "graphify-out/cache/semantic";
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

// ④ 증분 건전성 — **다음 실행**이 전량 재추출로 되돌아가지 않는지 본다.
//
// ④-a 시맨틱 캐시 존재 (하드 실패)
//   캐시 파일명은 콘텐츠 해시라 여기서 글↔항목을 짝지을 수는 없다(해시 재구현은
//   graphify 와 어긋날 위험이 크다). 글별 적중 확인은 graphify 자신의 해시
//   함수를 쓰는 seed-graph-cache.py 가 하고, 여기서는 "있기는 한가 / 글 수만큼
//   되는가"를 겹으로 본다.
if (!existsSync(CACHE_DIR)) {
  failures.push(
    `④ ${CACHE_DIR} 가 없다 — 증분 추출의 상태가 통째로 없다.\n` +
      `     이대로 커밋하면 다음 발행이 전량 재추출된다(24편 기준 1.26M in / 280k out / 40~60분).\n` +
      `     scripts/seed-graph-cache.py 가 돌았는지 확인해라.`,
  );
} else {
  const entries = (await readdir(CACHE_DIR)).filter((f) => f.endsWith(".json"));
  if (entries.length === 0) {
    failures.push(`④ ${CACHE_DIR} 가 비었다 — 다음 발행이 전량 재추출된다.`);
  } else if (entries.length < posts.length) {
    failures.push(
      `④ 캐시 항목이 글 수보다 적다: ${entries.length}건 < 글 ${posts.length}편.\n` +
        `     캐시에 없는 글은 다음 실행에 다시 LLM 을 탄다.`,
    );
  } else {
    notes.push(
      `시맨틱 캐시 ${entries.length}건 (글 ${posts.length}편) — 다음 실행은 바뀐 글만 LLM 을 탄다.`,
    );
  }
}

// ④-b 이번 실행의 캐시 통계 · ④-c 토큰 (로그가 있을 때만, 정보/경고)
//   기준은 git status 가 아니라 graphify 가 직접 센 값이다 — main 배치 시점엔
//   이미 머지가 끝나 working tree 가 clean 이라 git 기준은 아무 의미가 없다.
if (LOG && existsSync(LOG)) {
  const log = await readFile(LOG, "utf-8");

  // full 모드: "semantic cache: N hit / M miss" · 마무리 줄: "N cached, M re-extracted"
  const cacheStat = log.match(/semantic cache:\s*(\d+)\s*(?:hit|cached)\s*[/,]\s*(\d+)\s*(?:miss|re-extracted)/);
  if (cacheStat) {
    const [, hit, miss] = cacheStat;
    notes.push(`캐시: ${hit}편 적중 · ${miss}편 재추출.`);
    if (Number(hit) === 0 && posts.length > 1) {
      notes.push("⚠ 적중 0편 — 증분이 안 먹고 전량 재추출됐다(콜드 부트스트랩이 아니라면 캐시 상태를 확인해라).");
    }
  } else if (/semantic extraction on \d+ files/.test(log)) {
    notes.push("⚠ 로그에 캐시 적중 줄이 없다 — 전량 추출로 돌았다(콜드 부트스트랩이면 정상).");
  }

  // ④-c 토큰. 라벨 단계가 조용히 병목이 되는지 매 실행 눈에 보이게 한다.
  const tokenLines = [...log.matchAll(/tokens:\s*([\d,]+)\s*in\s*\/\s*([\d,]+)\s*out/g)];
  if (tokenLines.length) {
    const total = tokenLines.reduce(
      (acc, m) => ({
        in: acc.in + Number(m[1].replace(/,/g, "")),
        out: acc.out + Number(m[2].replace(/,/g, "")),
      }),
      { in: 0, out: 0 },
    );
    notes.push(`토큰 합계: ${total.in.toLocaleString()} in / ${total.out.toLocaleString()} out (${tokenLines.length}개 구간).`);
  } else {
    notes.push("토큰 0 — LLM 을 한 번도 안 탔다(전 글 캐시 적중).");
  }
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
