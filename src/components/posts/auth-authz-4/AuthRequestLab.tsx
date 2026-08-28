import { useMemo, useState } from "react";

// auth_request 시퀀스 랩 — 요청이 nginx auth_request를 거쳐 백엔드에 닿는 과정을 모사한다.
// 세션 유효성·X-User 위조·헤더 sanitize·백엔드 직접 접근을 토글해 우회 조건을 관찰한다.
//
// ⚠️ 교육용 개념 모델: 실제 nginx/네트워크 동작이 아니라 auth_request 규칙(2xx 허용 / 401 거부)과
//   신뢰 경계 원칙(헤더 sanitize·직접 접근 차단)을 규칙으로 모사한다.

// 시각 값은 토큰에서 뽑는다 — fallback 은 tokens.css 값과 정확히 같아야 한다 (KAN-072).
const TEAL = "var(--cat-skills, #3e6b6b)";
const RED = "var(--cat-strategy, #A84B4B)";
const INK = "var(--ink, #20264A)";
const INK_SOFT = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const PANEL = "var(--surface-hi, #fffdf8)";

// 상태 배경 틴트는 축 색의 옅은 단이다 — 토큰을 늘리지 않고 관계를 식으로 드러낸다
// (KAN-072 배치6, 유저 판정 2026-08-27).
const ACTIVE_TINT = "color-mix(in srgb, var(--cat-skills) 11%, var(--surface-hi))";
const DANGER_TINT = "color-mix(in srgb, var(--cat-strategy) 14%, var(--surface-hi))";

type Line = { text: string; kind: "info" | "ok" | "bad" };

function evaluate(
  session: "valid" | "invalid",
  forgeHeader: boolean,
  sanitize: boolean,
  bypassEdge: boolean,
): { lines: Line[]; verdict: "ok" | "denied" | "breach"; summary: string } {
  const lines: Line[] = [];

  if (bypassEdge) {
    lines.push({ text: "요청 → (nginx 건너뜀) → 백엔드에 직접 도달", kind: "bad" });
    lines.push({ text: "auth_request가 적용되지 않음 — 인증 검사 자체가 없음", kind: "bad" });
    if (forgeHeader) {
      lines.push({ text: "요청 헤더 X-User: admin (위조) → 백엔드가 그대로 신뢰", kind: "bad" });
      return {
        lines,
        verdict: "breach",
        summary: "심각: 백엔드가 외부에 노출돼 엣지를 우회당했고, 위조 X-User로 admin 신원까지 탈취. 내부망/mTLS로 직접 접근을 막아야 합니다.",
      };
    }
    return {
      lines,
      verdict: "breach",
      summary: "심각: 백엔드 직접 접근으로 인증이 통째로 우회됨. 백엔드를 외부에 노출하지 말고, 인가는 앱에서도 다시 하세요.",
    };
  }

  lines.push({ text: "요청 → nginx (location /private/)", kind: "info" });
  lines.push({ text: "nginx → auth_request /auth (인증 서버에 서브리퀘스트)", kind: "info" });

  if (session === "invalid") {
    lines.push({ text: "인증 서버 응답: 401 Unauthorized", kind: "bad" });
    lines.push({ text: "auth_request 규칙: 401 → 거부", kind: "ok" });
    return { lines, verdict: "denied", summary: "정상 거부 — 세션이 없거나 무효라 401. 백엔드에 닿지 못합니다." };
  }

  lines.push({ text: "인증 서버 응답: 202 (유효) + X-Auth-Request-User: alice", kind: "ok" });
  lines.push({ text: "auth_request 규칙: 2xx → 허용", kind: "ok" });

  // 헤더 sanitize 여부에 따라 위조 X-User 처리
  if (forgeHeader && !sanitize) {
    lines.push({ text: "클라이언트가 보낸 X-User: admin 을 nginx가 지우지 않음", kind: "bad" });
    lines.push({ text: "백엔드가 받는 값: X-User: admin (위조 통과!)", kind: "bad" });
    return {
      lines,
      verdict: "breach",
      summary: "취약: 세션은 alice지만, sanitize를 안 해 위조 X-User: admin이 백엔드로 전달됐습니다. proxy_set_header X-User $user; 로 인증 결과로 덮어쓰세요.",
    };
  }

  if (sanitize) {
    lines.push({ text: "nginx: proxy_set_header X-User $user → 클라이언트 값을 인증 결과로 덮어씀", kind: "ok" });
  }
  lines.push({ text: "백엔드가 받는 값: X-User: alice (인증 결과)", kind: "ok" });
  return {
    lines,
    verdict: "ok",
    summary: "정상 통과 — 세션 유효, 신원은 인증 결과(alice)로만 설정. 다만 백엔드는 여기서 멈추지 말고 scope·소유권으로 인가를 다시 집행해야 합니다.",
  };
}

