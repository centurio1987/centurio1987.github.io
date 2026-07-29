import { useMemo, useState, type CSSProperties } from "react";

/**
 * Cryptokey Routing 실습 — 공개키↔Allowed IPs 표 하나가
 *  ① 나가는 패킷의 라우팅(목적지 IP → 어느 피어 공개키로 암호화)
 *  ② 들어오는 패킷의 소스 IP 인증(복호에 쓰인 공개키의 Allowed IP인가)
 * 을 어떻게 함께 처리하는지 보여준다. 값은 WireGuard 백서 Configuration 1a 재구성.
 */

const INK = "#20264A";
const PAPER = "#F3EEE4";
const CORE = "#4E6CA8";
const OK = "#3E6B4F";
const DANGER = "#A84B4B";
const MUTED = "#6b6357";

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
  fontSize: 13,
  fontWeight: 600,
  padding: "6px 12px",
  borderRadius: 8,
  border: `1px solid ${active ? INK : INK + "33"}`,
  background: active ? INK : "#fff",
  color: active ? PAPER : INK,
  cursor: "pointer",
});

const sel: CSSProperties = {
  fontSize: 13,
  padding: "5px 8px",
  borderRadius: 6,
  border: `1px solid ${INK}33`,
  background: "#fff",
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
    <figure style={{ margin: "1.75rem 0", padding: 16, background: PAPER, border: `1px solid ${INK}22`, borderRadius: 10 }}>
      {/* 표 */}
      <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Cryptokey Routing 표 (백서 Configuration 1a 재구성)</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
        <thead>
          <tr style={{ color: MUTED, textAlign: "left" }}>
            <th style={{ padding: "3px 6px", fontWeight: 600 }}>피어</th>
            <th style={{ padding: "3px 6px", fontWeight: 600 }}>공개키</th>
            <th style={{ padding: "3px 6px", fontWeight: 600 }}>Allowed IPs</th>
          </tr>
        </thead>
        <tbody>
          {PEERS.map((p) => {
            const lit =
              (mode === "out" && outResult?.peer.id === p.id) || (mode === "in" && p.id === peerId);
            return (
              <tr key={p.id} style={{ background: lit ? "#fff" : "transparent" }}>
                <td style={{ padding: "4px 6px", color: INK, fontWeight: 600, borderLeft: `3px solid ${lit ? CORE : "transparent"}` }}>{p.name}</td>
                <td style={{ padding: "4px 6px", color: INK, fontFamily: "monospace" }}>{p.key}</td>
                <td style={{ padding: "4px 6px", color: INK, fontFamily: "monospace" }}>
                  {p.allowed.map((c) => {
                    const hit =
                      (mode === "out" && outResult?.peer.id === p.id && outResult?.cidr === c) ||
                      (mode === "in" && p.id === peerId && inCidr === c);
                    return (
                      <span
                        key={c}
                        style={{
                          display: "inline-block",
                          marginRight: 6,
                          padding: "1px 5px",
                          borderRadius: 4,
                          background: hit ? (mode === "in" ? OK : CORE) : "transparent",
                          color: hit ? "#fff" : INK,
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
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button type="button" style={btn(mode === "out")} onClick={() => setMode("out")}>
          나가는 패킷 (라우팅)
        </button>
        <button type="button" style={btn(mode === "in")} onClick={() => setMode("in")}>
          들어오는 패킷 (인증)
        </button>
      </div>

      {mode === "out" ? (
        <div>
          <label style={{ fontSize: 13, color: INK, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
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
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "#fff",
              border: `1px solid ${(outResult ? CORE : DANGER)}55`,
              color: INK,
              fontSize: 14,
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
            <label style={{ fontSize: 13, color: INK, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
              복호에 쓰인 키
              <select value={peerId} onChange={(e) => setPeerId(e.target.value)} style={sel}>
                {PEERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: 13, color: INK, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
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
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "#fff",
              border: `1px solid ${(accepted ? OK : DANGER)}55`,
              color: INK,
              fontSize: 14,
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

      <figcaption style={{ fontSize: 13, color: MUTED, marginTop: 12, lineHeight: 1.75 }}>
        같은 표가 두 방향으로 쓰입니다. 나가는 패킷은 목적지 IP로 <b>암호화에 쓸 세션 키(즉 어느 피어)를 고르고</b>(라우팅), 들어오는
        패킷은 복호에 쓰인 세션 키의 피어에 허용된 Allowed IP에 <b>소스 IP가 들어야만 수락</b>합니다(인증). "들어오는 패킷" 모드에서 <b>피어 B · 소스 IP
        10.192.122.3</b>(피어 A의 몫)을 골라 보십시오 — 복호는 됐지만 사칭이라 폐기됩니다.
      </figcaption>
    </figure>
  );
}
