import { useMemo, useState } from "react";

const layers = [
  { no: 7, name: "Application", unit: "Data", header: "HTTP" },
  { no: 6, name: "Presentation", unit: "Data", header: "TLS/encoding" },
  { no: 5, name: "Session", unit: "Data", header: "session state" },
  { no: 4, name: "Transport", unit: "Segment", header: "TCP" },
  { no: 3, name: "Network", unit: "Packet", header: "IP" },
  { no: 2, name: "Data Link", unit: "Frame", header: "Ethernet" },
  { no: 1, name: "Physical", unit: "Bits", header: "signal" },
];

export default function EncapsulationLab() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"send" | "receive">("send");
  const ordered = useMemo(
    () => (direction === "send" ? layers : [...layers].reverse()),
    [direction],
  );
  const current = ordered[step];
  const verb = direction === "send" ? "붙인다" : "해석하고 벗긴다";

  function changeDirection(next: "send" | "receive") {
    setDirection(next);
    setStep(0);
  }

  return (
    <figure style={{ margin: "2rem 0", padding: 18, border: "1px solid #d7d0c2", borderRadius: 12, background: "#fbf8f1" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button type="button" onClick={() => changeDirection("send")} aria-pressed={direction === "send"}>송신: 캡슐화</button>
        <button type="button" onClick={() => changeDirection("receive")} aria-pressed={direction === "receive"}>수신: 역캡슐화</button>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {ordered.map((layer, index) => {
          const active = index === step;
          const passed = index < step;
          return (
            <button
              type="button"
              key={layer.no}
              onClick={() => setStep(index)}
              aria-current={active ? "step" : undefined}
              style={{
                display: "grid", gridTemplateColumns: "3rem minmax(8rem, 1fr) minmax(7rem, 1fr)",
                gap: 8, alignItems: "center", textAlign: "left", padding: "10px 12px",
                border: active ? "2px solid #3e6b6b" : "1px solid #c9c1b1", borderRadius: 8,
                background: active ? "#e5f0ed" : passed ? "#f1eadb" : "#fffdf8",
                color: "#302d28", cursor: "pointer",
              }}
            >
              <strong>L{layer.no}</strong><span>{layer.name}</span><span>{layer.unit}</span>
            </button>
          );
        })}
      </div>

      <p role="status" style={{ margin: "16px 0 4px", lineHeight: 1.6 }}>
        <strong>L{current.no} {current.name}</strong>: {current.header} 정보를 {verb}. 이 단계에서 보이는 전송 단위는 <strong>{current.unit}</strong>다.
      </p>
      <figcaption style={{ fontSize: 13, color: "#6b6357" }}>
        방향을 바꾸고 각 계층을 눌러 보세요. 실제 구현에서는 L5~L7이 한 애플리케이션 안에 합쳐지는 경우가 많습니다.
      </figcaption>
    </figure>
  );
}
