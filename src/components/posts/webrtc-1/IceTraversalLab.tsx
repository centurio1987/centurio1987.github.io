import { useMemo, useState } from "react";
import {
  computeIce,
  type IceInput,
  type CandidateType,
  type NatMapping,
  type NatFiltering,
} from "./iceModel";

// ICE/NAT 트래버설 랩 — 토글로 네트워크 조건을 바꾸면 host/srflx/relay 후보 수집과
// "성사될 법한 경로"가 어떻게 달라지는지 관찰한다.
//
// ⚠️ 교육용 개념 모델: 실제 브라우저 ICE(RFC 8445) 구현·연결성 점검을 재현하지 않는다.
//   적용 산식과 한계는 ./iceModel.ts 주석 참조.

const typeColor: Record<CandidateType, string> = {
  host: "#3e6b6b", // teal — 직접
  srflx: "#4E6CA8", // blue — 흐름/공인 매핑
  relay: "#A84B4B", // red — 릴레이(비용/지연)
};

const typeLabel: Record<CandidateType, string> = {
  host: "host (사설 직결)",
  srflx: "srflx (STUN 공인 매핑)",
  relay: "relay (TURN 릴레이)",
};

export default function IceTraversalLab() {
  const [sameLan, setSameLan] = useState(false);
  const [udpBlocked, setUdpBlocked] = useState(false);
  const [stunReachable, setStunReachable] = useState(true);
  const [mapping, setMapping] = useState<NatMapping>("endpoint-independent");
  const [filtering, setFiltering] = useState<NatFiltering>("endpoint-independent");
  const [turn, setTurn] = useState<IceInput["turn"]>("udp");

  const input: IceInput = useMemo(
    () => ({ sameLan, udpBlocked, stunReachable, mapping, filtering, turn }),
    [sameLan, udpBlocked, stunReachable, mapping, filtering, turn],
  );
  const result = useMemo(() => computeIce(input), [input]);

  const toggleStyle = (on: boolean): React.CSSProperties => ({
    padding: "8px 12px",
    border: on ? "2px solid #3e6b6b" : "1px solid #c9c1b1",
    borderRadius: 8,
    background: on ? "#e5f0ed" : "#fffdf8",
    color: "#302d28",
    cursor: "pointer",
    fontSize: 13,
    textAlign: "left",
    lineHeight: 1.4,
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
      <p style={{ margin: "0 0 12px", fontWeight: 600, color: "#302d28" }}>
        네트워크 조건을 토글해 후보 수집과 경로 선택이 어떻게 달라지는지 보세요.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <button type="button" onClick={() => setSameLan((v) => !v)} aria-pressed={sameLan} style={toggleStyle(sameLan)}>
          같은 사설망(LAN)에 있다: <strong>{sameLan ? "예" : "아니오"}</strong>
        </button>
        <button
          type="button"
          onClick={() => setUdpBlocked((v) => !v)}
          aria-pressed={udpBlocked}
          style={toggleStyle(udpBlocked)}
        >
          경로의 UDP 차단: <strong>{udpBlocked ? "차단됨" : "허용"}</strong>
        </button>
        <button
          type="button"
          onClick={() => setStunReachable((v) => !v)}
          aria-pressed={stunReachable}
          style={toggleStyle(stunReachable)}
        >
          STUN 서버 도달: <strong>{stunReachable ? "가능" : "불가"}</strong>
        </button>
        <button
          type="button"
          onClick={() =>
            setMapping((m) => (m === "endpoint-independent" ? "address-dependent" : "endpoint-independent"))
          }
          aria-pressed={mapping === "address-dependent"}
          style={toggleStyle(mapping === "address-dependent")}
        >
          NAT 매핑: <strong>{mapping === "endpoint-independent" ? "endpoint-independent" : "address-dependent"}</strong>
        </button>
        <button
          type="button"
          onClick={() =>
            setFiltering((f) => (f === "endpoint-independent" ? "address-dependent" : "endpoint-independent"))
          }
          aria-pressed={filtering === "address-dependent"}
          style={toggleStyle(filtering === "address-dependent")}
        >
          NAT 필터링:{" "}
          <strong>{filtering === "endpoint-independent" ? "endpoint-independent" : "address-dependent"}</strong>
        </button>
        <button
          type="button"
          onClick={() =>
            setTurn((t) => (t === false ? "udp" : t === "udp" ? "tcp" : t === "tcp" ? "tls" : false))
          }
          aria-pressed={turn !== false}
          style={toggleStyle(turn !== false)}
        >
          TURN(릴레이): <strong>{turn === false ? "없음" : turn.toUpperCase()}</strong>
        </button>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {result.candidates.map((c) => (
          <div
            key={c.type}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(11rem, 0.5fr) 1fr",
              gap: 10,
              alignItems: "start",
              padding: "10px 12px",
              border: "1px solid #c9c1b1",
              borderRadius: 8,
              background: c.gathered ? "#fffdf8" : "#f3efe6",
              opacity: c.gathered ? 1 : 0.7,
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: typeColor[c.type] }}>
              {c.gathered ? "●" : "○"} {typeLabel[c.type]}
            </strong>
            <span style={{ fontSize: 13, color: "#4a463f" }}>{c.note}</span>
          </div>
        ))}
      </div>

      <div
        role="status"
        style={{
          marginTop: 14,
          padding: 14,
          border: "1px solid #c9c1b1",
          borderRadius: 8,
          background: "#fffdf8",
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: "0 0 6px" }}>
          <strong>이 모델이 추정하는 경로:</strong>{" "}
          {result.selected === "none" ? (
            <strong style={{ color: "#A84B4B" }}>연결 실패</strong>
          ) : (
            <strong style={{ color: typeColor[result.selected] }}>{typeLabel[result.selected]}</strong>
          )}
        </p>
        <p style={{ margin: 0, fontSize: 14 }}>{result.selectedReason}</p>
      </div>

      <figcaption style={{ fontSize: 13, color: "#6b6357", marginTop: 10, lineHeight: 1.55 }}>
        교육용 개념 모델입니다(브라우저 실제 ICE 구현 재현 아님). 산식: host&gt;srflx&gt;relay의 type
        preference로 단순화하고, srflx 성사는 "UDP 허용 + 매핑 endpoint-independent + 필터링 비대상의존"일 때만
        통한다고 가정합니다. {result.caveat}
      </figcaption>
    </figure>
  );
}
