import { useState } from "react";

/**
 * ESP tunnel 모드 오버헤드 → 유효 내부 MTU → TCP MSS 계산기.
 * 바이트 수는 RFC 4303(ESP 헤더·트레일러) + RFC 4106(AES-GCM: 8바이트 IV, 16바이트 ICV)
 * + RFC 3602/4868(AES-CBC: 16바이트 IV, HMAC-SHA-256-128: 16바이트 ICV) + RFC 3948(NAT-T UDP 8바이트) 기준.
 */

// 시각 값은 토큰을 쓴다 (KAN-072-CPJCT1). fallback 은 tokens.css 값과 정확히 같다.
const INK = "var(--ink, #20264A)";
const PAPER = "var(--paper, #F3EEE4)";
const PANEL = "var(--surface-hi, #fffdf8)";
const CORE = "var(--cat-architecture, #4E6CA8)";
const ACCENT = "var(--pop, #D8A33F)";
const DANGER = "var(--cat-strategy, #A84B4B)";
const MUTED = "var(--ink-2, #4a4f6a)";
const HAIR = "var(--stroke-hair, 1px)";

/** 알파 접미 hex(`${INK}33`)는 var() 와 이어붙일 수 없다 — 같은 비율을 color-mix 로 푼다. */
const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

type Suite = {
  id: string;
  label: string;
  iv: number;
  icv: number;
  align: number; // 평문(페이로드+패딩+PadLen+NextHeader)이 맞춰야 하는 경계
};

const SUITES: Suite[] = [
  { id: "gcm", label: "AES-256-GCM (aes256gcm16)", iv: 8, icv: 16, align: 4 },
  { id: "cbc", label: "AES-256-CBC + HMAC-SHA-256-128", iv: 16, icv: 16, align: 16 },
];

