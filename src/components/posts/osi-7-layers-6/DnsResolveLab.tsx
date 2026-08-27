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
// #9a5b2c(경고·질문 강조)는 **상수로 올리지 않는다** — 아직 판정 대기라 게이트 시야에
// 남아 있어야 한다. 상수로 빼면 추출층이 못 본다(인라인 속성 꼴만 본다). 그러면 잔여 0 이
// 「닫힌 것」과 「시야 밖으로 나간 것」을 섞어 버리고, 판정이 내려져도 자리를 못 찾는다.
// 토큰 밖 — 최근접 토큰과 ΔRGB 가 15 이상이라 옮기지 않았다(배치5 규약: 15 이상은 임의로 고르지 않는다).
const SAND = "#e8c97a"; // 최근접 --pop-tint ΔRGB 50
const TEAL_TINT = "#e5f0ed"; // 최근접 --paper ΔRGB 17
const MUTED = "#b8b0a0"; // 최근접 --border ΔRGB 54

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
        padding: 18,
        border: `${HAIR} solid ${BORDER}`,
        borderRadius: 12,
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
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        {["Root", ".com TLD", "권한 서버"].map((lvl, idx) => {
          const active = i === idx + 1;
          return (
            <span
              key={lvl}
              style={{
                padding: "var(--space-4, 4px) var(--space-12, 12px)",
                borderRadius: 8,
                fontSize: 12.5,
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
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
          fontFamily: "monospace",
          fontSize: 13,
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
          padding: 14,
          border: `${HAIR} solid ${step.cached ? TEAL : BORDER}`,
          // 왼쪽 강조 막대 5px 은 --stroke 스케일(1/1.5/2) 밖이라 그대로 둔다 —
          // 2px 로 밀면 막대가 절반 이하로 얇아진다(배치5 규약: 임의로 고르지 않는다).
          borderLeft: `5px solid ${step.cached ? TEAL : SAND}`,
          borderRadius: 8,
          background: PANEL,
          marginBottom: 14,
          lineHeight: 1.6,
        }}
        role="status"
      >
        <p style={{ margin: "0 0 var(--space-8, 8px)", fontWeight: 700, color: INK }}>{step.title}</p>
        <p style={{ margin: "0 0 var(--space-6, 6px)", fontSize: 13.5 }}>
          <strong style={{ color: "#9a5b2c" }}>질문:</strong>{" "}
          <code style={{ fontFamily: "monospace" }}>{step.ask}</code>
        </p>
        <p style={{ margin: 0, fontSize: 13.5 }}>
          <strong style={{ color: TEAL }}>응답:</strong> {step.reply}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          style={{
            padding: "var(--space-8, 8px) var(--space-14, 14px)",
            border: `${HAIR} solid ${BORDER}`,
            borderRadius: 8,
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
            borderRadius: 8,
            background: i === STEPS.length - 1 ? BORDER : TEAL,
            color: ON_TEAL,
            fontWeight: 600,
            cursor: i === STEPS.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          다음 ▶
        </button>
        <span style={{ marginLeft: "auto", fontSize: 12, color: INK_SOFT }}>
          {i + 1} / {STEPS.length}
        </span>
      </div>

      <figcaption style={{ fontSize: 13, color: INK_SOFT, marginTop: 12 }}>
        “재귀”는 내 OS가 한 번 부탁하면 resolver가 <strong>나 대신 여러 서버를 차례로</strong> 물어
        끝까지 답을 가져온다는 뜻입니다. 각 단계의 답은 TTL 동안 캐시돼, 인터넷 전체가 매번 root까지
        가지 않게 해 줍니다. (예시 IP는 설명용입니다.)
      </figcaption>
    </figure>
  );
}
