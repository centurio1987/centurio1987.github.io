import { z } from "zod";
import { CATEGORY_SLUGS } from "./categories";
import { AUTHOR_IDS } from "./authors";

/**
 * 폭신 대담 L2 정형본(`raws/talks/<slug>/talk.md`)의 스키마와 파서.
 *
 * 문법 규격은 `raws/talks/_rules/TALK_MD.md` 가 정본이고 이 파일이 그 구현이다.
 * 발행물(`src/content/posts/talk-<slug>.mdx`)은 `scripts/build-talk.ts` 가 여기서
 * 나온 값으로 굽는다 — L2 를 거치지 않고 발행물을 손으로 고치지 않는다.
 *
 * `src/lib/talk.ts`(런타임 화자 설정)와는 다른 물건이다. 저쪽은 렌더 시점,
 * 이쪽은 굽는 시점에 산다.
 */

/** `talk.md` 문법 버전. 문법을 바꾸면 올리고 파서가 옛 파일을 거부하게 한다. */
export const TALK_MD_GRAMMAR_VERSION = 1;

/** 답변 화자(빵토 교수님). `author` 는 인터뷰어여야 하므로 이 값이면 거부한다(SP6). */
export const TALK_INTERVIEWEE_AUTHOR = "ppangtolab-prof";

/** `<PullQuote>` 는 에피소드당 1~2개다(SP4). */
export const PULLQUOTE_MIN = 1;
export const PULLQUOTE_MAX = 2;

export type TalkParseCode =
  | "FRONTMATTER_MISSING"
  | "FRONTMATTER_UNTERMINATED"
  | "FRONTMATTER_UNSUPPORTED"
  | "FRONTMATTER_DUPLICATE_KEY"
  | "FRONTMATTER_INVALID"
  | "TEMPLATE_IN_FRONTMATTER"
  | "AUTHOR_IS_INTERVIEWEE"
  | "CONTENT_BEFORE_FIRST_Q"
  | "NO_QA"
  | "Q_EMPTY"
  | "ANSWER_EMPTY"
  | "CLOSING_NOT_LAST"
  | "CLOSING_EMPTY"
  | "PULLQUOTE_COUNT"
  | "PULLQUOTE_EMPTY";

export class TalkParseError extends Error {
  readonly code: TalkParseCode;
  /** 1부터 세는 원본 줄 번호. 파일 전체에 걸린 문제면 없다. */
  readonly line?: number;
  constructor(code: TalkParseCode, message: string, line?: number) {
    super(line ? `${message} (${line}번째 줄)` : message);
    this.name = "TalkParseError";
    this.code = code;
    this.line = line;
  }
}

/**
 * L2 frontmatter. `src/content.config.ts` 의 posts 스키마를 따라가되 셋이 다르다.
 * - `template` 은 **여기 쓰지 않는다** — 빌더가 항상 `talk` 을 박는다(두 곳이 진실을 다투지 않게).
 * - `series`·`order` 는 선택이 아니라 **필수**다(SP5).
 * - `source` 는 L1 이 앉아 있는 `raws/talks/<slug>/` 의 slug 다.
 */
export const talkFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  pubDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "pubDate 는 YYYY-MM-DD 여야 합니다"),
  category: z.enum(CATEGORY_SLUGS),
  author: z.enum(AUTHOR_IDS),
  tags: z.array(z.string()).default([]),
  series: z.string().min(1),
  order: z.number().int().positive(),
  draft: z.boolean().default(true),
  source: z.string().min(1),
});

export type TalkFrontmatter = z.infer<typeof talkFrontmatterSchema>;

export interface TalkQA {
  /** 1부터 매긴 순번. **원본에 적지 않는다** — 순서에서 나온다 */
  n: number;
  q: string;
  /** 답변 본문 마크다운. 정수 인용구는 빠져 있다 */
  answer: string;
  /** 이 답변 뒤에 놓일 정수 인용구 */
  pullQuotes: string[];
  /** 원본 `talk.md` 에서 이 질문이 시작한 줄 */
  line: number;
}

export interface TalkSource {
  grammarVersion: number;
  frontmatter: TalkFrontmatter;
  qa: TalkQA[];
  /** `## 마치며` 본문. 없으면 undefined */
  closing?: string;
  /** 전체 정수 인용구 개수 */
  pullQuoteCount: number;
}

const Q_HEADING = /^##\s+Q\.\s*(.*)$/;
const CLOSING_HEADING = /^##\s+마치며\s*$/;
const PULLQUOTE_OPEN = /^>\s*\[!정수\]\s*$/;
const QUOTE_LINE = /^>\s?(.*)$/;

