import { useMemo, useState } from "react";

// PKCE 플로우 스테퍼 — Authorization Code + PKCE 흐름을 한 스텝씩 밟으며
// 어느 채널로 무슨 데이터가 오가는지 관찰한다. PKCE 끄기·코드 가로채기를 켜면
// 결과가 어떻게 달라지는지 보인다.
//
// ⚠️ 교육용 개념 모델: 실제 네트워크 요청·암호 연산을 수행하지 않는다. RFC 6749/7636의
//   흐름과 검증 규칙을 규칙으로 모사한다. verifier/challenge 값은 RFC 7636 부록 예시.

// 시각 값은 토큰에서 뽑는다 — fallback 은 tokens.css 값과 정확히 같아야 한다 (KAN-072).
const TEAL = "var(--cat-skills, #3e6b6b)";
const RED = "var(--cat-strategy, #A84B4B)";
const SAND = "var(--cat-research, #B07A2E)";
const INK = "var(--ink, #20264A)";
const INK_SOFT = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const PANEL = "var(--surface-hi, #fffdf8)";
const IDLE = "var(--paper, #F3EEE4)";

// 상태 배경 틴트는 축 색의 옅은 단이다 — 토큰을 늘리지 않고 관계를 식으로 드러낸다
// (KAN-072 배치6, 유저 판정 2026-08-27).
const ACTIVE_TINT = "color-mix(in srgb, var(--cat-skills) 11%, var(--surface-hi))";
const DANGER_TINT = "color-mix(in srgb, var(--cat-strategy) 14%, var(--surface-hi))";
// 결과 패널은 테두리가 축을 지정한다(`attackOutcome.ok ? RED : TEAL`) — 배경은 그 축의
// 더 옅은 단이라 토글보다 낮은 9% 다 (유저 판정 2026-08-27 의 연장).
const OUTCOME_BAD = "color-mix(in srgb, var(--cat-strategy) 9%, var(--surface-hi))";
const OUTCOME_OK = "color-mix(in srgb, var(--cat-skills) 9%, var(--surface-hi))";

type Channel = "internal" | "front" | "back";

type StepDef = {
  title: string;
  channel: Channel;
  data: (pkce: boolean) => string;
};

const CH: Record<Channel, { label: string; color: string }> = {
  internal: { label: "클라이언트 내부", color: INK_SOFT },
  front: { label: "프론트채널(브라우저 URL)", color: SAND },
  back: { label: "백채널(서버→IdP)", color: TEAL },
};

const VERIFIER = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
const CHALLENGE = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

const STEPS: StepDef[] = [
  {
    title: "1. PKCE 준비",
    channel: "internal",
    data: (pkce) =>
      pkce
        ? `code_verifier = ${VERIFIER}\ncode_challenge = ${CHALLENGE}  (S256 해시)`
        : "PKCE 꺼짐 — verifier/challenge 없음.",
  },
  {
    title: "2. 인가 요청",
    channel: "front",
    data: (pkce) =>
      `GET .../auth?response_type=code&client_id=photo-app\n  &redirect_uri=.../callback&scope=openid&state=af0i&nonce=n-0S6` +
      (pkce ? `\n  &code_challenge=${CHALLENGE}&code_challenge_method=S256` : ""),
  },
  { title: "3. 로그인·동의", channel: "internal", data: () => "사용자가 IdP에서 인증하고 권한에 동의." },
  { title: "4. 콜백(코드)", channel: "front", data: () => "GET .../callback?code=<code>&state=af0i   (토큰 아님, 일회용 코드)" },
  {
    title: "5. 토큰 교환",
    channel: "back",
    data: (pkce) =>
      `POST .../token  grant_type=authorization_code&code=<code>\n  &redirect_uri=.../callback&client_id=photo-app` +
      (pkce ? `\n  &code_verifier=${VERIFIER}` : ""),
  },
  { title: "6. ID Token 검증", channel: "internal", data: () => "서명·iss·aud·exp·nonce 확인 → 로그인 완료." },
];

