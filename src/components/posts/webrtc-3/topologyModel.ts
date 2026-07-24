// mesh/SFU/MCU 대역폭·서버 부하 개념 모델.
//
// ⚠️ 교육용 단순화 모델입니다. 실제 프로덕션 SFU/MCU 구현의 정확한 수치를 재현하지 않습니다.
//
// 가정:
// - 참가자 1인당 발신 스트림 비트레이트는 동일(perStreamKbps)하다고 가정한다.
// - mesh: 각 참가자가 나머지 (N-1)명 모두에게 직접 스트림을 보낸다(RFC 7667 Point-to-Multipoint
//   Using Mesh). 업로드·다운로드 모두 (N-1)×perStreamKbps로 참가자 수에 비례해 늘어난다.
// - SFU: 각 참가자는 서버에 1회만 업로드하고(트랜스코딩 없이 라우팅), 서버는 (N-1)개 스트림을
//   그대로 전달한다. 업로드가 고정값이라는 것이 SFU의 핵심 이득이다 — 다운로드는 여전히 받아야
//   할 스트림 수(N-1)에 비례하지만, 실제로는 simulcast 계층 선택으로 각 스트림의 비트레이트를
//   낮출 수 있다(이 모델은 그 절감분을 단순화해 반영하지 않는다).
// - MCU: 각 참가자는 서버에 1회 업로드하고, 서버가 합성한 단일 스트림 1개만 받는다. 업로드·
//   다운로드 모두 참가자 수와 무관하게 고정이다.
// - 서버 연산 부하는 절대 CPU 수치가 아니라 **상대적 부하 점수**다. SFU는 트랜스코딩 없이 패킷을
//   포워딩만 하므로 참가자 수에 선형이되 가중치가 낮고(SFU_WEIGHT), MCU는 참가자마다 디코딩·
//   합성·재인코딩을 하므로 같은 N이라도 가중치가 훨씬 크다(MCU_WEIGHT). 두 가중치는 "SFU가
//   가볍고 MCU가 무겁다"는 구조적 방향성을 보여주기 위한 임의의 예시 상수다.

export type Topology = "mesh" | "sfu" | "mcu";

export interface TopologyLoad {
  uploadKbps: number;
  downloadKbps: number;
  serverLoadScore: number;
}

export interface TopologyResult {
  mesh: TopologyLoad;
  sfu: TopologyLoad;
  mcu: TopologyLoad;
}

const MCU_WEIGHT = 6; // 디코딩+합성+재인코딩 상대 가중치(임의 가정, 절대 수치 아님)
const SFU_WEIGHT = 1; // 트랜스코딩 없는 라우팅이라 참가자당 가중치가 낮음(임의 가정)

export function computeTopologyLoad(participants: number, perStreamKbps: number): TopologyResult {
  const n = Math.max(2, Math.round(participants));
  const others = n - 1;

  return {
    mesh: {
      uploadKbps: others * perStreamKbps,
      downloadKbps: others * perStreamKbps,
      serverLoadScore: 0,
    },
    sfu: {
      uploadKbps: perStreamKbps,
      downloadKbps: others * perStreamKbps,
      serverLoadScore: n * SFU_WEIGHT,
    },
    mcu: {
      uploadKbps: perStreamKbps,
      downloadKbps: perStreamKbps,
      serverLoadScore: n * MCU_WEIGHT,
    },
  };
}