/**
 * frontmatter 의 **문서화된 부분집합**만 읽는다. YAML 전체를 받지 않는 것은 게으름이
 * 아니라 계약이다 — 블록 스칼라·중첩 맵처럼 문법에 없는 것이 들어오면
 * 조용히 다르게 해석되느니 `FRONTMATTER_UNSUPPORTED` 로 멈춘다.
 *
 * 받는 값: 따옴표 문자열 · 맨 스칼라 · 정수 · true/false · `["a", "b"]` 인라인 배열
 */
function parseFrontmatter(lines: string[], offset: number): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  lines.forEach((raw, i) => {
    const lineNo = offset + i + 1;
    const line = raw.replace(/\s+$/, "");
    if (line === "" || line.startsWith("#")) return;
    const m = /^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
    if (!m) {
      throw new TalkParseError(
        "FRONTMATTER_UNSUPPORTED",
        `frontmatter 에서 \`키: 값\` 한 줄로 읽을 수 없는 줄을 만났습니다. ` +
          `여러 줄 값·중첩 맵·블록 스칼라는 talk.md 문법에 없습니다 — raws/talks/_rules/TALK_MD.md 참고`,
        lineNo,
      );
    }
    const [, key, rawValue] = m;
    if (key in out) {
      throw new TalkParseError(
        "FRONTMATTER_DUPLICATE_KEY",
        `frontmatter 에 \`${key}\` 가 두 번 있습니다`,
        lineNo,
      );
    }
    out[key] = parseScalar(rawValue.trim(), key, lineNo);
  });
  return out;
}

function parseScalar(value: string, key: string, lineNo: number): unknown {
  if (value === "") return "";
  if (value.startsWith("[")) {
    if (!value.endsWith("]")) {
      throw new TalkParseError(
        "FRONTMATTER_UNSUPPORTED",
        `\`${key}\` 의 배열이 한 줄에서 닫히지 않았습니다. 여러 줄 배열은 문법에 없습니다`,
        lineNo,
      );
    }
    const inner = value.slice(1, -1).trim();
    if (inner === "") return [];
    return inner.split(",").map((part) => {
      const t = part.trim();
      const unq = stripQuotes(t);
      if (unq === null) {
        throw new TalkParseError(
          "FRONTMATTER_UNSUPPORTED",
          `\`${key}\` 배열의 항목은 따옴표로 감싼 문자열이어야 합니다 — \`${t}\``,
          lineNo,
        );
      }
      return unq;
    });
  }
  const unq = stripQuotes(value);
  if (unq !== null) return unq;
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  return value;
}

/** 따옴표로 감싼 문자열이면 벗겨서, 아니면 null. */
function stripQuotes(v: string): string | null {
  if (v.length >= 2 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))) {
    return v.slice(1, -1);
  }
  return null;
}

/** 문단이 비었는지 — 공백과 HTML 주석만 있으면 빈 것으로 센다. */
function isBlank(text: string): boolean {
  return text.replace(/<!--[\s\S]*?-->/g, "").trim() === "";
}

/**
 * 본문 블록에서 `> [!정수]` 인용구를 떼어내고, 남은 답변과 인용구 목록을 돌려준다.
 * 인용구는 답변 안에 적지만 발행물에서는 `<QA>` **뒤에** 놓인다 — 템플릿이 그 모양이다.
 */
function extractPullQuotes(
  body: string[],
  startLine: number,
): { answer: string; pullQuotes: string[] } {
  const kept: string[] = [];
  const pullQuotes: string[] = [];
  for (let i = 0; i < body.length; i += 1) {
    if (!PULLQUOTE_OPEN.test(body[i])) {
      kept.push(body[i]);
      continue;
    }
    const openedAt = startLine + i;
    const parts: string[] = [];
    i += 1;
    while (i < body.length) {
      const q = QUOTE_LINE.exec(body[i]);
      if (!q) break;
      parts.push(q[1]);
      i += 1;
    }
    i -= 1;
    const text = parts.join("\n").trim();
    if (text === "") {
      throw new TalkParseError("PULLQUOTE_EMPTY", "정수 인용구가 비어 있습니다", openedAt);
    }
    pullQuotes.push(text);
  }
  return { answer: kept.join("\n").trim(), pullQuotes };
}

