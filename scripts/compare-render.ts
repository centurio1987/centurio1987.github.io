#!/usr/bin/env bun
/**
 * compare-render — 변경 전후의 **계산된 스타일을 전수 대조**한다.
 *
 * 왜 필요한가.
 *   토큰화는 대부분 "값이 같은 리터럴을 var() 로 바꾸는 일"이라 화면이 한 픽셀도 안 바뀌어야
 *   한다. 그런데 그것을 확인할 길이 눈밖에 없다 — 빌드도 타입도 초록이고, `var(--없는토큰)`
 *   은 선언을 통째로 무효로 만들면서 **에러를 안 낸다.** `verify-tokens` 는 소스의 표기를
 *   보지 화면을 안 보므로 이 구멍을 못 막는다.
 *
 *   그리고 이 대조는 **직접 짜면 조용히 통과한다.** KAN-072 배치5 가 실측으로 남긴 고장 셋이
 *   있다(`KANBAN.cards/KAN-072-CPJCT1.md:229`).
 *     ① 인라인 스타일을 `[style*='#hex']` 로 세면 안 된다 — React 는 재렌더 때 인라인 hex 를
 *        `rgb()` 로 정규화해서 **조작이 건드린 노드만 골라 셀렉터에서 빠진다.** 정작 봐야 하는
 *        조건부 색이 빠지고 결과는 "0곳, 이상 없음"으로 나온다.
 *     ② 셀렉터에 리터럴을 박으면 치환 후 조용히 0 이 된다(`[style*='2px solid']`).
 *     ③ 0건 통과를 그냥 믿으면 안 된다 — 고장을 주입해 무는지 먼저 본다.
 *   그래서 이 스크립트는 셀렉터로 안 세고 `getComputedStyle` 로 전수로 재며, `--self-test`
 *   가 고장 셋을 실제로 주입해 무는지 확인한다.
 *
 * 왜 격리 사본인가.
 *   같은 워크트리에서 찍은 전후는 못 믿는다 — 병렬 세션이 고친 파일이 내 몫으로 잡힌다
 *   (KAN-072 실측: 홈 −49px · 글 목록 −483px 이 남의 변경이었다). 그래서 **내가 고친 파일만
 *   HEAD 로 되돌린 사본**과 **지금 상태 사본**을 각각 따로 구워 대조한다.
 *
 * 게이트가 아니다. CI 에 안 물린다 — 사람이 부르는 개발 도구다.
 *
 * 사용:
 *   bun scripts/compare-render.ts                      # 변경 파일 자동 감지 → 대응 글만 대조
 *   bun scripts/compare-render.ts --ns s3              # 병렬 시 네임스페이스(필수)
 *   bun scripts/compare-render.ts --pages /posts/tauri-2/
 *   bun scripts/compare-render.ts --self-test          # 고장 3종이 물리는지
 *   bun scripts/compare-render.ts --keep               # 사본·빌드를 남긴다
 *
 * 차이가 있으면 종료코드 1.
 */
import { spawnSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(n);
const opt = (n: string, d = "") => {
  const i = argv.indexOf(n);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};

const NS = opt("--ns", "default");
const KEEP = flag("--keep");
const SELF_TEST = flag("--self-test");
const MAX_STATES = Number(opt("--states", "8"));
const SUMMARY = flag("--summary");
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

process.on("uncaughtException", (e) => { console.error("\n✗ 예외로 죽었다:", e); process.exit(3); });
process.on("unhandledRejection", (e) => { console.error("\n✗ 안 잡힌 거부로 죽었다:", e); process.exit(3); });
process.on("exit", (c) => { if (c !== 0 && c !== 1) console.error(`\n✗ 종료코드 ${c} 로 끝났다`); });

const failures: string[] = [];
const notes: string[] = [];
/** 즉시 나가는 진행 로그 — notes[] 는 끝에야 찍혀서 긴 실행의 정지 지점을 못 짚는다. */
const t0 = Date.now();
const log = (m: string) => console.error(`  [${String(Math.round((Date.now() - t0) / 1000)).padStart(4)}s] ${m}`);

// ── 사본 자리. 레포 **밖**이다 — 안에 두면 tsc 가 두 벌로 훑고(실측 에러 4→2),
//    `dist-s9` 같은 이름은 .gitignore 의 `dist` 정확 일치에 안 걸린다.
const WORK = join(
  process.env.TMPDIR ?? "/tmp",
  `compare-render-${NS}-${process.env.USER ?? "u"}`,
);

const sh = (cmd: string, args: string[], cwd = ROOT, quiet = true) => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf-8", maxBuffer: 1 << 28 });
  if (r.status !== 0 && !quiet) {
    throw new Error(`${cmd} ${args.join(" ")} → ${r.status}\n${r.stderr ?? ""}${r.stdout ?? ""}`);
  }
  return r;
};

