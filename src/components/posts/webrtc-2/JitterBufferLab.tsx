import { useMemo, useState } from "react";
import {
  generatePackets,
  simulatePlayout,
  summarize,
  JITTER_LEVEL_LABEL,
  type JitterLevel,
} from "./jitterBufferModel";

// jitter buffer 랩 — 패킷이 지연·재정렬되어 도착하는 것을, 버퍼가 목표 지연(target delay)만큼
// 붙잡아 두었다가 일정한 리듬으로 내보내는 과정을 조작하며 관찰한다.
//
// ⚠️ 교육용 개념 모델: libwebrtc의 NetEQ(적응형 오디오 jitter buffer)를 재현하지 않는다.
//   실제 NetEQ는 10ms마다 Normal/Accelerate/Preemptive Expand/Expand/Merge 중 하나를 선택하고,
//   목표 지연을 forgetting histogram 기반으로 계속 재계산한다. 여기서는 target delay를 슬라이더로
//   고정한 뒤 "그 예산 안에서 패킷이 제때 도착하는가"만 단순화해서 보여준다. 산식은 ./jitterBufferModel.ts 참조.

const LEVELS: JitterLevel[] = ["low", "medium", "high"];

// 시각 값은 토큰을 쓴다 (KAN-072-CPJCT1). fallback 은 tokens.css 값과 정확히 같다.
const INK = "var(--ink, #20264A)";
const INK_2 = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const PANEL = "var(--surface-hi, #fffdf8)";
const TRACK = "var(--paper, #F3EEE4)"; // 타임라인 바탕
const ON_CHIP = "var(--surface-hi, #fffdf8)"; // 색 칩 위 글자 — 종이 흰색
const HAIR = "var(--stroke-hair, 1px)";
const ARRIVED = "var(--cat-architecture, #4e6ca8)"; // 도착 순서 칩
const ON_TIME = "var(--cat-skills, #3e6b6b)"; // 제때 재생
const LATE = "var(--cat-strategy, #a84b4b)"; // 지각 → PLC 대체

