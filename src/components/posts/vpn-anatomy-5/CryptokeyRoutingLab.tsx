import { useMemo, useState, type CSSProperties } from "react";

/**
 * Cryptokey Routing 실습 — 공개키↔Allowed IPs 표 하나가
 *  ① 나가는 패킷의 라우팅(목적지 IP → 어느 피어 공개키로 암호화)
 *  ② 들어오는 패킷의 소스 IP 인증(복호에 쓰인 공개키의 Allowed IP인가)
 * 을 어떻게 함께 처리하는지 보여준다. 값은 WireGuard 백서 Configuration 1a 재구성.
 */

// 시각 값은 토큰을 쓴다 (KAN-072-CPJCT1). fallback 은 tokens.css 값과 정확히 같다.
const INK = "var(--ink, #20264A)";
const PAPER = "var(--paper, #F3EEE4)";
const PANEL = "var(--surface-hi, #fffdf8)";
const CORE = "var(--cat-architecture, #4E6CA8)";
const OK = "var(--cat-planning, #3E6B4F)";
const DANGER = "var(--cat-strategy, #A84B4B)";
const MUTED = "var(--ink-2, #4a4f6a)";
const HAIR = "var(--stroke-hair, 1px)";

/** 알파 접미 hex(`${INK}33`)는 var() 와 이어붙일 수 없다 — 같은 비율을 color-mix 로 푼다. */
const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

type Peer = { id: string; name: string; key: string; allowed: string[] };

const PEERS: Peer[] = [
  { id: "A", name: "피어 A", key: "xTIB...p8Dg", allowed: ["10.192.122.3/32", "10.192.124.0/24"] },
  { id: "B", name: "피어 B", key: "TrMv...WXX0", allowed: ["10.192.122.4/32", "192.168.0.0/16"] },
];

const CANDIDATE_IPS = ["10.192.124.7", "10.192.122.3", "10.192.122.4", "192.168.5.5", "8.8.8.8"];

function ipToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let v = 0;
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    v = (v * 256 + n) >>> 0;
  }
  return v >>> 0;
}

/** ip가 cidr(a.b.c.d/n)에 속하면 prefix 길이(n)를, 아니면 -1을 돌려준다. */
function cidrMatchLen(ip: string, cidr: string): number {
  const [net, bitsStr] = cidr.split("/");
  const bits = Number(bitsStr);
  const ipv = ipToInt(ip);
  const netv = ipToInt(net);
  if (ipv === null || netv === null || !Number.isInteger(bits)) return -1;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return ((ipv & mask) >>> 0) === ((netv & mask) >>> 0) ? bits : -1;
}

type OutResult = { peer: Peer; cidr: string } | null;

function longestPrefixPeer(ip: string): OutResult {
  let best: OutResult = null;
  let bestLen = -1;
  for (const peer of PEERS) {
    for (const cidr of peer.allowed) {
      const len = cidrMatchLen(ip, cidr);
      if (len > bestLen) {
        bestLen = len;
        best = { peer, cidr };
      }
    }
  }
  return best;
}

function acceptedBy(peer: Peer, ip: string): string | null {
  let bestCidr: string | null = null;
  let bestLen = -1;
  for (const cidr of peer.allowed) {
    const len = cidrMatchLen(ip, cidr);
    if (len > bestLen) {
      bestLen = len;
      bestCidr = cidr;
    }
  }
  return bestCidr;
}

const btn = (active: boolean): CSSProperties => ({
  fontSize: "var(--text-meta)",
  fontWeight: 600,
  padding: "var(--space-6) var(--space-12)",
  borderRadius: "var(--radius-sm)",
  border: `${HAIR} solid ${active ? INK : tint(INK, 20)}`,
  background: active ? INK : PANEL,
  color: active ? PAPER : INK,
  cursor: "pointer",
});

const sel: CSSProperties = {
  fontSize: "var(--text-meta)",
  padding: "var(--space-4) var(--space-8)",
  borderRadius: "var(--radius-sm)",
  border: `${HAIR} solid ${tint(INK, 20)}`,
  background: PANEL,
  color: INK,
};

