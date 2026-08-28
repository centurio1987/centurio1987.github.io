import { useState } from "react";

/**
 * IKE 헤더 28바이트 해부기.
 * RFC 7296 §3.1의 고정 헤더를 그대로 모사한다. Exchange Type과 Flags를 바꾸면
 * 오프셋 18·19 바이트가 실시간으로 바뀌는 것을 보여, "필드가 바이트의 몇 번째 자리인가"를
 * 외우게 하는 대신 손으로 만지게 한다. SPI 두 개는 실제 캡처값(합성)을 기본으로 둔다.
 */

// 시각 값은 토큰을 쓴다 (KAN-072-CPJCT1). fallback 은 tokens.css 값과 정확히 같다.
const INK = "var(--ink, #20264A)";
const PAPER = "var(--paper, #F3EEE4)";
const PANEL = "var(--surface-hi, #fffdf8)";
const CORE = "var(--cat-architecture, #4E6CA8)";
const ACCENT = "var(--pop, #D8A33F)";
const MUTED = "var(--ink-2, #4a4f6a)";
const OK = "var(--cat-planning, #3E6B4F)";
const HAIR = "var(--stroke-hair, 1px)";

/** 알파 접미 hex(`${INK}33`)는 var() 와 이어붙일 수 없다 — 같은 비율을 color-mix 로 푼다. */
const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

const EXCHANGES: { id: number; name: string }[] = [
  { id: 34, name: "IKE_SA_INIT" },
  { id: 35, name: "IKE_AUTH" },
  { id: 36, name: "CREATE_CHILD_SA" },
  { id: 37, name: "INFORMATIONAL" },
];

const hex1 = (n: number) => n.toString(16).padStart(2, "0");

type Row = {
  offset: string;
  field: string;
  bytes: string;
  note?: string;
  live?: boolean;
};

