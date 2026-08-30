import { useState } from "react";

// 수신 윈도우(흐름 제어)가 "한 번에 얼마나 보낼 수 있는지"를 어떻게 정하는지,
// 세그먼트를 보내고 ACK을 받으며 윈도우가 미끄러지는 모습을 직접 조작한다.

const TOTAL = 12;
// 시각 값은 tokens.css 토큰으로 옮긴다 (KAN-072-CPJCT1 배치5).
// var() 의 fallback 은 토큰 값과 **정확히 같아야 한다** — 어긋나면 fallback 축이
// 드리프트로 물어 게이트가 그 자리에서 막는다.
const TEAL = "var(--cat-skills, #3e6b6b)";
const INK = "var(--ink, #20264A)";
const INK_SOFT = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const PANEL = "var(--surface-hi, #fffdf8)";
const ON_TEAL = "var(--surface-hi, #fffdf8)";
const HAIR = "var(--stroke-hair, 1px)";
const BOLD = "var(--stroke-bold, 2px)";
const CREAM = "var(--cream, #EDE6D8)";
// 세그먼트 칸 글자. #5c5648 은 --ink-2 판정(#6b6357)의 변종이다 — 같은 「부속 글자」
// 역할이고 이동 크기도 같다(ΔRGB 39 vs 43). 최근접은 --cat-quality(Δ28)로 잡히지만
// 그건 카테고리 배지 전용 색이라 글자 잉크 자리가 아니다(§5 역할 우선).
const CELL_INK = "var(--ink-2, #4a4f6a)";
// 본문 강조 잉크. 유저 판정으로 --ink-accent 를 세웠다(2026-08-27, DESIGN_CONCEPT §4).
// 역할은 일관된데 이름이 없던 자리라 --stroke-bold·--text-small 과 같은 「구멍」이었다.
// 최근접 --pop-ink(Δ31)·--cat-leadership(Δ28)로 밀지 않은 이유는 앞은 서브 CTA 의 진한 단이고
// 뒤는 배지 전용이라서다 — 최근접이 곧 정답이 아니다(§5 역할 우선). 값이 같아 화면 변화 0.
const ACCENT_INK = "var(--ink-accent, #9a5b2c)";
// 상태 색 셋. **상수에는 리터럴이 아니라 토큰 참조를 담는다.**
// 한때 이 셋은 리터럴이었고, 그것이 곧 게이트 회피 경로였다 — 값을 const 로 올리면 값 자리에
// 남는 것이 식별자뿐이라 인식층이 통째로 못 봤다(KAN-072 S10 실측: 158→0 중 6건이 그렇게
// 숨어 인라인으로 되돌려야 했다). KAN-077 이 여섯째 인식기로 그 자리를 막았으므로
// (`scripts/lib/tokens/recognize/constRef.ts`) **이제는 숨지 않는다** — 여기 셋이 그 게이트가
// 처음 문 15건이고, 상수로 묶는 것 자체는 문제가 아니다.
// 값의 근거 — SAND·MUTED 는 **자기 뜻의 토큰**(--state-plain·--state-inactive)을 가리키고
// 값이 안 바뀌어 화면 변화 0 이다. 값이 같다는 이유로 --field-dst·--fate-blocked-border 에
// 묶지 않은 것이 KAN-077 검토 1항의 판정이다 — 값은 본질이 아니고 의미로 나눈다.
// TEAL_TINT 는 이 시리즈가 이미 일곱 자리에서 쓰는 활성 틴트 관용구(--cat-skills 11%)로 모았다.
const MUTED = "var(--state-inactive, #b8b0a0)";

type Kind = "acked" | "inflight" | "sendable" | "blocked";

const STYLE: Record<Kind, { bg: string; label: string }> = {
  // 범례 넷은 서로 구분돼야 하는 한 벌이다. 셋은 최근접 토큰과 ΔRGB 가 15 이상이라 그대로 두고
  // (#cfe3da 24 · #e8c97a 50 · #fff3d6 19), 하나만 토큰으로 옮긴다.
  acked: { bg: "#cfe3da", label: "ACK 완료" },
  inflight: { bg: "#e8c97a", label: "전송됨·ACK 대기" },
  sendable: { bg: "#fff3d6", label: "지금 보낼 수 있음" },
  blocked: { bg: CREAM, label: "윈도우 밖(대기)" }, // #efe9dd → ΔRGB 6
};

