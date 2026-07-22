import { useMemo, useState } from "react";

// PKCE 플로우 스테퍼 — Authorization Code + PKCE 흐름을 한 스텝씩 밟으며
// 어느 채널로 무슨 데이터가 오가는지 관찰한다. PKCE 끄기·코드 가로채기를 켜면
// 결과가 어떻게 달라지는지 보인다.
//
// ⚠️ 교육용 개념 모델: 실제 네트워크 요청·암호 연산을 수행하지 않는다. RFC 6749/7636의
//   흐름과 검증 규칙을 규칙으로 모사한다. verifier/challenge 값은 RFC 7636 부록 예시.

const TEAL = "#3e6b6b";
const RED = "#A84B4B";
const SAND = "#B07A2E";

type Channel = "internal" | "front" | "back";

type StepDef = {
  title: string;
  channel: Channel;
  data: (pkce: boolean) => string;
};

const CH: Record<Channel, { label: string; color: string }> = {
  internal: { label: "클라이언트 내부", color: "#6b6357" },
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
    padding: "8px 14px",
    border: "1px solid #c9c1b1",
    borderRadius: 8,
    background: disabled ? "#f3efe6" : "#fffdf8",
    color: disabled ? "#a9a294" : "#302d28",
    cursor: disabled ? "default" : "pointer",
    fontSize: 14,
  });
  const toggle = (on: boolean, danger = false): React.CSSProperties => ({
    padding: "6px 10px",
    border: on ? `2px solid ${danger ? RED : TEAL}` : "1px solid #c9c1b1",
    borderRadius: 7,
    background: on ? (danger ? "#f4e3e0" : "#e5f0ed") : "#fffdf8",
    color: "#302d28",
    cursor: "pointer",
    fontSize: 13,
  });

  return (
    <figure
      style={{
        margin: "2rem 0",
        padding: 18,
        border: "1px solid #d7d0c2",
        borderRadius: 12,
        background: "#fbf8f1",
      }}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
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
          padding: 14,
          border: "1px solid #c9c1b1",
          borderRadius: 8,
          background: "#fffdf8",
          minHeight: 120,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <strong style={{ fontSize: 16, color: "#302d28" }}>{step.title}</strong>
          <span
            style={{
              fontSize: 12,
              color: "#fffdf8",
              background: chInfo.color,
              padding: "2px 8px",
              borderRadius: 20,
            }}
          >
            {chInfo.label}
          </span>
        </div>
        <pre
          style={{
            margin: 0,
            fontSize: 12.5,
            lineHeight: 1.55,
            color: "#4a463f",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          {step.data(pkce)}
        </pre>
      </div>

      {intercept && (i >= 4) && attackOutcome && (
        <div
          role="status"
          style={{
            marginTop: 10,
            padding: 12,
            border: `1px solid ${attackOutcome.ok ? RED : TEAL}`,
            borderRadius: 8,
            background: attackOutcome.ok ? "#f7ebe9" : "#eaf1ee",
            fontSize: 13.5,
            lineHeight: 1.55,
            color: "#302d28",
          }}
        >
          <strong style={{ color: attackOutcome.ok ? RED : TEAL }}>
            {attackOutcome.ok ? "⚠ 공격 성공" : "✔ 공격 차단"}
          </strong>{" "}
          — {attackOutcome.text}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
        <button type="button" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} style={btn(i === 0)}>
          ◀ 이전
        </button>
        <span style={{ fontSize: 13, color: "#6b6357" }}>
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

      <figcaption style={{ fontSize: 13, color: "#6b6357", marginTop: 12, lineHeight: 1.55 }}>
        교육용 개념 모델입니다(실제 네트워크·암호 연산 없음). RFC 6749/7636의 흐름을 규칙으로 모사하며,
        verifier/challenge 값은 RFC 7636 부록의 예시입니다. "코드 가로채기"는 프론트채널로 돌아온 코드를 공격자가
        탈취한 상황을 가정합니다 — PKCE가 켜져 있으면 원본 code_verifier가 없어 토큰 교환이 거부됩니다.
      </figcaption>
    </figure>
  );
}
