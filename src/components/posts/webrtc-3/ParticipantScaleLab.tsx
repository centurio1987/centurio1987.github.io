import { useMemo, useState } from "react";
import { computeTopologyLoad, type Topology } from "./topologyModel";

// 참가자 수(N) 슬라이더로 mesh/SFU/MCU의 업로드·다운로드 대역폭과 서버 연산 부하가
// 어떻게 갈리는지 비교하는 랩.
//
// ⚠️ 교육용 개념 모델: 실제 프로덕션 SFU/MCU 구현의 정확한 수치를 재현하지 않습니다.
//   적용 산식과 가정은 ./topologyModel.ts 주석 참조.

const PER_STREAM_KBPS = 1000; // 1인당 발신 스트림 비트레이트 가정(예시, 1Mbps)

const topoLabel: Record<Topology, string> = {
  mesh: "mesh (풀 메시 P2P)",
  sfu: "SFU (선택적 전달)",
  mcu: "MCU (믹싱·재인코딩)",
};

// 시각 값은 토큰을 쓴다 (KAN-072-CPJCT1). fallback 은 tokens.css 값과 정확히 같다.
const INK = "var(--ink, #20264A)";
const INK_2 = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const PANEL = "var(--surface-hi, #fffdf8)";
const TRACK = "var(--paper, #F3EEE4)"; // 막대 바탕
const HAIR = "var(--stroke-hair, 1px)";

// 세 토폴로지를 **서로 가르는** 색표라 한 벌로 묶여 있다 — 하나만 옮기면 짝이 깨진다.
// mcu 의 보라(#8b7bd8)는 최근접 토큰이 --ink-3 로 ΔRGB 77.7 이라 옮길 자리가 없어,
// 셋을 통째로 판정 대기로 남긴다(KAN-072 배치6 · 매핑표 4절).
const topoColor: Record<Topology, string> = {
  mesh: "#A84B4B", // red — 참가자 수에 취약
  sfu: "#4E6CA8", // blue — 서버 라우팅
  mcu: "#8b7bd8", // purple — 서버 믹싱
};

function Bar({
  label,
  valueLabel,
  ratio,
  color,
}: {
  label: string;
  valueLabel: string;
  ratio: number;
  color: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "6.5rem 1fr 6.5rem", gap: "var(--space-10)", alignItems: "center" }}>
      <span style={{ fontSize: "var(--text-meta)", color: INK_2 }}>{label}</span>
      <div
        style={{
          height: 16,
          borderRadius: "var(--radius-sm)",
          background: TRACK,
          border: `${HAIR} solid ${BORDER}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(2, Math.min(100, ratio * 100))}%`,
            background: color,
            borderRadius: "var(--radius-sm)",
            transition: "width 120ms ease-out",
          }}
        />
      </div>
      <span style={{ fontSize: "var(--text-meta)", color: INK, fontFamily: "monospace", textAlign: "right" }}>
        {valueLabel}
      </span>
    </div>
  );
}

export default function ParticipantScaleLab() {
  const [participants, setParticipants] = useState(6);

  const result = useMemo(() => computeTopologyLoad(participants, PER_STREAM_KBPS), [participants]);

  const bwMax = useMemo(() => {
    const vals = (Object.keys(result) as Topology[]).flatMap((t) => [
      result[t].uploadKbps,
      result[t].downloadKbps,
    ]);
    return Math.max(...vals, 1);
  }, [result]);

  const loadMax = useMemo(() => {
    const vals = (Object.keys(result) as Topology[]).map((t) => result[t].serverLoadScore);
    return Math.max(...vals, 1);
  }, [result]);

  const topologies: Topology[] = ["mesh", "sfu", "mcu"];

  return (
    <figure
      style={{
        margin: "2rem 0",
        padding: "var(--space-16)",
        border: `${HAIR} solid ${BORDER}`,
        borderRadius: "var(--radius-md)",
        background: PANEL,
      }}
    >
      <label style={{ display: "block", marginBottom: "var(--space-16)", fontWeight: 600, color: INK }}>
        참가자 수(N): {participants}명
        <input
          type="range"
          min={2}
          max={16}
          value={participants}
          onChange={(e) => setParticipants(Number(e.target.value))}
          style={{ display: "block", width: "100%", marginTop: "var(--space-6)" }}
        />
      </label>

      <div style={{ display: "grid", gap: "var(--space-16)" }}>
        {topologies.map((t) => {
          const load = result[t];
          return (
            <div
              key={t}
              style={{
                padding: "var(--space-14)",
                border: `${HAIR} solid ${BORDER}`,
                borderRadius: "var(--radius-sm)",
                background: PANEL,
              }}
            >
              <strong style={{ color: topoColor[t], display: "block", marginBottom: "var(--space-10)" }}>{topoLabel[t]}</strong>
              <div style={{ display: "grid", gap: "var(--space-8)" }}>
                <Bar
                  label="업로드"
                  valueLabel={`${load.uploadKbps.toLocaleString()} kbps`}
                  ratio={load.uploadKbps / bwMax}
                  color={topoColor[t]}
                />
                <Bar
                  label="다운로드"
                  valueLabel={`${load.downloadKbps.toLocaleString()} kbps`}
                  ratio={load.downloadKbps / bwMax}
                  color={topoColor[t]}
                />
                <Bar
                  label="서버 부하"
                  valueLabel={t === "mesh" ? "해당 없음" : `점수 ${load.serverLoadScore}`}
                  ratio={load.serverLoadScore / loadMax}
                  color={topoColor[t]}
                />
              </div>
            </div>
          );
        })}
      </div>

      <figcaption style={{ fontSize: "var(--text-meta)", color: INK_2, marginTop: "var(--space-12)", lineHeight: 1.55 }}>
        교육용 개념 모델입니다(실제 SFU/MCU 구현 수치 재현 아님). 1인당 발신 스트림을{" "}
        {PER_STREAM_KBPS.toLocaleString()}kbps로 가정합니다. mesh는 업로드·다운로드가 모두 (N-1)에 비례해
        늘어나고, SFU는 업로드가 고정값(1×)인 대신 다운로드는 여전히 (N-1)에 비례합니다(다만 실제로는
        simulcast 계층 선택으로 낮출 수 있습니다 — 이 모델은 그 절감분을 반영하지 않습니다). MCU는 업로드·
        다운로드 모두 고정값이지만, 서버 부하(디코딩·합성·재인코딩 상대 점수, 임의 가중치)가 참가자 수에
        비례해 SFU보다 훨씬 가파르게 늘어납니다.
      </figcaption>
    </figure>
  );
}
