import { useState } from "react";

// 패킷이 Host A → R1 → R2 → Host B로 가는 동안
// IP(종단까지 고정)와 MAC·TTL(홉마다 변함)이 어떻게 달라지는지 한 구간씩 본다.

// 시각 값은 토큰에서 뽑는다 — fallback 은 tokens.css 값과 정확히 같아야 한다 (KAN-072).
const INK = "var(--ink, #20264A)";
const INK_SOFT = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const PANEL = "var(--surface-hi, #fffdf8)";
const TEAL = "var(--cat-skills, #3e6b6b)";
// 본문 강조 잉크. 유저 판정으로 --ink-accent 를 세웠다(2026-08-27, DESIGN_CONCEPT §4).
// 역할은 일관된데 이름이 없던 자리라 --stroke-bold·--text-small 과 같은 「구멍」이었다.
// 최근접 --pop-ink(Δ31)·--cat-leadership(Δ28)로 밀지 않은 이유는 앞은 서브 CTA 의 진한 단이고
// 뒤는 배지 전용이라서다 — 최근접이 곧 정답이 아니다(§5 역할 우선). 값이 같아 화면 변화 0.
const ACCENT_INK = "var(--ink-accent, #9a5b2c)";
// 평문/비캐시 상태 테두리. **상수에는 리터럴이 아니라 토큰 참조를 담는다** —
// 리터럴을 const 로 올리면 게이트 시야를 벗어나던 자리이고, KAN-077 이 그것을 막았다
// (`scripts/lib/tokens/recognize/constRef.ts`). --field-dst(2화 목적지 MAC 칸)와 값은 같지만 뜻이 달라 이름을 따로 세웠다.
const SAND = "var(--state-plain, #e8c97a)";
/** L3 헤더 패널 배경 — 같은 요소의 테두리가 TEAL(--cat-skills)이라 그 옅은 단으로 푼다.
    토큰을 안 늘리고 관계만 드러낸다(KAN-072 배치7 · 배치6 의 CriCallTrace 와 같은 논리).
    #eef5f3 대비 ΔRGB 5.9(8비트로 반올림해 잰 값) · 6.5(브라우저가 실제로 그리는 float
    계산값 rgb(243.42, 244.24, 239.54) 기준). 이 work 에서 유일하게 화면이 움직이는 자리다. */
