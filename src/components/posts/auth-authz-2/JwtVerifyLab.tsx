import { useMemo, useState } from "react";

// JWT 서명 검증 랩 — alg·kid·exp·aud를 바꿔 가며 6단계 검증이 어느 단계에서 왜 막히는지 관찰한다.
//
// ⚠️ 교육용 개념 모델: 실제 암호 서명 연산을 수행하지 않는다. RFC 8725(BCP) 원칙에 따른 검증 순서
//   (alg 허용목록 → kid로 키 선택 → 서명 → iss → aud → exp/nbf)를 규칙으로 모사해 통과/거부를 판정한다.

type Alg = "RS256" | "none" | "HS256";
type Kid = "match" | "rotated" | "unknown";
type Exp = "valid" | "expired";
type Aud = "match" | "mismatch";

type Step = {
  n: number;
  name: string;
  ok: boolean;
  detail: string;
};

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
// 막힌 단계의 배경 — 그 줄의 ✘ 표시가 이미 --cat-strategy 라 같은 축의 더 옅은 단을 쓴다
// (유저 판정 2026-08-27 의 연장).
const STEP_FAIL_BG = "color-mix(in srgb, var(--cat-strategy) 9%, var(--surface-hi))";

function evaluate(
  alg: Alg,
  kid: Kid,
  exp: Exp,
  aud: Aud,
  weakVerifier: boolean,
): { steps: Step[]; verdict: "pass" | "fail" | "forged"; summary: string } {
  const steps: Step[] = [];

  // 1. alg 허용목록 (허용: RS256만)
  const algAllowed = alg === "RS256";
  const algPassesHere = algAllowed || weakVerifier;
  steps.push({
    n: 1,
    name: "alg 허용목록",
    ok: algPassesHere,
    detail: algAllowed
      ? "alg=RS256 — 허용 목록 통과."
      : weakVerifier
        ? alg === "none"
          ? "⚠️ 취약 검증기: alg=none을 그대로 신뢰 → 서명 검사 건너뜀(위조 통과)."
          : "⚠️ 취약 검증기: alg=HS256 혼동 → RSA 공개키를 HMAC 비밀키로 오용(위조 가능)."
        : alg === "none"
          ? "alg=none — 허용 목록에 없음. 거부(alg:none 공격 차단)."
          : "alg=HS256 — 비대칭 키에 대칭 알고리즘. 거부(alg confusion 차단).",
  });
  if (!algPassesHere) {
    return { steps, verdict: "fail", summary: "1/6단계에서 거부 — 허용하지 않은 alg." };
  }
  // 취약 검증기 + 비RS256 = 위조가 통과하는 경로
  if (weakVerifier && !algAllowed) {
    steps.push({ n: 2, name: "kid→키 선택", ok: false, detail: "취약 검증기가 서명을 우회 — 키 선택·서명 검증이 무의미." });
    return {
      steps,
      verdict: "forged",
      summary: "위조 통과 — 취약 검증기가 alg를 신뢰해 서명을 우회했습니다. 실제로 뚫리는 경우입니다.",
    };
  }

  // 2. kid → 신뢰한 JWKS에서 공개키 선택
  const keyFound = kid !== "unknown";
  steps.push({
    n: 2,
    name: "kid→키 선택",
    ok: keyFound,
    detail: keyFound
      ? kid === "rotated"
        ? "JWKS에 옛 kid가 남아 있어 매칭 성공(로테이션 중첩)."
        : "신뢰한 JWKS에서 kid로 공개키 매칭 성공."
      : "헤더 kid가 JWKS에 없음 → 검증할 키를 못 찾음. 거부.",
  });
  if (!keyFound) {
    return { steps, verdict: "fail", summary: "2/6단계에서 거부 — kid에 해당하는 공개키가 JWKS에 없음." };
  }

  // 3. 서명 검증 (키를 골랐고 alg가 허용되므로 통과)
  steps.push({ n: 3, name: "서명 검증", ok: true, detail: "선택한 공개키로 서명 검증 통과." });

  // 4. iss (이 모델에선 항상 신뢰 발급자로 가정)
  steps.push({ n: 4, name: "iss(발급자)", ok: true, detail: "iss가 신뢰하는 발급자와 일치." });

  // 5. aud
  const audOk = aud === "match";
  steps.push({
    n: 5,
    name: "aud(대상)",
    ok: audOk,
    detail: audOk
      ? "aud에 우리 식별자 포함 → 우리를 위한 토큰."
      : "aud가 우리가 아님 → 서명은 유효하지만 남의 토큰. 거부(1편의 사고 방지).",
  });
  if (!audOk) {
    return { steps, verdict: "fail", summary: "5/6단계에서 거부 — 서명은 유효하나 aud가 우리가 아님." };
  }

  // 6. exp/nbf
  const timeOk = exp === "valid";
  steps.push({
    n: 6,
    name: "exp/nbf(시간)",
    ok: timeOk,
    detail: timeOk ? "현재 시각이 exp 이전, nbf 이후 → 유효." : "현재 시각이 exp를 지남 → 만료. 거부.",
  });
  if (!timeOk) {
    return { steps, verdict: "fail", summary: "6/6단계에서 거부 — 토큰 만료(exp 경과)." };
  }

  return { steps, verdict: "pass", summary: "6단계 모두 통과 — 신뢰할 수 있는 토큰(그다음 scope·역할 인가는 별도)." };
}

