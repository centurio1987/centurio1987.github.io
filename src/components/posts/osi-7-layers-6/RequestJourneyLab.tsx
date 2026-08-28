import { useState } from "react";

// 한 줄 `curl https://www.example.com/` 가 어느 계층의 무엇을 차례로 깨우는지
// 단계별로 본다 — 시리즈 전체를 한 화면에 종합한다.

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
const CODE_BG = "var(--cream, #EDE6D8)";
const DONE_BG = "var(--surface, #F8F3E8)";
// 본문 강조 잉크. 유저 판정으로 --ink-accent 를 세웠다(2026-08-27, DESIGN_CONCEPT §4).
// 역할은 일관된데 이름이 없던 자리라 --stroke-bold·--text-small 과 같은 「구멍」이었다.
// 최근접 --pop-ink(Δ31)·--cat-leadership(Δ28)로 밀지 않은 이유는 앞은 서브 CTA 의 진한 단이고
// 뒤는 배지 전용이라서다 — 최근접이 곧 정답이 아니다(§5 역할 우선). 값이 같아 화면 변화 0.
const ACCENT_INK = "var(--ink-accent, #9a5b2c)";
// 토큰 밖 — 최근접 토큰과 ΔRGB 가 15 이상이라 옮기지 않았다(배치5 규약: 15 이상은 임의로 고르지 않는다).
const TEAL_TINT = "#e5f0ed"; // 최근접 --paper ΔRGB 17
const MUTED = "#b8b0a0"; // 최근접 --border ΔRGB 54

type Stage = {
  layer: string;
  proto: string;
  title: string;
  produces: string;
  part: string;
  note: string;
};

const STAGES: Stage[] = [
  {
    layer: "L7",
    proto: "DNS",
    title: "이름을 IP로",
    produces: "www.example.com → 93.184.216.34",
    part: "6편 (이 글)",
    note: "주소를 모르면 아무 데도 못 갑니다. 가장 먼저 일어나는 L7 동작입니다.",
  },
  {
    layer: "L4",
    proto: "TCP",
    title: "연결 수립 (3-way handshake)",
    produces: "SYN → SYN-ACK → ACK, 포트 443 연결",
    part: "4편",
    note: "그 IP의 443 포트까지 신뢰할 수 있는 byte stream을 엽니다.",
  },
  {
    layer: "L6",
    proto: "TLS",
    title: "보안 채널 수립",
    produces: "ECDHE 키 합의 + 인증서 검증 → 암호화 채널",
    part: "5편",
    note: "이제부터 오가는 모든 byte는 기밀·무결·인증됩니다.",
  },
  {
    layer: "L7",
    proto: "HTTP",
    title: "요청 전송",
    produces: "GET /  (HTTP/2면 :method=GET, :path=/ 의사헤더)",
    part: "6편 (이 글)",
    note: "비로소 '내가 원하는 것'을 말합니다. 여기까지가 다 이 한마디를 위한 준비였습니다.",
  },
  {
    layer: "L7",
    proto: "HTTP",
    title: "응답 수신",
    produces: "200 OK + 헤더 + 본문(HTML)",
    part: "6편 (이 글)",
    note: "전달의 성공(2xx)과 의미의 성공은 다릅니다. 503이면 다 와도 실패입니다.",
  },
];