export default function IkeHeaderDissector() {
  // 기본값 = 캡처의 프레임 1(IKE_SA_INIT 요청). SPI는 랩 합성값.
  const [exchange, setExchange] = useState(34);
  const [initiator, setInitiator] = useState(true); // I 비트 0x08
  const [response, setResponse] = useState(false); // R 비트 0x20
  const higherVersion = false; // V 비트 0x10 — IKEv2 구현은 0으로 둔다

  const flags =
    (initiator ? 0x08 : 0) | (higherVersion ? 0x10 : 0) | (response ? 0x20 : 0);

  const role = initiator ? "Initiator(개시자)" : "Responder(응답자)";
  const dir = response ? "Response(응답)" : "Request(요청)";

  const rows: Row[] = [
    { offset: "0–7", field: "Initiator SPI", bytes: "9f 85 f7 74 5c 53 f7 3e", note: "개시자가 고른 8바이트" },
    {
      offset: "8–15",
      field: "Responder SPI",
      bytes: initiator && !response ? "00 00 00 00 00 00 00 00" : "47 4b 30 74 cf d0 5b 67",
      note: initiator && !response ? "첫 요청엔 아직 0 (응답자 SA가 없다)" : "응답자가 채운 8바이트",
    },
    { offset: "16", field: "Next Payload", bytes: "21", note: "0x21 = 33 = Security Association" },
    { offset: "17", field: "Version", bytes: "20", note: "MjVer 2 · MnVer 0 → IKEv2" },
    { offset: "18", field: "Exchange Type", bytes: hex1(exchange), note: `${exchange} = ${EXCHANGES.find((e) => e.id === exchange)?.name}`, live: true },
    { offset: "19", field: "Flags", bytes: hex1(flags), note: `${role} · ${dir}`, live: true },
    { offset: "20–23", field: "Message ID", bytes: "00 00 00 00", note: "IKE_SA_INIT는 0, IKE_AUTH는 1…" },
    { offset: "24–27", field: "Length", bytes: "00 00 01 28", note: "메시지 전체 길이 (여기선 296)" },
  ];

  const chip: React.CSSProperties = {
    fontSize: "var(--text-meta)",
    padding: "var(--space-4) var(--space-8)",
    borderRadius: "var(--radius-sm)",
    border: `${HAIR} solid ${tint(INK, 20)}`,
    background: PANEL,
    color: INK,
    cursor: "pointer",
  };

  return (
    <figure style={{ margin: "1.75rem 0", padding: "var(--space-16)", background: PAPER, border: `${HAIR} solid ${tint(INK, 13.3)}`, borderRadius: "var(--radius-sm)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-12)", alignItems: "center", marginBottom: "var(--space-14)" }}>
        <label style={{ fontSize: "var(--text-meta)", color: INK, fontWeight: 600 }}>
          Exchange Type{" "}
          <select
            value={exchange}
            onChange={(e) => setExchange(Number(e.target.value))}
            style={{ fontSize: "var(--text-meta)", padding: "var(--space-4) var(--space-6)", borderRadius: "var(--radius-sm)", border: `${HAIR} solid ${tint(INK, 20)}` }}
          >
            {EXCHANGES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.id} · {e.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          style={{ ...chip, background: initiator ? CORE : PANEL, color: initiator ? PANEL : INK, borderColor: initiator ? CORE : tint(INK, 20) }}
          onClick={() => setInitiator((v) => !v)}
        >
          I · Initiator (0x08) {initiator ? "켜짐" : "꺼짐"}
        </button>
        <button
          type="button"
          style={{ ...chip, background: response ? CORE : PANEL, color: response ? PANEL : INK, borderColor: response ? CORE : tint(INK, 20) }}
          onClick={() => setResponse((v) => !v)}
        >
          R · Response (0x20) {response ? "켜짐" : "꺼짐"}
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "var(--text-meta)", background: PANEL }}>
          <thead>
            <tr style={{ color: MUTED, textAlign: "left" }}>
              <th style={{ padding: "var(--space-6) var(--space-8)", borderBottom: `${HAIR} solid ${tint(INK, 13.3)}`, whiteSpace: "nowrap" }}>오프셋</th>
              <th style={{ padding: "var(--space-6) var(--space-8)", borderBottom: `${HAIR} solid ${tint(INK, 13.3)}` }}>필드</th>
              <th style={{ padding: "var(--space-6) var(--space-8)", borderBottom: `${HAIR} solid ${tint(INK, 13.3)}` }}>바이트</th>
              <th style={{ padding: "var(--space-6) var(--space-8)", borderBottom: `${HAIR} solid ${tint(INK, 13.3)}` }}>뜻</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.offset} style={{ background: r.live ? tint(ACCENT, 9.4) : "transparent" }}>
                <td style={{ padding: "var(--space-6) var(--space-8)", color: MUTED, fontFamily: "monospace", whiteSpace: "nowrap", verticalAlign: "top" }}>{r.offset}</td>
                <td style={{ padding: "var(--space-6) var(--space-8)", color: INK, fontWeight: r.live ? 700 : 500, verticalAlign: "top" }}>{r.field}</td>
                <td style={{ padding: "var(--space-6) var(--space-8)", fontFamily: "monospace", color: r.live ? ACCENT : INK, fontWeight: r.live ? 700 : 400, whiteSpace: "nowrap", verticalAlign: "top" }}>{r.bytes}</td>
                <td style={{ padding: "var(--space-6) var(--space-8)", color: MUTED, verticalAlign: "top" }}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "var(--space-12)", marginBottom: 0, padding: "var(--space-8) var(--space-10)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-meta)", lineHeight: 1.7, color: OK, background: tint(OK, 7.1), border: `${HAIR} solid ${tint(OK, 26.7)}` }}>
        지금 Flags 바이트 = <strong style={{ fontFamily: "monospace" }}>0x{hex1(flags)}</strong> ({role} · {dir}).
        캡처의 프레임 1은 <strong style={{ fontFamily: "monospace" }}>0x08</strong>(개시자·요청), 프레임 2는 <strong style={{ fontFamily: "monospace" }}>0x20</strong>(응답자·응답)이었습니다.
      </p>

      <figcaption style={{ fontSize: "var(--text-meta)", color: MUTED, marginTop: "var(--space-12)", lineHeight: 1.75 }}>
        금색 두 줄(오프셋 18·19)만 위 버튼으로 바뀝니다. 나머지 26바이트는 협상 내내 자리가 고정입니다.
        SPI·Length는 실제 캡처값(합성)을 그대로 뒀습니다 — 값 자체는 매 실행 달라지지만 <strong>자리</strong>는 바뀌지 않습니다.
      </figcaption>
    </figure>
  );
}
