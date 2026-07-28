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
        border: "1px solid #d8d0c0",
        borderRadius: 10,
        background: "#faf7f1",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <button
          type="button"
          onClick={() => setTunnel((v) => !v)}
          aria-pressed={tunnel}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #20264a",
            background: tunnel ? "#4e6ca8" : "#f3efe6",
            color: tunnel ? "#ffffff" : "#20264a",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {tunnel ? "터널 ON — VPN 연결됨" : "터널 OFF — 그냥 인터넷"}
        </button>
        <span style={{ fontSize: 13, color: "#6b6357" }}>
          버튼을 눌러 터널을 켜고 끈 뒤, 아래에서 관찰자를 바꿔 보십시오.
        </span>
      </div>

      <div
        role="group"
        aria-label="관찰자 선택"
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}
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
                padding: "6px 10px",
                borderRadius: 999,
                border: active ? "1px solid #20264a" : "1px solid #cfc7b6",
                background: active ? "#20264a" : "#ffffff",
                color: active ? "#ffffff" : "#3c3a33",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 13, color: "#6b6357", margin: "8px 0 12px" }}>
        {observer.hint}
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
          tableLayout: "fixed",
        }}
      >
        <caption style={{ captionSide: "top", textAlign: "left", padding: "0 0 6px", fontSize: 13, color: "#6b6357" }}>
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
                    padding: "8px 10px",
                    borderTop: "1px solid #e3ddd0",
                    width: "42%",
                    fontWeight: 600,
                    color: "#3c3a33",
                    verticalAlign: "top",
                  }}
                >
                  {row}
                </th>
                <td
                  style={{
                    padding: "8px 10px",
                    borderTop: "1px solid #e3ddd0",
                    verticalAlign: "top",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      marginRight: 8,
                      borderRadius: 999,
                      background: tone.bg,
                      color: tone.fg,
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tone.mark}
                  </span>
                  <span style={{ color: "#3c3a33" }}>{cell.text}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <figcaption style={{ fontSize: 13, color: "#6b6357", marginTop: 10, lineHeight: 1.6 }}>
        터널을 켜면 <strong>경로 관찰자</strong>에게서 목적지와 방문 도메인이 가려집니다. 그 정보는 사라지는 게 아니라{" "}
        <strong>VPN 게이트웨이 운영자</strong>의 칸으로 옮겨갑니다. 추적 스크립트 칸은 터널과 무관하게 그대로입니다.
      </figcaption>
    </figure>
  );
}
