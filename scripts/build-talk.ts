#!/usr/bin/env bun
/**
 * build-talk — L2 정형본(`raws/talks/<slug>/talk.md`)을 발행물
 * (`src/content/posts/talk-<slug>.mdx`)로 굽는다.
 *
 * **발행물은 파생물이다.** 손으로 고치지 않는다 — 고칠 것이 있으면 L2 를 고치고
 * 다시 굽는다. 그래야 "원문이 있으니 언제든 다시 만든다"가 참으로 남는다.
 *
 * 이 스크립트가 지키는 계약은 `polssin-daedam` 명세에서 **기계가 잡을 수 있는 것**
 * 넷이다. 셋은 파서(`src/lib/talkSource.ts`)가 이미 보고, 여기서는 그 결과를
 * 템플릿(`src/templates/talk-episode.mdx`)의 모양으로 옮기면서 `template: talk` 을
 * 박는다(SP5) — 그래서 L2 에는 그 필드를 쓰지 않는다.
 *
 * L1 도 함께 본다. `raws/talks/<slug>/source.json` 이 없거나, 해시가 어긋나거나,
 * `integrity.usable` 이 false 면 굽지 않는다. 잘린 원본에서 대담을 만들면 그 대담은
 * 다시 만들 수 없기 때문이다.
 *
 * 사용:
 *   bun scripts/build-talk.ts <slug>            # raws/talks/<slug>/talk.md 를 굽는다
 *   bun scripts/build-talk.ts <talk.md 경로>     # 경로로 지정해도 된다
 *   bun scripts/build-talk.ts --all             # raws/talks/ 아래 전부
 *   bun scripts/build-talk.ts <slug> --check    # 쓰지 않고 기존 발행물과 비교만 한다
 *   bun scripts/build-talk.ts --all --talks-dir <디렉터리> --out-dir <디렉터리>
 *                                               # 픽스처처럼 다른 자리에서 돌릴 때
 *
 * 입출력 디렉터리를 인자로 받는 것은 편의가 아니다. 픽스처를 `raws/talks/` 에 두면
 * 그 픽스처가 곧 발행 글이 되어 버린다 — 검증용 가짜 대담이 사이트에 실리는 것을
 * 막으려면 검증기가 다른 자리에서 같은 코드를 돌릴 수 있어야 한다.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseTalkSource, TalkParseError, type TalkSource } from "../src/lib/talkSource";

// `check-emphasis.ts` 와 같은 방식 — `import.meta.dir` 은 bun 전용이라 tsc 가 못 본다.
const ROOT = resolve(new URL("..", import.meta.url).pathname);
export const DEFAULT_TALKS_DIR = join(ROOT, "raws/talks");
export const DEFAULT_POSTS_DIR = join(ROOT, "src/content/posts");

/** 입출력 자리. 기본은 저장소의 진짜 자리, 픽스처 검증은 여기만 바꿔 같은 코드를 돌린다. */
export interface Dirs {
  talksDir: string;
  postsDir: string;
}
const DEFAULT_DIRS: Dirs = { talksDir: DEFAULT_TALKS_DIR, postsDir: DEFAULT_POSTS_DIR };

/** `raws/talks/` 안에서 슬러그가 아닌 것 — `_` 로 시작하면 대담이 아니다. */
function isSlugDir(name: string): boolean {
  return !name.startsWith(".") && !name.startsWith("_");
}

export interface SourceManifest {
  schemaVersion: number;
  slug: string;
  adapter: string;
  origin: Record<string, unknown>;
  files: { path: string; bytes: number; sha256: string }[];
  integrity: {
    usable: boolean;
    truncatedNodes?: number;
    truncatedBytes?: number;
    keptUtterances?: number;
    reason?: string | null;
  };
}

export class TalkBuildError extends Error {
  readonly slug: string;
  constructor(slug: string, message: string) {
    super(`[${slug}] ${message}`);
    this.name = "TalkBuildError";
    this.slug = slug;
  }
}

/** 굽는 결과. `--check` 여부와 무관하게 같은 문자열이 나온다. */
export interface BuildResult {
  slug: string;
  outPath: string;
  mdx: string;
  /** 기존 파일과 같은가. 파일이 없으면 false */
  unchanged: boolean;
}

export function listTalkSlugs(dirs: Dirs = DEFAULT_DIRS): string[] {
  if (!existsSync(dirs.talksDir)) return [];
  return readdirSync(dirs.talksDir)
    .filter(isSlugDir)
    .filter((name) => statSync(join(dirs.talksDir, name)).isDirectory())
    .sort();
}

