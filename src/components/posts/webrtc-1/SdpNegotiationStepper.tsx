import { useState } from "react";

// SDP Offer/Answer 협상 스테퍼 — createOffer → setLocal → 전송 → setRemote →
// createAnswer → setLocal → 전송 → setRemote 흐름을 단계별로 따라가며,
// 각 단계에서 무엇이 채워지고 signalingState가 어떻게 전이되는지 본다.
//
// ⚠️ 교육용 개념 모델: 실제 SDP 본문/ICE 후보 라인을 그대로 생성하지 않는다.
//   m-line·codec·signalingState 전이의 "구조"만 단순화해 보여준다(RFC 8866 SDP,
//   W3C WebRTC 1.0 setLocal/RemoteDescription 의미를 본뜸).

type Step = {
  id: number;
  actor: "caller" | "callee";
  api: string;
  signaling: string; // 해당 액터의 signalingState (단순화)
  what: string;
  filled: string;
};

const steps: Step[] = [
  {
    id: 0,
    actor: "caller",
    api: "pc.createOffer()",
    signaling: "stable → (아직)",
    what: "발신자가 자기 미디어·트랜스포트 능력을 모아 Offer SDP를 만듭니다.",
    filled: "m-line(audio/video), codec 후보(Opus·VP8/VP9 등), ICE ufrag/pwd, DTLS fingerprint(setup:actpass)",
  },
  {
    id: 1,
    actor: "caller",
    api: "pc.setLocalDescription(offer)",
    signaling: "stable → have-local-offer",
    what: "발신자가 Offer를 자기 로컬 설명으로 적용합니다. 이때부터 ICE 후보 수집이 시작됩니다(trickle).",
    filled: "로컬 설명 확정 → onicecandidate로 후보가 흘러나오기 시작",
  },
  {
    id: 2,
    actor: "caller",
    api: "(시그널링 채널로 Offer 전송)",
    signaling: "have-local-offer",
    what: "Offer SDP를 WebRTC 밖의 시그널링 경로(WebSocket 등)로 상대에게 보냅니다. 이 전송은 WebRTC 표준 밖입니다.",
    filled: "Offer SDP 문자열이 상대에게 도착",
  },
  {
    id: 3,
    actor: "callee",
    api: "pc.setRemoteDescription(offer)",
    signaling: "stable → have-remote-offer",
    what: "수신자가 받은 Offer를 원격 설명으로 적용합니다. 상대의 codec·DTLS 역할을 알게 됩니다.",
    filled: "상대의 m-line/codec 파악, DTLS setup 협상(보통 수신자가 active)",
  },
  {
    id: 4,
    actor: "callee",
    api: "pc.createAnswer()",
    signaling: "have-remote-offer",
    what: "수신자가 공통 codec을 골라 Answer SDP를 만듭니다. 양쪽이 합의 가능한 능력만 남깁니다.",
    filled: "교집합 codec 확정, 자신의 ICE ufrag/pwd·DTLS fingerprint",
  },
  {
    id: 5,
    actor: "callee",
    api: "pc.setLocalDescription(answer)",
    signaling: "have-remote-offer → stable",
    what: "수신자가 Answer를 로컬에 적용합니다. 수신자 쪽 ICE 후보 수집이 시작됩니다.",
    filled: "수신자 협상 완료(stable), onicecandidate 시작",
  },
  {
    id: 6,
    actor: "callee",
    api: "(시그널링 채널로 Answer 전송)",
    signaling: "stable",
    what: "Answer SDP를 시그널링 경로로 발신자에게 돌려보냅니다.",
    filled: "Answer SDP가 발신자에게 도착",
  },
  {
    id: 7,
    actor: "caller",
    api: "pc.setRemoteDescription(answer)",
    signaling: "have-local-offer → stable",
    what: "발신자가 Answer를 원격 설명으로 적용합니다. 협상이 닫히고, 이제 ICE 연결성 점검·DTLS 핸드셰이크로 넘어갑니다.",
    filled: "양쪽 stable → 미디어 전에 ICE 점검·DTLS-SRTP 핸드셰이크 진행",
  },
];

