import { useState } from "react";

// 같은 글자가 어떤 byte로 표현되는지(UTF-8), 그리고 그 byte를 엉뚱한 charset으로
// 읽으면 어떻게 깨지는지(mojibake)를 직접 본다. L6 '표현'의 핵심 데모.
// 브라우저 API(TextEncoder)에 의존하지 않도록 순수 JS로 인코딩한다(SSR 안전).

// 시각 값은 tokens.css 토큰으로 옮긴다 (KAN-072-CPJCT1 배치5).
// var() 의 fallback 은 토큰 값과 **정확히 같아야 한다** — 어긋나면 fallback 축이
// 드리프트로 물어 게이트가 그 자리에서 막는다.
const TEAL = "var(--cat-skills, #3e6b6b)";
const INK = "var(--ink, #20264A)";
const INK_SOFT = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const PANEL = "var(--surface-hi, #fffdf8)";
const ON_TEAL = "var(--surface-hi, #fffdf8)";
const HAIR = "var(--stroke-hair, 1px)";
// 본문 강조 잉크. 유저 판정으로 --ink-accent 를 세웠다(2026-08-27, DESIGN_CONCEPT §4).
// 역할은 일관된데 이름이 없던 자리라 --stroke-bold·--text-small 과 같은 「구멍」이었다.
// 최근접 --pop-ink(Δ31)·--cat-leadership(Δ28)로 밀지 않은 이유는 앞은 서브 CTA 의 진한 단이고
// 뒤는 배지 전용이라서다 — 최근접이 곧 정답이 아니다(§5 역할 우선). 값이 같아 화면 변화 0.
const ACCENT_INK = "var(--ink-accent, #9a5b2c)";
// 상태 색 셋. **상수에는 리터럴이 아니라 토큰 참조를 담는다.**
// 한때 이 셋은 리터럴이었고, 그것이 곧 게이트 회피 경로였다 — 값을 const 로 올리면 값 자리에
// 남는 것이 식별자뿐이라 인식층이 통째로 못 봤다(KAN-072 S10 실측: 158→0 중 6건이 그렇게
// 숨어 인라인으로 되돌려야 했다). KAN-077 이 여섯째 인식기로 그 자리를 막았으므로
// (`scripts/lib/tokens/recognize/constRef.ts`) **이제는 숨지 않는다** — 여기 셋이 그 게이트가
// 처음 문 15건이고, 상수로 묶는 것 자체는 문제가 아니다.
// 값의 근거 — SAND·MUTED 는 **자기 뜻의 토큰**(--state-plain·--state-inactive)을 가리키고
// 값이 안 바뀌어 화면 변화 0 이다. 값이 같다는 이유로 --field-dst·--fate-blocked-border 에
// 묶지 않은 것이 KAN-077 검토 1항의 판정이다 — 값은 본질이 아니고 의미로 나눈다.
// TEAL_TINT 는 이 시리즈가 이미 일곱 자리에서 쓰는 활성 틴트 관용구(--cat-skills 11%)로 모았다.
const TEAL_TINT = "color-mix(in srgb, var(--cat-skills) 11%, var(--surface-hi))";

const PRESETS = ["café", "안녕 한글", "résumé", "I ♥ UTF-8", "😀 emoji"];

// 문자열 → UTF-8 byte 배열 (code point 기준 수동 인코딩)
function toUtf8Bytes(str: string): number[] {
  const out: number[] = [];
  for (const ch of str) {
    let cp = ch.codePointAt(0)!;
    if (cp < 0x80) {
      out.push(cp);
    } else if (cp < 0x800) {
      out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f)
      );
    }
  }
  return out;
}

// byte 배열을 Latin-1(ISO-8859-1)로 잘못 읽었을 때의 문자열 = mojibake
function asLatin1(bytes: number[]): string {
  return bytes.map((b) => String.fromCharCode(b)).join("");
}

const hex = (b: number) => b.toString(16).padStart(2, "0").toUpperCase();