/** 지금 워크트리에서 HEAD 대비 바뀐 `src/` 파일. */
function changedFiles(): string[] {
  const given = opt("--files");
  if (given) return given.split(",").map((s) => s.trim()).filter(Boolean);
  const r = sh("git", ["diff", "--name-only", "HEAD", "--", "src/"]);
  const staged = sh("git", ["diff", "--cached", "--name-only", "--", "src/"]);
  const untracked = sh("git", ["ls-files", "--others", "--exclude-standard", "--", "src/"]);
  return [...new Set(
    `${r.stdout}\n${staged.stdout}\n${untracked.stdout}`.split("\n").map((s) => s.trim()).filter(Boolean),
  )].sort();
}

/**
 * 파일 → 대조할 페이지.
 *
 * `src/components/posts/<slug>/X.tsx` 의 `<slug>` 는 `src/content/posts/<slug>.mdx` 와
 * 1:1 이라 글 주소가 그대로 나온다. 그 밖의 파일이 섞이면 어느 글에 나오는지 모르므로
 * **전 글 대조로 올린다** — 좁혀서 놓치는 것보다 넓게 재는 쪽이 싸다.
 */
function pagesFor(files: string[]): { pages: string[]; widened: boolean } {
  const given = opt("--pages");
  if (given) return { pages: given.split(",").map((s) => s.trim()).filter(Boolean), widened: false };
  const slugs = new Set<string>();
  let widened = false;
  for (const f of files) {
    const m = f.match(/^src\/components\/posts\/([^/]+)\//);
    if (m && existsSync(join(ROOT, "src/content/posts", `${m[1]}.mdx`))) slugs.add(m[1]);
    else widened = true;
  }
  if (widened || !slugs.size) {
    const r = sh("bash", ["-lc", "ls src/content/posts/*.mdx | xargs -n1 basename | sed 's/\\.mdx$//'"]);
    for (const s of r.stdout.split("\n").map((x) => x.trim()).filter(Boolean)) slugs.add(s);
  }
  return { pages: [...slugs].sort().map((s) => `/posts/${s}/`), widened };
}

/**
 * 격리 사본 하나를 만든다.
 *
 * `--link-dest` 하드링크다 — 심링크 `node_modules` 로는 빌드가 안 된다(vite 가 심링크 실제
 * 경로를 사본 루트에 다시 붙여 없는 경로를 만든다). 204MB 가 3.8초다(KAN-072 실측).
 * `--exclude '/dist'` 의 앞 `/` 는 앵커다 — 없으면 `node_modules/astro/dist` 까지 지운다.
 */
function makeCopy(dest: string, revert: string[]) {
  log(`사본 ${dest.split("/").pop()} (되돌릴 파일 ${revert.length}개)`);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  const r = sh("rsync", [
    "-a", `--link-dest=${ROOT}/`,
    "--exclude", "/dist", "--exclude", "/.git", "--exclude", "/.astro",
    `${ROOT}/`, `${dest}/`,
  ]);
  if (r.status !== 0) throw new Error(`rsync 실패: ${r.stderr}`);
  // 되돌리기는 `git show HEAD:` 로 한다 — `git checkout` 은 공유 인덱스를 건드린다.
  for (const f of revert) {
    const got = sh("git", ["show", `HEAD:${f}`]);
    if (got.status !== 0) { rmSync(join(dest, f), { force: true }); continue; }  // HEAD 에 없던 새 파일
    writeIsolated(join(dest, f), got.stdout);
  }
  assertRepoUntouched();
}

/**
 * 사본 안의 파일 하나를 바꾼다. **반드시 먼저 링크를 끊는다.**
 *
 * `--link-dest` 사본은 하드링크라 원본과 **같은 inode** 다. 그냥 `writeFileSync` 하면 그
 * inode 를 잘라 쓰므로 **레포의 원본 파일이 덮어써진다.** 실측으로 겪었다 — 첫 실행에서
 * 방금 고친 `PermissionGate.tsx` 가 HEAD 내용으로 되돌아갔고, git 은 "변경 없음"이라고 답해서
 * 하네스는 아무 일도 없었던 것처럼 통과했다. 자가검사가 `tokens.css` 를 건드리므로 이 버그가
 * 남았으면 다음 실행이 **디자인 토큰 정본을 날렸을 것이다.**
 */
function writeIsolated(target: string, content: string) {
  mkdirSync(dirname(target), { recursive: true });
  rmSync(target, { force: true });   // ← 링크를 끊는다. 이 한 줄이 없으면 원본이 죽는다
  writeFileSync(target, content);
}

/** 사본 조작이 레포를 건드리지 않았는지 매번 확인한다 — 위 함정의 그물이다. */
let repoFingerprint = "";
function assertRepoUntouched() {
  const fp = sh("git", ["status", "--porcelain"]).stdout;
  if (!repoFingerprint) { repoFingerprint = fp; return; }
  if (fp !== repoFingerprint) {
    throw new Error(
      "사본을 만드는 동안 레포 작업 트리가 바뀌었다 — 하드링크를 뚫고 원본을 쓴 것이다.\n" +
      `  전: ${repoFingerprint.split("\n").length - 1}줄 / 후: ${fp.split("\n").length - 1}줄\n` +
      "  writeIsolated() 를 안 거친 쓰기가 있는지 본다.",
    );
  }
}

function build(dir: string, label: string) {
  log(`${label} 빌드 시작`);
  const r = spawnSync("bun", ["run", "build"], { cwd: dir, encoding: "utf-8", maxBuffer: 1 << 28 });
  if (r.status !== 0) {
    throw new Error(`${label} 빌드 실패 (exit ${r.status})\n${(r.stderr ?? "").slice(-3000)}`);
  }
  const pages = (r.stdout.match(/Completed in|▶/g) ?? []).length;
  log(`${label} 빌드 완료`);
  notes.push(`${label} 빌드 완료 (${pages ? `${pages}쪽 표시` : "ok"})`);
}

/**
 * dist 를 정적으로 서빙한다.
 *
 * `astro preview` 를 안 쓴다 — `--port` 를 무시하고 빈 포트를 잡으며 `[::1]` 에 바인딩해서
 * `127.0.0.1` 로는 안 붙는다(KAN-072 실측). 정적 출력이라 평범한 파일 서버면 충분하고,
 * 포트를 내가 정할 수 있어야 병렬에서 안 겹친다. `Bun.serve` 대신 `node:http` 를 쓰는 이유는
 * 이 레포 tsconfig 에 Bun 전역 타입이 없어서다 — 게이트가 아니어도 `tsc` 신규 에러는 안 낸다.
 */
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".xml": "application/xml",
};