export default function SlidingWindowLab() {
  const [win, setWin] = useState(4); // 수신 윈도우 크기(세그먼트)
  const [base, setBase] = useState(0); // ACK 완료된 세그먼트 수(왼쪽 경계)
  const [inflight, setInflight] = useState(0); // 보냈지만 ACK 안 온 수

  const canSend = inflight < win && base + inflight < TOTAL;
  const canAck = inflight > 0;

  const kindOf = (i: number): Kind => {
    if (i < base) return "acked";
    if (i < base + inflight) return "inflight";
    if (i < base + win) return "sendable";
    return "blocked";
  };

  const reset = () => {
    setBase(0);
    setInflight(0);
  };

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
      <p style={{ margin: "0 0 var(--space-12, 12px)", fontWeight: 600, color: INK }}>
        수신 측이 알려 준 <strong>윈도우 크기</strong>만큼만 ACK 없이 미리 보낼 수 있습니다.
        세그먼트를 보내고 ACK을 받으며 윈도우가 오른쪽으로 미끄러지는 모습을 보세요.
      </p>

      <label style={{ display: "block", fontSize: "var(--text-meta)", color: INK, marginBottom: "var(--space-12)" }}>
        수신 윈도우: <strong>{win}</strong> 세그먼트{" "}
        {win === 0 && <span style={{ color: ACCENT_INK }}>(zero window — 전송 정지!)</span>}
        <input
          type="range"
          min={0}
          max={8}
          value={win}
          onChange={(e) => setWin(Number(e.target.value))}
          style={{ display: "block", width: "100%", marginTop: "var(--space-6)" }}
        />
      </label>

      {/* 세그먼트 띠 */}
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-10)" }}>
        {Array.from({ length: TOTAL }, (_, i) => {
          const k = kindOf(i);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--text-micro)",
                color: CELL_INK,
                borderRadius: "var(--radius-xs)",
                background: STYLE[k].bg,
                border:
                  i === base && inflight === 0 && k !== "acked"
                    ? `${BOLD} solid ${TEAL}`
                    : `${HAIR} solid ${BORDER}`,
              }}
              aria-label={`세그먼트 ${i + 1}: ${STYLE[k].label}`}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-12)", marginBottom: "var(--space-14)" }}>
        {(Object.keys(STYLE) as Kind[]).map((k) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-4)", fontSize: "var(--text-label)" }}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: "var(--radius-xs)",
                background: STYLE[k].bg,
                border: `${HAIR} solid ${BORDER}`,
                display: "inline-block",
              }}
            />
            {STYLE[k].label}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: "var(--space-8)", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setInflight((n) => n + 1)}
          disabled={!canSend}
          style={{
            padding: "var(--space-8, 8px) var(--space-14, 14px)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            background: canSend ? TEAL : BORDER,
            color: ON_TEAL,
            fontWeight: 600,
            cursor: canSend ? "pointer" : "not-allowed",
          }}
        >
          세그먼트 전송 ▶
        </button>
        <button
          type="button"
          onClick={() => {
            setBase((b) => b + 1);
            setInflight((n) => Math.max(0, n - 1));
          }}
          disabled={!canAck}
          style={{
            padding: "var(--space-8, 8px) var(--space-14, 14px)",
            border: `${HAIR} solid ${BORDER}`,
            borderRadius: "var(--radius-sm)",
            background: canAck ? PANEL : CREAM,
            color: canAck ? INK : MUTED,
            cursor: canAck ? "pointer" : "not-allowed",
          }}
        >
          ◀ ACK 수신
        </button>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "var(--space-8, 8px) var(--space-14, 14px)",
            border: `${HAIR} solid ${BORDER}`,
            borderRadius: "var(--radius-sm)",
            background: PANEL,
            color: INK,
            cursor: "pointer",
          }}
        >
          초기화
        </button>
        <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: "var(--text-label)", color: INK_SOFT }}>
          ACK 완료 {base} · 대기 중 {inflight} · 남은 윈도우 {Math.max(0, win - inflight)}
        </span>
      </div>

      <figcaption style={{ fontSize: "var(--text-meta)", color: INK_SOFT, marginTop: "var(--space-12)" }}>
        윈도우를 키우면 한 번에 더 많이 “날아갈” 수 있습니다(처리량↑). 윈도우를 <code>0</code>으로
        내리면 수신 측이 “잠깐 멈춰”라고 말한 셈이라 전송이 막힙니다(zero window). 이것이{" "}
        <strong>흐름 제어</strong> — 빠른 송신자가 느린 수신자의 버퍼를 넘치게 하지 않도록 수신자가
        속도를 쥐는 장치입니다. (네트워크 혼잡을 보는 혼잡 제어는 이와 별개입니다.)
      </figcaption>
    </figure>
  );
}
