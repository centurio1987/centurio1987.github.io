import { useState } from "react";

// 인증·인가 지도 — 여덟 좌표를 눌러 "어떤 질문에 답하는지", "무슨 기술이 사는지",
// "인접 좌표는 무엇인지"를 관찰한다. 인증 축·인가 축·상태(구현) 축을 색으로 구분한다.
//
// ⚠️ 교육용 개념 지도: 좌표와 인접 관계는 학습용 단순화이며, 특정 스펙(RFC/OIDC 등)의
//   형식 정의가 아니다. "OAuth는 인가, OIDC는 페더레이션" 같은 관계의 큰 그림을 잡기 위한 것.

type Axis = "authn" | "authz" | "state";

type Coord = {
  id: string;
  label: string;
  axis: Axis;
  question: string;
  tech: string;
  neighbors: string[];
};

const AXIS: Record<Axis, { label: string; color: string; bg: string }> = {
  authn: { label: "인증 축 · 누구인가", color: "#3e6b6b", bg: "#e5f0ed" },
  authz: { label: "인가 축 · 해도 되나", color: "#A84B4B", bg: "#f4e3e0" },
  state: { label: "상태·구현 축", color: "#4E6CA8", bg: "#e4e9f3" },
};

const COORDS: Coord[] = [
  {
    id: "identification",
    label: "식별",
    axis: "authn",
    question: "너는 누구라고 주장하는가?",
    tech: "사용자 ID, 이메일 — 계정을 가리키는 이름표",
    neighbors: ["authentication"],
  },
  {
    id: "authentication",
    label: "인증",
    axis: "authn",
    question: "그 주장을 증명할 수 있는가?",
    tech: "비밀번호, MFA, Passkey / WebAuthn, Kerberos",
    neighbors: ["identification", "session", "token", "federation"],
  },
  {
    id: "authorization",
    label: "인가",
    axis: "authz",
    question: "그래서 이 행위를 해도 되는가?",
    tech: "RBAC · ABAC · ReBAC, OAuth scope",
    neighbors: ["delegation", "policy"],
  },
  {
    id: "delegation",
    label: "위임",
    axis: "authz",
    question: "내 권한 일부를 앱에 맡겨도 되나?",
    tech: "OAuth 2.0 access token (무엇을 할 수 있는가)",
    neighbors: ["authorization", "federation", "token"],
  },
  {
    id: "federation",
    label: "페더레이션",
    axis: "authn",
    question: "다른 곳(IdP)의 로그인을 믿어도 되나?",
    tech: "OIDC ID Token, SAML 어서션 (누가 로그인했나)",
    neighbors: ["authentication", "delegation"],
  },
  {
    id: "session",
    label: "세션",
    axis: "state",
    question: "로그인 상태를 서버가 기억한다 (stateful)",
    tech: "세션 ID + 쿠키 + 서버측 저장소(Redis)",
    neighbors: ["authentication", "token"],
  },
  {
    id: "token",
    label: "토큰(자체 포함)",
    axis: "state",
    question: "로그인 상태를 토큰 스스로 증명한다 (stateless)",
    tech: "JWT — 서명·표준 클레임으로 검증 (opaque 토큰은 introspection)",
    neighbors: ["authentication", "session", "delegation"],
  },
  {
    id: "policy",
    label: "정책",
    axis: "authz",
    question: "인가 규칙을 어디에 둘 것인가?",
    tech: "PDP(결정)/PEP(강제), OPA · Rego, deny-by-default",
    neighbors: ["authorization"],
  },
];

const byId = (id: string) => COORDS.find((c) => c.id === id)!;

export default function AuthzMap() {
  const [selectedId, setSelectedId] = useState<string>("delegation");
  const selected = byId(selectedId);
  const neighborIds = new Set(selected.neighbors);

  const cardStyle = (c: Coord): React.CSSProperties => {
    const isSelected = c.id === selectedId;
    const isNeighbor = neighborIds.has(c.id);
    const axis = AXIS[c.axis];
    return {
      padding: "10px 12px",
      border: isSelected ? `2px solid ${axis.color}` : `1px solid #c9c1b1`,
      borderRadius: 8,
      background: isSelected ? axis.bg : isNeighbor ? "#fffdf8" : "#f3efe6",
      opacity: isSelected || isNeighbor ? 1 : 0.82,
      color: "#302d28",
      cursor: "pointer",
      textAlign: "left",
      lineHeight: 1.4,
      transition: "background 0.15s, border 0.15s",
    };
  };

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
      <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#302d28" }}>
        좌표를 눌러 무슨 질문에 답하는지, 어떤 기술이 사는지, 인접 좌표는 무엇인지 확인하세요.
      </p>

      {/* 축 범례 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "8px 0 14px" }}>
        {(Object.keys(AXIS) as Axis[]).map((a) => (
          <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#4a463f" }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: AXIS[a].color,
                display: "inline-block",
              }}
            />
            {AXIS[a].label}
          </span>
        ))}
      </div>

      {/* 좌표 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {COORDS.map((c) => (
          <button
            type="button"
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            aria-pressed={c.id === selectedId}
            style={cardStyle(c)}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 2,
                  background: AXIS[c.axis].color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <strong>{c.label}</strong>
            </span>
          </button>
        ))}
      </div>

      {/* 상세 패널 */}
      <div
        role="status"
        style={{
          padding: 14,
          border: "1px solid #c9c1b1",
          borderRadius: 8,
          background: "#fffdf8",
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: "0 0 8px" }}>
          <strong style={{ color: AXIS[selected.axis].color, fontSize: 17 }}>{selected.label}</strong>{" "}
          <span style={{ fontSize: 12, color: "#6b6357" }}>· {AXIS[selected.axis].label}</span>
        </p>
        <p style={{ margin: "0 0 6px", fontSize: 15 }}>
          <strong>질문:</strong> {selected.question}
        </p>
        <p style={{ margin: "0 0 6px", fontSize: 14, color: "#4a463f" }}>
          <strong>여기 사는 기술:</strong> {selected.tech}
        </p>
        <p style={{ margin: 0, fontSize: 14, color: "#4a463f" }}>
          <strong>인접 좌표:</strong>{" "}
          {selected.neighbors.map((n, i) => (
            <span key={n}>
              {i > 0 && ", "}
              <button
                type="button"
                onClick={() => setSelectedId(n)}
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  color: AXIS[byId(n).axis].color,
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: 14,
                }}
              >
                {byId(n).label}
              </button>
            </span>
          ))}
        </p>
      </div>

      <figcaption style={{ fontSize: 13, color: "#6b6357", marginTop: 10, lineHeight: 1.55 }}>
        교육용 개념 지도입니다. 좌표와 인접 관계는 큰 그림을 잡기 위한 학습용 단순화이며, 특정 스펙(RFC·OIDC
        등)의 형식 정의가 아닙니다. 색은 인증(누구인가)·인가(해도 되나)·상태(구현) 세 축을 구분합니다.
      </figcaption>
    </figure>
  );
}