export default function JwtVerifyLab() {
  const [alg, setAlg] = useState<Alg>("RS256");
  const [kid, setKid] = useState<Kid>("match");
  const [exp, setExp] = useState<Exp>("valid");
  const [aud, setAud] = useState<Aud>("match");
  const [weak, setWeak] = useState(false);

  const result = useMemo(() => evaluate(alg, kid, exp, aud, weak), [alg, kid, exp, aud, weak]);

  const groupStyle: React.CSSProperties = { display: "grid", gap: 4 };
  const optBtn = (on: boolean): React.CSSProperties => ({
    padding: "var(--space-6) var(--space-10)",
    border: on ? `var(--stroke-bold) solid ${TEAL}` : `var(--stroke-hair) solid ${BORDER}`,
    borderRadius: 7,
    background: on ? ACTIVE_TINT : PANEL,
    color: INK,
    cursor: "pointer",
    fontSize: 13,
  });
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: INK_SOFT };

  // `#8a5a00`(위조 통과 경고색)은 매핑표 밖이다 — 최근접 토큰이 --pop-ink 인데 ΔRGB 21.0 이고
  // 그쪽은 서브 CTA 의 진한 단이라 역할이 다르다. 판정 대기로 둔다 (KAN-072 배치6 S13).
  const verdictColor =
    result.verdict === "pass" ? TEAL : result.verdict === "forged" ? "#8a5a00" : RED;
  const verdictText =
    result.verdict === "pass" ? "✔ 검증 통과" : result.verdict === "forged" ? "⚠ 위조 통과(취약)" : "✘ 거부됨";

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
        토큰 조건을 바꿔, 6단계 검증이 어디서 막히는지 보세요.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div style={groupStyle}>
          <span style={label}>헤더 alg</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["RS256", "none", "HS256"] as Alg[]).map((a) => (
              <button type="button" key={a} onClick={() => setAlg(a)} aria-pressed={alg === a} style={optBtn(alg === a)}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <div style={groupStyle}>
          <span style={label}>kid</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(
              [
                ["match", "매칭"],
                ["rotated", "로테이션"],
                ["unknown", "없음"],
              ] as [Kid, string][]
            ).map(([k, t]) => (
              <button type="button" key={k} onClick={() => setKid(k)} aria-pressed={kid === k} style={optBtn(kid === k)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={groupStyle}>
          <span style={label}>exp(만료)</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(
              [
                ["valid", "유효"],
                ["expired", "만료"],
              ] as [Exp, string][]
            ).map(([e, t]) => (
              <button type="button" key={e} onClick={() => setExp(e)} aria-pressed={exp === e} style={optBtn(exp === e)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={groupStyle}>
          <span style={label}>aud(대상)</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(
              [
                ["match", "우리 앱"],
                ["mismatch", "남의 앱"],
              ] as [Aud, string][]
            ).map(([a, t]) => (
              <button type="button" key={a} onClick={() => setAud(a)} aria-pressed={aud === a} style={optBtn(aud === a)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setWeak((v) => !v)}
        aria-pressed={weak}
        style={{
          ...optBtn(weak),
          border: weak ? `var(--stroke-bold) solid ${RED}` : `var(--stroke-hair) solid ${BORDER}`,
          background: weak ? DANGER_TINT : PANEL,
          marginBottom: 14,
        }}
      >
        취약 검증기(헤더 alg를 그대로 신뢰): <strong>{weak ? "켜짐" : "꺼짐"}</strong>
      </button>

      <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
        {result.steps.map((s) => (
          <div
            key={s.n}
            style={{
              display: "grid",
              gridTemplateColumns: "2rem minmax(6rem, 0.4fr) 1fr",
              gap: 10,
              alignItems: "start",
              padding: "var(--space-8) var(--space-12)",
              border: `var(--stroke-hair) solid ${BORDER}`,
              borderRadius: 8,
              // 축을 살리면 짝이 안 깨진다 — 통과는 패널, 막힘은 전략 축의 옅은 단(Δ2.2).
              background: s.ok ? PANEL : STEP_FAIL_BG,
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: s.ok ? TEAL : RED }}>{s.ok ? "✔" : "✘"}{s.n}</strong>
            <strong style={{ fontSize: 13, color: INK }}>{s.name}</strong>
            <span style={{ fontSize: 13, color: INK_SOFT }}>{s.detail}</span>
          </div>
        ))}
      </div>

      <div
        role="status"
        style={{
          padding: 14,
          border: `var(--stroke-hair) solid ${verdictColor}`,
          borderRadius: 8,
          background: PANEL,
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: "0 0 var(--space-4)" }}>
          <strong style={{ color: verdictColor, fontSize: 16 }}>{verdictText}</strong>
        </p>
        <p style={{ margin: 0, fontSize: 14, color: INK_SOFT }}>{result.summary}</p>
      </div>

      <figcaption style={{ fontSize: 13, color: INK_SOFT, marginTop: 10, lineHeight: 1.55 }}>
        교육용 개념 모델입니다(실제 암호 연산 없음). RFC 8725의 검증 순서를 규칙으로 모사합니다. "취약 검증기"는
        헤더 alg를 그대로 신뢰하는 잘못된 구현으로, alg=none·HS256 혼동 시 위조가 통과하는 실제 취약점을 재현합니다.
      </figcaption>
    </figure>
  );
}
