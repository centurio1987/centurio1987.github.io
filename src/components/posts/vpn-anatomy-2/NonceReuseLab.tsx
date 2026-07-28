import { useState, type CSSProperties } from "react";

// nonce 재사용 랩 — 같은 키 + 같은 nonce로 두 평문을 암호화하면, 공격자가 키를 모르는
// 채로도 C1 XOR C2 = P1 XOR P2 를 얻어 낸다는 사실을 직접 조작하며 확인한다.
//
// ⚠️ 교육용 모형: 진짜 ChaCha20이 아니라 (키, nonce) 문자열을 해시해 시드로 삼는
//   결정론적 의사난수(mulberry32)로 키스트림을 흉내 낸다. XOR 성질은 키스트림의
//   종류와 무관하게 성립하므로, 이 모형만으로도 nonce 재사용의 위험은 그대로 체감된다.

const INK = "#20264A";
const ACCENT = "#4E6CA8";
const DANGER = "#A84B4B";
const POP = "#D8A33F";
const SURFACE = "#F8F3E8";
const PAPER = "#F3EEE4";

const MAX_LEN = 32;
const DEFAULT_KEY = "6f1c9ab3";
const NONCE_A = "N-2f01";
const NONCE_B = "N-8ac4";

// --- 결정론적 의사난수 키스트림 (교육용 모형, 실제 ChaCha20 아님) ---

function hashSeed(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function keystream(key: string, nonce: string, len: number): number[] {
  const rng = mulberry32(hashSeed(`${key}::${nonce}`));
  return Array.from({ length: len }, () => Math.floor(rng() * 256));
}

function toBytes(s: string, len: number): number[] {
  const padded = s.padEnd(len, " ");
  return Array.from({ length: len }, (_, i) => padded.charCodeAt(i) & 0xff);
}

function xorBytes(a: number[], b: number[]): number[] {
  return a.map((v, i) => v ^ (b[i] ?? 0));
}

function toAscii(bytes: number[]): string {
  return bytes.map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "·")).join("");
}

// --- 스타일 ---

const labelBlock: CSSProperties = { display: "grid", gap: 6, fontSize: 12, fontWeight: 600, color: INK };

const inputStyle: CSSProperties = {
  padding: "8px 10px",
  border: `1px solid ${INK}33`,
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "'JetBrains Mono', monospace",
  background: "#fffdf8",
  color: INK,
  width: "100%",
  boxSizing: "border-box",
};

const ghostBtn: CSSProperties = {
  padding: "6px 12px",
  borderRadius: 999,
  border: `1px solid ${INK}33`,
  background: "#fffdf8",
  color: INK,
  fontSize: 12,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

function toggleStyle(active: boolean): CSSProperties {
  return {
    padding: "8px 14px",
    borderRadius: 999,
    border: `2px solid ${active ? DANGER : ACCENT}`,
    background: active ? "#A84B4B1f" : "#4E6CA81f",
    color: active ? DANGER : ACCENT,
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  };
}

const panelStyle: CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 10,
  border: `1px solid ${INK}22`,
  background: PAPER,
};

const panelTitle: CSSProperties = { margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: INK };

const rowLabel: CSSProperties = {
  display: "inline-block",
  minWidth: 42,
  fontSize: 12,
  fontWeight: 700,
  color: "#5b5748",
  marginRight: 6,
};

