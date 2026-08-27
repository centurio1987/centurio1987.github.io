import { useState } from "react";

// split tunnel · kill switch · DNS 유출 체험.
// 조작: 터널 상태(정상/끊김) · 구성(전체/split) · kill switch(on/off) · DNS 리졸버(터널 안/밖).
// 관찰: 세 종류 트래픽(사내·인터넷·DNS 질의)이 각각 어디로 가는지.
// 교육 목표: ① DNS가 새는 조합은 "터널 정상 + split + 리졸버 밖"이다.
//            ② kill switch가 일하는 순간은 "터널 끊김"이다 — 끄면 전부 새고 켜면 전부 막힌다.

type Fate = "tunnel" | "direct" | "leak" | "blocked";

// 시각 값은 토큰을 쓴다 (KAN-072-CPJCT1). fallback 은 tokens.css 값과 정확히 같다.
const MUTED = "var(--ink-2, #4a4f6a)";
const MUTED_3 = "var(--ink-3, #6f7390)";
const BORDER = "var(--border, #d8d0be)";
const SUBTLE = "var(--subtle, #e8e2d6)";
const CANVAS = "var(--canvas, #d8d4ca)";
const PANEL = "var(--surface-hi, #fffdf8)";
const HAIR = "var(--stroke-hair, 1px)";

/** 알파 접미 색은 var() 와 이어붙일 수 없다 — 같은 비율을 color-mix 로 푼다. */
const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

// 상태 팔레트는 (bg, fg, border) 셋이 한 짝이라 통째로 옮기거나 통째로 두거나다 — 네 bg 중
// 셋이 --cream/--paper 로 눌려 초록·금색·붉음 구분이 사라지므로 KAN-072-CPJCT1 배치5 에서 멈췄다.
const FATE_META: Record<Fate, { label: string; bg: string; fg: string; border: string }> = {
  tunnel: { label: "터널로 보호", bg: "#e7efe6", fg: "#2f5d3a", border: "#8bb897" },
  direct: { label: "평문 직결(예상됨)", bg: "#f6ecd8", fg: "#7a5a1e", border: "#d9b871" },
  leak: { label: "유출 — 노출됨", bg: "#f4dcd4", fg: "#8a3320", border: "#d99b86" },
  blocked: { label: "차단됨(침묵)", bg: "#eae6df", fg: "#5f5a51", border: "#b8b0a0" },
};

const CLASSES: { id: "corp" | "internet" | "dns"; name: string; note: string }[] = [
  { id: "corp", name: "사내 트래픽", note: "10.0.0.0/8 등 내부 대역" },
  { id: "internet", name: "인터넷 트래픽", note: "일반 웹·스트리밍" },
  { id: "dns", name: "DNS 질의", note: "이름 해석 — 방문 도메인" },
];

export default function SplitTunnelLab() {
  const [tunnelUp, setTunnelUp] = useState(true);
  const [split, setSplit] = useState(true);
  const [killSwitch, setKillSwitch] = useState(true);
  const [resolverInside, setResolverInside] = useState(false);

  function fate(cls: "corp" | "internet" | "dns"): Fate {
    if (!tunnelUp) return killSwitch ? "blocked" : "leak";
    if (!split) return "tunnel"; // 전체 터널 — 전부 터널을 탄다
    // split 구성
    if (cls === "corp") return "tunnel";
    if (cls === "internet") return "direct";
    return resolverInside ? "tunnel" : "leak"; // DNS
  }

  const dnsLeaking = tunnelUp && split && !resolverInside;
  const dropLeaking = !tunnelUp && !killSwitch;

  const summary = !tunnelUp
    ? killSwitch
      ? "터널이 끊겼고 kill switch가 켜져 있어 모든 트래픽이 침묵합니다 — 우발적 유출 없음."
      : "터널이 끊겼는데 kill switch가 꺼져 있어 사내 트래픽까지 전부 터널 밖으로 새어 나갑니다."
    : split
      ? dnsLeaking
        ? "정상·split 구성에서 리졸버가 터널 밖이라 DNS 질의(방문 도메인)가 노출됩니다 — 빠른데 새는 정확한 지점."
        : "리졸버를 터널 안으로 돌리자 DNS 유출이 막혔습니다. 인터넷 직결은 의도된 노출입니다."
      : "전체 터널 구성 — 세 종류 모두 터널을 탑니다. 대신 게이트웨이가 병목·복호 지점이 됩니다.";

  const btn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "var(--space-6) var(--space-10)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    borderRadius: 6,
    border: `${HAIR} solid ${active ? "#8a7a56" : BORDER}`,
    background: active ? "#efe3c6" : PANEL,
    color: active ? "#4a3f26" : "#7a7264",
  });

  const control = (
    label: string,
    a: { text: string; on: boolean; set: () => void },
    b: { text: string; on: boolean; set: () => void },
  ) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: MUTED, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="button" aria-pressed={a.on} onClick={a.set} style={btn(a.on)}>{a.text}</button>
        <button type="button" aria-pressed={b.on} onClick={b.set} style={btn(b.on)}>{b.text}</button>
      </div>
    </div>
  );

  return (
    <figure style={{ margin: "1.5rem 0", border: `${HAIR} solid ${SUBTLE}`, borderRadius: 10, padding: 16, background: PANEL }}>
      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "minmax(0,1fr)" }}>
        <div>
          {control(
            "터널 상태",
            { text: "정상", on: tunnelUp, set: () => setTunnelUp(true) },
            { text: "끊김", on: !tunnelUp, set: () => setTunnelUp(false) },
          )}
          {control(
            "구성",
            { text: "전체 터널", on: !split, set: () => setSplit(false) },
            { text: "split tunnel", on: split, set: () => setSplit(true) },
          )}
          {control(
            "kill switch",
            { text: "켜짐", on: killSwitch, set: () => setKillSwitch(true) },
            { text: "꺼짐", on: !killSwitch, set: () => setKillSwitch(false) },
          )}
          {control(
            "DNS 리졸버 위치",
            { text: "터널 안", on: resolverInside, set: () => setResolverInside(true) },
            { text: "터널 밖", on: !resolverInside, set: () => setResolverInside(false) },
          )}
        </div>

        <div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 6, fontWeight: 600 }}>
            트래픽이 흐르는 곳
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CLASSES.map((c) => {
              const f = fate(c.id);
              const meta = FATE_META[f];
              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "var(--space-8) var(--space-12)",
                    borderRadius: 7,
                    background: meta.bg,
                    border: `${HAIR} solid ${meta.border}`,
                  }}
                >
                  <span style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: meta.fg }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: MUTED_3 }}>{c.note}</span>
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: meta.fg,
                      whiteSpace: "nowrap",
                      padding: "var(--space-2) var(--space-8)",
                      borderRadius: 999,
                      border: `${HAIR} solid ${meta.border}`,
                      background: tint(PANEL, 50),
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <figcaption
        style={{
          marginTop: 14,
          fontSize: 13,
          lineHeight: 1.6,
          color: dnsLeaking || dropLeaking ? "#8a3320" : "#5f5a51",
          borderTop: `${HAIR} dashed ${CANVAS}`,
          paddingTop: 10,
        }}
      >
        {summary}
      </figcaption>
    </figure>
  );
}