/** L1 을 읽고 해시·무결성을 본다. 어긋나면 던진다. */
export function readSourceManifest(slug: string, dirs: Dirs = DEFAULT_DIRS): SourceManifest {
  const dir = join(dirs.talksDir, slug);
  const manifestPath = join(dir, "source.json");
  if (!existsSync(manifestPath)) {
    throw new TalkBuildError(slug, "source.json 이 없습니다 — L2 는 L1 없이 설 수 없습니다");
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as SourceManifest;

  if (manifest.slug !== slug) {
    throw new TalkBuildError(
      slug,
      `source.json 의 slug 가 디렉터리 이름과 다릅니다 — "${manifest.slug}"`,
    );
  }
  if (!manifest.files?.length) {
    throw new TalkBuildError(slug, "source.json 에 files 가 비어 있습니다");
  }
  for (const f of manifest.files) {
    const p = join(dir, f.path);
    if (!existsSync(p)) {
      throw new TalkBuildError(slug, `원문 파일이 없습니다 — ${f.path}`);
    }
    const buf = readFileSync(p);
    const sha = createHash("sha256").update(buf).digest("hex");
    if (buf.byteLength !== f.bytes || sha !== f.sha256) {
      throw new TalkBuildError(
        slug,
        `원문이 움직였습니다 — ${f.path} (기록 ${f.bytes}B/${f.sha256.slice(0, 12)}…, ` +
          `지금 ${buf.byteLength}B/${sha.slice(0, 12)}…). L1 은 불변입니다`,
      );
    }
  }
  if (!manifest.integrity?.usable) {
    throw new TalkBuildError(
      slug,
      `원본이 대담 정본으로 쓸 수 없는 상태입니다 (integrity.usable=false)` +
        (manifest.integrity?.reason ? ` — ${manifest.integrity.reason}` : ""),
    );
  }
  return manifest;
}

/** YAML 이중따옴표 스칼라. 우리가 내보내는 값만 다루므로 이스케이프 둘이면 충분하다. */
function yamlString(v: string): string {
  return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function renderFrontmatter(src: TalkSource): string {
  const fm = src.frontmatter;
  const lines = [
    `title: ${yamlString(fm.title)}`,
    ...(fm.description ? [`description: ${yamlString(fm.description)}`] : []),
    `pubDate: ${fm.pubDate}`,
    `category: ${fm.category}`,
    `author: ${fm.author}`,
    `tags: [${fm.tags.map(yamlString).join(", ")}]`,
    `series: ${yamlString(fm.series)}`,
    `order: ${fm.order}`,
    // SP5 — 이 값이 대담 레이아웃을 활성화한다. L2 에는 없고 여기서만 박는다.
    `template: talk`,
    `draft: ${fm.draft}`,
  ];
  return `---\n${lines.join("\n")}\n---`;
}

/**
 * 발행물 MDX 를 만든다.
 *
 * 답변 본문은 **들여쓰지 않는다.** 템플릿 자산은 2칸 들여쓰지만, 굽는 답변에는
 * 코드블록·표가 들어올 수 있고 들여쓰기가 붙으면 그것들이 다른 뜻이 된다.
 * MDX 는 JSX 자식으로 온 마크다운을 빈 줄로만 구분하므로 들여쓰기가 필요 없다.
 */
export function renderMdx(src: TalkSource, sourceLabel?: string): string {
  const from = sourceLabel ?? `raws/talks/${src.frontmatter.source}/talk.md`;
  const parts: string[] = [
    renderFrontmatter(src),
    "",
    `import QA from "../../components/talk/QA.astro";`,
    `import PullQuote from "../../components/talk/PullQuote.astro";`,
    "",
    `{/* 이 파일은 scripts/build-talk.ts 가 ${from} 에서 구운 파생물입니다.`,
    `    손으로 고치지 마세요 — 고칠 것이 있으면 talk.md 를 고치고 다시 구우세요. */}`,
  ];

  for (const qa of src.qa) {
    parts.push("");
    // q 는 JSON 문자열 표현식으로 넣는다 — 질문에 따옴표가 들어와도 안 깨진다.
    parts.push(`<QA n={${qa.n}} q={${JSON.stringify(qa.q)}}>`);
    parts.push("");
    parts.push(qa.answer);
    parts.push("");
    parts.push("</QA>");
    for (const quote of qa.pullQuotes) {
      parts.push("");
      parts.push("<PullQuote>");
      parts.push("");
      parts.push(quote);
      parts.push("");
      parts.push("</PullQuote>");
    }
  }

  if (src.closing) {
    parts.push("");
    parts.push("## 마치며");
    parts.push("");
    parts.push(src.closing);
  }

  return normalize(parts.join("\n"));
}

/**
 * 출력 정규화. 재현성 비교가 공백 하나에 걸리지 않도록 **빌더와 검증기가 이 함수를
 * 공유한다.** LF · 줄 끝 공백 없음 · 빈 줄 3개 이상 금지 · 마지막 개행 하나.
 */
export function normalize(text: string): string {
  return `${text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()}\n`;
}

export function buildTalk(slug: string, dirs: Dirs = DEFAULT_DIRS): BuildResult {
  const talkPath = join(dirs.talksDir, slug, "talk.md");
  if (!existsSync(talkPath)) {
    throw new TalkBuildError(slug, "talk.md 가 없습니다 — 아직 L2 가 만들어지지 않았습니다");
  }
  readSourceManifest(slug, dirs);

  let src: TalkSource;
  try {
    src = parseTalkSource(readFileSync(talkPath, "utf-8"));
  } catch (e) {
    if (e instanceof TalkParseError) throw new TalkBuildError(slug, `talk.md — ${e.message}`);
    throw e;
  }
  if (src.frontmatter.source !== slug) {
    throw new TalkBuildError(
      slug,
      `talk.md 의 source 가 디렉터리 이름과 다릅니다 — "${src.frontmatter.source}"`,
    );
  }

  const rel = talkPath.startsWith(`${ROOT}/`) ? talkPath.slice(ROOT.length + 1) : talkPath;
  const mdx = renderMdx(src, rel);
  const outPath = join(dirs.postsDir, `talk-${slug}.mdx`);
  const unchanged = existsSync(outPath) && readFileSync(outPath, "utf-8") === mdx;
  return { slug, outPath, mdx, unchanged };
}

function flagValue(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : argv[i + 1];
}

function main(argv: string[]): number {
  const check = argv.includes("--check");
  const all = argv.includes("--all");
  const talksDir = flagValue(argv, "--talks-dir");
  const outDir = flagValue(argv, "--out-dir");
  const dirs: Dirs = {
    talksDir: talksDir ? resolve(talksDir) : DEFAULT_TALKS_DIR,
    postsDir: outDir ? resolve(outDir) : DEFAULT_POSTS_DIR,
  };
  const skip = new Set([talksDir, outDir].filter(Boolean) as string[]);
  const positional = argv.filter((a) => !a.startsWith("--") && !skip.has(a));

  let slugs: string[];
  if (all) {
    slugs = listTalkSlugs(dirs);
  } else if (positional.length) {
    slugs = positional.map((a) => {
      const m = /talks?\/([^/]+)\/talk\.md$/.exec(a.replace(/\\/g, "/"));
      return m ? m[1] : a;
    });
  } else {
    console.error("사용: bun scripts/build-talk.ts <slug|talk.md 경로> [--check]  또는  --all");
    return 1;
  }

  if (!slugs.length) {
    console.log(`${dirs.talksDir} 에 대담이 없습니다 — 할 일 없음`);
    return 0;
  }

  let failed = 0;
  let written = 0;
  for (const slug of slugs) {
    try {
      const r = buildTalk(slug, dirs);
      if (check) {
        if (r.unchanged) {
          console.log(`같음   ${slug} → ${r.outPath.replace(`${ROOT}/`, "")}`);
        } else {
          console.log(
            `다름   ${slug} → ${r.outPath.replace(`${ROOT}/`, "")}` +
              ` — talk.md 에서 다시 구운 결과와 발행물이 다릅니다.` +
              ` 발행물을 손으로 고쳤거나 굽지 않은 변경이 있습니다`,
          );
          failed += 1;
        }
        continue;
      }
      if (r.unchanged) {
        console.log(`그대로 ${slug}`);
      } else {
        mkdirSync(dirs.postsDir, { recursive: true });
        writeFileSync(r.outPath, r.mdx, "utf-8");
        written += 1;
        console.log(`구움   ${slug} → ${r.outPath.replace(`${ROOT}/`, "")}`);
      }
    } catch (e) {
      failed += 1;
      console.error(`실패   ${(e as Error).message}`);
    }
  }

  console.log(
    `\n대담 ${slugs.length}건 · ${check ? "비교" : "굽기"} · 실패 ${failed}` +
      (check ? "" : ` · 새로 쓴 것 ${written}`),
  );
  return failed === 0 ? 0 : 1;
}

if (import.meta.main) {
  process.exit(main(process.argv.slice(2)));
}
