#!/usr/bin/env bun
/**
 * ingest-talk — 대화 원본을 L1 으로 봉인하고, 정규화된 **발화 목록**을 낸다.
 *
 * 규칙의 정본은 `raws/talks/_rules/NORMALIZE_RULES.md` 이고 이 파일이 그 구현이다.
 * 여기서 하는 일은 **버리기와 봉인**뿐이다 — 문장을 고치거나 합치거나 순서를 바꾸지
 * 않는다. 그건 `talk-ingest` 스킬이 맡는 판단이다.
 *
 * 왜 스크립트인가: 무엇을 버릴지는 이미 표로 정해져 있다. 정해진 것을 산문으로
 * 지시하면 매번 조금씩 다르게 실행된다.
 *
 * 사용:
 *   bun scripts/ingest-talk.ts --from <원본 파일> --slug <slug>   # 봉인 + 발화 목록
 *   bun scripts/ingest-talk.ts --slug <slug>                     # 이미 봉인된 것에서 다시 뽑기
 *   … --json          발화 목록을 JSON 으로
 *   … --talks-dir <디렉터리>   픽스처처럼 다른 자리에서 돌릴 때
 *   … --force         이미 있는 <slug>/ 를 덮어쓴다
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { DEFAULT_TALKS_DIR, type SourceManifest } from "./build-talk";

const ROOT = resolve(new URL("..", import.meta.url).pathname);

export interface Utterance {
  role: "interviewer" | "interviewee";
  /** 원본의 step_index 를 그대로 보존한다 — L2 에서 원본 지점을 되짚을 수 있게 */
  index: number;
  text: string;
}

export interface NormalizeResult {
  adapter: string;
  utterances: Utterance[];
  /** 원본에서 건진 출처 메타 (버리기 전에 뽑는다) */
  origin: { model?: string; conversedAt?: string };
  integrity: {
    usable: boolean;
    truncatedNodes: number;
    truncatedBytes: number;
    keptUtterances: number;
    reason: string | null;
  };
  /** 남길 발화에서 발견된 민감 패턴 */
  sensitive: { pattern: string; sample: string; index: number }[];
}

export class IngestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IngestError";
  }
}

