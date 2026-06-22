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

const actorColor = { caller: "#3e6b6b", callee: "#4E6CA8" } as const;

export default function SdpNegotiationStepper() {
  const [i, setI] = useState(0);
  const step = steps[i];

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
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          style={{
            padding: "8px 14px",
            border: "1px solid #c9c1b1",
            borderRadius: 8,
            background: i === 0 ? "#f3efe6" : "#fffdf8",
            cursor: i === 0 ? "default" : "pointer",
            color: "#302d28",
          }}
        >
          ← 이전
        </button>
        <button
          type="button"
          onClick={() => setI((v) => Math.min(steps.length - 1, v + 1))}
          disabled={i === steps.length - 1}
          style={{
            padding: "8px 14px",
            border: "1px solid #3e6b6b",
            borderRadius: 8,
            background: i === steps.length - 1 ? "#f3efe6" : "#e5f0ed",
            cursor: i === steps.length - 1 ? "default" : "pointer",
            color: "#302d28",
            fontWeight: 600,
          }}
        >
          다음 →
        </button>
        <span style={{ alignSelf: "center", fontSize: 13, color: "#6b6357" }}>
          {i + 1} / {steps.length}
        </span>
      </div>

      <div style={{ display: "grid", gap: 4 }}>
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
                gap: 8,
                alignItems: "center",
                textAlign: "left",
                padding: "8px 10px",
                border: active ? "2px solid #3e6b6b" : "1px solid #c9c1b1",
                borderRadius: 6,
                background: active ? "#e5f0ed" : done ? "#f1eadb" : "#fffdf8",
                color: "#302d28",
                cursor: "pointer",
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              <strong style={{ color: actorColor[s.actor] }}>{s.actor === "caller" ? "발신자" : "수신자"}</strong>
              <code style={{ fontSize: 12.5 }}>{s.api}</code>
            </button>
          );
        })}
      </div>

      <div
        role="status"
        style={{
          marginTop: 14,
          padding: 14,
          border: "1px solid #c9c1b1",
          borderRadius: 8,
          background: "#fffdf8",
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: "0 0 6px" }}>
          <strong style={{ color: actorColor[step.actor] }}>
            {step.actor === "caller" ? "발신자(caller)" : "수신자(callee)"}
          </strong>{" "}
          · signalingState: <code style={{ background: "#f1eadb", padding: "1px 6px", borderRadius: 4 }}>{step.signaling}</code>
        </p>
        <p style={{ margin: "0 0 6px" }}>{step.what}</p>
        <p style={{ margin: 0, fontSize: 13, color: "#4a463f" }}>
          <strong>이때 채워지는 것:</strong> {step.filled}
        </p>
      </div>

      <figcaption style={{ fontSize: 13, color: "#6b6357", marginTop: 10, lineHeight: 1.55 }}>
        교육용 개념 모델입니다(실제 SDP 본문·ICE 라인을 생성하지 않음). signalingState 전이와 단계별로 채워지는
        정보의 "구조"만 단순화해 보여줍니다 — 실제 협상은 trickle ICE로 후보가 비동기로 흐르고, 재협상·glare가 끼면
        순서가 달라집니다.
      </figcaption>
    </figure>
  );
}