async function serve(dist: string): Promise<{ port: number; close: () => Promise<void> }> {
  const server: Server = createServer((req, res) => {
    let p = decodeURIComponent((req.url ?? "/").split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    for (const cand of [join(dist, p), join(dist, p + ".html")]) {
      try {
        if (statSync(cand).isFile()) {
          const ext = cand.slice(cand.lastIndexOf("."));
          res.writeHead(200, { "content-type": MIME[ext] ?? "application/octet-stream" });
          createReadStream(cand).pipe(res);
          return;
        }
      } catch { /* 다음 후보 */ }
    }
    res.writeHead(404); res.end("404");
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  return { port, close: () => new Promise<void>((r) => server.close(() => r())) };
}

// ── 페이지 안에서 도는 코드. 셀렉터로 값을 안 센다 — 전 요소를 훑어 getComputedStyle 로 잰다.
//
//    **재는 속성은 좁히되 요소는 안 좁힌다.** 요소당 340속성을 다 읽으면 스냅샷 한 벌이 2초
//    넘게 걸려 21쪽 대조가 30분이 된다. 대신 이 카드가 **쓸 수 있는 속성 전부**(축 넷이
//    건드리는 것)와 **상자 크기**를 잰다 — 상자가 레이아웃 파급을 통째로 받아내므로, 목록에
//    없는 속성이 흔들려도 자리가 움직이면 잡힌다. 의심스러우면 `--all-props` 로 전수로 올린다.
const PROPS = [
  // 색 축
  "color", "background-color", "background-image", "fill", "stroke", "outline-color", "caret-color",
  "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
  "text-decoration-color", "box-shadow", "text-shadow", "opacity", "filter",
  // radius · stroke 축
  "border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius",
  "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
  "outline-width", "outline-style", "stroke-width",
  // 간격 축
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "row-gap", "column-gap",
  // 글자 축
  "font-size", "line-height", "font-weight", "font-family", "letter-spacing", "word-spacing",
  // 레이아웃 결과 — 위 목록 밖이 흔들려도 자리가 움직이면 여기서 잡힌다
  "display", "position", "top", "right", "bottom", "left", "width", "height",
  "flex-basis", "flex-grow", "flex-shrink", "grid-template-columns", "transform", "z-index",
];

const snapshotSource = (allProps: boolean) => `(() => {
  const PROPS = ${JSON.stringify(PROPS)};
  const out = [];
  const walk = (el, path) => {
    const cs = getComputedStyle(el);
    const names = ${allProps ? "Array.from(cs)" : "PROPS"};
    const vals = [];
    for (const p of names) {
      // 손그림 필터 id 는 빌드 전역 카운터라(Doodle.astro:87 dd<n>) 빌드가 갈리면 번호가
      // 갈릴 수 있다. 번호를 지운다 — 값이 아니라 이름이고, 이 카드가 못 바꾸는 것이다.
      vals.push(p + ":" + cs.getPropertyValue(p).replace(/#dd\\d+-/g, "#dd*-"));
    }
    const r = el.getBoundingClientRect();
    vals.push("@box:" + [r.width, r.height].map((n) => Math.round(n * 100) / 100).join(","));
    out.push({ path, style: vals.join(";") });
    // 그려지지 않는 노드는 세지도 밟지도 않는다. Astro 는 하이드레이션 <style>/<script> 를
    // **페이지마다 다른 위치**에 끼우는데(첫 아일랜드 앞이거나 뒤), 그것을 형제로 세면 그
    // 뒤 인덱스가 통째로 한 칸 밀려 멀쩡한 아일랜드가 "없던 노드"로 잡힌다(실측:
    // osi-7-layers-3 에서 40건). 화면에 안 그려지는 것들이라 빼는 것이 옳다.
    const SKIP = new Set(["SCRIPT", "STYLE", "LINK", "META", "TEMPLATE", "NOSCRIPT"]);
    let i = 0;
    for (const c of el.children) {
      if (SKIP.has(c.tagName)) continue;
      walk(c, path + "/" + (i++) + ":" + c.tagName.toLowerCase());
    }
  };
  walk(document.body, "body");
  return out;
})()`;

const PAGE_SNAPSHOT = snapshotSource(argv.includes("--all-props"));

/**
 * 시간에 끌려다니는 값을 전부 굳힌다.
 *
 * 안 굳히면 **하네스가 시끄러워서** 진짜 차이가 묻힌다. 실측으로 잡힌 셋이다.
 *   · 푸터 저자 라인업의 idle 흔들림 — 재는 순간마다 `transform: matrix(…)` 가 달라진다
 *     (`deco.css:185-194` 의 무한 키프레임). 애니메이션 길이를 0 으로 눌러 기준 상태로 고정한다.
 *   · 웹폰트 — 도착 전에 재면 글자 상자가 폴백 메트릭으로 잡혀 `@box` 가 통째로 흔들린다.
 *   · 이미지 — 도착 전에 재면 자리를 비워 둔 판(`[data-imgwait]`)이 그대로 잡힌다.
 *
 * `prefers-reduced-motion` 은 브라우저 컨텍스트에서 켠다 — 이 사이트가 그 신호를 존중해서
 * 모션을 끄므로(`DESIGN_CONCEPT.md` §10), 사이트 자신의 계약을 쓰는 것이 덧칠보다 낫다.
 */
const PAGE_FREEZE = `(() => {
  const s = document.createElement("style");
  s.textContent = "*,*::before,*::after{animation-duration:0s !important;animation-delay:0s !important;" +
    "animation-iteration-count:1 !important;transition-duration:0s !important;transition-delay:0s !important;" +
    "caret-color:transparent !important}";
  document.head.appendChild(s);
})()`;

/** 아일랜드를 화면에 넣어 수화시킨다 — client:visible 이라 안 보이면 안 뜬다. */
const PAGE_HYDRATE = `(async () => {
  const islands = [...document.querySelectorAll("astro-island")];
  for (const el of islands) el.scrollIntoView({ block: "center" });
  window.scrollTo(0, 0);
  // client:media 아일랜드는 기다리지 않는다 — reducedMotion=reduce 로 재기 때문에
  // AmbientWaves·AmbientAurora 는 **설계대로** 영영 안 뜬다(Footer.astro:22).
  // 그것까지 기다리면 8초를 매 페이지마다 버리고, 그러고도 "안 끝났다"가 뜬다.
  const pending = () => [...document.querySelectorAll("astro-island[ssr]")]
    .filter((e) => e.getAttribute("client") !== "media");
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (!pending().length) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  // fonts.ready 는 안 풀릴 수 있다(외부 폰트가 안 오면). 상한을 건다 —
  // 여기서 멈추면 하네스가 "느린 것"이 아니라 "멈춘 것"이 되고, 그건 실패로 안 보인다.
  if (document.fonts && document.fonts.ready) {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))]);
  }
  const imgs = [...document.images].filter((i) => !i.complete);
  await Promise.all(imgs.map((i) => new Promise((r) => {
    const done = () => r(null);
    i.addEventListener("load", done, { once: true });
    i.addEventListener("error", done, { once: true });
    setTimeout(done, 4000);
  })));
  window.scrollTo(0, 0);
  // React 커밋보다 앞서 읽지 않게 두 프레임 기다린다.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return pending().length;
})()`;

/** 조작 대상 — 문서 순서 고정이라 양쪽이 같은 순서로 같은 것을 누른다. */
/** 잡음 표본을 뜨기 전 잠깐 기다린다 — 타이머가 한 번은 돌아야 움직이는 자리가 드러난다. */
const NOISE_WAIT = `new Promise((r) => setTimeout(r, 600))`;

const PAGE_CONTROLS = `(() => {
  const sel = "astro-island button, astro-island [role=button], astro-island input[type=range], astro-island select";
  return [...document.querySelectorAll(sel)].length;
})()`;

async function snapshotPage(page: any, url: string, states: number, noise = false) {
  const shots: Shot[] = [];
  let left = 0;
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(PAGE_FREEZE);
  left = await page.evaluate(PAGE_HYDRATE);
  shots.push({ state: "base", nodes: await page.evaluate(PAGE_SNAPSHOT) });
  // **상태마다** 한 번 더 잰다 — 같은 빌드에서 연달아 잰 두 값이 갈리면 그 자리는 시간에
  // 끌려다니는 것이고, 전후 대조의 신호가 아니다. 마지막 상태만 재서는 못 잡는다:
  // webrtc-2 지터 버퍼는 ctrl1 에서만 움직였고 osi-7-layers-4 슬라이딩 윈도는 ctrl2~5 의
  // 칸 강조색이 갈렸다(둘 다 코드모드가 background 를 한 줄도 안 건드린 자리다).
  if (noise) { await page.evaluate(NOISE_WAIT); shots.push({ state: "base#noise", nodes: await page.evaluate(PAGE_SNAPSHOT) }); }

  const n = Math.min(states, await page.evaluate(PAGE_CONTROLS));
  for (let i = 0; i < n; i++) {
    const ok = await page.evaluate(`(async (i) => {
      const sel = "astro-island button, astro-island [role=button], astro-island input[type=range], astro-island select";
      const el = [...document.querySelectorAll(sel)][i];
      if (!el || el.disabled) return false;
      if (el.tagName === "INPUT") {
        // React 가 value setter 를 추적해서 fill() 이 안 먹는다 — 키로 민다.
        el.focus();
        return "range";
      }
      el.click();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return true;
    })(${i})`);
    if (ok === "range") {
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.evaluate(`new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    } else if (!ok) continue;
    shots.push({ state: `ctrl${i}`, nodes: await page.evaluate(PAGE_SNAPSHOT) });
    if (noise) { await page.evaluate(NOISE_WAIT); shots.push({ state: `ctrl${i}#noise`, nodes: await page.evaluate(PAGE_SNAPSHOT) }); }
  }
  return { shots, left };
}

/**
 * 모든 대기에 상한을 건다.
 *
 * 브라우저가 죽어도 Playwright 의 promise 는 안 풀린다 — 실측으로 겪었다: Chromium 이
 * 사라진 뒤 `evaluate` 가 12분을 그대로 매달렸고, 로그가 없으니 화면에서는 "느린 것"과
 * 구별이 안 됐다. **멈춤은 실패로 보여야 한다.**
 */
const withTimeout = <T,>(p: Promise<T>, ms: number, what: string): Promise<T> =>
  Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${what} 가 ${ms}ms 를 넘겼다`), ), ms))]);

/**
 * 바깥으로 나가는 요청을 전부 막는다 — 실행을 밀폐한다.
 *
 * 이 사이트는 한국어 웹폰트를 `fonts.googleapis.com` 에서 받는다. 그 응답이 올 때와 안 올
 * 때가 갈리면 **글자 상자가 폴백 메트릭과 진짜 폰트 사이를 오간다.** 실측으로 그렇게 걸렸다:
 * `webrtc-2` 의 `<strong>` 이 36.14px 대 30.3px, 그 뒤 칸 위치가 2px 씩 밀렸다. 재실행하면
 * 사라지는 종류라 원인을 못 짚으면 "가끔 빨개지는 대조"가 되어 아무도 안 믿게 된다.
 *
 * 폴백 폰트로 재는 것이 실제 화면과 다르지만, 여기서 묻는 것은 "폰트가 어떻게 보이나"가
 * 아니라 "리터럴을 토큰으로 바꿨을 때 값이 그대로인가"다. **양쪽이 같은 조건이면 답이 나온다.**
 */
async function blockExternal(ctx: any) {
  await ctx.route("**/*", (route: any) => {
    const u = route.request().url();
    return u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")
      ? route.continue() : route.abort();
  });
}

interface Node { path: string; style: string }
interface Shot { state: string; nodes: Node[] }
interface Diff { url: string; vp: string; state: string; path: string; prop: string; before: string; after: string }

/**
 * 같은 쪽을 두 번 잰 짝에서 **스스로 움직이는 (경로, 속성)** 을 뽑는다.
 * 여기 든 자리는 전후 대조에서 뺀다 — 빌드가 같아도 갈리는 값이라 신호가 아니다.
 */
function noiseKeys(shots: Shot[]): { keys: Set<string>; states: Set<string> } {
  const keys = new Set<string>(), states = new Set<string>();
  for (const sh of shots) {
    if (!sh.state.endsWith("#noise")) continue;
    states.add(sh.state);
    const base = shots.find((x) => x.state === sh.state.replace("#noise", ""));
    if (!base) continue;
    const byPath = new Map(base.nodes.map((n) => [n.path, n]));
    for (const n of sh.nodes) {
      const o = byPath.get(n.path);
      if (!o) { keys.add(`${n.path}|*`); continue; }
      if (o.style === n.style) continue;
      const ma = new Map(o.style.split(";").map((x) => [x.slice(0, x.indexOf(":")), x.slice(x.indexOf(":") + 1)]));
      for (const part of n.style.split(";")) {
        const k = part.slice(0, part.indexOf(":")), v = part.slice(part.indexOf(":") + 1);
        if (ma.get(k) !== v) keys.add(`${n.path}|${k}`);
      }
    }
  }
  return { keys, states };
}

function diffShots(url: string, vp: string, a: Shot[], b: Shot[], noisy = new Set<string>(), cap = SUMMARY ? 100000 : 40): Diff[] {
  const out: Diff[] = [];
  const states = new Set([...a.map((s) => s.state), ...b.map((s) => s.state)]);
  for (const st of states) {
    const A: Node[] = a.find((s) => s.state === st)?.nodes ?? [];
    const B: Node[] = b.find((s) => s.state === st)?.nodes ?? [];
    if (A.length !== B.length) {
      out.push({ url, vp, state: st, path: "(문서)", prop: "요소 수", before: String(A.length), after: String(B.length) });
      continue;
    }
    const byPathA = new Map<string, Node>(A.map((n) => [n.path, n]));
    for (const nb of B) {
      const na = byPathA.get(nb.path);
      if (!na) { out.push({ url, vp, state: st, path: nb.path, prop: "(노드)", before: "없음", after: "있음" }); continue; }
      if (na.style === nb.style) continue;
      const ma = new Map(na.style.split(";").map((x: string) => [x.slice(0, x.indexOf(":")), x.slice(x.indexOf(":") + 1)]));
      const mb = new Map(nb.style.split(";").map((x: string) => [x.slice(0, x.indexOf(":")), x.slice(x.indexOf(":") + 1)]));
      for (const [k, v] of mb) {
        if (ma.get(k) === v) continue;
        if (noisy.has(`${nb.path}|${k}`) || noisy.has(`${nb.path}|*`)) continue;
        out.push({ url, vp, state: st, path: nb.path, prop: k, before: String(ma.get(k)), after: String(v) });
        if (out.length >= cap) return out;
      }
    }
  }
  return out;
}

async function run(beforeDist: string, afterDist: string, pages: string[], shared?: any) {
  const { chromium } = await import("playwright");
  const sb = await serve(beforeDist), sa = await serve(afterDist);
  const browser = shared ?? await chromium.launch();
  const diffs: Diff[] = [];
  try {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: "reduce",
      });
      await blockExternal(ctx);
      const pb = await ctx.newPage(), pa = await ctx.newPage();
      for (const path of pages) {
        log(`${vp.name} ${path}`);
        const A = await withTimeout(snapshotPage(pb, `http://127.0.0.1:${sb.port}${path}`, MAX_STATES, true), 200000, `before ${path}`);
        const B = await withTimeout(snapshotPage(pa, `http://127.0.0.1:${sa.port}${path}`, MAX_STATES), 180000, `after ${path}`);
        // 수화 잔여는 **양쪽이 다를 때만** 말한다 — client:media 섬은 reducedMotion 아래에서
        // 설계상 영영 안 뜨고(Footer.astro:22), 그것은 양쪽에 똑같이 남으므로 신호가 아니다.
        if (A.left !== B.left) notes.push(`${path} [${vp.name}] 수화 잔여가 갈렸다 — before ${A.left} / after ${B.left}`);
        const { keys: noisy, states: noiseStates } = noiseKeys(A.shots);
        if (noisy.size) notes.push(`${path} [${vp.name}] 스스로 움직이는 자리 ${noisy.size}곳을 대조에서 뺐다(같은 빌드끼리도 갈린다)`);
        diffs.push(...diffShots(path, vp.name, A.shots.filter((s) => !noiseStates.has(s.state)), B.shots, noisy));
      }
      await ctx.close();
    }
  } finally {
    if (!shared) await browser.close();
    // 공유 브라우저는 아직 살아 있어 소켓을 물고 있다 — 강제로 뜯지 않는다.
    await sb.close(); await sa.close();
  }
  return diffs;
}

// ── 자가검사 — 0건 통과를 그냥 믿지 않는다. 고장 셋을 주입해 각각 무는지 본다.
//
//    **고정 지면 하나로 돈다.** 작업 트리의 변경 파일을 따라가면 아무것도 안 고친 상태에서
//    자가검사를 부를 때 React 시뮬이 없는 글이 뽑혀 고장이 안 물린다 — 그러면 게이트가
//    살아 있는지 물으려던 검사가 상태에 따라 답이 달라진다. 커밋된 지면을 박는다.
const ST_PAGE = "/posts/tauri-2/";

async function selfTest() {
  const st: { name: string; bit: boolean; detail: string }[] = [];
  const one = [ST_PAGE];
  const A = join(WORK, "st-before"), B = join(WORK, "st-after");
  // 브라우저 하나를 셋이 나눠 쓴다 — 반복 launch 가 메모리를 쌓아 Chromium 이 죽었다(실측).
  const { chromium } = await import("playwright");
  const br = await chromium.launch();
  try {

  // 바탕 — 양쪽 다 HEAD 그대로. 여기서 차이가 나오면 하네스 자체가 시끄러운 것이다.
  makeCopy(A, changedFiles());
  build(A, "자가검사 바탕");
  const base = await run(join(A, "dist"), join(A, "dist"), one, br);
  st.push({ name: "잡음 0 (같은 빌드끼리)", bit: base.length === 0,
            detail: base.length ? `차이 ${base.length}건 — 예: ${base[0].prop} ${base[0].before} → ${base[0].after}` : "차이 0" });

  // 고장1 — 토큰 정의 이름을 지운다. 그러면 `var(--x)` 선언이 통째로 무효가 되어 속성이 떨어진다.
  //
  //   **fallback 없이 쓰이는 토큰이어야 한다.** 처음엔 `--radius-sm` 을 지웠는데 안 물었고,
  //   그것이 오답이 아니라 정답이었다 — 이 지면의 `--radius-sm` 은 전부
  //   `var(--radius-md, 12px)` 꼴로 fallback 을 달고 있어 이름을 지워도 화면이 안 바뀐다
  //   (KAN-072 가 적어 둔 "이름 감사만 물고 화면은 안 바뀐다"가 이것이다). 화면 대조기는
  //   화면이 안 바뀌면 안 무는 것이 맞으므로, 고장 쪽을 **화면에 보이는 고장**으로 바꿨다.
  //   `--space-12` 는 `PermissionGate.tsx:197,219` 에서 맨 `var(--space-12)` 로 쓰인다.
  makeCopy(B, changedFiles());
  const tok = join(B, "src/styles/tokens.css");
  writeIsolated(tok, readFileSync(tok, "utf-8").replace("--space-12: 12px;", "--space-12-GONE: 12px;"));
  build(B, "고장1(맨 var() 토큰 이름 삭제)");
  const d1 = await run(join(A, "dist"), join(B, "dist"), one, br);
  st.push({ name: "고장1 맨 var() 토큰 이름 삭제", bit: d1.length > 0,
            detail: d1.length ? `${d1.length}건 — 예: ${d1[0].prop} ${d1[0].before} → ${d1[0].after}` : "안 물었다" });

  // 고장2 — 값만 지역에서 뒤집는다. 이름은 그대로라 이름 감사로는 안 잡힌다.
  makeCopy(B, changedFiles());
  const tok2 = join(B, "src/styles/tokens.css");
  writeIsolated(tok2, readFileSync(tok2, "utf-8").replace(/--ink:\s*[^;]+;/, "--ink: #ff0000;"));
  build(B, "고장2(값 반전)");
  const d2 = await run(join(A, "dist"), join(B, "dist"), one, br);
  st.push({ name: "고장2 값 지역 반전", bit: d2.length > 0,
            detail: d2.length ? `${d2.length}건 — 예: ${d2[0].prop} ${d2[0].before} → ${d2[0].after}` : "안 물었다" });

  // 고장3 — **옛 방식이 같은 고장을 놓치는지** 본다. 무는 것이 아니라 안 무는 것을 확인한다.
  //   `style=` 속성 문자열로 세는 방식은 화면에 실제로 칠해진 값을 못 본다. 값이 var() 를
  //   거쳐 오면 속성에 아예 없고, 인라인 hex 는 React 가 재렌더 때 rgb() 로 정규화한다
  //   (KAN-072 실측 — 조작이 건드린 노드만 골라 셀렉터에서 빠진다). 둘 다 같은 부류다.
  const bs = await blindSpot(join(B, "dist"), one, "#ff0000", "rgb(255, 0, 0)", br);
  st.push({
    name: "고장3 속성 문자열 방식의 맹점",
    bit: bs.cssHits > 0 && bs.selHits < bs.cssHits,
    detail: `[style*=] 방식 ${bs.selHits}곳 · getComputedStyle 방식 ${bs.cssHits}곳`,
  });

  return st;
  } finally { await br.close(); }
}

/** 같은 고장을 두 방식으로 센다 — 속성 문자열 대 계산값. */
async function blindSpot(dist: string, pages: string[], hex: string, rgb: string, shared?: any) {
  const { chromium } = await import("playwright");
  const s = await serve(dist);
  const browser = shared ?? await chromium.launch();
  let selHits = 0, cssHits = 0;
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    await blockExternal(ctx);
    const page = await ctx.newPage();
    for (const p of pages) {
      log(`맹점 측정 ${p}`);
      await page.goto(`http://127.0.0.1:${s.port}${p}`, { waitUntil: "load", timeout: 60000 });
      await page.evaluate(PAGE_FREEZE);
      await page.evaluate(PAGE_HYDRATE);
      selHits += await page.evaluate(`document.querySelectorAll("[style*='${hex}'],[style*='${hex.toUpperCase()}']").length`);
      cssHits += await page.evaluate(`(() => {
        const props = ["color","background-color","border-top-color","border-right-color",
                       "border-bottom-color","border-left-color","fill","stroke","outline-color"];
        let n = 0;
        for (const el of document.querySelectorAll("*")) {
          const cs = getComputedStyle(el);
          if (props.some((p) => cs.getPropertyValue(p) === ${JSON.stringify(rgb)})) n++;
        }
        return n;
      })()`);
    }
  } finally { if (!shared) await browser.close(); await s.close(); }
  return { selHits, cssHits };
}