export default function EspOverheadLab() {
  const [mtu, setMtu] = useState(1500);
  const [suiteId, setSuiteId] = useState("gcm");
  const [natt, setNatt] = useState(false);

  const suite = SUITES.find((s) => s.id === suiteId) ?? SUITES[0];
  const outerIp = 20;
  const udp = natt ? 8 : 0;
  const espHeader = 8; // SPI 4 + Sequence Number 4
  const trailerFixed = 2; // Pad Length 1 + Next Header 1

  const fixed = outerIp + udp + espHeader + suite.iv + trailerFixed + suite.icv;
  const room = mtu - fixed; // 페이로드 + 패딩에 쓸 수 있는 바이트
  // 패딩이 0일 때 페이로드가 최대다 → (payload + 2)가 align의 배수가 되는 가장 큰 값을 찾는다.
  let payload = room;
  while (payload > 0 && (payload + trailerFixed) % suite.align !== 0) payload -= 1;
  const padding = Math.max(0, room - payload);
  const overhead = mtu - payload;
  const mss = Math.max(0, payload - 20 - 20); // 내부 IPv4 20 + TCP 20

  const rows: { label: string; bytes: number; color: string }[] = [
    { label: "새 외부 IP 헤더", bytes: outerIp, color: CORE },
    ...(natt ? [{ label: "UDP 헤더 (NAT-T)", bytes: udp, color: ACCENT }] : []),
    { label: "ESP 헤더 (SPI 4 + Seq 4)", bytes: espHeader, color: CORE },
    { label: `IV (${suite.id === "gcm" ? "GCM nonce의 전송분" : "CBC 블록"})`, bytes: suite.iv, color: CORE },
    { label: "패딩", bytes: padding, color: padding > 0 ? DANGER : MUTED },
    { label: "Pad Length + Next Header", bytes: trailerFixed, color: CORE },
    { label: "ICV (무결성 검사값)", bytes: suite.icv, color: CORE },
  ];

  return (
    <figure style={{ margin: "1.75rem 0", padding: "var(--space-16)", background: PAPER, border: `${HAIR} solid ${tint(INK, 13.3)}`, borderRadius: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-16)", alignItems: "center", marginBottom: "var(--space-14)" }}>
        <label style={{ fontSize: "var(--text-meta)", color: INK, fontWeight: 600 }}>
          바깥 경로 MTU: {mtu}바이트
          <input
            type="range"
            min={1280}
            max={1500}
            step={4}
            value={mtu}
            onChange={(e) => setMtu(Number(e.target.value))}
            style={{ display: "block", width: 240, marginTop: "var(--space-6)" }}
          />
        </label>
        <label style={{ fontSize: "var(--text-meta)", color: INK, fontWeight: 600 }}>
          암호군{" "}
          <select
            value={suiteId}
            onChange={(e) => setSuiteId(e.target.value)}
            style={{ fontSize: "var(--text-meta)", padding: "var(--space-4) var(--space-6)", borderRadius: 6, border: `${HAIR} solid ${tint(INK, 20)}` }}
          >
            {SUITES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: "var(--text-meta)", color: INK, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "var(--space-6)" }}>
          <input type="checkbox" checked={natt} onChange={(e) => setNatt(e.target.checked)} />
          NAT-T (UDP 4500)
        </label>
      </div>

      <div style={{ display: "flex", height: 26, borderRadius: 5, overflow: "hidden", border: `${HAIR} solid ${tint(INK, 20)}`, marginBottom: "var(--space-6)" }}>
        {rows
          .filter((r) => r.bytes > 0)
          .map((r) => (
            <div
              key={r.label}
              title={`${r.label} — ${r.bytes}바이트`}
              style={{ width: `${(r.bytes / mtu) * 100}%`, background: r.color, borderRight: `${HAIR} solid ${tint(PANEL, 33.3)}` }}
            />
          ))}
        <div
          title={`원본 패킷 — ${payload}바이트`}
          style={{ flex: 1, background: PANEL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-micro)", color: MUTED }}
        >
          원본 패킷 {payload}바이트
        </div>
      </div>
      <p style={{ fontSize: "var(--text-label)", color: MUTED, margin: "0 0 var(--space-14)" }}>
        왼쪽 색 띠가 캡슐화 비용, 흰 칸이 실제로 실어 나르는 원본 IP 패킷입니다.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-meta)", marginBottom: "var(--space-12)" }}>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td style={{ padding: "var(--space-2) 0", color: INK }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: r.color,
                    marginRight: "var(--space-8)",
                  }}
                />
                {r.label}
              </td>
              <td style={{ padding: "var(--space-2) 0", textAlign: "right", color: r.bytes > 0 ? INK : MUTED, fontVariantNumeric: "tabular-nums" }}>
                {r.bytes}바이트
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-10)" }}>
        {[
          { k: "캡슐화 오버헤드", v: `${overhead}바이트` },
          { k: "유효 내부 MTU", v: `${payload}바이트` },
          { k: "TCP MSS 상한", v: `${mss}바이트` },
        ].map((c) => (
          <div
            key={c.k}
            style={{ flex: "1 1 150px", padding: "var(--space-8) var(--space-10)", background: PANEL, borderRadius: "var(--radius-sm)", border: `${HAIR} solid ${tint(INK, 13.3)}` }}
          >
            <div style={{ fontSize: "var(--text-label)", color: MUTED }}>{c.k}</div>
            <div style={{ fontSize: "var(--text-body)", fontWeight: 700, color: INK }}>{c.v}</div>
          </div>
        ))}
      </div>

      <figcaption style={{ fontSize: "var(--text-meta)", color: MUTED, marginTop: "var(--space-12)", lineHeight: 1.75 }}>
        NAT-T를 켜 보십시오 — UDP 헤더 8바이트가 붙는 순간 유효 내부 MTU가 내려앉습니다. 거기에 CBC 계열까지 고르면 16바이트
        블록에 맞추느라 붉은 패딩이 튀어나옵니다(AEAD는 4바이트 경계만 맞추면 되니 대개 0입니다). 이 표의 마지막 줄(MSS 상한)이
        뒤에 나올 MSS clamping 값의 근거입니다.
      </figcaption>
    </figure>
  );
}