function HexBytes({ bytes, compareWith }: { bytes: number[]; compareWith?: number[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
      {bytes.map((b, i) => {
        const same = compareWith ? compareWith[i] === b : false;
        return (
          <span
            key={i}
            style={{
              padding: "2px 4px",
              borderRadius: 4,
              color: INK,
              background: same ? "#D8A33F3d" : "transparent",
              border: same ? `1px solid ${POP}` : "1px solid transparent",
            }}
          >
            {b.toString(16).padStart(2, "0")}
          </span>
        );
      })}
    </div>
  );
}

export default function NonceReuseLab() {
  const [key, setKey] = useState(DEFAULT_KEY);
  const [p1, setP1] = useState("TRANSFER 100 USD");
  const [p2, setP2] = useState("TRANSFER 900 USD");
  const [reuseNonce, setReuseNonce] = useState(true);
  const [guessP1, setGuessP1] = useState("TRANSFER 100 USD");

  const regenerateKey = () => {
    // 사용자 액션에서만 랜덤화한다 — SSR 초기 렌더는 항상 DEFAULT_KEY(결정론적).
    if (typeof window === "undefined") return;
    const hex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setKey(hex);
  };

  const len = Math.min(MAX_LEN, Math.max(1, p1.length, p2.length, guessP1.length));

  const nonce1 = NONCE_A;
  const nonce2 = reuseNonce ? NONCE_A : NONCE_B;

  const p1Bytes = toBytes(p1, len);
  const p2Bytes = toBytes(p2, len);
  const guessBytes = toBytes(guessP1, len);

  const ks1 = keystream(key, nonce1, len);
  const ks2 = keystream(key, nonce2, len);

  const c1 = xorBytes(p1Bytes, ks1);
  const c2 = xorBytes(p2Bytes, ks2);

  const xorC = xorBytes(c1, c2);
  const xorP = xorBytes(p1Bytes, p2Bytes);
  const proofMatches = xorC.every((v, i) => v === xorP[i]);

  const recovered = xorBytes(xorC, guessBytes);
  const recoveredAscii = toAscii(recovered);
  const attackSucceeds = proofMatches && guessP1 === p1;

  const sameKsCount = ks1.filter((v, i) => v === ks2[i]).length;

  return (
    <figure style={{ margin: "2rem 0", padding: 18, border: `1px solid ${INK}22`, borderRadius: 12, background: SURFACE }}>
      <p style={{ margin: "0 0 12px", fontWeight: 600, color: INK, lineHeight: 1.5 }}>
        P1·P2와 nonce 토글을 바꿔 가며, <strong>같은 nonce가 왜 위험한지</strong> 눈으로 확인하세요. 아래로 갈수록
        키스트림 → 암호문 → XOR 증명 → 실제 공격 순서로 이어집니다.
      </p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))", marginBottom: 14 }}>
        <label style={labelBlock}>
          평문 P1
          <input
            value={p1}
            maxLength={MAX_LEN}
            onChange={(e) => setP1(e.target.value.slice(0, MAX_LEN))}
            style={inputStyle}
          />
        </label>
        <label style={labelBlock}>
          평문 P2
          <input
            value={p2}
            maxLength={MAX_LEN}
            onChange={(e) => setP2(e.target.value.slice(0, MAX_LEN))}
            style={inputStyle}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 4 }}>
        <button
          type="button"
          onClick={() => setReuseNonce((v) => !v)}
          aria-pressed={reuseNonce}
          style={toggleStyle(reuseNonce)}
        >
          {reuseNonce ? "⚠ 같은 nonce 사용 (취약)" : "✔ 다른 nonce 사용 (안전)"}
        </button>
        <span style={{ fontSize: 12, color: "#5b5748" }}>
          nonce1 = <code>{nonce1}</code> · nonce2 = <code>{nonce2}</code>
        </span>
        <button type="button" onClick={regenerateKey} style={ghostBtn}>
          키 재생성 (K={key})
        </button>
      </div>

      <div style={panelStyle}>
        <p style={panelTitle}>키스트림 KS (교육용 PRNG — 실제 ChaCha20 아님)</p>
        <div style={{ display: "grid", gap: 6 }}>
          <div>
            <span style={rowLabel}>KS1</span>
            <HexBytes bytes={ks1} compareWith={ks2} />
          </div>
          <div>
            <span style={rowLabel}>KS2</span>
            <HexBytes bytes={ks2} compareWith={ks1} />
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#5b5748", margin: "8px 0 0" }}>
          {sameKsCount}/{len} 바이트 동일
          {sameKsCount === len ? " — 키스트림이 완전히 겹칩니다." : " — 서로 다른 키스트림입니다."}
        </p>
      </div>

      <div style={panelStyle}>
        <p style={panelTitle}>암호문 C = P XOR KS</p>
        <div style={{ display: "grid", gap: 6 }}>
          <div>
            <span style={rowLabel}>C1</span>
            <HexBytes bytes={c1} />
          </div>
          <div>
            <span style={rowLabel}>C2</span>
            <HexBytes bytes={c2} />
          </div>
        </div>
      </div>

      <div style={panelStyle}>
        <p style={panelTitle}>C1 XOR C2 vs P1 XOR P2</p>
        <div style={{ display: "grid", gap: 6 }}>
          <div>
            <span style={rowLabel}>C1⊕C2</span>
            <HexBytes bytes={xorC} />
          </div>
          <div>
            <span style={rowLabel}>P1⊕P2</span>
            <HexBytes bytes={xorP} />
          </div>
        </div>
        <div
          role="status"
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 8,
            display: "inline-block",
            border: `1px solid ${proofMatches ? POP : ACCENT}`,
            background: proofMatches ? "#D8A33F1a" : "#4E6CA81a",
          }}
        >
          <strong style={{ color: proofMatches ? "#8a6313" : ACCENT }}>
            {proofMatches ? "✔ 두 값이 정확히 일치합니다" : "✘ 두 값이 다릅니다"}
          </strong>
        </div>
      </div>

      <div style={{ ...panelStyle, border: `1px solid ${DANGER}55` }}>
        <p style={panelTitle}>공격 시뮬레이션 — 공격자가 P1을 이렇게 추측했다면?</p>
        <label style={labelBlock}>
          추측한 P1
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              value={guessP1}
              maxLength={MAX_LEN}
              onChange={(e) => setGuessP1(e.target.value.slice(0, MAX_LEN))}
              style={{ ...inputStyle, flex: 1, minWidth: "10rem" }}
            />
            <button type="button" onClick={() => setGuessP1(p1)} style={ghostBtn}>
              P1과 동일하게
            </button>
          </div>
        </label>
        <p style={{ fontSize: 12, color: "#5b5748", margin: "10px 0 4px" }}>
          (C1 XOR C2) XOR 추측한 P1 → ASCII로 복원
        </p>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 15,
            padding: "8px 10px",
            background: "#fffdf8",
            borderRadius: 6,
            wordBreak: "break-all",
            border: `1px solid ${INK}22`,
          }}
        >
          {recoveredAscii}
        </p>
        <div
          role="status"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            display: "inline-block",
            border: `1px solid ${attackSucceeds ? DANGER : ACCENT}`,
            background: attackSucceeds ? "#A84B4B1a" : "#4E6CA81a",
          }}
        >
          <strong style={{ color: attackSucceeds ? DANGER : ACCENT }}>
            {attackSucceeds ? "⚠ P2 평문이 그대로 드러났습니다" : "✔ 복원 실패 — 깨진 바이트만 나옵니다"}
          </strong>
        </div>
      </div>

      <figcaption style={{ fontSize: 13, color: "#5b5748", marginTop: 12, lineHeight: 1.55 }}>
        ⚠ 교육용 모형입니다. 실제 ChaCha20이 아니라 (키, nonce)를 해시해 시드로 쓰는 결정론적 의사난수로
        키스트림을 대신합니다. C1 XOR C2 = P1 XOR P2 라는 XOR 성질은 어떤 키스트림을 쓰든 동일하게
        성립하므로, 이 모형만으로도 nonce 재사용의 위험은 그대로 체감됩니다.
      </figcaption>
    </figure>
  );
}