export default function JitterBufferLab() {
  const [level, setLevel] = useState<JitterLevel>("medium");
  const [targetDelay, setTargetDelay] = useState(80);
  const [seed, setSeed] = useState(20260722);

  const packets = useMemo(() => generatePackets(level, seed), [level, seed]);
  const results = useMemo(() => simulatePlayout(packets, targetDelay), [packets, targetDelay]);
  const stats = useMemo(() => summarize(results), [results]);

  const timelineMax = useMemo(() => {
    const maxArrival = Math.max(...packets.map((p) => p.arrivalTime));
    const maxPlayout = Math.max(...results.map((r) => r.playoutTime));
    return Math.max(maxArrival, maxPlayout) + 40;
  }, [packets, results]);

  const pct = (t: number) => `${Math.min(100, (t / timelineMax) * 100)}%`;

  const cycleLevel = () => {
    const idx = LEVELS.indexOf(level);
    setLevel(LEVELS[(idx + 1) % LEVELS.length]);
  };

  const buttonStyle: React.CSSProperties = {
    padding: "var(--space-8, 8px) var(--space-12, 12px)",
    border: `${HAIR} solid ${BORDER}`,
    borderRadius: 8,
    background: PANEL,
    color: INK,
    cursor: "pointer",
    fontSize: 13,
    textAlign: "left",
  };

  return (
    <figure
      style={{
        margin: "2rem 0",
        padding: 18,
        border: `${HAIR} solid ${BORDER}`,
        borderRadius: 12,
        background: PANEL,
      }}
    >
      <p style={{ margin: "0 0 var(--space-12, 12px)", fontWeight: 600, color: INK }}>
        네트워크 지터와 목표 지연(target delay)을 바꿔가며, 버퍼가 무엇을 구해내고 무엇을 놓치는지 보세요.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <button type="button" onClick={cycleLevel} style={buttonStyle} aria-pressed>
          네트워크 지터: <strong>{JITTER_LEVEL_LABEL[level]}</strong>
        </button>

        <label style={{ ...buttonStyle, display: "block" }}>
          목표 지연(target delay): <strong>{targetDelay}ms</strong>
          <input
            type="range"
            min={20}
            max={200}
            step={10}
            value={targetDelay}
            onChange={(e) => setTargetDelay(Number(e.target.value))}
            style={{ display: "block", width: "100%", marginTop: 6 }}
          />
        </label>

        <button type="button" onClick={() => setSeed((s) => s + 1)} style={buttonStyle}>
          🔀 새 패킷 스트림 생성
        </button>
      </div>

      <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: INK_2, fontWeight: 600 }}>도착 순서 (뒤섞일 수 있음)</div>
        <div style={{ position: "relative", height: 34, background: TRACK, borderRadius: 6 }}>
          {packets.map((p) => (
            <div
              key={p.seq}
              title={`seq ${p.seq}: ${Math.round(p.arrivalTime)}ms 도착`}
              style={{
                position: "absolute",
                left: pct(p.arrivalTime),
                top: 4,
                width: 22,
                height: 26,
                marginLeft: -11,
                borderRadius: 4,
                background: ARRIVED,
                color: ON_CHIP,
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {p.seq}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, color: INK_2, fontWeight: 600, marginTop: 8 }}>
          재생 순서 (버퍼가 내보내는 일정한 리듬)
        </div>
        <div style={{ position: "relative", height: 34, background: TRACK, borderRadius: 6 }}>
          {results.map((r) => (
            <div
              key={r.seq}
              title={`seq ${r.seq}: ${
                r.status === "on-time" ? `${Math.round(r.headroomMs)}ms 여유` : "지각 → PLC로 대체"
              }`}
              style={{
                position: "absolute",
                left: pct(r.playoutTime),
                top: 4,
                width: 22,
                height: 26,
                marginLeft: -11,
                borderRadius: 4,
                background: r.status === "on-time" ? ON_TIME : LATE,
                color: ON_CHIP,
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {r.status === "on-time" ? r.seq : "×"}
            </div>
          ))}
        </div>
      </div>

      <div
        role="status"
        style={{
          marginTop: 10,
          padding: 14,
          border: `${HAIR} solid ${BORDER}`,
          borderRadius: 8,
          background: PANEL,
          lineHeight: 1.6,
          display: "grid",
          gap: 4,
        }}
      >
        <p style={{ margin: 0 }}>
          이번 스트림: 지연 은닉(concealment) <strong style={{ color: LATE }}>{stats.concealedCount}</strong>회
          / 재정렬 도착 <strong>{stats.reorderedCount}</strong>건 / 평균 버퍼 여유{" "}
          <strong>{Math.round(stats.avgHeadroom)}ms</strong>
        </p>
        <p style={{ margin: 0, fontSize: 13, color: INK_2 }}>
          목표 지연을 늘리면 지각(빨간 ×)이 줄어드는 대신, 전체 오디오/영상이 그만큼 늦게 나옵니다 — jitter
          buffer는 이 "지연 대 매끄러움" 트레이드오프를 계속 저울질합니다.
        </p>
      </div>

      <figcaption style={{ fontSize: 13, color: INK_2, marginTop: 10, lineHeight: 1.55 }}>
        교육용 개념 모델입니다(NetEQ 등 실제 구현 재현 아님). 패킷은 20ms 간격으로 전송되고, 편도 기본 지연
        60ms + 네트워크 지터 잡음을 더해 도착합니다. 재생은 <em>목표 지연만큼 기다린 뒤 일정한 리듬</em>으로
        나가며, 재생 시각까지 도착하지 못한 패킷은 PLC(패킷 손실 은닉)로 대체된다고 가정합니다. 실제 NetEQ는
        target delay를 고정하지 않고 forgetting histogram 기반으로 계속 재계산합니다.
      </figcaption>
    </figure>
  );
}
