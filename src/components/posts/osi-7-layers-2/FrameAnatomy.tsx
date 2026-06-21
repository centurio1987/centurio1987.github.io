import { useState } from "react";

// Ethernet II 프레임의 각 field를 눌러 역할·크기를 확인하고,
// 802.1Q VLAN tag가 어디에 끼어드는지 토글로 관찰한다.

type Field = {
  id: string;
  label: string;
  bytes: string;
  color: string;
  desc: string;
  vlanOnly?: boolean;
};

const TEAL = "#3e6b6b";

const FIELDS: Field[] = [
  {
    id: "preamble",
    label: "Preamble + SFD",
    bytes: "7 + 1 B",
    color: "#cdbfa6",
    desc: "수신 NIC의 클럭을 송신 비트열에 맞춰 동기화하는 신호 구간. 엄밀히는 L1 영역이라 캡처 도구나 FCS 계산 범위에는 보통 잡히지 않는다.",
  },
  {
    id: "dst",
    label: "Destination MAC",
    bytes: "6 B",
    color: "#e8c97a",
    desc: "이 프레임을 받을 다음 장치의 L2 주소. 원격 서버가 아니라 '같은 링크의 다음 홉'(보통 기본 gateway) 주소다. 브로드캐스트면 ff:ff:ff:ff:ff:ff.",
  },
  {
    id: "src",
    label: "Source MAC",
    bytes: "6 B",
    color: "#dcc18a",
    desc: "보낸 장치의 MAC. 스위치는 이 값을 보고 '이 MAC은 이 port에 있다'를 학습한다. 앞 3바이트(OUI)는 제조사 식별자.",
  },
  {
    id: "vlan",
    label: "802.1Q Tag",
    bytes: "4 B",
    color: "#8fb8a8",
    desc: "VLAN ID(12bit)와 우선순위(PCP 3bit)를 담는다. TPID 0x8100로 시작해 '이 다음은 VLAN 태그'임을 알린다. access port에서는 보통 떼고, trunk port에서만 붙은 채 오간다.",
    vlanOnly: true,
  },
  {
    id: "ethertype",
    label: "EtherType",
    bytes: "2 B",
    color: "#bcd0c9",
    desc: "payload의 상위 protocol을 가리킨다. 0x0800=IPv4, 0x86DD=IPv6, 0x0806=ARP. 값이 1500 이하면 길이(Length) 필드로 해석하는 옛 규약도 있다.",
  },
  {
    id: "payload",
    label: "Payload",
    bytes: "46–1500 B",
    color: "#e2dccb",
    desc: "상위 계층 데이터(보통 IP packet). 46바이트보다 짧으면 패딩으로 채운다. 표준 상한 1500B가 곧 기본 MTU이며, jumbo frame은 이보다 크다.",
  },
  {
    id: "fcs",
    label: "FCS",
    bytes: "4 B",
    color: "#d9b896",
    desc: "Frame Check Sequence. CRC-32로 전송 중 비트 오류를 검출한다. 어긋나면 프레임을 조용히 버린다 — '재전송'은 L2가 아니라 상위(TCP)의 몫이다.",
  },
];

export default function FrameAnatomy() {
  const [vlan, setVlan] = useState(false);
  const [selected, setSelected] = useState<string>("dst");

  const visible = FIELDS.filter((f) => !f.vlanOnly || vlan);
  const active = visible.find((f) => f.id === selected) ?? visible[0];

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: "#302d28" }}>
          각 칸을 눌러 Ethernet II 프레임의 field를 뜯어보세요.
        </p>
        <label
          style={{
            fontSize: 13,
            color: "#302d28",
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={vlan}
            onChange={(e) => setVlan(e.target.checked)}
          />
          802.1Q VLAN tag 끼우기
        </label>
      </div>

      {/* 프레임 막대 */}
      <div style={{ display: "flex", width: "100%", overflow: "hidden", borderRadius: 6 }}>
        {visible.map((f) => {
          const isActive = f.id === active.id;
          return (
            <button
              type="button"
              key={f.id}
              onClick={() => setSelected(f.id)}
              aria-pressed={isActive}
              style={{
                flex: f.id === "payload" ? 3 : 1,
                minWidth: 0,
                padding: "12px 4px",
                border: isActive ? "2px solid #302d28" : "1px solid #fff",
                background: f.color,
                color: "#302d28",
                cursor: "pointer",
                fontSize: 11.5,
                lineHeight: 1.35,
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{f.label}</div>
              <div style={{ fontSize: 10.5, color: "#5c5648" }}>{f.bytes}</div>
            </button>
          );
        })}
      </div>
      <p style={{ margin: "6px 0 14px", fontSize: 12, color: "#6b6357", textAlign: "right" }}>
        ← 헤더 · 전송 방향 → · 꼬리(FCS)
      </p>

      {/* 설명 패널 */}
      <div
        role="status"
        style={{
          padding: 14,
          border: `1px solid ${active.color}`,
          borderLeft: `5px solid ${active.color}`,
          borderRadius: 8,
          background: "#fffdf8",
          lineHeight: 1.65,
        }}
      >
        <p style={{ margin: "0 0 6px" }}>
          <strong style={{ color: TEAL }}>{active.label}</strong>{" "}
          <span style={{ color: "#6b6357", fontSize: 13 }}>· {active.bytes}</span>
        </p>
        <p style={{ margin: 0, color: "#302d28" }}>{active.desc}</p>
      </div>

      <figcaption style={{ fontSize: 13, color: "#6b6357", marginTop: 12 }}>
        VLAN tag를 끼워 보세요. Source MAC과 EtherType <em>사이</em>에 4바이트가 비집고
        들어갑니다 — 그래서 태그된 프레임의 최대 크기는 1518에서 1522바이트로 커지고,
        이를 모르는 장비는 멀쩡한 프레임을 "너무 길다"며 버리기도 합니다.
      </figcaption>
    </figure>
  );
}
