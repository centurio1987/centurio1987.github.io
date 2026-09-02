import { useState } from "react";

// VPN 위협모델 체험 — 터널을 켜고 끄면서 "누가 무엇을 보는가"를 관찰자별로 바꿔 본다.
// 교육 목표: VPN이 가리는 것은 '경로 관찰자에게 보이는 목적지'이고,
//            VPN 제공자와 종단(목적지 서비스)에게는 오히려 정보가 모인다는 것.

type Cell = { text: string; tone: "hidden" | "visible" | "partial" | "na" };

const ROWS = [
  "출발지 — 내 실제 IP",
  "목적지 — 접속하는 서비스",
  "통신 내용",
  "방문 도메인(이름)",
  "나를 개인으로 특정",
] as const;

type Observer = {
  id: string;
  label: string;
  hint: string;
  off: Cell[];
  on: Cell[];
};

const OBSERVERS: Observer[] = [
  {
    id: "path",
    label: "카페 와이파이 · ISP",
    hint: "내 회선과 목적지 사이 경로에 앉은 관찰자",
    off: [
      { text: "보임 — 내 회선이 곧 나다", tone: "visible" },
      { text: "보임 — IP 헤더 목적지 그대로", tone: "visible" },
      { text: "HTTPS면 암호문 (TLS가 가림)", tone: "partial" },
      { text: "보임 — DNS 질의와 TLS SNI", tone: "visible" },
      { text: "가입자 정보로 이미 특정됨", tone: "visible" },
    ],
    on: [
      { text: "보임 — 내 회선이 곧 나다", tone: "visible" },
      { text: "VPN 게이트웨이 하나만 보임", tone: "hidden" },
      { text: "암호문 (터널이 한 겹 더 덮음)", tone: "hidden" },
      { text: "안 보임 (DNS가 터널 밖으로 새면 보임 — EP7)", tone: "partial" },
      { text: "가입자 정보로 이미 특정됨", tone: "visible" },
    ],
  },
  {
    id: "provider",
    label: "VPN 게이트웨이 운영자",
    hint: "회사 VPN 장비 관리자 또는 상용 VPN 사업자",
    off: [
      { text: "경로에 없음", tone: "na" },
      { text: "경로에 없음", tone: "na" },
      { text: "경로에 없음", tone: "na" },
      { text: "경로에 없음", tone: "na" },
      { text: "경로에 없음", tone: "na" },
    ],
    on: [
      { text: "보임 — 터널을 여는 쪽이 나다", tone: "visible" },
      { text: "보임 — 겉포장을 벗기는 지점", tone: "visible" },
      { text: "HTTPS면 암호문, 평문 프로토콜이면 보임", tone: "partial" },
      { text: "보임 — 터널 안 DNS도 여기를 지난다", tone: "visible" },
      { text: "실제 IP + 계정이 한자리에 모임", tone: "visible" },
    ],
  },
  {
    id: "server",
    label: "목적지 서비스 서버",
    hint: "내가 접속하는 그 웹서비스의 종단",
    off: [
      { text: "보임 — 내 IP가 그대로 찍힘", tone: "visible" },
      { text: "자기 자신", tone: "na" },
      { text: "보임 — 종단이라 평문으로 복호", tone: "visible" },
      { text: "자기 자신", tone: "na" },
      { text: "로그인하면 특정", tone: "visible" },
    ],
    on: [
      { text: "게이트웨이 IP만 보임", tone: "hidden" },
      { text: "자기 자신", tone: "na" },
      { text: "보임 — 종단이라 평문으로 복호", tone: "visible" },
      { text: "자기 자신", tone: "na" },
      { text: "로그인하면 특정", tone: "visible" },
    ],
  },
  {
    id: "tracker",
    label: "페이지 안의 추적 스크립트",
    hint: "쿠키 · 브라우저 지문(fingerprint)",
    off: [
      { text: "IP는 부수 정보일 뿐", tone: "partial" },
      { text: "자기 자신", tone: "na" },
      { text: "보임 — 내 브라우저 안에서 실행", tone: "visible" },
      { text: "보임", tone: "visible" },
      { text: "쿠키·지문으로 특정", tone: "visible" },
    ],
    on: [
      { text: "IP만 바뀜 — 추적에 무의미", tone: "partial" },
      { text: "자기 자신", tone: "na" },
      { text: "보임 — 내 브라우저 안에서 실행", tone: "visible" },
      { text: "보임", tone: "visible" },
      { text: "쿠키·지문으로 특정 (VPN 무관)", tone: "visible" },
    ],
  },
];

// 시각 값은 토큰을 쓴다 (KAN-072-CPJCT1). fallback 은 tokens.css 값과 정확히 같다.
const INK = "var(--ink, #20264A)";
const MUTED = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const SUBTLE = "var(--subtle, #e8e2d6)";
const SURFACE = "var(--surface, #F8F3E8)";
const PANEL = "var(--surface-hi, #fffdf8)";
const PAPER = "var(--paper, #F3EEE4)";
const CORE = "var(--cat-architecture, #4E6CA8)";
const HAIR = "var(--stroke-hair, 1px)";

