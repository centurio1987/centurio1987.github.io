import { useState } from "react";

// www.example.com 을 재귀 resolver가 root → TLD → authoritative로
// 내려가며 해석하는 과정을 한 단계씩 본다.

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
const BOLD = "var(--stroke-bold, 2px)";
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
const SAND = "var(--state-plain, #e8c97a)";
const TEAL_TINT = "color-mix(in srgb, var(--cat-skills) 11%, var(--surface-hi))";
const MUTED = "var(--state-inactive, #b8b0a0)";

type Step = {
  title: string;
  from: string;
  to: string;
  ask: string;
  reply: string;
  cached?: boolean;
};

const STEPS: Step[] = [
  {
    title: "0. 캐시 확인",
    from: "내 OS (stub)",
    to: "재귀 resolver",
    ask: "www.example.com 의 IP?",
    reply: "캐시에 있으면 즉시 응답. 없으면 재귀 resolver가 대신 찾아 나섭니다.",
  },
  {
    title: "1. Root에게 묻기",
    from: "재귀 resolver",
    to: "Root 서버",
    ask: "www.example.com 어디 있어?",
    reply: "“난 .com 담당 서버 위치만 알아” → .com TLD 서버를 가리킴(referral).",
  },
  {
    title: "2. TLD(.com)에게 묻기",
    from: "재귀 resolver",
    to: ".com TLD 서버",
    ask: "www.example.com 어디 있어?",
    reply: "“example.com 의 authoritative 서버는 여기” → 권한 서버를 가리킴(referral).",
  },
  {
    title: "3. Authoritative에게 묻기",
    from: "재귀 resolver",
    to: "example.com 권한 서버",
    ask: "www.example.com 의 A 레코드?",
    reply: "“www.example.com 은 93.184.216.34” → 드디어 진짜 답(answer).",
  },
  {
    title: "4. 캐시하고 돌려주기",
    from: "재귀 resolver",
    to: "내 OS (stub)",
    ask: "—",
    reply: "resolver가 TTL 동안 캐시한 뒤 IP를 돌려줍니다. 다음 조회는 0번에서 바로 끝납니다.",
    cached: true,
  },
];

export default function DnsResolveLab() {
  const [i, setI] = useState(0);
  const step = STEPS[i];

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
      <p style={{ margin: "0 0 var(--space-14, 14px)", fontWeight: 600, color: INK }}>
        “다음”으로 재귀 resolver가 <strong>root → TLD → 권한 서버</strong>로 내려가며 이름을 IP로
        바꾸는 과정을 따라가세요.
      </p>

      {/* 계층 표시 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "var(--space-6)",
          flexWrap: "wrap",
          marginBottom: "var(--space-14)",
        }}
      >
        {["Root", ".com TLD", "권한 서버"].map((lvl, idx) => {
          const active = i === idx + 1;
          return (
            <span
              key={lvl}
              style={{
                padding: "var(--space-4, 4px) var(--space-12, 12px)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-label)",
                fontWeight: active ? 700 : 500,
                border: active ? `${BOLD} solid ${TEAL}` : `${HAIR} solid ${BORDER}`,
                background: active ? TEAL_TINT : PANEL,
                color: INK,
              }}
            >
              {lvl}
            </span>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-8)",
          marginBottom: "var(--space-12)",
          flexWrap: "wrap",
          fontFamily: "monospace",
          fontSize: "var(--text-meta)",
          color: TEAL,
          fontWeight: 700,
        }}
      >
        <span>{step.from}</span>
        <span>──▶</span>
        <span>{step.to}</span>
      </div>

      <div
        style={{
          padding: "var(--space-14)",
          border: `${HAIR} solid ${step.cached ? TEAL : BORDER}`,
          // 왼쪽 강조 막대 5px 은 --stroke 스케일(1/1.5/2) 밖이라 그대로 둔다 —
          // 2px 로 밀면 막대가 절반 이하로 얇아진다(배치5 규약: 임의로 고르지 않는다).
          borderLeft: `5px solid ${step.cached ? TEAL : SAND}`,
          borderRadius: "var(--radius-sm)",
          background: PANEL,
          marginBottom: "var(--space-14)",
          lineHeight: 1.6,
        }}
        role="status"
      >
        <p style={{ margin: "0 0 var(--space-8, 8px)", fontWeight: 700, color: INK }}>{step.title}</p>
        <p style={{ margin: "0 0 var(--space-6, 6px)", fontSize: "var(--text-meta)" }}>
          <strong style={{ color: ACCENT_INK }}>질문:</strong>{" "}
          <code style={{ fontFamily: "monospace" }}>{step.ask}</code>
        </p>
        <p style={{ margin: 0, fontSize: "var(--text-meta)" }}>
          <strong style={{ color: TEAL }}>응답:</strong> {step.reply}
        </p>
      </div>

      <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          style={{
            padding: "var(--space-8, 8px) var(--space-14, 14px)",
            border: `${HAIR} solid ${BORDER}`,
            borderRadius: "var(--radius-sm)",
            background: PANEL,
            color: i === 0 ? MUTED : INK,
            cursor: i === 0 ? "not-allowed" : "pointer",
          }}
        >
          ◀ 이전
        </button>
        <button
          type="button"
          onClick={() => setI((v) => Math.min(STEPS.length - 1, v + 1))}
          disabled={i === STEPS.length - 1}
          style={{
            padding: "var(--space-8, 8px) var(--space-14, 14px)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            background: i === STEPS.length - 1 ? BORDER : TEAL,
            color: ON_TEAL,
            fontWeight: 600,
            cursor: i === STEPS.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          다음 ▶
        </button>
        <span style={{ marginLeft: "auto", fontSize: "var(--text-label)", color: INK_SOFT }}>
          {i + 1} / {STEPS.length}
        </span>
      </div>

      <figcaption style={{ fontSize: "var(--text-meta)", color: INK_SOFT, marginTop: "var(--space-12)" }}>
        “재귀”는 내 OS가 한 번 부탁하면 resolver가 <strong>나 대신 여러 서버를 차례로</strong> 물어
        끝까지 답을 가져온다는 뜻입니다. 각 단계의 답은 TTL 동안 캐시돼, 인터넷 전체가 매번 root까지
        가지 않게 해 줍니다. (예시 IP는 설명용입니다.)
      </figcaption>
    </figure>
  );
}