export default function EncodingLab() {
  const [text, setText] = useState("café");

  const cps = [...text]; // code point 단위
  const bytes = toUtf8Bytes(text);
  const mojibake = asLatin1(bytes);

  return (
    <figure
      style={{
        margin: "2rem 0",
        padding: "var(--space-16)",
        border: `${HAIR} solid ${BORDER}`,
        borderRadius: "var(--radius-md)",
        background: PANEL,
      }}
    >
      <p style={{ margin: "0 0 var(--space-12, 12px)", fontWeight: 600, color: INK }}>
        글자를 입력하면 UTF-8이 그것을 어떤 <strong>byte</strong>로 표현하는지, 그리고 그 byte를
        엉뚱한 charset으로 읽으면 어떻게 <strong>깨지는지</strong> 보여 줍니다.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-8)", marginBottom: "var(--space-8)" }}>
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => setText(p)}
            style={{
              padding: "var(--space-4, 4px) var(--space-10, 10px)",
              fontSize: "var(--text-meta)",
              border: `${HAIR} solid ${BORDER}`,
              borderRadius: "var(--card-radius)",
              background: text === p ? TEAL_TINT : PANEL,
              color: INK,
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        aria-label="인코딩할 텍스트"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "var(--space-8, 8px) var(--space-10, 10px)",
          fontSize: "var(--text-small)",
          border: `${HAIR} solid ${BORDER}`,
          borderRadius: "var(--radius-sm)",
          marginBottom: "var(--space-14)",
        }}
      />

      <div style={{ display: "grid", gap: "var(--space-10)" }}>
        <Row label="글자 수 vs byte 수">
          <strong style={{ color: TEAL }}>{cps.length}</strong> 글자 →{" "}
          <strong style={{ color: ACCENT_INK }}>{bytes.length}</strong> byte
          {bytes.length !== cps.length && (
            <span style={{ color: INK_SOFT, fontSize: "var(--text-label)" }}>
              {" "}
              — 한 글자가 1byte가 아닐 수 있다
            </span>
          )}
        </Row>

        <Row label="UTF-8 byte (hex)">
          <code style={{ fontFamily: "monospace", fontSize: "var(--text-meta)", wordBreak: "break-all" }}>
            {bytes.length ? bytes.map(hex).join(" ") : "—"}
          </code>
        </Row>

        <Row label="이 byte를 Latin-1로 잘못 읽으면">
          <code
            style={{
              fontFamily: "monospace",
              fontSize: "var(--text-small)",
              color: ACCENT_INK,
              wordBreak: "break-all",
            }}
          >
            {mojibake || "—"}
          </code>
          <span style={{ color: INK_SOFT, fontSize: "var(--text-label)" }}> ← 글자 깨짐(mojibake)</span>
        </Row>
      </div>

      <figcaption style={{ fontSize: "var(--text-meta)", color: INK_SOFT, marginTop: "var(--space-14)" }}>
        <code>café</code>의 <code>é</code>는 UTF-8에서 2byte(<code>C3 A9</code>)인데, 이걸 Latin-1로
        읽으면 그 2byte가 각각 한 글자가 돼 <code>café</code>가 <code>cafÃ©</code>로 깨집니다. 바로 이
        “byte는 같은데 해석이 달라 뜻이 어긋나는” 문제를 막는 게 L6의 일이고, 그래서 HTML·HTTP는{" "}
        <code>charset=utf-8</code>을 명시합니다. (실무의 깨짐은 Latin-1보다 Windows-1252인 경우가 많지만
        원리는 같습니다.)
      </figcaption>
    </figure>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(120px, 200px) 1fr",
        gap: "var(--space-10)",
        alignItems: "baseline",
        padding: "var(--space-8, 8px) var(--space-10, 10px)",
        border: `${HAIR} solid ${BORDER}`,
        borderRadius: "var(--radius-sm)",
        background: PANEL,
      }}
    >
      <span style={{ fontSize: "var(--text-label)", color: INK_SOFT, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: "var(--text-meta)", color: INK }}>{children}</span>
    </div>
  );
}
