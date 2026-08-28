import { useState } from "react";

// TCP 3-way handshake를 한 단계씩 밟으며 양쪽 끝의 상태(state machine)와
// 주고받는 세그먼트의 flag·seq·ack가 어떻게 변하는지 본다.

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
const SEG_BG = "var(--surface, #F8F3E8)";
// 토큰 밖 — 최근접 토큰과 ΔRGB 가 15 이상이라 옮기지 않았다(배치5 규약: 15 이상은 임의로 고르지 않는다).
const SAND = "#e8c97a"; // 최근접 --pop-tint ΔRGB 50
const TEAL_TINT = "#e5f0ed"; // 최근접 --paper ΔRGB 17
const MUTED = "#b8b0a0"; // 최근접 --border ΔRGB 54

type Step = {
  title: string;
  clientState: string;
  serverState: string;
  // 이 단계에서 흐르는 세그먼트(없으면 null)
  seg: { dir: "c2s" | "s2c"; flags: string; seq: string; ack: string } | null;
  note: string;
};

const STEPS: Step[] = [
  {
    title: "0. 시작 전",
    clientState: "CLOSED",
    serverState: "LISTEN",
    seg: null,
    note: "서버는 포트를 열고 LISTEN 상태로 연결을 기다린다. 클라이언트는 아직 아무것도 보내지 않았다.",
  },
  {
    title: "1. SYN →",
    clientState: "SYN-SENT",
    serverState: "LISTEN",
    seg: { dir: "c2s", flags: "SYN", seq: "x", ack: "-" },
    note: "클라이언트가 초기 순서번호 x(ISN)를 담아 SYN을 보냅니다. “이 번호부터 셀게”라는 선언입니다. 클라이언트는 SYN-SENT로.",
  },
  {
    title: "2. ← SYN, ACK",
    clientState: "SYN-SENT",
    serverState: "SYN-RECEIVED",
    seg: { dir: "s2c", flags: "SYN, ACK", seq: "y", ack: "x+1" },
    note: "서버도 자기 ISN y를 SYN으로 선언하면서, 클라이언트의 x를 잘 받았다고 ack=x+1로 확인합니다. 한 세그먼트에 두 일을 겹쳐 담습니다.",
  },
  {
    title: "3. ACK →",
    clientState: "ESTABLISHED",
    serverState: "ESTABLISHED",
    seg: { dir: "c2s", flags: "ACK", seq: "x+1", ack: "y+1" },
    note: "클라이언트가 서버의 y를 ack=y+1로 확인합니다. 이 마지막 ACK이 닿는 순간 양쪽 모두 ESTABLISHED — 이제 데이터를 주고받을 수 있습니다.",
  },
];

function Endpoint({ label, state, active }: { label: string; state: string; active: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        padding: "var(--space-10, 10px) var(--space-8, 8px)",
        border: active ? `${BOLD} solid ${TEAL}` : `${HAIR} solid ${BORDER}`,
        borderRadius: "var(--radius-sm)",
        background: active ? TEAL_TINT : PANEL,
      }}
    >
      <div style={{ fontWeight: 700, color: INK, fontSize: "var(--text-meta)" }}>{label}</div>
      <div
        style={{
          marginTop: "var(--space-4)",
          fontFamily: "monospace",
          fontSize: "var(--text-meta)",
          color: TEAL,
          fontWeight: 700,
        }}
      >
        {state}
      </div>
    </div>
  );
}

export default function HandshakeLab() {
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
        “다음” 버튼으로 3-way handshake를 한 단계씩 진행하며, 양쪽 상태와 세그먼트의 seq/ack가
        어떻게 맞물리는지 관찰하세요.
      </p>

      <div style={{ display: "flex", gap: "var(--space-12)", alignItems: "stretch", marginBottom: "var(--space-10)" }}>
        <Endpoint label="Client" state={step.clientState} active={step.seg?.dir === "c2s"} />
        <Endpoint label="Server" state={step.serverState} active={step.seg?.dir === "s2c"} />
      </div>

      {/* 세그먼트 표시 */}
      <div
        style={{
          minHeight: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-10)",
        }}
      >
        {step.seg ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-10)",
              padding: "var(--space-8, 8px) var(--space-14, 14px)",
              border: `${HAIR} solid ${SAND}`,
              borderRadius: "var(--btn-radius)",
              background: SEG_BG,
              fontFamily: "monospace",
              fontSize: "var(--text-meta)",
            }}
          >
            <span style={{ color: TEAL, fontWeight: 700 }}>
              {step.seg.dir === "c2s" ? "Client ──▶ Server" : "Client ◀── Server"}
            </span>
            <span>
              [{step.seg.flags}] seq={step.seg.seq} ack={step.seg.ack}
            </span>
          </div>
        ) : (
          <span style={{ color: INK_SOFT, fontSize: "var(--text-meta)" }}>아직 주고받는 세그먼트가 없습니다.</span>
        )}
      </div>

      <p
        role="status"
        style={{
          margin: "0 0 var(--space-14, 14px)",
          padding: "var(--space-12)",
          background: PANEL,
          border: `${HAIR} solid ${BORDER}`,
          borderRadius: "var(--radius-sm)",
          lineHeight: 1.6,
          fontSize: "var(--text-meta)",
          color: INK,
        }}
      >
        <strong>{step.title}</strong> — {step.note}
      </p>

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
        세 번 주고받는 이유는 <strong>양쪽이 서로의 순서번호를 확인</strong>해야 하기 때문입니다. SYN
        하나로는 한 방향만 합의됩니다. 마지막 ACK이 유실되면 서버는 SYN-RECEIVED에 머물다 SYN-ACK을
        재전송합니다 — handshake도 신뢰성 규칙을 그대로 따릅니다.
      </figcaption>
    </figure>
  );
}
