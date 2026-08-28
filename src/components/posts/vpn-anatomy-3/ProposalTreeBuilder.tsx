import { useState } from "react";

/**
 * SA / Proposal / Transform 트리 빌더.
 * RFC 7296 §3.3의 길이 산술을 인터랙티브로 만든다. 변환을 넣고 빼면
 * Proposal Length와 SA Payload Length가 덧셈으로 맞아떨어지는 것을 눈으로 보게 한다.
 * 기본값 = 캡처의 프레임 1 제안(ENCR·PRF·D-H 셋, 12+8+8=28 → +8 → 36 → +4 → 40).
 */

// 시각 값은 토큰을 쓴다 (KAN-072-CPJCT1). fallback 은 tokens.css 값과 정확히 같다.
const INK = "var(--ink, #20264A)";
const PAPER = "var(--paper, #F3EEE4)";
const PANEL = "var(--surface-hi, #fffdf8)";
const CORE = "var(--cat-architecture, #4E6CA8)";
const ACCENT = "var(--pop, #D8A33F)";
const MUTED = "var(--ink-2, #4a4f6a)";
const OK = "var(--cat-planning, #3E6B4F)";
const DANGER = "var(--cat-strategy, #A84B4B)";
const HAIR = "var(--stroke-hair, 1px)";

/** 알파 접미 hex(`${INK}33`)는 var() 와 이어붙일 수 없다 — 같은 비율을 color-mix 로 푼다. */
const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

type Tf = {
  key: string;
  type: string;
  id: string;
  len: number; // Transform 고정 8 + 속성. Key Length 속성이 붙는 ENCR만 12.
  fixed?: boolean; // AEAD 구성에서 사실상 항상 켜는 변환
  note: string;
};

const TRANSFORMS: Tf[] = [
  { key: "encr", type: "ENCR (1)", id: "AES-GCM 16 ICV (20)", len: 12, fixed: true, note: "암호화 — Key Length 256 속성 4바이트가 붙어 12" },
  { key: "prf", type: "PRF (2)", id: "PRF_HMAC_SHA2_384 (6)", len: 8, fixed: true, note: "키 유도용 의사난수 함수" },
  { key: "dh", type: "D-H (4)", id: "384-bit random ECP (20)", len: 8, fixed: true, note: "키 교환 그룹 (2편의 그 DH)" },
  { key: "integ", type: "INTEG (3)", id: "HMAC_SHA2_256_128 (12)", len: 8, fixed: false, note: "무결성 — AEAD를 고르면 필요 없다" },
  { key: "esn", type: "ESN (5)", id: "No ESN (0)", len: 8, fixed: false, note: "확장 시퀀스 번호 여부" },
];

