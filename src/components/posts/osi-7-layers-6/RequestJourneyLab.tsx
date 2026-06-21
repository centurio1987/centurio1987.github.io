import { useState } from "react";

// 한 줄 `curl https://www.example.com/` 가 어느 계층의 무엇을 차례로 깨우는지
// 단계별로 본다 — 시리즈 전체를 한 화면에 종합한다.

const TEAL = "#3e6b6b";

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
    note: "주소를 모르면 아무 데도 못 간다. 가장 먼저 일어나는 L7 동작.",
  },
  {
    layer: "L4",
    proto: "TCP",
    title: "연결 수립 (3-way handshake)",
    produces: "SYN → SYN-ACK → ACK, 포트 443 연결",
    part: "4편",
    note: "그 IP의 443 포트까지 신뢰할 수 있는 byte stream을 연다.",
  },
  {
    layer: "L6",
    proto: "TLS",
    title: "보안 채널 수립",
    produces: "ECDHE 키 합의 + 인증서 검증 → 암호화 채널",
    part: "5편",
    note: "이제부터 오가는 모든 byte는 기밀·무결·인증된다.",
  },
  {
    layer: "L7",
    proto: "HTTP",
    title: "요청 전송",
    produces: "GET /  (HTTP/2면 :method=GET, :path=/ 의사헤더)",
    part: "6편 (이 글)",
    note: "비로소 '내가 원하는 것'을 말한다. 여기까지가 다 이 한마디를 위한 준비였다.",
  },
  {
    layer: "L7",
    proto: "HTTP",
    title: "응답 수신",
    produces: "200 OK + 헤더 + 본문(HTML)",
    part: "6편 (이 글)",
    note: "전달의 성공(2xx)과 의미의 성공은 다르다. 503이면 다 와도 실패다.",
  },
];

export default function RequestJourneyLab() {
  const [i, setI] = useState(0);
  const stage = STAGES[i];

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
      <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#302d28" }}>
        한 줄{" "}
        <code style={{ fontFamily: "monospace", background: "#f1eadb", padding: "1px 5px", borderRadius: 4 }}>
          curl https://www.example.com/
        </code>{" "}
        가 깨우는 계층을 차례로 따라가 보세요.
      </p>
      <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#6b6357" }}>
        이 위 단계마다, 아래에는 늘 IP 라우팅(L3·3편) → Ethernet/ARP(L2·2편) → 신호(L1·2편)가
        깔려 있습니다.
      </p>

      {/* 단계 스택 */}
      <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
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
                gap: 10,
                alignItems: "center",
                textAlign: "left",
                padding: "9px 12px",
                border: active ? `2px solid ${TEAL}` : "1px solid #c9c1b1",
                borderRadius: 8,
                background: active ? "#e5f0ed" : done ? "#f1f5f3" : "#fffdf8",
                color: "#302d28",
                cursor: "pointer",
                opacity: !active && !done && idx > i ? 0.7 : 1,
              }}
            >
              <strong style={{ color: TEAL, fontFamily: "monospace" }}>{s.layer}</strong>
              <span>
                <strong>{s.proto}</strong> · {s.title}
              </span>
              <span style={{ fontSize: 11, color: "#6b6357" }}>{done ? "✓" : active ? "▶" : ""}</span>
            </button>
          );
        })}
      </div>

      <div
        role="status"
        style={{
          padding: 14,
          border: "1px solid #c9c1b1",
          borderLeft: `5px solid ${TEAL}`,
          borderRadius: 8,
          background: "#fffdf8",
          lineHeight: 1.6,
          marginBottom: 14,
        }}
      >
        <p style={{ margin: "0 0 6px" }}>
          <strong style={{ color: TEAL }}>
            {stage.layer} · {stage.proto}
          </strong>{" "}
          <span style={{ fontSize: 12, color: "#6b6357" }}>— {stage.part}에서 해부</span>
        </p>
        <p style={{ margin: "0 0 6px", fontFamily: "monospace", fontSize: 13, color: "#9a5b2c" }}>
          {stage.produces}
        </p>
        <p style={{ margin: 0, fontSize: 13.5 }}>{stage.note}</p>
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
          onClick={() => setI((v) => Math.min(STAGES.length - 1, v + 1))}
          disabled={i === STAGES.length - 1}
          style={{
            padding: "8px 14px",
            border: "none",
            borderRadius: 8,
            background: i === STAGES.length - 1 ? "#c9c1b1" : TEAL,
            color: "#fff",
            fontWeight: 600,
            cursor: i === STAGES.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          다음 ▶
        </button>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#6b6357" }}>
          {i + 1} / {STAGES.length}
        </span>
      </div>

      <figcaption style={{ fontSize: 13, color: "#6b6357", marginTop: 12 }}>
        한 줄의 명령이 일곱 책임을 모두 깨웁니다. 이 시리즈는 그 한 줄을 거꾸로 분해해 온 여정이었습니다.
      </figcaption>
    </figure>
  );
}
