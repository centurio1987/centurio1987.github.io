import { useState } from "react";

// 패킷이 Host A → R1 → R2 → Host B로 가는 동안
// IP(종단까지 고정)와 MAC·TTL(홉마다 변함)이 어떻게 달라지는지 한 구간씩 본다.

const TEAL = "#3e6b6b";
const SAND = "#e8c97a";

const SRC_IP = "198.51.100.10"; // Host A
const DST_IP = "203.0.113.20"; // Host B

type Seg = {
  label: string;
  link: string;
  srcMac: string;
  dstMac: string;
  ttl: number;
  note: string;
};

const SEGMENTS: Seg[] = [
  {
    label: "Host A → R1",
    link: "LAN 1",
    srcMac: "A (aa:..:0a)",
    dstMac: "R1 왼쪽 if (r1:..:01)",
    ttl: 64,
    note: "A는 목적지가 다른 네트워크임을 알고, 기본 gateway R1의 MAC으로 보냅니다. dst IP는 여전히 B.",
  },
  {
    label: "R1 → R2",
    link: "전송 구간",
    srcMac: "R1 오른쪽 if (r1:..:02)",
    dstMac: "R2 왼쪽 if (r2:..:01)",
    ttl: 63,
    note: "R1은 프레임을 벗기고 IP를 검사한 뒤 TTL을 1 줄이고, 다음 홉 R2를 향해 새 프레임으로 다시 쌉니다.",
  },
  {
    label: "R2 → Host B",
    link: "LAN 2",
    srcMac: "R2 오른쪽 if (r2:..:02)",
    dstMac: "B (bb:..:14)",
    ttl: 62,
    note: "R2도 같은 일을 합니다. 마지막 구간에서 dst MAC이 비로소 최종 목적지 B가 됩니다.",
  },
];

const NODES = ["A", "R1", "R2", "B"];

export default function HopJourney() {
  const [step, setStep] = useState(0);
  const seg = SEGMENTS[step];

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
        “다음 구간”을 눌러 패킷을 한 홉씩 옮기며, <strong>IP는 그대로인데 MAC과 TTL은 매 홉
        바뀌는</strong> 모습을 확인하세요.
      </p>

      {/* 경로 시각화 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {NODES.map((n, i) => {
          const isRouter = n === "R1" || n === "R2";
          // 현재 구간의 양 끝 노드를 강조
          const active = i === step || i === step + 1;
          return (
            <span key={n} style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 52,
                  height: 40,
                  borderRadius: isRouter ? 8 : 20,
                  border: active ? `2px solid ${TEAL}` : "1px solid #c9c1b1",
                  background: active ? "#e5f0ed" : "#fffdf8",
                  fontWeight: 700,
                  color: "#302d28",
                  fontSize: 13,
                }}
              >
                {n}
              </span>
              {i < NODES.length - 1 && (
                <span
                  style={{
                    width: 46,
                    textAlign: "center",
                    color: i === step ? TEAL : "#c9c1b1",
                    fontWeight: 700,
                  }}
                >
                  {i === step ? "▶▶" : "──"}
                </span>
              )}
            </span>
          );
        })}
      </div>

      <p style={{ textAlign: "center", margin: "0 0 14px", fontSize: 13, color: "#6b6357" }}>
        구간 {step + 1}/3 · <strong style={{ color: "#302d28" }}>{seg.label}</strong> ({seg.link})
      </p>

      {/* 헤더 패널 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div
          style={{
            border: `1px solid ${TEAL}`,
            borderRadius: 8,
            background: "#eef5f3",
            padding: 12,
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: 700, color: TEAL }}>
            L3 IP 헤더 <span style={{ fontWeight: 400, fontSize: 12 }}>(종단까지 고정)</span>
          </p>
          <p style={{ margin: "0 0 4px", fontFamily: "monospace", fontSize: 13 }}>
            src: {SRC_IP}
          </p>
          <p style={{ margin: "0 0 8px", fontFamily: "monospace", fontSize: 13 }}>
            dst: {DST_IP}
          </p>
          <p style={{ margin: 0, fontSize: 13 }}>
            TTL:{" "}
            <strong style={{ color: "#9a5b2c", fontFamily: "monospace", fontSize: 15 }}>
              {seg.ttl}
            </strong>{" "}
            <span style={{ color: "#6b6357", fontSize: 12 }}>(홉마다 −1)</span>
          </p>
        </div>

        <div
          style={{
            border: `1px solid ${SAND}`,
            borderRadius: 8,
            background: "#fdf6e6",
            padding: 12,
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#9a5b2c" }}>
            L2 Ethernet 헤더 <span style={{ fontWeight: 400, fontSize: 12 }}>(구간마다 새로)</span>
          </p>
          <p style={{ margin: "0 0 4px", fontFamily: "monospace", fontSize: 13 }}>
            src MAC: {seg.srcMac}
          </p>
          <p style={{ margin: 0, fontFamily: "monospace", fontSize: 13 }}>
            dst MAC: {seg.dstMac}
          </p>
        </div>
      </div>

      <p
        role="status"
        style={{
          margin: "12px 0 0",
          padding: 10,
          background: "#fffdf8",
          border: "1px solid #c9c1b1",
          borderRadius: 8,
          lineHeight: 1.6,
          fontSize: 13.5,
          color: "#302d28",
        }}
      >
        {seg.note}
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            padding: "8px 14px",
            border: "1px solid #c9c1b1",
            borderRadius: 8,
            background: "#fffdf8",
            color: step === 0 ? "#b8b0a0" : "#302d28",
            cursor: step === 0 ? "not-allowed" : "pointer",
          }}
        >
          ◀ 이전
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(SEGMENTS.length - 1, s + 1))}
          disabled={step === SEGMENTS.length - 1}
          style={{
            padding: "8px 14px",
            border: "none",
            borderRadius: 8,
            background: step === SEGMENTS.length - 1 ? "#c9c1b1" : TEAL,
            color: "#fff",
            fontWeight: 600,
            cursor: step === SEGMENTS.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          다음 구간 ▶
        </button>
      </div>

      <figcaption style={{ fontSize: 13, color: "#6b6357", marginTop: 12 }}>
        세 구간 내내 <code>src/dst IP</code>는 한 글자도 변하지 않습니다(NAT가 없다면). 반면 MAC은
        구간마다 통째로 바뀌고 TTL은 라우터를 지날 때마다 줄어듭니다 — TTL이 0이 되면 패킷은 폐기되고
        라우터가 ICMP Time Exceeded를 돌려보내는데, 이게 바로 <code>traceroute</code>의 원리입니다.
      </figcaption>
    </figure>
  );
}
