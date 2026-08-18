#!/usr/bin/env bun
/**
 * verify-talk — 폭신 대담 3계층이 서로 어긋나지 않았는지 본다.
 *
 * 이 파이프라인의 전제는 하나다: **발행물은 정형본에서 굽고, 정형본은 원문에서 나온다.**
 * 그 전제가 깨지는 길은 셋이고, 셋 다 조용히 깨진다 — 빌드도 타입도 초록이다.
 *
 *   ① 원문이 움직인다      → 다시 굽으면 다른 글이 나온다. 해시로 잡는다
 *   ② 정형본이 규격을 벗어난다 → 굽다가 터지거나 이상한 것이 나온다. 파서로 잡는다
 *   ③ 발행물을 손으로 고친다   → 정형본을 고쳐 다시 굽는 순간 그 수정이 사라진다.
 *                            다시 구워 비교해서 잡는다
 *
 * 그리고 **검증기 자신이 맞게 도는지**도 매번 확인한다(자가검사). 고장을 일부러
 * 주입해 셋이 각각 다른 사유로 걸리는지 보는 것이다 — 검증기가 조용히 아무것도
 * 안 잡게 되는 것이 이 층에서 제일 위험하다.
 *
 * 사용:
 *   bun run talk:verify              # 저장소 상태 + 픽스처 + 자가검사
 *   bun run talk:verify --no-self-test
 *   bun run talk:verify <slug>       # 특정 대담만 (자가검사는 그대로 돈다)
 */
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  buildTalk,
  listTalkSlugs,
  readSourceManifest,
  TalkBuildError,
  type Dirs,
  DEFAULT_POSTS_DIR,
  DEFAULT_TALKS_DIR,
} from "./build-talk";
import { parseTalkSource, TalkParseError } from "../src/lib/talkSource";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const FIXTURES_DIR = join(ROOT, "scripts/fixtures/talk");

let problems = 0;
function fail(msg: string): void {
  problems += 1;
  console.error(`  ✗ ${msg}`);
}
function ok(msg: string): void {
  console.log(`  ✓ ${msg}`);
}
function note(msg: string): void {
  console.log(`  · ${msg}`);
}

/** ─── 1. 저장소의 실제 대담 ───────────────────────────────────────── */

function checkRepoTalks(only?: string): void {
  const dirs: Dirs = { talksDir: DEFAULT_TALKS_DIR, postsDir: DEFAULT_POSTS_DIR };
  const slugs = listTalkSlugs(dirs).filter((s) => !only || s === only);

  console.log(`\n[대담] raws/talks/ — ${slugs.length}건`);
  if (!slugs.length) note("검사할 대담이 없습니다");

  for (const slug of slugs) {
    const hasTalkMd = existsSync(join(dirs.talksDir, slug, "talk.md"));

    // ① 원문 무결성 — talk.md 가 아직 없어도 본다. L1 은 그 자체로 지켜야 하는 것이다.
    let usable = false;
    try {
      const manifest = readSourceManifest(slug, dirs);
      usable = manifest.integrity.usable;
      ok(`${slug} — 원문 ${manifest.files.length}개 해시 일치`);
    } catch (e) {
      if (e instanceof TalkBuildError && /usable=false/.test(e.message)) {
        // 봉인은 정상이고 굽지 못할 뿐이다. talk.md 가 없으면 문제가 아니다.
        if (hasTalkMd) {
          fail(`${slug} — 못 쓰는 원본에서 정형본이 만들어져 있습니다: ${e.message}`);
        } else {
          note(`${slug} — 봉인만 됨 (integrity.usable=false, 정형본 없음). 원본을 다시 받아야 합니다`);
        }
      } else {
        fail(`${slug} — ${(e as Error).message}`);
      }
      continue;
    }

    if (!hasTalkMd) {
      note(`${slug} — 정형본(talk.md)이 아직 없습니다`);
      continue;
    }
    if (!usable) continue;

    // ②③ 정형본 규격 + 발행물 일치
    try {
      const r = buildTalk(slug, dirs);
      if (r.unchanged) {
        ok(`${slug} — 발행물이 정형본에서 구운 것과 같습니다`);
      } else if (!existsSync(r.outPath)) {
        fail(`${slug} — 정형본은 있는데 발행물이 없습니다. \`bun scripts/build-talk.ts ${slug}\``);
      } else {
        fail(
          `${slug} — 발행물이 다시 구운 결과와 다릅니다. 발행물을 손으로 고쳤거나 굽지 않은 변경이 있습니다`,
        );
      }
    } catch (e) {
      fail(`${slug} — ${(e as Error).message}`);
    }
  }

  // 고아 발행물 — 정형본 없이 존재하는 talk-*.mdx
  if (!only && existsSync(dirs.postsDir)) {
    const orphans = readdirSync(dirs.postsDir)
      .filter((f) => /^talk-.+\.mdx$/.test(f))
      .map((f) => f.replace(/^talk-/, "").replace(/\.mdx$/, ""))
      .filter((s) => !existsSync(join(dirs.talksDir, s, "talk.md")));
    for (const s of orphans) {
      fail(`talk-${s}.mdx — 대응하는 raws/talks/${s}/talk.md 가 없습니다 (고아 발행물)`);
    }
  }
}