// ── main
// 지문을 **아무것도 만들기 전에** 뜬다 — 첫 makeCopy 뒤에 뜨면 그 한 번의 피해를 못 잡는다.
assertRepoUntouched();
const files = changedFiles();
const { pages, widened } = pagesFor(files);
mkdirSync(WORK, { recursive: true });

console.log(`compare-render — ns=${NS} · 작업 자리 ${WORK}`);
console.log(`변경 파일 ${files.length}개 · 대조 페이지 ${pages.length}쪽${widened ? " (범위 유도 실패로 전 글 대조)" : ""}`);

try {
  if (SELF_TEST) {
    const st = await selfTest();
    for (const c of st) {
      console.log(`  ${c.bit ? "✓" : "✗"} ${c.name} — ${c.detail}`);
      if (!c.bit) failures.push(`자가검사 「${c.name}」 실패 — ${c.detail}`);
    }
    notes.push(`자가검사 ${st.length}종 — 통과 ${st.filter((c) => c.bit).length}`);
  } else {
    if (!files.length) { console.log("변경 파일이 없다 — 대조할 것이 없다."); process.exit(0); }
    const A = join(WORK, "before"), B = join(WORK, "after");
    makeCopy(A, files);   // 내 파일만 HEAD 로
    makeCopy(B, []);      // 지금 상태 그대로
    build(A, "before"); build(B, "after");
    const diffs = await run(join(A, "dist"), join(B, "dist"), pages);
    if (SUMMARY) {
      // 판정용 요약 — "무엇이 얼마나 움직였나"를 지면과 속성으로 접는다.
      // 차이 목록을 그대로 내밀면 수백 줄이라 사람이 판정할 재료가 안 된다.
      const byPage = new Map<string, Map<string, number>>();
      const heights = new Map<string, [string, string]>();
      for (const d of diffs) {
        const key = `${d.url} [${d.vp}]`;
        const m = byPage.get(key) ?? new Map<string, number>();
        m.set(d.prop, (m.get(d.prop) ?? 0) + 1);
        byPage.set(key, m);
        if (d.path === "body" && d.prop === "@box") heights.set(key, [d.before, d.after]);
      }
      console.log(`\n요약 — 지면 ${byPage.size}곳에서 값이 움직였다 (총 ${diffs.length}건)`);
      for (const [k, m] of [...byPage].sort()) {
        const h = heights.get(k);
        const hs = h ? ` · 문서 높이 ${h[0].split(",")[1]} → ${h[1].split(",")[1]}` : "";
        const top = [...m].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([p, n]) => `${p} ${n}`).join(" · ");
        console.log(`  ${k}${hs}\n      ${top}`);
      }
      process.exit(0);
    }
    if (diffs.length) {
      for (const d of diffs.slice(0, 40)) {
        failures.push(`${d.url} [${d.vp}/${d.state}] ${d.path}\n      ${d.prop}: ${d.before} → ${d.after}`);
      }
      if (diffs.length > 40) failures.push(`… 그리고 ${diffs.length - 40}건 더`);
    } else {
      notes.push(`계산된 스타일 차이 0 — ${pages.length}쪽 × 뷰포트 ${VIEWPORTS.length} × 상태 최대 ${MAX_STATES + 1}`);
    }
  }
} finally {
  if (!KEEP) rmSync(WORK, { recursive: true, force: true });
  else notes.push(`--keep — 사본을 남겼다: ${WORK}`);
}

for (const n of notes) console.log(`  · ${n}`);
if (failures.length) {
  console.error("\n✗ 전후가 다르다.");
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    "\n  고치는 법: 위 자리의 var(--토큰) 이 실제로 그 값으로 풀리는지 본다. tokens.css 에\n" +
    "  그 이름이 없으면 선언이 통째로 무효가 되어 속성이 떨어진다(에러 없이). 값을 일부러\n" +
    "  바꾼 것이라면 이 스크립트로 재는 구간이 아니다 — 무엇이 얼마나 바뀌는지 판정표에 적어라.",
  );
  process.exit(1);
}
console.log("\n✓ 전후 동일.");