const TEAL_TINT = "color-mix(in srgb, var(--cat-skills) 6%, var(--surface-hi))";

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
        padding: "var(--space-16)",
        border: `var(--stroke-hair) solid ${BORDER}`,
        borderRadius: "var(--radius-md)",
        background: PANEL,
      }}
    >
      <p style={{ margin: "0 0 var(--space-14)", fontWeight: "var(--font-weight-bold)", color: INK }}>
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
          marginBottom: "var(--space-16)",
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
                  borderRadius: isRouter ? "var(--radius-sm)" : "var(--radius-lg)",
                  border: active ? `var(--stroke-bold) solid ${TEAL}` : `var(--stroke-hair) solid ${BORDER}`,
                  background: active ? "color-mix(in srgb, var(--cat-skills) 11%, var(--surface-hi))" : PANEL,
                  fontWeight: "var(--font-weight-bold)",
                  color: INK,
                  fontSize: "var(--text-meta)",
                }}
              >
                {n}
              </span>
              {i < NODES.length - 1 && (
                <span
                  style={{
                    width: 46,
                    textAlign: "center",
                    color: i === step ? TEAL : BORDER,
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  {i === step ? "▶▶" : "──"}
                </span>
              )}
            </span>
          );
        })}
      </div>

      <p style={{ textAlign: "center", margin: "0 0 var(--space-14)", fontSize: "var(--text-meta)", color: INK_SOFT }}>
        구간 {step + 1}/3 · <strong style={{ color: INK }}>{seg.label}</strong> ({seg.link})
      </p>

      {/* 헤더 패널 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-12)" }}>
        <div
          style={{
            border: `var(--stroke-hair) solid ${TEAL}`,
            borderRadius: "var(--radius-sm)",
            background: TEAL_TINT,
            padding: "var(--space-12)",
          }}
        >
          <p style={{ margin: "0 0 var(--space-8)", fontWeight: "var(--font-weight-bold)", color: TEAL }}>
            L3 IP 헤더 <span style={{ fontWeight: "var(--font-weight-regular)", fontSize: "var(--text-label)" }}>(종단까지 고정)</span>
          </p>
          <p style={{ margin: "0 0 var(--space-4)", fontFamily: "var(--font-code)", fontSize: "var(--text-meta)" }}>
            src: {SRC_IP}
          </p>
          <p style={{ margin: "0 0 var(--space-8)", fontFamily: "var(--font-code)", fontSize: "var(--text-meta)" }}>
            dst: {DST_IP}
          </p>
          <p style={{ margin: 0, fontSize: "var(--text-meta)" }}>
            TTL:{" "}
            <strong style={{ color: ACCENT_INK, fontFamily: "var(--font-code)", fontSize: "var(--text-small)" }}>
              {seg.ttl}
            </strong>{" "}
            <span style={{ color: INK_SOFT, fontSize: "var(--text-label)" }}>(홉마다 −1)</span>
          </p>
        </div>

        <div
          style={{
            border: `var(--stroke-hair) solid ${SAND}`,
            borderRadius: "var(--radius-sm)",
            background: "var(--surface, #F8F3E8)",
            padding: "var(--space-12)",
          }}
        >
          <p style={{ margin: "0 0 var(--space-8)", fontWeight: "var(--font-weight-bold)", color: ACCENT_INK }}>
            L2 Ethernet 헤더 <span style={{ fontWeight: "var(--font-weight-regular)", fontSize: "var(--text-label)" }}>(구간마다 새로)</span>
          </p>
          <p style={{ margin: "0 0 var(--space-4)", fontFamily: "var(--font-code)", fontSize: "var(--text-meta)" }}>
            src MAC: {seg.srcMac}
          </p>
          <p style={{ margin: 0, fontFamily: "var(--font-code)", fontSize: "var(--text-meta)" }}>
            dst MAC: {seg.dstMac}
          </p>
        </div>
      </div>

      <p
        role="status"
        style={{
          margin: "var(--space-12) 0 0",
          padding: "var(--space-10)",
          background: PANEL,
          border: `var(--stroke-hair) solid ${BORDER}`,
          borderRadius: "var(--radius-sm)",
          lineHeight: "var(--font-leading-ui)",
          fontSize: "var(--text-meta)",
          color: INK,
        }}
      >
        {seg.note}
      </p>

      <div style={{ display: "flex", gap: "var(--space-8)", marginTop: "var(--space-14)" }}>
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            padding: "var(--space-8) var(--space-14)",
            border: `var(--stroke-hair) solid ${BORDER}`,
            borderRadius: "var(--radius-sm)",
            background: PANEL,
            color: step === 0 ? "var(--state-inactive, #b8b0a0)" : INK,
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
            padding: "var(--space-8) var(--space-14)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            background: step === SEGMENTS.length - 1 ? BORDER : TEAL,
            color: PANEL,
            fontWeight: "var(--font-weight-bold)",
            cursor: step === SEGMENTS.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          다음 구간 ▶
        </button>
      </div>

      <figcaption style={{ fontSize: "var(--text-meta)", color: INK_SOFT, marginTop: "var(--space-12)" }}>
        세 구간 내내 <code>src/dst IP</code>는 한 글자도 변하지 않습니다(NAT가 없다면). 반면 MAC은
        구간마다 통째로 바뀌고 TTL은 라우터를 지날 때마다 줄어듭니다 — TTL이 0이 되면 패킷은 폐기되고
        라우터가 ICMP Time Exceeded를 돌려보내는데, 이게 바로 <code>traceroute</code>의 원리입니다.
      </figcaption>
    </figure>
  );
}