export default function PkceFlowStepper() {
  const [i, setI] = useState(0);
  const [pkce, setPkce] = useState(true);
  const [intercept, setIntercept] = useState(false);

  // 공격자가 코드를 가로챈 뒤 5단계(토큰 교환)를 시도한 결과
  const attackOutcome = useMemo(() => {
    if (!intercept) return null;
    if (pkce) {
      return {
        ok: false,
        text: "가로챈 코드로 토큰 교환 시도 → code_verifier가 없어 IdP가 invalid_grant으로 거부. 공격 실패.",
      };
    }
    return {
      ok: true,
      text: "PKCE가 꺼져 있어, 가로챈 코드만으로 토큰 교환 성공. 공격자가 토큰 탈취(실제 위험).",
    };
  }, [intercept, pkce]);

  const step = STEPS[i];
  const chInfo = CH[step.channel];

  const btn = (disabled: boolean): React.CSSProperties => ({
    padding: "var(--space-8) var(--space-14)",
    border: `var(--stroke-hair) solid ${BORDER}`,
    borderRadius: "var(--radius-sm)",
    background: disabled ? IDLE : PANEL,
    // `#a9a294`(비활성 글자) → --ink-muted. KAN-072 배치6 S13 이 「최근접 --ink-3 이
    // Δ74.8 로 멀다」며 판정 대기로 뒀는데, 그 뒤 --ink-muted(#a59c8b)가 서면서 Δ11.5 가
    // 됐다. 역할도 같다(비활성 글자). 유저 판정 2026-08-29 — DESIGN_CONCEPT.md:85 가
    // 「셋을 한 값으로 모으는 것은 별도 판정」이라 남겨 둔 자리 중 하나를 닫은 것이다.
    color: disabled ? "var(--ink-muted)" : INK,
    cursor: disabled ? "default" : "pointer",
    fontSize: "var(--text-meta)",
  });
  const toggle = (on: boolean, danger = false): React.CSSProperties => ({
    padding: "var(--space-6) var(--space-10)",
    border: on ? `var(--stroke-bold) solid ${danger ? RED : TEAL}` : `var(--stroke-hair) solid ${BORDER}`,
    borderRadius: "var(--radius-sm)",
    background: on ? (danger ? DANGER_TINT : ACTIVE_TINT) : PANEL,
    color: INK,
    cursor: "pointer",
    fontSize: "var(--text-meta)",
  });

  return (
    <figure
      style={{
        margin: "2rem 0",
        padding: "var(--space-16)",
        border: `var(--stroke-hair) solid ${BORDER}`,
        borderRadius: "var(--radius-md)",
        background: PANEL,
      }}
    >
      <div style={{ display: "flex", gap: "var(--space-8)", flexWrap: "wrap", marginBottom: "var(--space-14)" }}>
        <button type="button" onClick={() => setPkce((v) => !v)} aria-pressed={pkce} style={toggle(pkce)}>
          PKCE(S256): <strong>{pkce ? "켜짐" : "꺼짐"}</strong>
        </button>
        <button
          type="button"
          onClick={() => setIntercept((v) => !v)}
          aria-pressed={intercept}
          style={toggle(intercept, true)}
        >
          공격자가 코드 가로채기: <strong>{intercept ? "켜짐" : "꺼짐"}</strong>
        </button>
      </div>

      <div
        style={{
          padding: "var(--space-14)",
          border: `var(--stroke-hair) solid ${BORDER}`,
          borderRadius: "var(--radius-sm)",
          background: PANEL,
          minHeight: 120,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-10)", marginBottom: "var(--space-8)" }}>
          <strong style={{ fontSize: "var(--text-small)", color: INK }}>{step.title}</strong>
          <span
            style={{
              fontSize: "var(--text-label)",
              color: PANEL,
              background: chInfo.color,
              padding: "var(--space-2) var(--space-8)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            {chInfo.label}
          </span>
        </div>
        <pre
          style={{
            margin: 0,
            fontSize: "var(--text-label)",
            lineHeight: "var(--font-leading-ui)",
            color: INK_SOFT,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            fontFamily: "var(--font-code)",
          }}
        >
          {step.data(pkce)}
        </pre>
      </div>

      {intercept && (i >= 4) && attackOutcome && (
        <div
          role="status"
          style={{
            marginTop: "var(--space-10)",
            padding: "var(--space-12)",
            border: `var(--stroke-hair) solid ${attackOutcome.ok ? RED : TEAL}`,
            borderRadius: "var(--radius-sm)",
            // 축을 살리면 짝이 안 깨진다 — 바로 위 border 와 같은 축의 옅은 단이다(Δ2.2 · Δ5.1).
            background: attackOutcome.ok ? OUTCOME_BAD : OUTCOME_OK,
            fontSize: "var(--text-meta)",
            lineHeight: "var(--font-leading-ui)",
            color: INK,
          }}
        >
          <strong style={{ color: attackOutcome.ok ? RED : TEAL }}>
            {attackOutcome.ok ? "⚠ 공격 성공" : "✔ 공격 차단"}
          </strong>{" "}
          — {attackOutcome.text}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-10)", marginTop: "var(--space-14)" }}>
        <button type="button" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} style={btn(i === 0)}>
          ◀ 이전
        </button>
        <span style={{ fontSize: "var(--text-meta)", color: INK_SOFT }}>
          {i + 1} / {STEPS.length}
        </span>
        <button
          type="button"
          onClick={() => setI((v) => Math.min(STEPS.length - 1, v + 1))}
          disabled={i === STEPS.length - 1}
          style={btn(i === STEPS.length - 1)}
        >
          다음 ▶
        </button>
      </div>

      <figcaption style={{ fontSize: "var(--text-meta)", color: INK_SOFT, marginTop: "var(--space-12)", lineHeight: "var(--font-leading-ui)" }}>
        교육용 개념 모델입니다(실제 네트워크·암호 연산 없음). RFC 6749/7636의 흐름을 규칙으로 모사하며,
        verifier/challenge 값은 RFC 7636 부록의 예시입니다. "코드 가로채기"는 프론트채널로 돌아온 코드를 공격자가
        탈취한 상황을 가정합니다 — PKCE가 켜져 있으면 원본 code_verifier가 없어 토큰 교환이 거부됩니다.
      </figcaption>
    </figure>
  );
}