export default function RequestJourneyLab() {
  const [i, setI] = useState(0);
  const stage = STAGES[i];

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
      <p style={{ margin: "0 0 var(--space-6, 6px)", fontWeight: 600, color: INK }}>
        한 줄{" "}
        <code
          style={{
            fontFamily: "monospace",
            background: CODE_BG,
            padding: "var(--space-2, 2px) var(--space-4, 4px)",
            borderRadius: "var(--radius-xs)",
          }}
        >
          curl https://www.example.com/
        </code>{" "}
        가 깨우는 계층을 차례로 따라가 보세요.
      </p>
      <p style={{ margin: "0 0 var(--space-14, 14px)", fontSize: "var(--text-label)", color: INK_SOFT }}>
        이 위 단계마다, 아래에는 늘 IP 라우팅(L3·3편) → Ethernet/ARP(L2·2편) → 신호(L1·2편)가
        깔려 있습니다.
      </p>

      {/* 단계 스택 */}
      <div style={{ display: "grid", gap: "var(--space-6)", marginBottom: "var(--space-14)" }}>
        {STAGES.map((s, idx) => {
          const active = idx === i;
          const done = idx < i;
          return (
            <button
              type="button"
              key={idx}
              onClick={() => setI(idx)}
              aria-pressed={active}
              style={{
                display: "grid",
                gridTemplateColumns: "3rem 1fr auto",
                gap: "var(--space-10)",
                alignItems: "center",
                textAlign: "left",
                padding: "var(--space-8, 8px) var(--space-12, 12px)",
                border: active ? `${BOLD} solid ${TEAL}` : `${HAIR} solid ${BORDER}`,
                borderRadius: "var(--radius-sm)",
                background: active ? TEAL_TINT : done ? DONE_BG : PANEL,
                color: INK,
                cursor: "pointer",
                opacity: !active && !done && idx > i ? 0.7 : 1,
              }}
            >
              <strong style={{ color: TEAL, fontFamily: "monospace" }}>{s.layer}</strong>
              <span>
                <strong>{s.proto}</strong> · {s.title}
              </span>
              <span style={{ fontSize: "var(--text-micro)", color: INK_SOFT }}>{done ? "✓" : active ? "▶" : ""}</span>
            </button>
          );
        })}
      </div>

      <div
        role="status"
        style={{
          padding: "var(--space-14)",
          border: `${HAIR} solid ${BORDER}`,
          // 왼쪽 강조 막대 5px 은 --stroke 스케일(1/1.5/2) 밖이라 그대로 둔다 —
          // 2px 로 밀면 막대가 절반 이하로 얇아진다(배치5 규약: 임의로 고르지 않는다).
          borderLeft: `5px solid ${TEAL}`,
          borderRadius: "var(--radius-sm)",
          background: PANEL,
          lineHeight: 1.6,
          marginBottom: "var(--space-14)",
        }}
      >
        <p style={{ margin: "0 0 var(--space-6, 6px)" }}>
          <strong style={{ color: TEAL }}>
            {stage.layer} · {stage.proto}
          </strong>{" "}
          <span style={{ fontSize: "var(--text-label)", color: INK_SOFT }}>— {stage.part}에서 해부</span>
        </p>
        <p style={{ margin: "0 0 var(--space-6, 6px)", fontFamily: "monospace", fontSize: "var(--text-meta)", color: ACCENT_INK }}>
          {stage.produces}
        </p>
        <p style={{ margin: 0, fontSize: "var(--text-meta)" }}>{stage.note}</p>
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
          onClick={() => setI((v) => Math.min(STAGES.length - 1, v + 1))}
          disabled={i === STAGES.length - 1}
          style={{
            padding: "var(--space-8, 8px) var(--space-14, 14px)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            background: i === STAGES.length - 1 ? BORDER : TEAL,
            color: ON_TEAL,
            fontWeight: 600,
            cursor: i === STAGES.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          다음 ▶
        </button>
        <span style={{ marginLeft: "auto", fontSize: "var(--text-label)", color: INK_SOFT }}>
          {i + 1} / {STAGES.length}
        </span>
      </div>

      <figcaption style={{ fontSize: "var(--text-meta)", color: INK_SOFT, marginTop: "var(--space-12)" }}>
        한 줄의 명령이 일곱 책임을 모두 깨웁니다. 이 시리즈는 그 한 줄을 거꾸로 분해해 온 여정이었습니다.
      </figcaption>
    </figure>
  );
}
