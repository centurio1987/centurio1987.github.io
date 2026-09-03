import { useMemo, useState } from "react";

// 시각 값은 토큰에서 뽑는다 — fallback 은 tokens.css 값과 정확히 같아야 한다 (KAN-072).
const INK = "var(--ink, #20264A)";
const INK_SOFT = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const PANEL = "var(--surface-hi, #fffdf8)";
const CREAM = "var(--cream, #EDE6D8)";
const TEAL = "var(--cat-skills, #3e6b6b)";

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
  const verb = direction === "send" ? "붙입니다" : "해석하고 벗깁니다";

  function changeDirection(next: "send" | "receive") {
    setDirection(next);
    setStep(0);
  }

  return (
    <figure style={{ margin: "2rem 0", padding: "var(--space-16)", border: `var(--stroke-hair) solid ${BORDER}`, borderRadius: "var(--radius-md)", background: PANEL }}>
      <div style={{ display: "flex", gap: "var(--space-8)", flexWrap: "wrap", marginBottom: "var(--space-16)" }}>
        <button type="button" onClick={() => changeDirection("send")} aria-pressed={direction === "send"}>송신: 캡슐화</button>
        <button type="button" onClick={() => changeDirection("receive")} aria-pressed={direction === "receive"}>수신: 역캡슐화</button>
      </div>

      <div style={{ display: "grid", gap: "var(--space-6)" }}>
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
                gap: "var(--space-8)", alignItems: "center", textAlign: "left", padding: "var(--space-10) var(--space-12)",
                border: active ? `var(--stroke-bold) solid ${TEAL}` : `var(--stroke-hair) solid ${BORDER}`, borderRadius: "var(--radius-sm)",
                background: active ? "color-mix(in srgb, var(--cat-skills) 11%, var(--surface-hi))" : passed ? CREAM : PANEL,
                color: INK, cursor: "pointer",
              }}
            >
              <strong>L{layer.no}</strong><span>{layer.name}</span><span>{layer.unit}</span>
            </button>
          );
        })}
      </div>

      <p role="status" style={{ margin: "var(--space-16) 0 var(--space-4)", lineHeight: "var(--font-leading-ui)" }}>
        <strong>L{current.no} {current.name}</strong>: {current.header} 정보를 {verb}. 이 단계에서 보이는 전송 단위는 <strong>{current.unit}</strong>입니다.
      </p>
      <figcaption style={{ fontSize: "var(--text-meta)", color: INK_SOFT }}>
        방향을 바꾸고 각 계층을 눌러 보세요. 실제 구현에서는 L5~L7이 한 애플리케이션 안에 합쳐지는 경우가 많습니다.
      </figcaption>
    </figure>
  );
}