// 시각 값은 토큰을 쓴다 (KAN-072-CPJCT1). fallback 은 tokens.css 값과 정확히 같다.
const INK = "var(--ink, #20264A)";
const INK_2 = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const PANEL = "var(--surface-hi, #fffdf8)";
const IDLE = "var(--paper, #F3EEE4)"; // 비활성(양 끝 단계) 버튼
const CREAM = "var(--cream, #EDE6D8)"; // 지나온 단계 · 인라인 코드 칩
const HAIR = "var(--stroke-hair, 1px)";
const BOLD = "var(--stroke-bold, 2px)";
const CALLER = "var(--cat-skills, #3e6b6b)"; // 발신자 · 진행 강조
const CALLEE = "var(--cat-architecture, #4e6ca8)"; // 수신자
/** 선택 배경 — 기술 축 색의 옅은 단(배치6 유저 판정). 토큰을 안 늘리고 관계만 드러낸다. */
const ACTIVE = "color-mix(in srgb, var(--cat-skills) 11%, var(--surface-hi))";

const actorColor = { caller: CALLER, callee: CALLEE } as const;

export default function SdpNegotiationStepper() {
  const [i, setI] = useState(0);
  const step = steps[i];

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
      <div style={{ display: "flex", gap: "var(--space-8)", flexWrap: "wrap", marginBottom: "var(--space-14)" }}>
        <button
          type="button"
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          style={{
            padding: "var(--space-8, 8px) var(--space-14, 14px)",
            border: `${HAIR} solid ${BORDER}`,
            borderRadius: "var(--radius-sm)",
            background: i === 0 ? IDLE : PANEL,
            cursor: i === 0 ? "default" : "pointer",
            color: INK,
          }}
        >
          ← 이전
        </button>
        <button
          type="button"
          onClick={() => setI((v) => Math.min(steps.length - 1, v + 1))}
          disabled={i === steps.length - 1}
          style={{
            padding: "var(--space-8, 8px) var(--space-14, 14px)",
            border: `${HAIR} solid ${CALLER}`,
            borderRadius: "var(--radius-sm)",
            background: i === steps.length - 1 ? IDLE : ACTIVE,
            cursor: i === steps.length - 1 ? "default" : "pointer",
            color: INK,
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          다음 →
        </button>
        <span style={{ alignSelf: "center", fontSize: "var(--text-meta)", color: INK_2 }}>
          {i + 1} / {steps.length}
        </span>
      </div>

      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        {steps.map((s, idx) => {
          const active = idx === i;
          const done = idx < i;
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => setI(idx)}
              aria-current={active ? "step" : undefined}
              style={{
                display: "grid",
                gridTemplateColumns: "5.5rem 1fr",
                gap: "var(--space-8)",
                alignItems: "center",
                textAlign: "left",
                padding: "var(--space-8, 8px) var(--space-10, 10px)",
                border: active ? `${BOLD} solid ${CALLER}` : `${HAIR} solid ${BORDER}`,
                borderRadius: "var(--radius-sm)",
                background: active ? ACTIVE : done ? CREAM : PANEL,
                color: INK,
                cursor: "pointer",
                fontSize: "var(--text-meta)",
                lineHeight: "var(--font-leading-sub)",
              }}
            >
              <strong style={{ color: actorColor[s.actor] }}>{s.actor === "caller" ? "발신자" : "수신자"}</strong>
              <code style={{ fontSize: "var(--text-label)" }}>{s.api}</code>
            </button>
          );
        })}
      </div>

      <div
        role="status"
        style={{
          marginTop: "var(--space-14)",
          padding: "var(--space-14)",
          border: `${HAIR} solid ${BORDER}`,
          borderRadius: "var(--radius-sm)",
          background: PANEL,
          lineHeight: "var(--font-leading-ui)",
        }}
      >
        <p style={{ margin: "0 0 var(--space-6, 6px)" }}>
          <strong style={{ color: actorColor[step.actor] }}>
            {step.actor === "caller" ? "발신자(caller)" : "수신자(callee)"}
          </strong>{" "}
          · signalingState:{" "}
          <code style={{ background: CREAM, padding: "var(--space-2, 2px) var(--space-6, 6px)", borderRadius: "var(--radius-xs)" }}>
            {step.signaling}
          </code>
        </p>
        <p style={{ margin: "0 0 var(--space-6, 6px)" }}>{step.what}</p>
        <p style={{ margin: 0, fontSize: "var(--text-meta)", color: INK_2 }}>
          <strong>이때 채워지는 것:</strong> {step.filled}
        </p>
      </div>

      <figcaption style={{ fontSize: "var(--text-meta)", color: INK_2, marginTop: "var(--space-10)", lineHeight: "var(--font-leading-ui)" }}>
        교육용 개념 모델입니다(실제 SDP 본문·ICE 라인을 생성하지 않음). signalingState 전이와 단계별로 채워지는
        정보의 "구조"만 단순화해 보여줍니다 — 실제 협상은 trickle ICE로 후보가 비동기로 흐르고, 재협상·glare가 끼면
        순서가 달라집니다.
      </figcaption>
    </figure>
  );
}