export default function AuthRequestLab() {
  const [session, setSession] = useState<"valid" | "invalid">("valid");
  const [forge, setForge] = useState(false);
  const [sanitize, setSanitize] = useState(true);
  const [bypass, setBypass] = useState(false);

  const result = useMemo(() => evaluate(session, forge, sanitize, bypass), [session, forge, sanitize, bypass]);

  const toggle = (on: boolean, danger = false): React.CSSProperties => ({
    // 7px·11px 은 §9 스케일 밖이라 동률에서 작은 쪽으로 접는다 (7→6 · 11→10).
    padding: "var(--space-6) var(--space-10)",
    border: on ? `var(--stroke-bold) solid ${danger ? RED : TEAL}` : `var(--stroke-hair) solid ${BORDER}`,
    borderRadius: 7,
    background: on ? (danger ? DANGER_TINT : ACTIVE_TINT) : PANEL,
    color: INK,
    cursor: "pointer",
    fontSize: "var(--text-meta)",
    textAlign: "left",
  });

  const verdictColor = result.verdict === "ok" ? TEAL : result.verdict === "denied" ? INK_SOFT : RED;
  const verdictText =
    result.verdict === "ok" ? "✔ 통과(인증)" : result.verdict === "denied" ? "⛔ 거부" : "⚠ 침해";

  const lineColor = (k: Line["kind"]) => (k === "ok" ? TEAL : k === "bad" ? RED : INK_SOFT);

  return (
    <figure
      style={{
        margin: "2rem 0",
        padding: 18,
        border: `var(--stroke-hair) solid ${BORDER}`,
        borderRadius: "var(--radius-md)",
        background: PANEL,
      }}
    >
      <p style={{ margin: "0 0 var(--space-12)", fontWeight: 600, color: INK }}>
        조건을 토글해 auth_request가 어디서 막고, 어디서 뚫리는지 보세요.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
          gap: "var(--space-8)",
          marginBottom: "var(--space-14)",
        }}
      >
        <button
          type="button"
          onClick={() => setSession((s) => (s === "valid" ? "invalid" : "valid"))}
          aria-pressed={session === "valid"}
          style={toggle(session === "valid")}
        >
          세션: <strong>{session === "valid" ? "유효" : "무효/없음"}</strong>
        </button>
        <button type="button" onClick={() => setForge((v) => !v)} aria-pressed={forge} style={toggle(forge, true)}>
          공격자가 X-User 위조: <strong>{forge ? "예" : "아니오"}</strong>
        </button>
        <button
          type="button"
          onClick={() => setSanitize((v) => !v)}
          aria-pressed={sanitize}
          style={toggle(sanitize)}
        >
          프록시 헤더 sanitize: <strong>{sanitize ? "켜짐" : "꺼짐"}</strong>
        </button>
        <button type="button" onClick={() => setBypass((v) => !v)} aria-pressed={bypass} style={toggle(bypass, true)}>
          백엔드 직접 접근(엣지 우회): <strong>{bypass ? "예" : "아니오"}</strong>
        </button>
      </div>

      <div
        style={{
          padding: "var(--space-14)",
          border: `var(--stroke-hair) solid ${BORDER}`,
          borderRadius: "var(--radius-sm)",
          background: PANEL,
          marginBottom: "var(--space-12)",
        }}
      >
        {result.lines.map((l, idx) => (
          <div
            key={idx}
            style={{
              fontSize: "var(--text-meta)",
              lineHeight: 1.7,
              color: lineColor(l.kind),
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {l.kind === "bad" ? "✗ " : l.kind === "ok" ? "· " : "· "}
            {l.text}
          </div>
        ))}
      </div>

      <div
        role="status"
        style={{
          padding: "var(--space-14)",
          border: `var(--stroke-hair) solid ${verdictColor}`,
          borderRadius: "var(--radius-sm)",
          background: PANEL,
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: "0 0 var(--space-4)" }}>
          <strong style={{ color: verdictColor, fontSize: 16 }}>{verdictText}</strong>
        </p>
        <p style={{ margin: 0, fontSize: 14, color: INK_SOFT }}>{result.summary}</p>
      </div>

      <figcaption style={{ fontSize: "var(--text-meta)", color: INK_SOFT, marginTop: "var(--space-10)", lineHeight: 1.55 }}>
        교육용 개념 모델입니다(실제 nginx 동작 재현 아님). auth_request의 2xx=허용·401=거부 규칙과, 신원 헤더
        sanitize·백엔드 직접 접근 차단이라는 신뢰 경계 원칙을 규칙으로 모사합니다.
      </figcaption>
    </figure>
  );
}
