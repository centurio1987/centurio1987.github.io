import { useState } from "react";

/**
 * OpenVPN opcode/key-id 1바이트 분해기.
 * openvpn.github.io/openvpn-rfc §4·§6.1 그대로: 상위 5비트 = opcode(메시지 종류),
 * 하위 3비트 = key-id(0~7, rekey마다 회전). 사용자가 두 값을 고르면 한 바이트로 합쳐
 * 그 결과가 캡처에서 본 값과 어떻게 맞아떨어지는지 보여 준다.
 */

// 시각 값은 토큰을 쓴다 (KAN-072-CPJCT1). fallback 은 tokens.css 값과 정확히 같다.
const INK = "var(--ink, #20264A)";
const PAPER = "var(--paper, #F3EEE4)";
const PANEL = "var(--surface-hi, #fffdf8)";
const CORE = "var(--cat-architecture, #4E6CA8)";
const ACCENT = "var(--pop, #D8A33F)";
const OK = "var(--cat-planning, #3E6B4F)";
const MUTED = "var(--ink-2, #4a4f6a)";
const HAIR = "var(--stroke-hair, 1px)";

/** 알파 접미 hex(`${INK}33`)는 var() 와 이어붙일 수 없다 — 같은 비율을 color-mix 로 푼다. */
const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

type Op = { value: number; name: string; channel: "control" | "data" };

// §6.1 opcode 상수 중 Current 상태인 것들 + 대표 레거시(P_DATA_V1).
const OPCODES: Op[] = [
  { value: 3, name: "P_CONTROL_SOFT_RESET_V1", channel: "control" },
  { value: 4, name: "P_CONTROL_V1", channel: "control" },
  { value: 5, name: "P_ACK_V1", channel: "control" },
  { value: 6, name: "P_DATA_V1", channel: "data" },
  { value: 7, name: "P_CONTROL_HARD_RESET_CLIENT_V2", channel: "control" },
  { value: 8, name: "P_CONTROL_HARD_RESET_SERVER_V2", channel: "control" },
  { value: 9, name: "P_DATA_V2", channel: "data" },
  { value: 10, name: "P_CONTROL_HARD_RESET_CLIENT_V3", channel: "control" },
  { value: 11, name: "P_CONTROL_WKC_V1", channel: "control" },
];

// 이 편 캡처(openvpn-opcode.txt / openvpn-tls-auth.txt)에 실제로 등장한 바이트.
const IN_CAPTURE: Record<number, string> = {
  0x38: "Frame 3 — 클라이언트 하드리셋",
  0x40: "Frame 4 — 서버 하드리셋",
  0x48: "Frame 1 — 데이터 패킷",
  0x20: "Frame 5 — TLS를 나르는 제어 패킷",
  0x28: "Frame 8 — 확인응답(ACK)",
};