/** ─── 2. 픽스처 회귀 ─────────────────────────────────────────────── */

function listFixtures(): string[] {
  if (!existsSync(FIXTURES_DIR)) return [];
  return readdirSync(FIXTURES_DIR)
    .filter((n) => !n.startsWith(".") && !n.startsWith("_") && existsSync(join(FIXTURES_DIR, n, "talk.md")))
    .sort();
}

function checkFixtures(): void {
  const names = listFixtures();
  console.log(`\n[픽스처] scripts/fixtures/talk/ — ${names.length}건`);
  for (const name of names) {
    const expectedPath = join(FIXTURES_DIR, name, "expected.mdx");
    if (!existsSync(expectedPath)) {
      fail(`${name} — expected.mdx 가 없습니다`);
      continue;
    }
    try {
      const r = buildTalk(name, { talksDir: FIXTURES_DIR, postsDir: FIXTURES_DIR });
      const expected = readFileSync(expectedPath, "utf-8");
      if (r.mdx === expected) ok(`${name} — 구운 결과가 expected.mdx 와 같습니다`);
      else fail(`${name} — 구운 결과가 expected.mdx 와 다릅니다. 빌더 출력이 바뀌었습니다`);
    } catch (e) {
      fail(`${name} — ${(e as Error).message}`);
    }
  }
}

/** ─── 3. 자가검사 — 고장을 주입해 실제로 걸리는지 본다 ──────────────── */

interface Fault {
  name: string;
  /** 임시로 복사된 픽스처 디렉터리를 망가뜨린다 */
  break: (dir: string, postsDir: string) => void;
  /** 걸렸다고 인정할 조건 */
  expect: (outcome: { error?: Error; unchanged?: boolean }) => boolean;
  /** 사람에게 보여줄, 걸린 이유 */
  describe: (outcome: { error?: Error; unchanged?: boolean }) => string;
}