// 톤 팔레트는 (bg, fg) 가 짝이라 통째로 옮기거나 통째로 두거나다 — 네 bg 중 셋이
// --paper 로 눌려 초록·붉음·금색 구분이 사라지므로 KAN-072-CPJCT1 배치5 에서 멈췄다.
const TONE: Record<Cell["tone"], { bg: string; fg: string; mark: string }> = {
  hidden: { bg: "#e6ede4", fg: "#2f5238", mark: "가려짐" },
  visible: { bg: "#f6e3e3", fg: "#7a3232", mark: "보임" },
  partial: { bg: "#f7ecd8", fg: "#6d4f16", mark: "조건부" },
  na: { bg: "#efece5", fg: "#6b6357", mark: "해당 없음" },
};

export default function ObserverView() {
  const [tunnel, setTunnel] = useState(false);
  const [who, setWho] = useState(OBSERVERS[0].id);

  const observer = OBSERVERS.find((o) => o.id === who) ?? OBSERVERS[0];
  const cells = tunnel ? observer.on : observer.off;

  return (
    <figure
      style={{
        margin: "1.75rem 0",
        padding: "1rem",
        border: `${HAIR} solid ${BORDER}`,
        borderRadius: "var(--radius-sm)",
        background: SURFACE,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "var(--space-10)",
          marginBottom: "var(--space-12)",
        }}
      >
        <button
          type="button"
          onClick={() => setTunnel((v) => !v)}
          aria-pressed={tunnel}
          style={{
            padding: "var(--space-8) var(--space-14)",
            borderRadius: "var(--radius-sm)",
            border: `${HAIR} solid ${INK}`,
            background: tunnel ? CORE : PAPER,
            color: tunnel ? PANEL : INK,
            fontWeight: "var(--font-weight-bold)",
            cursor: "pointer",
          }}
        >
          {tunnel ? "터널 ON — VPN 연결됨" : "터널 OFF — 그냥 인터넷"}
        </button>
        <span style={{ fontSize: "var(--text-meta)", color: MUTED }}>
          버튼을 눌러 터널을 켜고 끈 뒤, 아래에서 관찰자를 바꿔 보십시오.
        </span>
      </div>

      <div
        role="group"
        aria-label="관찰자 선택"
        style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)", marginBottom: "var(--space-4)" }}
      >
        {OBSERVERS.map((o) => {
          const active = o.id === who;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setWho(o.id)}
              aria-pressed={active}
              style={{
                padding: "var(--space-6) var(--space-10)",
                borderRadius: "var(--btn-radius)",
                border: active ? `${HAIR} solid ${INK}` : "var(--stroke-hair) solid var(--border)",
                background: active ? INK : PANEL,
                color: active ? PANEL : "var(--ink)",
                fontSize: "var(--text-meta)",
                cursor: "pointer",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: "var(--text-meta)", color: MUTED, margin: "var(--space-8) 0 var(--space-12)" }}>
        {observer.hint}
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "var(--text-meta)",
          tableLayout: "fixed",
        }}
      >
        <caption style={{ captionSide: "top", textAlign: "left", padding: "0 0 var(--space-6)", fontSize: "var(--text-meta)", color: MUTED }}>
          {observer.label}가 볼 수 있는 것 — 터널 {tunnel ? "ON" : "OFF"}
        </caption>
        <tbody>
          {ROWS.map((row, i) => {
            const cell = cells[i];
            const tone = TONE[cell.tone];
            return (
              <tr key={row}>
                <th
                  scope="row"
                  style={{
                    textAlign: "left",
                    padding: "var(--space-8) var(--space-10)",
                    borderTop: `${HAIR} solid ${SUBTLE}`,
                    width: "42%",
                    fontWeight: "var(--font-weight-bold)",
                    color: INK,
                    verticalAlign: "top",
                  }}
                >
                  {row}
                </th>
                <td
                  style={{
                    padding: "var(--space-8) var(--space-10)",
                    borderTop: `${HAIR} solid ${SUBTLE}`,
                    verticalAlign: "top",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "var(--space-2) var(--space-8)",
                      marginRight: "var(--space-8)",
                      borderRadius: "var(--btn-radius)",
                      background: tone.bg,
                      color: tone.fg,
                      fontSize: "var(--text-label)",
                      fontWeight: "var(--font-weight-bold)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tone.mark}
                  </span>
                  <span style={{ color: INK }}>{cell.text}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <figcaption style={{ fontSize: "var(--text-meta)", color: MUTED, marginTop: "var(--space-10)", lineHeight: "var(--font-leading-ui)" }}>
        터널을 켜면 <strong>경로 관찰자</strong>에게서 목적지와 방문 도메인이 가려집니다. 그 정보는 사라지는 게 아니라{" "}
        <strong>VPN 게이트웨이 운영자</strong>의 칸으로 옮겨갑니다. 추적 스크립트 칸은 터널과 무관하게 그대로입니다.
      </figcaption>
    </figure>
  );
}