/** NORMALIZE_RULES §7 — 이 저장소는 공개다. 자동 치환하지 않고 멈춘다. */
const SENSITIVE: [string, RegExp][] = [
  ["홈 절대경로", /\/Users\/[A-Za-z0-9._-]+/g],
  ["file URL", /file:\/\/\//g],
  ["도구 설정 경로", /~?\/\.(claude|gemini|agents)\b/g],
  ["세션·태스크 UUID", /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g],
  ["토큰꼴", /\b(ghp_|gho_|sk-|AKIA)[A-Za-z0-9]{8,}/g],
  ["이메일", /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g],
  ["개인키 헤더", /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
];

const TRUNCATED = /<truncated (\d+) bytes?>/g;

/** ─── 어댑터 ────────────────────────────────────────────────────── */

interface Adapter {
  id: string;
  detect: (text: string) => boolean;
  normalize: (text: string) => NormalizeResult;
}

interface GraphNode {
  id: string;
  step_index: number;
  source: string;
  type: string;
  content?: string;
  tool_calls?: unknown[];
}

const antigravityGraphMdx: Adapter = {
  id: "antigravity-graph-mdx",
  detect: (text) => /^export const flatNodesData = \[/m.test(text),
  normalize(text) {
    // `graphData` 가 아니라 `flatNodesData` 를 읽는다 — 표본에서 트리 쪽이 불완전했다.
    const line = text.split("\n").find((l) => l.startsWith("export const flatNodesData ="));
    if (!line) throw new IngestError("flatNodesData 를 찾지 못했습니다");
    const nodes = JSON.parse(
      line.slice("export const flatNodesData =".length).trim().replace(/;$/, ""),
    ) as GraphNode[];

    const kept = nodes.filter(
      (n) =>
        (n.content ?? "").trim() !== "" &&
        ((n.source === "USER_EXPLICIT" && n.type === "USER_INPUT") ||
          (n.source === "MODEL" && n.type === "PLANNER_RESPONSE")),
    );

    // 버리기 전에 메타를 건진다 (NORMALIZE_RULES §3)
    const firstUser = kept.find((n) => n.type === "USER_INPUT")?.content ?? "";
    const origin = {
      conversedAt: /The current local time is: ([0-9T:+\-]+)\./.exec(firstUser)?.[1],
      model: /`Model Selection` from \S+ to (.+?)\. No need to comment/.exec(firstUser)?.[1],
    };

    let truncatedNodes = 0;
    let truncatedBytes = 0;
    for (const n of kept) {
      const hits = [...(n.content ?? "").matchAll(TRUNCATED)];
      if (hits.length) {
        truncatedNodes += 1;
        truncatedBytes += hits.reduce((a, m) => a + Number(m[1]), 0);
      }
    }

    const utterances: Utterance[] = kept.map((n) => ({
      role: n.type === "USER_INPUT" ? "interviewer" : "interviewee",
      index: n.step_index,
      text: stripWrappers(n.content ?? ""),
    }));

    const sensitive: NormalizeResult["sensitive"] = [];
    for (const u of utterances) {
      for (const [name, re] of SENSITIVE) {
        const m = new RegExp(re.source, re.flags).exec(u.text);
        if (m) sensitive.push({ pattern: name, sample: m[0], index: u.index });
      }
    }

    return {
      adapter: this.id,
      utterances,
      origin,
      integrity: {
        usable: truncatedNodes === 0,
        truncatedNodes,
        truncatedBytes,
        keptUtterances: utterances.length,
        reason:
          truncatedNodes === 0
            ? null
            : `남길 발화 ${truncatedNodes}개가 <truncated N bytes> 로 잘려 있다(유실 ${truncatedBytes}B)` +
              " — L1 로 봉인은 하되 L2 생성은 거부한다 (NORMALIZE_RULES §5)",
      },
      sensitive,
    };
  },
};

const ADAPTERS: Adapter[] = [antigravityGraphMdx];

/** `<USER_REQUEST>` 안쪽만 남기고 메타 래퍼를 벗긴다 (NORMALIZE_RULES §3). */
function stripWrappers(content: string): string {
  const req = /<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/.exec(content);
  if (req) return req[1].trim();
  return content
    .replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, "")
    .replace(/<USER_SETTINGS_CHANGE>[\s\S]*?<\/USER_SETTINGS_CHANGE>/g, "")
    .trim();
}

export function pickAdapter(text: string): Adapter {
  const found = ADAPTERS.find((a) => a.detect(text));
  if (!found) {
    throw new IngestError(
      `어느 어댑터로도 읽을 수 없는 형식입니다. 추측해서 읽지 않습니다 — ` +
        `raws/talks/_rules/NORMALIZE_RULES.md §1 에 어댑터를 추가하세요 ` +
        `(지금 있는 것: ${ADAPTERS.map((a) => a.id).join(", ")})`,
    );
  }
  return found;
}

/** ─── 봉인 ──────────────────────────────────────────────────────── */

export function seal(
  fromPath: string,
  slug: string,
  opts: { talksDir?: string; force?: boolean; capturedAt: string } ,
): { dir: string; manifest: SourceManifest; result: NormalizeResult } {
  const talksDir = opts.talksDir ?? DEFAULT_TALKS_DIR;
  const dir = join(talksDir, slug);
  if (existsSync(dir) && !opts.force) {
    throw new IngestError(`${dir} 가 이미 있습니다. 덮어쓰려면 --force`);
  }
  const text = readFileSync(fromPath, "utf-8");
  const adapter = pickAdapter(text);
  const result = adapter.normalize(text);

  if (result.utterances.length === 0) {
    throw new IngestError("남는 발화가 0개입니다 (NORMALIZE_RULES §4-3)");
  }

  // 민감 패턴은 **복사하기 전에** 막는다. 잘린 원본(§5)은 기록으로 남길 값이 있어
  // 봉인하지만, 유출은 봉인하는 순간 저장소에 박히므로 되돌릴 값이 없다.
  if (result.sensitive.length) {
    throw new IngestError(
      `민감 패턴이 남길 발화에서 발견됐습니다 — 봉인하지 않았습니다 (NORMALIZE_RULES §4-4·§7).\n` +
        `자동으로 치환하지 않습니다. 원문이 원문이 아니게 되기 때문입니다.\n` +
        result.sensitive.map((s) => `  [${s.index}] ${s.pattern} — ${s.sample}`).join("\n"),
    );
  }

  mkdirSync(join(dir, "source"), { recursive: true });
  const name = basename(fromPath);
  copyFileSync(fromPath, join(dir, "source", name));

  const buf = readFileSync(join(dir, "source", name));
  const manifest: SourceManifest = {
    schemaVersion: 1,
    slug,
    adapter: adapter.id,
    origin: {
      tool: adapter.id,
      model: result.origin.model ?? null,
      conversedAt: result.origin.conversedAt ?? null,
      capturedAt: opts.capturedAt,
      from: fromPath.startsWith(`${ROOT}/`) ? fromPath.slice(ROOT.length + 1) : fromPath,
    },
    files: [
      { path: `source/${name}`, bytes: buf.byteLength, sha256: createHash("sha256").update(buf).digest("hex") },
    ],
    integrity: result.integrity,
  };
  writeFileSync(join(dir, "source.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
  return { dir, manifest, result };
}

/** 이미 봉인된 L1 에서 발화 목록을 다시 뽑는다. 봉인은 건드리지 않는다. */
export function normalizeSealed(slug: string, talksDir = DEFAULT_TALKS_DIR): NormalizeResult {
  const dir = join(talksDir, slug);
  const manifestPath = join(dir, "source.json");
  if (!existsSync(manifestPath)) throw new IngestError(`${manifestPath} 가 없습니다`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as SourceManifest;
  const merged: NormalizeResult[] = manifest.files.map((f) => {
    const text = readFileSync(join(dir, f.path), "utf-8");
    return pickAdapter(text).normalize(text);
  });
  const first = merged[0];
  if (merged.length === 1) return first;
  return {
    adapter: first.adapter,
    utterances: merged.flatMap((m) => m.utterances),
    origin: first.origin,
    integrity: {
      usable: merged.every((m) => m.integrity.usable),
      truncatedNodes: merged.reduce((a, m) => a + m.integrity.truncatedNodes, 0),
      truncatedBytes: merged.reduce((a, m) => a + m.integrity.truncatedBytes, 0),
      keptUtterances: merged.reduce((a, m) => a + m.integrity.keptUtterances, 0),
      reason: merged.find((m) => m.integrity.reason)?.integrity.reason ?? null,
    },
    sensitive: merged.flatMap((m) => m.sensitive),
  };
}

/** ─── 출력 ──────────────────────────────────────────────────────── */

function renderUtterances(slug: string, r: NormalizeResult): string {
  const lines = [
    `# ${slug} — 발화 ${r.utterances.length}개 (어댑터 ${r.adapter})`,
    "",
    "> 정규화 결과다. 파일로 남기지 않는다 — 정본은 talk.md 하나뿐이다.",
    "> `[n]` 은 원본의 step_index 다. L2 에서 원본 지점을 되짚을 때 쓴다.",
  ];
  for (const u of r.utterances) {
    lines.push("");
    lines.push(`## [${u.index}] ${u.role === "interviewer" ? "인터뷰어(질문)" : "교수님(답변)"}`);
    lines.push("");
    lines.push(u.text);
  }
  return `${lines.join("\n")}\n`;
}

/** ─── main ──────────────────────────────────────────────────────── */

function flag(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : argv[i + 1];
}

function main(argv: string[]): number {
  const from = flag(argv, "--from");
  const slug = flag(argv, "--slug");
  const talksDir = flag(argv, "--talks-dir");
  const asJson = argv.includes("--json");
  const force = argv.includes("--force");

  if (!slug) {
    console.error("사용: bun scripts/ingest-talk.ts --from <원본> --slug <slug> [--json] [--force]");
    return 1;
  }

  try {
    let result: NormalizeResult;
    let where: string;
    if (from) {
      const capturedAt = new Date().toISOString().slice(0, 10);
      const sealed = seal(resolve(from), slug, {
        talksDir: talksDir ? resolve(talksDir) : undefined,
        force,
        capturedAt,
      });
      result = sealed.result;
      where = sealed.dir;
      console.error(`봉인   ${where}/source/ · source.json`);
    } else {
      result = normalizeSealed(slug, talksDir ? resolve(talksDir) : DEFAULT_TALKS_DIR);
      where = join(talksDir ?? DEFAULT_TALKS_DIR, slug);
    }

    // 이미 봉인된 것을 다시 뽑는 경로에서도 유출은 막는다(봉인 시점에 규칙이 없었을 수 있다).
    if (result.sensitive.length) {
      console.error(`\n민감 패턴이 남길 발화에서 발견됐습니다 (NORMALIZE_RULES §4-4·§7).`);
      console.error(`자동으로 치환하지 않습니다 — 원문이 원문이 아니게 되기 때문입니다.`);
      for (const s of result.sensitive) {
        console.error(`  [${s.index}] ${s.pattern} — ${s.sample}`);
      }
      return 1;
    }
    // 잘림은 하드 실패이되 봉인은 남긴다 — 왜 못 썼는지가 기록으로 남아야 한다.
    if (!result.integrity.usable) {
      console.error(`\n${result.integrity.reason}`);
      console.error(`원본을 다시 받아야 합니다. 봉인은 ${where} 에 남겨 두었습니다.`);
      return 1;
    }

    process.stdout.write(asJson ? `${JSON.stringify(result, null, 2)}\n` : renderUtterances(slug, result));
    return 0;
  } catch (e) {
    console.error(`실패   ${(e as Error).message}`);
    return 1;
  }
}

if (import.meta.main) {
  process.exit(main(process.argv.slice(2)));
}