/** `talk.md` 원문을 읽어 구조를 돌려준다. 어긋나면 `TalkParseError` 를 던진다. */
export function parseTalkSource(raw: string): TalkSource {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  if (lines[0]?.trim() !== "---") {
    throw new TalkParseError("FRONTMATTER_MISSING", "파일이 `---` 로 시작하지 않습니다", 1);
  }
  const closeIdx = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (closeIdx === -1) {
    throw new TalkParseError("FRONTMATTER_UNTERMINATED", "frontmatter 가 닫히지 않았습니다");
  }

  const fmRaw = parseFrontmatter(lines.slice(1, closeIdx), 1);

  if ("template" in fmRaw) {
    throw new TalkParseError(
      "TEMPLATE_IN_FRONTMATTER",
      "`template` 은 talk.md 에 적지 않습니다 — 빌더가 항상 `talk` 을 박습니다. 두 곳이 값을 다투면 반드시 어긋납니다",
    );
  }

  const parsed = talkFrontmatterSchema.safeParse(fmRaw);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((iss) => `${iss.path.join(".") || "(루트)"}: ${iss.message}`)
      .join(" · ");
    throw new TalkParseError("FRONTMATTER_INVALID", `frontmatter 가 스키마에 안 맞습니다 — ${detail}`);
  }
  const frontmatter = parsed.data;

  if (frontmatter.author === TALK_INTERVIEWEE_AUTHOR) {
    throw new TalkParseError(
      "AUTHOR_IS_INTERVIEWEE",
      `\`author\` 는 대담을 기록해 올리는 **인터뷰어**입니다. 답변 화자인 ${TALK_INTERVIEWEE_AUTHOR} 는 src/lib/talk.ts 가 세우므로 여기 적지 않습니다`,
    );
  }

  // 본문을 `## Q.` 과 `## 마치며` 로 자른다
  const bodyStart = closeIdx + 1;
  type Block = { kind: "qa" | "closing"; heading: string; line: number; body: string[] };
  const blocks: Block[] = [];
  const preamble: string[] = [];

  for (let i = bodyStart; i < lines.length; i += 1) {
    const line = lines[i];
    const lineNo = i + 1;
    const qm = Q_HEADING.exec(line);
    const cm = CLOSING_HEADING.exec(line);
    if (qm) {
      blocks.push({ kind: "qa", heading: qm[1].trim(), line: lineNo, body: [] });
      continue;
    }
    if (cm) {
      blocks.push({ kind: "closing", heading: "마치며", line: lineNo, body: [] });
      continue;
    }
    if (blocks.length === 0) preamble.push(line);
    else blocks[blocks.length - 1].body.push(line);
  }

  if (!isBlank(preamble.join("\n"))) {
    throw new TalkParseError(
      "CONTENT_BEFORE_FIRST_Q",
      "첫 `## Q.` 앞에 본문이 있습니다. 대담은 질문으로 시작합니다 — 들어가는 말이 필요하면 첫 질문 안에 넣으세요",
      bodyStart + 1,
    );
  }

  const qaBlocks = blocks.filter((b) => b.kind === "qa");
  if (qaBlocks.length === 0) {
    throw new TalkParseError("NO_QA", "`## Q.` 로 시작하는 질문이 하나도 없습니다");
  }

  const closingIdx = blocks.findIndex((b) => b.kind === "closing");
  if (closingIdx !== -1 && closingIdx !== blocks.length - 1) {
    throw new TalkParseError(
      "CLOSING_NOT_LAST",
      "`## 마치며` 는 마지막에 옵니다 — 그 뒤에 질문이 더 있습니다",
      blocks[closingIdx].line,
    );
  }

  const qa: TalkQA[] = [];
  let pullQuoteCount = 0;
  qaBlocks.forEach((block, idx) => {
    if (block.heading === "") {
      throw new TalkParseError("Q_EMPTY", "`## Q.` 뒤에 질문문이 없습니다", block.line);
    }
    const { answer, pullQuotes } = extractPullQuotes(block.body, block.line + 1);
    if (isBlank(answer)) {
      throw new TalkParseError(
        "ANSWER_EMPTY",
        `질문 "${block.heading}" 에 답변이 없습니다`,
        block.line,
      );
    }
    pullQuoteCount += pullQuotes.length;
    qa.push({ n: idx + 1, q: block.heading, answer, pullQuotes, line: block.line });
  });

  if (pullQuoteCount < PULLQUOTE_MIN || pullQuoteCount > PULLQUOTE_MAX) {
    throw new TalkParseError(
      "PULLQUOTE_COUNT",
      `정수 인용구는 에피소드당 ${PULLQUOTE_MIN}~${PULLQUOTE_MAX}개입니다 — 지금 ${pullQuoteCount}개입니다. ` +
        `정수는 요약이 아니라 그 대담을 거쳐야만 할 수 있게 된 말이라 여러 개일 수 없습니다`,
    );
  }

  let closing: string | undefined;
  if (closingIdx !== -1) {
    const text = blocks[closingIdx].body.join("\n").trim();
    if (isBlank(text)) {
      throw new TalkParseError("CLOSING_EMPTY", "`## 마치며` 가 비어 있습니다", blocks[closingIdx].line);
    }
    closing = text;
  }

  return { grammarVersion: TALK_MD_GRAMMAR_VERSION, frontmatter, qa, closing, pullQuoteCount };
}