const FAULTS: Fault[] = [
  {
    name: "원문 1바이트 수정",
    break: (dir) => {
      const p = join(dir, "source/conversation.mdx");
      writeFileSync(p, `${readFileSync(p, "utf-8")} `, "utf-8");
    },
    expect: (o) => o.error instanceof TalkBuildError && /원문이 움직였습니다/.test(o.error.message),
    describe: (o) => o.error?.message ?? "(에러 없음)",
  },
  {
    name: "정형본 스키마 위반 (series 삭제)",
    break: (dir) => {
      const p = join(dir, "talk.md");
      writeFileSync(p, readFileSync(p, "utf-8").replace(/^series: .*\n/m, ""), "utf-8");
    },
    expect: (o) => o.error instanceof TalkBuildError && /series/.test(o.error.message),
    describe: (o) => o.error?.message ?? "(에러 없음)",
  },
  {
    name: "발행물 손수정",
    break: (_dir, postsDir) => {
      const p = join(postsDir, "talk-minimal.mdx");
      writeFileSync(p, `${readFileSync(p, "utf-8")}\n손으로 덧붙인 줄.\n`, "utf-8");
    },
    expect: (o) => o.error === undefined && o.unchanged === false,
    describe: (o) => (o.unchanged === false ? "다시 구운 결과와 발행물이 다름" : "못 잡음"),
  },
  {
    name: "원본이 못 쓰는 상태 (usable=false)",
    break: (dir) => {
      const p = join(dir, "source.json");
      const j = JSON.parse(readFileSync(p, "utf-8"));
      j.integrity.usable = false;
      j.integrity.reason = "자가검사용 주입";
      writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`, "utf-8");
    },
    expect: (o) => o.error instanceof TalkBuildError && /usable=false/.test(o.error.message),
    describe: (o) => o.error?.message ?? "(에러 없음)",
  },
  {
    name: "source.json 삭제",
    break: (dir) => rmSync(join(dir, "source.json")),
    expect: (o) => o.error instanceof TalkBuildError && /source\.json 이 없습니다/.test(o.error.message),
    describe: (o) => o.error?.message ?? "(에러 없음)",
  },
];

function selfTestFaults(): void {
  console.log(`\n[자가검사] 고장 주입 — ${FAULTS.length}종`);
  if (!existsSync(join(FIXTURES_DIR, "minimal"))) {
    fail("minimal 픽스처가 없어 자가검사를 못 합니다");
    return;
  }
  const seen = new Map<string, string>();
  for (const fault of FAULTS) {
    const tmp = mkdtempSync(join(tmpdir(), "talk-verify-"));
    try {
      const talksDir = join(tmp, "talks");
      const postsDir = join(tmp, "posts");
      cpSync(join(FIXTURES_DIR, "minimal"), join(talksDir, "minimal"), { recursive: true });
      cpSync(join(FIXTURES_DIR, "minimal/expected.mdx"), join(postsDir, "talk-minimal.mdx"), {
        recursive: false,
      });
      // 픽스처의 expected.mdx 는 픽스처 경로를 주석에 담고 있다. 임시 자리에서 구우면
      // 그 경로가 달라지므로, 비교 기준을 임시 자리에서 한 번 구워 만든다.
      const baseline = buildTalk("minimal", { talksDir, postsDir });
      writeFileSync(join(postsDir, "talk-minimal.mdx"), baseline.mdx, "utf-8");

      fault.break(join(talksDir, "minimal"), postsDir);

      let outcome: { error?: Error; unchanged?: boolean };
      try {
        const r = buildTalk("minimal", { talksDir, postsDir });
        outcome = { unchanged: r.unchanged };
      } catch (e) {
        outcome = { error: e as Error };
      }
      const detail = fault.describe(outcome);
      if (fault.expect(outcome)) {
        ok(`${fault.name} → ${detail}`);
        const dup = seen.get(detail);
        if (dup) fail(`  ↑ "${dup}" 와 사유가 같습니다 — 구분이 안 됩니다`);
        seen.set(detail, fault.name);
      } else {
        fail(`${fault.name} → 못 잡았습니다 (${detail})`);
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
}

/** ─── 4. 자가검사 — 파서가 규격 위반을 코드별로 갈라내는지 ──────────── */

function fixtureTalkMd(): string {
  return readFileSync(join(FIXTURES_DIR, "minimal/talk.md"), "utf-8");
}

function selfTestParser(): void {
  const base = fixtureTalkMd();
  const cases: { name: string; src: string; code: string }[] = [
    {
      name: "정수 인용구 3개",
      code: "PULLQUOTE_COUNT",
      src: base.replace(
        "## 마치며",
        "> [!정수]\n> 둘째.\n\n> [!정수]\n> 셋째.\n\n## 마치며",
      ),
    },
    { name: "series 누락", code: "FRONTMATTER_INVALID", src: base.replace(/^series: .*\n/m, "") },
    {
      name: "author 가 교수님",
      code: "AUTHOR_IS_INTERVIEWEE",
      src: base.replace("author: ppangto", "author: ppangtolab-prof"),
    },
    { name: "질문문 없음", code: "Q_EMPTY", src: base.replace(/^## Q\. .*$/m, "## Q.") },
    { name: "질문 0개", code: "NO_QA", src: base.split("## Q.")[0] },
    {
      name: "template 을 적음",
      code: "TEMPLATE_IN_FRONTMATTER",
      src: base.replace("draft: true", "draft: true\ntemplate: talk"),
    },
    {
      name: "마치며가 마지막이 아님",
      code: "CLOSING_NOT_LAST",
      src: `${base}\n## Q. 뒤늦은 질문\n\n답변.\n`,
    },
    {
      name: "카테고리가 목록에 없음",
      code: "FRONTMATTER_INVALID",
      src: base.replace("category: architecture", "category: 아키텍처"),
    },
    {
      name: "frontmatter 에 블록 스칼라",
      code: "FRONTMATTER_UNSUPPORTED",
      src: base.replace(/^description: .*$/m, "description: |\n  여러 줄\n  값"),
    },
  ];

  console.log(`\n[자가검사] 파서 규격 위반 — ${cases.length}종`);
  try {
    parseTalkSource(base);
    ok("정상 픽스처는 통과합니다");
  } catch (e) {
    fail(`정상 픽스처가 실패했습니다 — ${(e as Error).message}`);
  }
  for (const c of cases) {
    try {
      parseTalkSource(c.src);
      fail(`${c.name} → 통과해 버렸습니다 (${c.code} 를 기대)`);
    } catch (e) {
      if (!(e instanceof TalkParseError)) {
        fail(`${c.name} → TalkParseError 가 아닙니다: ${(e as Error).message}`);
      } else if (e.code !== c.code) {
        fail(`${c.name} → ${c.code} 를 기대했는데 ${e.code} 가 났습니다`);
      } else {
        ok(`${c.name} → [${e.code}]`);
      }
    }
  }
}

/** ─── main ──────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const only = argv.find((a) => !a.startsWith("--"));
const selfTest = !argv.includes("--no-self-test");

checkRepoTalks(only);
checkFixtures();
if (selfTest) {
  selfTestParser();
  selfTestFaults();
}

console.log(
  problems === 0
    ? "\n[verify-talk] ✓ 대담 3계층에 어긋남 없음"
    : `\n[verify-talk] ✗ ${problems}건`,
);
process.exit(problems === 0 ? 0 : 1);