export default function OpcodeByte() {
  const [opcode, setOpcode] = useState(7); // 기본값 = 캡처의 0x38
  const [keyId, setKeyId] = useState(0);

  const op = OPCODES.find((o) => o.value === opcode) ?? OPCODES[0];
  const byte = ((opcode << 3) | keyId) & 0xff;
  const hex = "0x" + byte.toString(16).padStart(2, "0").toUpperCase();
  const bits = byte.toString(2).padStart(8, "0").split("");
  const isData = op.channel === "data";
  const channelColor = isData ? OK : CORE;
  const captureNote = IN_CAPTURE[byte];

  const cell = (b: string, group: "op" | "key") => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 42,
        fontFamily: "monospace",
        fontSize: "var(--text-h3)",
        fontWeight: 700,
        color: PANEL,
        background: group === "op" ? CORE : ACCENT,
        borderRadius: "var(--radius-xs)",
      }}
    >
      {b}
    </span>
  );

  const label: React.CSSProperties = { fontSize: "var(--text-meta)", color: INK, fontWeight: 600 };

  return (
    <figure
      style={{
        margin: "1.75rem 0",
        padding: "var(--space-16)",
        background: PAPER,
        border: `${HAIR} solid ${tint(INK, 13.3)}`,
        borderRadius: "var(--radius-sm)",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-16)", alignItems: "center", marginBottom: "var(--space-16)" }}>
        <label style={label}>
          opcode (상위 5비트){" "}
          <select
            value={opcode}
            onChange={(e) => setOpcode(Number(e.target.value))}
            style={{ fontSize: "var(--text-meta)", padding: "var(--space-4) var(--space-6)", borderRadius: "var(--radius-sm)", border: `${HAIR} solid ${tint(INK, 20)}`, maxWidth: 280 }}
          >
            {OPCODES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value} · {o.name}
              </option>
            ))}
          </select>
        </label>
        <label style={label}>
          key-id (하위 3비트): <strong style={{ color: ACCENT }}>{keyId}</strong>
          <input
            type="range"
            min={0}
            max={7}
            value={keyId}
            onChange={(e) => setKeyId(Number(e.target.value))}
            style={{ display: "block", width: 160, marginTop: "var(--space-6)" }}
            aria-label="key-id"
          />
        </label>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-16)", alignItems: "flex-end", marginBottom: "var(--space-12)" }}>
        <div>
          <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
            {bits.slice(0, 5).map((b, i) => (
              <span key={`op-${i}`}>{cell(b, "op")}</span>
            ))}
            {bits.slice(5).map((b, i) => (
              <span key={`key-${i}`}>{cell(b, "key")}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "var(--space-4)", fontSize: "var(--text-micro)", color: MUTED }}>
            <span style={{ width: 34 * 5 + 16, color: CORE, fontWeight: 600 }}>opcode = {opcode}</span>
            <span style={{ width: 34 * 3 + 8, color: ACCENT, fontWeight: 600 }}>key-id = {keyId}</span>
          </div>
        </div>
        <div style={{ fontFamily: "monospace", fontSize: "var(--text-h2)", fontWeight: 700, color: INK }}>{hex}</div>
      </div>

      <div style={{ fontSize: "var(--text-meta)", color: INK, lineHeight: 1.9 }}>
        <span style={{ marginRight: "var(--space-14)" }}>
          메시지:{" "}
          <strong style={{ fontFamily: "monospace", color: channelColor }}>{op.name}</strong>
        </span>
        <span
          style={{
            padding: "var(--space-2) var(--space-8)",
            borderRadius: "var(--btn-radius)",
            fontSize: "var(--text-label)",
            fontWeight: 700,
            color: PANEL,
            background: channelColor,
          }}
        >
          {isData ? "데이터 채널" : "제어 채널"}
        </span>
      </div>

      {captureNote && (
        <p
          style={{
            marginTop: "var(--space-10)",
            marginBottom: 0,
            padding: "var(--space-8) var(--space-10)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--text-meta)",
            lineHeight: 1.7,
            color: OK,
            background: tint(OK, 7.1),
            border: `${HAIR} solid ${tint(OK, 26.7)}`,
          }}
        >
          이 바이트({hex})는 이 편 캡처에 실제로 등장합니다 — {captureNote}. 스펙의 비트 쪼개기가 회선에서 그대로 나옵니다.
        </p>
      )}

      <figcaption style={{ fontSize: "var(--text-meta)", color: MUTED, marginTop: "var(--space-12)", lineHeight: 1.75 }}>
        파란 다섯 칸 = opcode(메시지 종류), 금색 세 칸 = key-id(어느 키로 풀지). 둘을 이어 붙이면 패킷 맨 앞 1바이트가 됩니다. 이
        바이트는 수신자가 처리 방법을 정하려고 <strong>복호 전에</strong> 읽어야 하는 라우팅 정보라, tls-crypt로 제어 채널을
        암호화해도 <strong>평문으로 남습니다</strong>.
      </figcaption>
    </figure>
  );
}
