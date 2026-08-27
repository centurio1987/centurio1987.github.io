import { useState } from "react";

// 스위치가 source MAC을 학습하고, destination이 미지면 flooding,
// 학습된 뒤엔 해당 port로만 forwarding 하는 과정을 직접 보낸다.

type Host = { id: string; mac: string; port: number };

const HOSTS: Host[] = [
  { id: "A", mac: "02:..:0A", port: 1 },
  { id: "B", mac: "02:..:0B", port: 2 },
  { id: "C", mac: "02:..:0C", port: 3 },
  { id: "D", mac: "02:..:0D", port: 4 },
];

type Frame = { src: string; dst: string };
type LogLine = { text: string; kind: "flood" | "forward" | "learn" };

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

export default function SwitchLearningLab() {
  // 학습된 forwarding table: MAC -> port
  const [table, setTable] = useState<Record<string, number>>({});
  const [frame, setFrame] = useState<Frame>({ src: "A", dst: "B" });
  const [log, setLog] = useState<LogLine[]>([]);
  const [lastReached, setLastReached] = useState<number[]>([]);

  const send = () => {
    if (frame.src === frame.dst) return;
    const src = HOSTS.find((h) => h.id === frame.src)!;
    const dst = HOSTS.find((h) => h.id === frame.dst)!;

    const next = { ...table };
    const lines: LogLine[] = [];

    // 1) source MAC 학습 (이미 같은 port면 갱신만)
    if (next[src.mac] !== src.port) {
      next[src.mac] = src.port;
      lines.push({
        text: `학습: ${src.mac} 는 port ${src.port} 에 있다 (source에서 배움)`,
        kind: "learn",
      });
    } else {
      lines.push({
        text: `이미 알고 있음: ${src.mac} → port ${src.port}`,
        kind: "learn",
      });
    }

    // 2) destination 조회 → forward or flood
    let reached: number[];
    const known = next[dst.mac];
    if (known) {
      reached = [known];
      lines.push({
        text: `FORWARD: ${dst.mac} 는 port ${known} 으로 학습돼 있음 → 그 port로만 보냄`,
        kind: "forward",
      });
    } else {
      reached = HOSTS.filter((h) => h.port !== src.port).map((h) => h.port);
      lines.push({
        text: `FLOOD: ${dst.mac} 위치를 모름 → source(port ${src.port}) 빼고 전체 port로 복제 전송`,
        kind: "flood",
      });
    }

    setTable(next);
    setLastReached(reached);
    setLog((prev) => [...lines, ...prev].slice(0, 8));
  };

  const reset = () => {
    setTable({});
    setLog([]);
    setLastReached([]);
  };

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
      <p style={{ margin: "0 0 var(--space-14)", fontWeight: 600, color: INK }}>
        프레임을 보내며 스위치의 MAC 주소 테이블이 어떻게 채워지고, 언제 flooding이
        unicast forwarding으로 바뀌는지 관찰하세요.
      </p>

      {/* 토폴로지 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {HOSTS.map((h) => {
          const isSrc = h.id === frame.src;
          const isDst = h.id === frame.dst;
          const reached = lastReached.includes(h.port);
          return (
            <div
              key={h.id}
              style={{
                padding: "var(--space-8) var(--space-6)",
                textAlign: "center",
                border: `var(--stroke-hair) solid ${reached ? TEAL : BORDER}`,
                borderRadius: 8,
                background: reached ? "#e5f0ed" : PANEL,
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: 700, color: INK }}>
                Host {h.id}
                {isSrc ? " ▶" : ""}
                {isDst ? " ◎" : ""}
              </div>
              <div style={{ fontSize: 11, color: INK_SOFT }}>{h.mac}</div>
              <div style={{ fontSize: 11, color: INK_SOFT }}>port {h.port}</div>
            </div>
          );
        })}
      </div>
      <p style={{ margin: "0 0 var(--space-14)", fontSize: 12, color: INK_SOFT }}>
        ▶ source · ◎ destination · 테두리가 칠해진 host = 이번 프레임이 실제로 도달한 곳
      </p>

      {/* 컨트롤 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "flex-end",
          marginBottom: 14,
        }}
      >
        <label style={{ fontSize: 13, color: INK }}>
          보내는 host (source)
          <select
            value={frame.src}
            onChange={(e) => setFrame((f) => ({ ...f, src: e.target.value }))}
            style={{ display: "block", marginTop: 4, padding: "var(--space-4) var(--space-8)" }}
          >
            {HOSTS.map((h) => (
              <option key={h.id} value={h.id}>
                Host {h.id}
              </option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: 13, color: INK }}>
          받는 host (destination)
          <select
            value={frame.dst}
            onChange={(e) => setFrame((f) => ({ ...f, dst: e.target.value }))}
            style={{ display: "block", marginTop: 4, padding: "var(--space-4) var(--space-8)" }}
          >
            {HOSTS.map((h) => (
              <option key={h.id} value={h.id}>
                Host {h.id}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={send}
          disabled={frame.src === frame.dst}
          style={{
            padding: "var(--space-8) var(--space-16)",
            border: "none",
            borderRadius: 8,
            background: frame.src === frame.dst ? BORDER : TEAL,
            color: PANEL,
            cursor: frame.src === frame.dst ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          프레임 전송
        </button>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "var(--space-8) var(--space-16)",
            border: `var(--stroke-hair) solid ${BORDER}`,
            borderRadius: 8,
            background: PANEL,
            color: INK,
            cursor: "pointer",
          }}
        >
          테이블 초기화
        </button>
      </div>

      {/* MAC 테이블 + 로그 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div
          style={{
            border: `var(--stroke-hair) solid ${BORDER}`,
            borderRadius: 8,
            background: PANEL,
            padding: 12,
          }}
        >
          <p style={{ margin: "0 0 var(--space-8)", fontWeight: 600, color: TEAL }}>
            스위치 MAC 주소 테이블
          </p>
          {Object.keys(table).length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: INK_SOFT }}>
              (비어 있음 — 아직 아무 source도 학습하지 않음)
            </p>
          ) : (
            <table style={{ fontSize: 13, borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr style={{ color: INK_SOFT }}>
                  <th style={{ textAlign: "left", padding: "var(--space-2) var(--space-4)" }}>MAC</th>
                  <th style={{ textAlign: "left", padding: "var(--space-2) var(--space-4)" }}>port</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(table).map(([mac, port]) => (
                  <tr key={mac}>
                    <td style={{ padding: "var(--space-2) var(--space-4)", fontFamily: "monospace" }}>{mac}</td>
                    <td style={{ padding: "var(--space-2) var(--space-4)" }}>{port}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div
          style={{
            border: `var(--stroke-hair) solid ${BORDER}`,
            borderRadius: 8,
            background: PANEL,
            padding: 12,
          }}
        >
          <p style={{ margin: "0 0 var(--space-8)", fontWeight: 600, color: TEAL }}>
            스위치가 한 일 (최근 순)
          </p>
          {log.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: INK_SOFT }}>
              프레임을 전송해 보세요.
            </p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
              {log.map((l, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    marginBottom: 4,
                    color:
                      l.kind === "flood"
                        ? ACCENT_INK
                        : l.kind === "forward"
                        ? TEAL
                        : INK_SOFT,
                  }}
                >
                  {l.kind === "flood" ? "🌊 " : l.kind === "forward" ? "🎯 " : "📝 "}
                  {l.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <figcaption style={{ fontSize: 13, color: INK_SOFT, marginTop: 12 }}>
        같은 destination으로 두 번 보내 보세요. 첫 번째는{" "}
        <span style={{ color: ACCENT_INK }}>FLOOD</span>, 그러나 그 host가 한 번이라도
        프레임을 <em>보낸 뒤</em>엔 테이블에 학습돼{" "}
        <span style={{ color: TEAL }}>FORWARD</span>로 바뀝니다. (위 데모의 MAC은 표기를
        줄인 예시값입니다.)
      </figcaption>
    </figure>
  );
}