export default function CryptokeyRoutingLab() {
  const [mode, setMode] = useState<"out" | "in">("out");
  const [destIp, setDestIp] = useState("10.192.124.7");
  const [peerId, setPeerId] = useState("B");
  const [srcIp, setSrcIp] = useState("10.192.122.3");

  const outResult = useMemo(() => longestPrefixPeer(destIp), [destIp]);
  const inPeer = PEERS.find((p) => p.id === peerId) ?? PEERS[0];
  const inCidr = useMemo(() => acceptedBy(inPeer, srcIp), [inPeer, srcIp]);
  const accepted = inCidr !== null;

  return (
    <figure style={{ margin: "1.75rem 0", padding: "var(--space-16)", background: PAPER, border: `${HAIR} solid ${tint(INK, 13.3)}`, borderRadius: "var(--radius-sm)" }}>
      {/* 표 */}
      <div style={{ fontSize: "var(--text-label)", color: MUTED, marginBottom: "var(--space-6)" }}>Cryptokey Routing 표 (백서 Configuration 1a 재구성)</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-meta)", marginBottom: "var(--space-16)" }}>
        <thead>
          <tr style={{ color: MUTED, textAlign: "left" }}>
            <th style={{ padding: "var(--space-2) var(--space-6)", fontWeight: 600 }}>피어</th>
            <th style={{ padding: "var(--space-2) var(--space-6)", fontWeight: 600 }}>공개키</th>
            <th style={{ padding: "var(--space-2) var(--space-6)", fontWeight: 600 }}>Allowed IPs</th>
          </tr>
        </thead>
        <tbody>
          {PEERS.map((p) => {
            const lit =
              (mode === "out" && outResult?.peer.id === p.id) || (mode === "in" && p.id === peerId);
            return (
              <tr key={p.id} style={{ background: lit ? PANEL : "transparent" }}>
                <td style={{ padding: "var(--space-4) var(--space-6)", color: INK, fontWeight: 600, borderLeft: `var(--stroke-bold) solid ${lit ? CORE : "transparent"}` }}>{p.name}</td>
                <td style={{ padding: "var(--space-4) var(--space-6)", color: INK, fontFamily: "monospace" }}>{p.key}</td>
                <td style={{ padding: "var(--space-4) var(--space-6)", color: INK, fontFamily: "monospace" }}>
                  {p.allowed.map((c) => {
                    const hit =
                      (mode === "out" && outResult?.peer.id === p.id && outResult?.cidr === c) ||
                      (mode === "in" && p.id === peerId && inCidr === c);
                    return (
                      <span
                        key={c}
                        style={{
                          display: "inline-block",
                          marginRight: "var(--space-6)",
                          padding: "var(--space-2) var(--space-4)",
                          borderRadius: "var(--radius-xs)",
                          background: hit ? (mode === "in" ? OK : CORE) : "transparent",
                          color: hit ? PANEL : INK,
                        }}
                      >
                        {c}
                      </span>
                    );
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 모드 토글 */}
      <div style={{ display: "flex", gap: "var(--space-8)", marginBottom: "var(--space-14)" }}>
        <button type="button" style={btn(mode === "out")} onClick={() => setMode("out")}>
          나가는 패킷 (라우팅)
        </button>
        <button type="button" style={btn(mode === "in")} onClick={() => setMode("in")}>
          들어오는 패킷 (인증)
        </button>
      </div>

      {mode === "out" ? (
        <div>
          <label style={{ fontSize: "var(--text-meta)", color: INK, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "var(--space-8)" }}>
            목적지 IP
            <select value={destIp} onChange={(e) => setDestIp(e.target.value)} style={sel}>
              {CANDIDATE_IPS.map((ip) => (
                <option key={ip} value={ip}>
                  {ip}
                </option>
              ))}
            </select>
          </label>
          <div
            style={{
              marginTop: "var(--space-12)",
              padding: "var(--space-10) var(--space-12)",
              borderRadius: "var(--radius-sm)",
              background: PANEL,
              border: `${HAIR} solid ${tint(outResult ? CORE : DANGER, 33.3)}`,
              color: INK,
              fontSize: "var(--text-meta)",
            }}
          >
            {outResult ? (
              <>
                <b style={{ color: CORE }}>{outResult.peer.name}</b>의 <code>{outResult.cidr}</code>에 매칭 → 그 피어(
                <code>{outResult.peer.key}</code>)와의 <b>세션 키로 암호화해 전송</b>합니다. 공개키는 피어와 세션 키를 고르는 열쇠입니다. (longest-prefix match)
              </>
            ) : (
              <>
                어느 피어의 Allowed IP에도 걸리지 않습니다 → <b style={{ color: DANGER }}>터널로 보내지 않고 드롭</b>. (표에 없는 목적지는 WireGuard가 나르지 않습니다.)
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-14)", alignItems: "center" }}>
            <label style={{ fontSize: "var(--text-meta)", color: INK, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "var(--space-8)" }}>
              복호에 쓰인 키
              <select value={peerId} onChange={(e) => setPeerId(e.target.value)} style={sel}>
                {PEERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: "var(--text-meta)", color: INK, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "var(--space-8)" }}>
              패킷이 주장하는 소스 IP
              <select value={srcIp} onChange={(e) => setSrcIp(e.target.value)} style={sel}>
                {CANDIDATE_IPS.map((ip) => (
                  <option key={ip} value={ip}>
                    {ip}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div
            style={{
              marginTop: "var(--space-12)",
              padding: "var(--space-10) var(--space-12)",
              borderRadius: "var(--radius-sm)",
              background: PANEL,
              border: `${HAIR} solid ${tint(accepted ? OK : DANGER, 33.3)}`,
              color: INK,
              fontSize: "var(--text-meta)",
            }}
          >
            {accepted ? (
              <>
                소스 IP <code>{srcIp}</code>가 {inPeer.name}의 <code>{inCidr}</code> 안에 있습니다 → <b style={{ color: OK }}>수락</b>. 이 피어가 이 IP를 자기 것이라 주장할 권한이 확인됐습니다.
              </>
            ) : (
              <>
                소스 IP <code>{srcIp}</code>가 {inPeer.name}의 Allowed IP 어디에도 없습니다 → <b style={{ color: DANGER }}>폐기</b>. 복호는 성공했어도, 이 피어는 이 IP를 쓸 권한이 없습니다(사칭 차단).
              </>
            )}
          </div>
        </div>
      )}

      <figcaption style={{ fontSize: "var(--text-meta)", color: MUTED, marginTop: "var(--space-12)", lineHeight: 1.75 }}>
        같은 표가 두 방향으로 쓰입니다. 나가는 패킷은 목적지 IP로 <b>암호화에 쓸 세션 키(즉 어느 피어)를 고르고</b>(라우팅), 들어오는
        패킷은 복호에 쓰인 세션 키의 피어에 허용된 Allowed IP에 <b>소스 IP가 들어야만 수락</b>합니다(인증). "들어오는 패킷" 모드에서 <b>피어 B · 소스 IP
        10.192.122.3</b>(피어 A의 몫)을 골라 보십시오 — 복호는 됐지만 사칭이라 폐기됩니다.
      </figcaption>
    </figure>
  );
}