export default function ProposalTreeBuilder() {
  const [on, setOn] = useState<Record<string, boolean>>({
    encr: true,
    prf: true,
    dh: true,
    integ: false,
    esn: false,
  });

  const selected = TRANSFORMS.filter((t) => on[t.key]);
  const transformsBytes = selected.reduce((s, t) => s + t.len, 0);
  const proposalLen = transformsBytes + 8; // Proposal 고정부 8옥텟
  const saPayloadLen = proposalLen + 4; // Generic Payload Header 4옥텟
  const count = selected.length;

  // 캡처의 프레임 1과 일치하는가?
  const matchesCapture =
    on.encr && on.prf && on.dh && !on.integ && !on.esn;
  const hasAead = on.encr; // 여기 데모에선 ENCR가 곧 AEAD
  const redundantInteg = hasAead && on.integ;

  const btn = (active: boolean, disabled: boolean): React.CSSProperties => ({
    fontSize: "var(--text-meta)",
    padding: "var(--space-6) var(--space-10)",
    borderRadius: "var(--radius-sm)",
    border: `${HAIR} solid ${active ? CORE : tint(INK, 20)}`,
    background: active ? CORE : PANEL,
    color: active ? PANEL : disabled ? MUTED : INK,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
  });

  return (
    <figure style={{ margin: "1.75rem 0", padding: "var(--space-16)", background: PAPER, border: `${HAIR} solid ${tint(INK, 13.3)}`, borderRadius: "var(--radius-sm)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-8)", marginBottom: "var(--space-14)" }}>
        {TRANSFORMS.map((t) => {
          const active = !!on[t.key];
          const disabled = count === 1 && active; // 마지막 하나는 못 끈다(제안이 비면 무의미)
          return (
            <button
              key={t.key}
              type="button"
              style={btn(active, disabled)}
              disabled={disabled}
              onClick={() => setOn((p) => ({ ...p, [t.key]: !p[t.key] }))}
              title={t.note}
            >
              {active ? "− " : "+ "}
              {t.type}
            </button>
          );
        })}
      </div>

      <div style={{ background: PANEL, borderRadius: "var(--radius-sm)", border: `${HAIR} solid ${tint(INK, 9.4)}`, padding: "var(--space-14)", fontFamily: "monospace", fontSize: "var(--text-meta)", lineHeight: 1.7, color: INK, overflowX: "auto" }}>
        <div style={{ color: CORE, fontWeight: 700 }}>
          SA payload · length {saPayloadLen}
        </div>
        <div style={{ paddingLeft: "var(--space-16)" }}>
          └ Proposal #1 · length {proposalLen} · Protocol ID: IKE(1) · SPI Size: 0 · transforms {count}
        </div>
        {selected.map((t, i) => (
          <div key={t.key} style={{ paddingLeft: "var(--space-32)" }}>
            {i === selected.length - 1 ? "└" : "├"} Transform · len {t.len} · Type {t.type} · ID {t.id}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "var(--space-12)", fontSize: "var(--text-meta)", color: INK, lineHeight: 1.9 }}>
        <div>
          변환 길이 합계:{" "}
          <strong style={{ fontFamily: "monospace" }}>
            {selected.map((t) => t.len).join(" + ")} = {transformsBytes}
          </strong>
        </div>
        <div>
          + Proposal 고정부 8:{" "}
          <strong style={{ fontFamily: "monospace", color: ACCENT }}>
            {transformsBytes} + 8 = {proposalLen}
          </strong>{" "}
          = Proposal Length
        </div>
        <div>
          + Generic Payload Header 4:{" "}
          <strong style={{ fontFamily: "monospace", color: ACCENT }}>
            {proposalLen} + 4 = {saPayloadLen}
          </strong>{" "}
          = SA Payload Length
        </div>
      </div>

      <p style={{ marginTop: "var(--space-12)", marginBottom: 0, padding: "var(--space-8) var(--space-10)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-meta)", lineHeight: 1.7, color: redundantInteg ? DANGER : OK, background: tint(redundantInteg ? DANGER : OK, 7.1), border: `${HAIR} solid ${tint(redundantInteg ? DANGER : OK, 26.7)}` }}>
        {redundantInteg
          ? "AES-GCM은 이미 암호화와 무결성을 한 몸으로 처리하는 AEAD입니다. INTEG 변환을 따로 넣으면 대개 거부되거나 무시됩니다 — 캡처에서 INTEG 칸이 비어 있던 이유입니다."
          : matchesCapture
            ? "지금 트리가 캡처의 프레임 1 제안과 정확히 같습니다: 12 + 8 + 8 = 28 → +8 → 36 → +4 → 40. INTEG 칸이 비어 있는 것이 정상입니다(AEAD)."
            : "변환을 켜고 끌 때마다 아래 두 길이가 정확히 그만큼 움직입니다. 길이는 외우는 값이 아니라 더해지는 값입니다."}
      </p>

      <figcaption style={{ fontSize: "var(--text-meta)", color: MUTED, marginTop: "var(--space-12)", lineHeight: 1.75 }}>
        Transform은 고정부 8옥텟이지만, ENCR은 Key Length 속성(4옥텟)이 붙어 12가 됩니다. Proposal 고정부 8옥텟과
        Generic Payload Header 4옥텟이 그 위에 얹혀, 캡처의 <strong>40</strong>이라는 SA payload length가 덧셈 한 줄로 설명됩니다.
      </figcaption>
    </figure>
  );
}
