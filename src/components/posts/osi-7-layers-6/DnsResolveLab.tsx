import { useState } from "react";

// www.example.com 을 재귀 resolver가 root → TLD → authoritative로
// 내려가며 해석하는 과정을 한 단계씩 본다.

const TEAL = "#3e6b6b";
const SAND = "#e8c97a";

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
    reply: "캐시에 있으면 즉시 응답. 없으면 재귀 resolver가 대신 찾아 나선다.",
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
    reply: "resolver가 TTL 동안 캐시한 뒤 IP를 돌려준다. 다음 조회는 0번에서 바로 끝난다.",
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
        border: "1px solid #d7d0c2",
        borderRadius: 12,
        background: "#fbf8f1",
      }}
    >
      <p style={{ margin: "0 0 14px", fontWeight: 600, color: "#302d28" }}>
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
                padding: "5px 12px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                border: active ? `2px solid ${TEAL}` : "1px solid #c9c1b1",
                background: active ? "#e5f0ed" : "#fffdf8",
                color: "#302d28",
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
          border: `1px solid ${step.cached ? TEAL : "#c9c1b1"}`,
          borderLeft: `5px solid ${step.cached ? TEAL : SAND}`,
          borderRadius: 8,
          background: "#fffdf8",
          marginBottom: 14,
          lineHeight: 1.6,
        }}
        role="status"
      >
        <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#302d28" }}>{step.title}</p>
        <p style={{ margin: "0 0 6px", fontSize: 13.5 }}>
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
            padding: "8px 14px",
            border: "1px solid #c9c1b1",
            borderRadius: 8,
            background: "#fffdf8",
            color: i === 0 ? "#b8b0a0" : "#302d28",
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
            padding: "8px 14px",
            border: "none",
            borderRadius: 8,
            background: i === STEPS.length - 1 ? "#c9c1b1" : TEAL,
            color: "#fff",
            fontWeight: 600,
            cursor: i === STEPS.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          다음 ▶
        </button>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#6b6357" }}>
          {i + 1} / {STEPS.length}
        </span>
      </div>

      <figcaption style={{ fontSize: 13, color: "#6b6357", marginTop: 12 }}>
        “재귀”는 내 OS가 한 번 부탁하면 resolver가 <strong>나 대신 여러 서버를 차례로</strong> 물어
        끝까지 답을 가져온다는 뜻입니다. 각 단계의 답은 TTL 동안 캐시돼, 인터넷 전체가 매번 root까지
        가지 않게 해 줍니다. (예시 IP는 설명용입니다.)
      </figcaption>
    </figure>
  );
}
