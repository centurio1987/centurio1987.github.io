import { useState } from "react";

type Symptom = {
  id: string;
  label: string;
  layer: string;
  layerNo: number;
  why: string;
  command: string;
  healthy: string;
  broken: string;
  tip: string;
};

const symptoms: Symptom[] = [
  {
    id: "link",
    label: "링크 LED가 꺼져 있고 interface가 DOWN이다",
    layer: "L1 Physical",
    layerNo: 1,
    why: "신호 자체가 매체에 실리지 못하는 상태다. 상위 계층 설정은 아직 볼 차례가 아니다.",
    command: "ip link show",
    healthy: "state UP, 그리고 LOWER_UP (carrier 감지됨)",
    broken: "state DOWN 또는 NO-CARRIER — cable·transceiver·Wi-Fi association·가상 NIC 연결 문제",
    tip: "간헐적이면 error counter(`ip -s link`)의 CRC·carrier 증가량부터 본다. 케이블만 바꿔도 끝나는 일이 의외로 많다.",
  },
  {
    id: "neigh",
    label: "gateway가 ping되지 않고 neighbor가 INCOMPLETE다",
    layer: "L2 Data Link",
    layerNo: 2,
    why: "같은 링크의 다음 장치(보통 gateway)의 MAC을 못 알아내는 상태. ARP/Neighbor Discovery가 응답을 못 받고 있다.",
    command: "ip neigh show",
    healthy: "gateway IP 옆에 lladdr ...(MAC) REACHABLE",
    broken: "INCOMPLETE 또는 FAILED — ARP/ND 미응답, VLAN 불일치, wireless client isolation, switch port 차단",
    tip: "이 단계에서 DNS 서버를 바꾸는 것은 원인과 멀다. gateway가 같은 링크(on-link)로 잡히는지, 같은 VLAN인지부터 확인한다.",
  },
  {
    id: "route",
    label: "gateway는 되는데 외부 IP(예: 1.1.1.1)로 못 나간다",
    layer: "L3 Network",
    layerNo: 3,
    why: "링크는 살아 있으나 다른 네트워크로 가는 경로·주소가 어긋난 상태. default route나 NAT가 의심된다.",
    command: "ip route show; tracepath 1.1.1.1",
    healthy: "default via <gateway> 존재, tracepath가 hop마다 전진",
    broken: "default route 없음, 첫 hop 이후 정지, 또는 비대칭 경로 — NAT·방화벽·라우팅 설정 점검",
    tip: "ping 실패만으로 목적지가 죽었다고 단정하지 않는다. ICMP가 차단됐을 수 있으니 실제 service traffic도 함께 본다.",
  },
  {
    id: "port",
    label: "IP는 ping되는데 서비스 포트에 연결되지 않는다",
    layer: "L4 Transport",
    layerNo: 4,
    why: "host까지는 도달하지만 원하는 process의 port까지 transport 연결이 안 되는 상태. firewall이나 listen 여부 문제.",
    command: "nc -vz example.com 443",
    healthy: "succeeded! / Connected — SYN-ACK이 돌아옴",
    broken: "timeout(SYN만 나가고 무응답 → drop: 방화벽/라우팅/loss/과부하 후보), Connection refused(명시적 거절 RST → 보통 서버 미listen, 방화벽 REJECT도 가능)",
    tip: "refused와 timeout은 전혀 다른 단서다. refused는 '명시적 거절을 받았다', timeout은 '어딘가에서 조용히 삼켜졌다' — 다음에 볼 곳이 갈린다.",
  },
  {
    id: "tls",
    label: "연결은 되는데 인증서/TLS 오류가 난다",
    layer: "L6 Presentation",
    layerNo: 6,
    why: "패킷은 이미 잘 오가지만 양쪽이 bytes를 같은 의미로 해석·보호하지 못하는 상태. 인증서·SNI·시계 문제.",
    command: "curl -v https://example.com/",
    healthy: "SSL certificate verify ok, 기대한 hostname의 인증서",
    broken: "certificate has expired, hostname mismatch(SNI 오류), unknown CA — 인증서 체인·시스템 시계·SNI 확인",
    tip: "로컬 시계가 틀어지면 멀쩡한 인증서도 만료/미발효로 보인다. `date`부터 확인하는 습관이 시간을 아낀다.",
  },
  {
    id: "http",
    label: "TLS까지 멀쩡한데 503/404/타임아웃이 뜬다",
    layer: "L7 Application",
    layerNo: 7,
    why: "하위 전달은 모두 성공했고 application 의미에서 실패한 상태. '네트워크 문제'가 아니라 서버·라우팅·upstream 문제.",
    command: "curl -v https://example.com/ -o /dev/null",
    healthy: "HTTP/2 200, 기대한 본문",
    broken: "404(라우팅/경로), 503(upstream 다운/과부하), 응답 지연(백엔드 timeout) — application log를 본다",
    tip: "여기까지 왔으면 패킷은 죄가 없다. '인터넷이 안 돼요' 대신 '어느 책임의 실패'인지 말할 수 있어야 한다.",
  },
];

export default function LayerTriage() {
  const [selected, setSelected] = useState<string | null>(null);
  const active = symptoms.find((s) => s.id === selected) ?? null;

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
        지금 관찰한 증상을 고르면, 어느 계층부터 의심하고 무엇을 확인할지 짚어줍니다.
      </p>

      <div style={{ display: "grid", gap: 6 }}>
        {symptoms.map((s) => {
          const isActive = s.id === selected;
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => setSelected(s.id)}
              aria-pressed={isActive}
              style={{
                display: "grid",
                gridTemplateColumns: "3rem 1fr",
                gap: 10,
                alignItems: "center",
                textAlign: "left",
                padding: "10px 12px",
                border: isActive ? "2px solid #3e6b6b" : "1px solid #c9c1b1",
                borderRadius: 8,
                background: isActive ? "#e5f0ed" : "#fffdf8",
                color: "#302d28",
                cursor: "pointer",
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: "#3e6b6b" }}>L{s.layerNo}?</strong>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          role="status"
          style={{
            marginTop: 16,
            padding: 14,
            border: "1px solid #c9c1b1",
            borderRadius: 8,
            background: "#fffdf8",
            lineHeight: 1.65,
          }}
        >
          <p style={{ margin: "0 0 8px" }}>
            <strong style={{ color: "#3e6b6b" }}>의심 계층: {active.layer}</strong>
          </p>
          <p style={{ margin: "0 0 8px" }}>{active.why}</p>
          <p style={{ margin: "0 0 8px" }}>
            <strong>먼저 확인:</strong>{" "}
            <code
              style={{
                background: "#f1eadb",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              {active.command}
            </code>
          </p>
          <p style={{ margin: "0 0 6px" }}>
            ✅ <strong>정상</strong>: {active.healthy}
          </p>
          <p style={{ margin: "0 0 8px" }}>
            ❌ <strong>이상</strong>: {active.broken}
          </p>
          <p style={{ margin: 0, color: "#6b6357" }}>💡 {active.tip}</p>
        </div>
      ) : (
        <p style={{ marginTop: 14, marginBottom: 0, fontSize: 13, color: "#6b6357" }}>
          증상 하나를 눌러 보세요. 진단은 항상 <strong>아래(L1)에서 위(L7)로</strong> 좁혀가는 것이 안전합니다.
        </p>
      )}
    </figure>
  );
}
