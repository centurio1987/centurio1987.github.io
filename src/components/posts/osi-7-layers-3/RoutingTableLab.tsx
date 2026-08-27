import { useState } from "react";

// 목적지 IP를 넣으면 라우팅 테이블에서 longest prefix match로
// 어떤 경로가 선택되는지 직접 확인한다.

type Route = {
  cidr: string; // "10.20.0.0/16"
  via: string; // next hop 설명
  dev: string;
};

// 시각 값은 토큰에서 뽑는다 — fallback 은 tokens.css 값과 정확히 같아야 한다 (KAN-072).
const INK = "var(--ink, #20264A)";
const INK_SOFT = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const PANEL = "var(--surface-hi, #fffdf8)";
const TEAL = "var(--cat-skills, #3e6b6b)";
const SAND = "#e8c97a";

const TABLE: Route[] = [
  { cidr: "0.0.0.0/0", via: "via 203.0.113.1 (기본 경로)", dev: "eth0" },
  { cidr: "10.0.0.0/8", via: "via 10.0.0.1", dev: "eth1" },
  { cidr: "10.20.0.0/16", via: "via 10.20.0.1", dev: "eth2" },
  { cidr: "10.20.30.0/24", via: "via 10.20.30.1", dev: "eth3" },
  { cidr: "192.168.1.0/24", via: "directly connected", dev: "eth4" },
];

const PRESETS = ["10.20.30.5", "10.20.40.5", "10.99.0.1", "8.8.8.8", "192.168.1.50"];

// "a.b.c.d" -> 부호 없는 32비트 정수. 형식이 틀리면 null.
function ipToInt(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const v = Number(p);
    if (v < 0 || v > 255) return null;
    n = n * 256 + v;
  }
  return n >>> 0;
}

function matchLen(ipInt: number, cidr: string): number | null {
  const [base, lenStr] = cidr.split("/");
  const len = Number(lenStr);
  const baseInt = ipToInt(base);
  if (baseInt === null) return null;
  // len=0이면 마스크는 0 (전부 매치)
  const mask = len === 0 ? 0 : (0xffffffff << (32 - len)) >>> 0;
  return (ipInt & mask) >>> 0 === (baseInt & mask) >>> 0 ? len : null;
}

export default function RoutingTableLab() {
  const [ip, setIp] = useState("10.20.30.5");

  const ipInt = ipToInt(ip);
  const valid = ipInt !== null;

  // 각 경로의 prefix 길이(매치되면), 그중 가장 긴 것이 승자.
  const evaluated = TABLE.map((r) => ({
    route: r,
    len: valid ? matchLen(ipInt!, r.cidr) : null,
  }));
  const winnerLen = evaluated.reduce<number | null>(
    (best, e) => (e.len !== null && (best === null || e.len > best) ? e.len : best),
    null
  );
  const winner = evaluated.find((e) => e.len !== null && e.len === winnerLen) ?? null;

  return (
    <figure
      style={{
        margin: "2rem 0",
        padding: 18,
        border: `var(--stroke-hair) solid ${BORDER}`,
        borderRadius: 12,
        background: PANEL,
      }}
    >
      <p style={{ margin: "0 0 var(--space-12)", fontWeight: 600, color: INK }}>
        목적지 IP를 넣으면, 라우터가 이 테이블에서 <strong>가장 긴(=가장 구체적인) 프리픽스</strong>를
        골라 다음 홉을 정합니다.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <label style={{ fontSize: 13, color: INK }}>
          목적지 IP:{" "}
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            spellCheck={false}
            style={{
              padding: "var(--space-4) var(--space-8)",
              fontFamily: "monospace",
              border: `var(--stroke-hair) solid ${valid ? BORDER : "#c0392b"}`,
              borderRadius: 6,
              width: 150,
            }}
          />
        </label>
        {!valid && (
          <span style={{ color: "#c0392b", fontSize: 12 }}>
            올바른 IPv4 주소를 입력하세요 (예: 10.20.30.5)
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => setIp(p)}
            style={{
              padding: "var(--space-4) var(--space-10)",
              fontSize: 12,
              fontFamily: "monospace",
              border: `var(--stroke-hair) solid ${BORDER}`,
              borderRadius: 14,
              background: ip === p ? "#e5f0ed" : PANEL,
              color: INK,
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <thead>
            <tr style={{ color: INK_SOFT, textAlign: "left" }}>
              <th style={{ padding: "var(--space-4) var(--space-8)" }}>destination/prefix</th>
              <th style={{ padding: "var(--space-4) var(--space-8)" }}>next hop</th>
              <th style={{ padding: "var(--space-4) var(--space-8)" }}>dev</th>
              <th style={{ padding: "var(--space-4) var(--space-8)" }}>매치?</th>
            </tr>
          </thead>
          <tbody>
            {evaluated.map((e) => {
              const isWinner = winner != null && e.route.cidr === winner.route.cidr;
              const matched = e.len !== null;
              return (
                <tr
                  key={e.route.cidr}
                  style={{
                    background: isWinner ? "#e5f0ed" : "transparent",
                    color: matched ? INK : "#a59c8b",
                  }}
                >
                  <td
                    style={{
                      padding: "var(--space-4) var(--space-8)",
                      fontFamily: "monospace",
                      fontWeight: isWinner ? 700 : 400,
                      borderLeft: isWinner ? `3px solid ${TEAL}` : "3px solid transparent",
                    }}
                  >
                    {e.route.cidr}
                  </td>
                  <td style={{ padding: "var(--space-4) var(--space-8)" }}>{e.route.via}</td>
                  <td style={{ padding: "var(--space-4) var(--space-8)", fontFamily: "monospace" }}>{e.route.dev}</td>
                  <td style={{ padding: "var(--space-4) var(--space-8)" }}>
                    {matched ? (
                      <span style={{ color: isWinner ? TEAL : INK_SOFT }}>
                        /{e.len} 매치{isWinner ? " ✔ 선택" : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        role="status"
        style={{
          marginTop: 14,
          padding: 12,
          border: `var(--stroke-hair) solid ${SAND}`,
          borderLeft: `5px solid ${SAND}`,
          borderRadius: 8,
          background: PANEL,
          lineHeight: 1.6,
        }}
      >
        {valid && winner ? (
          <p style={{ margin: 0 }}>
            <code style={{ fontFamily: "monospace" }}>{ip}</code> →{" "}
            <strong style={{ color: TEAL }}>
              {winner.route.cidr} ({winner.route.via}, {winner.route.dev})
            </strong>{" "}
            선택. 여러 경로가 동시에 매치돼도 <strong>가장 긴 /{winner.len}</strong>를 고릅니다.
          </p>
        ) : (
          <p style={{ margin: 0, color: INK_SOFT }}>
            유효한 IP를 넣으면 선택 결과가 여기 표시됩니다.
          </p>
        )}
      </div>

      <figcaption style={{ fontSize: 13, color: INK_SOFT, marginTop: 10 }}>
        <code>10.20.30.5</code>는 /8·/16·/24에 모두 걸리지만 선택되는 것은 가장 구체적인 /24입니다.
        <code> 10.99.0.1</code>은 /8만 걸리고, <code>8.8.8.8</code>은 아무 데도 안 걸려 결국{" "}
        <code>0.0.0.0/0</code> 기본 경로로 갑니다 — 그래서 default route를 "최후의 보루"라 부릅니다.
      </figcaption>
    </figure>
  );
}
