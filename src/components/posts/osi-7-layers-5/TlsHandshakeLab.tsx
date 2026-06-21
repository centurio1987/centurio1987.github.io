import { useState } from "react";

// TLS 1.3 1-RTT handshake를 한 단계씩 밟으며 무엇이 협상되고
// 어디서부터 암호화가 시작되는지 본다. (Part 4의 TCP handshake와 짝을 이룬다.)

const TEAL = "#3e6b6b";
const SAND = "#e8c97a";

type Step = {
  title: string;
  dir: "c2s" | "s2c" | "both" | null;
  enc: "plain" | "encrypted";
  carries: string[];
  note: string;
};

const STEPS: Step[] = [
  {
    title: "0. TCP 연결됨 (아직 평문)",
    dir: null,
    enc: "plain",
    carries: [],
    note: "이미 Part 4의 3-way handshake로 TCP 연결은 섰다. 하지만 지금 오가는 모든 byte는 평문이다. TLS는 이 위에 '같은 뜻 + 비밀'을 얹는다.",
  },
  {
    title: "1. ClientHello →",
    dir: "c2s",
    enc: "plain",
    carries: [
      "지원 cipher suite 목록",
      "key_share (내 ECDHE 공개값)",
      "SNI (접속하려는 hostname)",
      "ALPN (h2 / http/1.1 …)",
      "supported_versions: TLS 1.3",
    ],
    note: "클라이언트가 '이런 암호 쓸 수 있고, 키 교환용 공개값은 이거고, 이 hostname의 인증서를 줘'라고 한 번에 던진다. SNI가 평문이라 어느 사이트로 가는지는 이 단계까지 노출된다.",
  },
  {
    title: "2. ← ServerHello + (암호화된) 인증서·Finished",
    dir: "s2c",
    enc: "encrypted",
    carries: [
      "선택한 cipher suite 1개",
      "key_share (서버 ECDHE 공개값)",
      "── 여기서부터 암호화 ──",
      "Certificate (서버 인증서 체인)",
      "CertificateVerify (개인키 서명)",
      "Finished",
    ],
    note: "서버가 cipher 하나를 고르고 자기 key_share를 보낸다. 이 순간 양쪽은 ECDHE로 같은 세션 키를 계산할 수 있다 — 그래서 ServerHello '이후' 메시지(인증서 포함)부터 바로 암호화된다. 인증서로 신원을, CertificateVerify 서명으로 '그 인증서의 개인키를 진짜 가졌음'을 증명한다.",
  },
  {
    title: "3. Client Finished →",
    dir: "c2s",
    enc: "encrypted",
    carries: ["Finished (handshake 무결성 확인)"],
    note: "클라이언트가 인증서 체인·hostname을 검증하고, 자기도 Finished를 보내 handshake가 변조되지 않았음을 확인한다. 메시지 1왕복(1-RTT) 만에 보안 채널이 선다.",
  },
  {
    title: "4. Application Data ↔ (암호화)",
    dir: "both",
    enc: "encrypted",
    carries: ["HTTP 요청·응답 등 실제 데이터 (전부 암호화)"],
    note: "이제 HTTP 같은 상위 데이터가 모두 암호화되어 오간다. 기밀성(엿봐도 모름)·무결성(중간 변조 감지)·인증(상대가 그 hostname의 주인)이 함께 보장된다.",
  },
];

export default function TlsHandshakeLab() {
  const [i, setI] = useState(0);
  const step = STEPS[i];

  const dirLabel =
    step.dir === "c2s"
      ? "Client ──▶ Server"
      : step.dir === "s2c"
      ? "Client ◀── Server"
      : step.dir === "both"
      ? "Client ◀──▶ Server"
      : "— (전송 없음)";

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
        “다음”으로 TLS 1.3 handshake를 한 단계씩 진행하며, 무엇이 협상되고 어디서부터
        <strong> 암호화가 시작되는지</strong> 보세요.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <span style={{ fontFamily: "monospace", fontWeight: 700, color: TEAL }}>{dirLabel}</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 999,
            background: step.enc === "encrypted" ? "#e5f0ed" : "#fdf6e6",
            color: step.enc === "encrypted" ? TEAL : "#9a5b2c",
            border: `1px solid ${step.enc === "encrypted" ? TEAL : SAND}`,
          }}
        >
          {step.enc === "encrypted" ? "🔒 암호화됨" : "🔓 평문"}
        </span>
      </div>

      <div
        style={{
          minHeight: 96,
          padding: 12,
          border: "1px solid #c9c1b1",
          borderRadius: 8,
          background: "#fffdf8",
          marginBottom: 12,
        }}
      >
        {step.carries.length === 0 ? (
          <span style={{ color: "#6b6357", fontSize: 13 }}>이 단계에선 TLS 메시지가 없습니다.</span>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {step.carries.map((c, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  fontFamily: c.includes("──") ? "inherit" : "monospace",
                  color: c.includes("──") ? "#9a5b2c" : "#302d28",
                  fontWeight: c.includes("──") ? 700 : 400,
                  listStyle: c.includes("──") ? "none" : "disc",
                  marginLeft: c.includes("──") ? -18 : 0,
                }}
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p
        role="status"
        style={{
          margin: "0 0 14px",
          padding: 12,
          background: "#fffdf8",
          border: "1px solid #c9c1b1",
          borderRadius: 8,
          lineHeight: 1.65,
          fontSize: 13.5,
          color: "#302d28",
        }}
      >
        <strong>{step.title}</strong> — {step.note}
      </p>

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
        TLS 1.3은 키 교환에 ECDHE를 써서, 서버 개인키가 훗날 유출돼도 과거 트래픽은 못 푸는{" "}
        <strong>forward secrecy</strong>를 보장합니다. 또 ServerHello 직후부터 인증서까지 암호화하므로
        엿보는 쪽이 볼 수 있는 평문은 사실상 SNI 정도뿐입니다.
      </figcaption>
    </figure>
  );
}
