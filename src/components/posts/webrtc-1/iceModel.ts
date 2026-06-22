// WebRTC Part 1 — ICE 경로 선택 "교육용 개념 모델" 순수 함수.
//
// ⚠️ 면책: 아래 로직은 브라우저의 실제 ICE 구현(RFC 8445)을 재현하지 않는다.
//   실제 후보 수집·연결성 점검(connectivity check)·우선순위 계산은 NAT의
//   mapping/filtering 동작 종류, OS, 방화벽 정책, 후보 타이밍에 따라 달라진다.
//   여기서는 "왜 host가 안 되면 srflx, 그것도 안 되면 relay로 떨어지는가"라는
//   직관만 단순화된 가정으로 보여준다.

export type NatMapping = "endpoint-independent" | "address-dependent";
export type NatFiltering = "endpoint-independent" | "address-dependent";

export type IceInput = {
  // 두 피어가 같은 LAN(사설망)에 있는가 → host 후보로 직결 가능
  sameLan: boolean;
  // 경로상 UDP가 막혀 있는가 (기업 방화벽 등)
  udpBlocked: boolean;
  // STUN 서버로 공인 매핑(srflx)을 발견할 수 있는가
  stunReachable: boolean;
  // NAT 매핑 동작: address-dependent면 대상마다 매핑이 달라져 srflx 재사용이 어려움
  mapping: NatMapping;
  // NAT 필터링 동작: address-dependent면 먼저 보낸 적 없는 출처의 인바운드를 차단
  filtering: NatFiltering;
  // TURN(릴레이) 사용 가능 여부와 전송 방식
  turn: false | "udp" | "tcp" | "tls";
};

export type CandidateType = "host" | "srflx" | "relay";

export type CandidateRow = {
  type: CandidateType;
  // RFC 8445의 type preference를 본뜬 "교육용" 우선순위(host>srflx>relay).
  // 실제 priority는 (2^24)*typePref + (2^8)*localPref + (256 - componentId)
  // 식으로 계산되지만, 여기서는 type 단계만 비교한다.
  typePreference: number;
  gathered: boolean;
  note: string;
};

export type IceResult = {
  candidates: CandidateRow[];
  // 모델이 "선택될 법한" 경로(설명용). 실제 nominated pair가 아니다.
  selected: CandidateType | "none";
  selectedReason: string;
  // 단정 회피용: 모델 한계 경고를 함께 노출
  caveat: string;
};

// host: 같은 LAN이면 사설 IP로 직접 닿을 수 있다.
function gatherHost(input: IceInput): CandidateRow {
  return {
    type: "host",
    typePreference: 126,
    gathered: true, // host 후보는 항상 수집된다(네트워크 인터페이스가 있으면).
    note: input.sameLan
      ? "두 피어가 같은 사설망 → host 후보 쌍이 바로 연결될 여지가 큽니다."
      : "host 후보는 수집되지만, 서로 다른 NAT 뒤라면 상대의 사설 IP로는 닿지 못합니다.",
  };
}

// srflx(server-reflexive): STUN으로 발견한 '내 공인 IP:포트'.
function gatherSrflx(input: IceInput): CandidateRow {
  const gathered = input.stunReachable && !input.udpBlocked;
  let note: string;
  if (!gathered) {
    note = input.udpBlocked
      ? "UDP가 막혀 STUN 바인딩 요청이 나가지 못해 srflx 수집에 실패합니다."
      : "STUN 서버에 도달하지 못해 공인 매핑을 알 수 없습니다.";
  } else if (input.mapping === "address-dependent" || input.filtering === "address-dependent") {
    note =
      "srflx를 수집했지만 NAT 매핑/필터링이 대상 의존적이라, STUN으로 본 매핑이 상대 피어에게 그대로 통하지 않을 수 있습니다.";
  } else {
    note = "공인 매핑이 대상과 무관하게 유지될 가능성이 높아 직접 경로(P2P) 성사 여지가 있습니다.";
  }
  return { type: "srflx", typePreference: 100, gathered, note };
}

// relay: TURN 서버가 양쪽 트래픽을 중계. 가장 확실하지만 비용·지연 부담.
function gatherRelay(input: IceInput): CandidateRow {
  const gathered = input.turn !== false;
  return {
    type: "relay",
    typePreference: 0,
    gathered,
    note: gathered
      ? `TURN(${(input.turn as string).toUpperCase()}) 릴레이 후보 확보 — 다른 경로가 모두 막혀도 마지막 보루입니다.`
      : "TURN 서버가 구성되지 않아 relay 후보가 없습니다 → 직접 경로가 막히면 연결에 실패합니다.",
  };
}

// 모델이 추정하는 "성사될 법한" 경로.
// 우선순위 높은 것부터, '이 모델의 가정 하에서' 통할 가능성이 있는 후보를 고른다.
function pickPath(input: IceInput, rows: CandidateRow[]): { selected: CandidateType | "none"; reason: string } {
  const host = rows.find((r) => r.type === "host");
  const srflx = rows.find((r) => r.type === "srflx");
  const relay = rows.find((r) => r.type === "relay");

  if (input.sameLan && host?.gathered) {
    return { selected: "host", reason: "같은 사설망이라 host 후보 쌍이 직접 연결될 가능성이 가장 높습니다." };
  }

  // 직접 경로(srflx)가 통하려면: srflx 수집 + UDP 가능 + 매핑/필터링이 우호적이어야 한다는
  // (단순화된) 가정을 둔다. 실제로는 양쪽 NAT 조합·홀펀칭 타이밍에 더 민감하다.
  const srflxFavorable =
    !!srflx?.gathered &&
    !input.udpBlocked &&
    input.mapping === "endpoint-independent" &&
    input.filtering !== "address-dependent";
  if (srflxFavorable) {
    return { selected: "srflx", reason: "NAT 매핑/필터링이 우호적이라 STUN으로 뚫은 직접 경로가 성사될 여지가 큽니다." };
  }

  if (relay?.gathered) {
    return {
      selected: "relay",
      reason:
        "직접 경로가 불확실하거나 막혀, 이 모델에서는 TURN 릴레이로 떨어집니다. (실제로는 srflx가 성공할 수도 있으니 단정 금지)",
    };
  }

  return {
    selected: "none",
    reason: "직접 경로가 막혔는데 TURN도 없어, 이 가정 하에서는 연결을 못 맺습니다.",
  };
}

export function computeIce(input: IceInput): IceResult {
  const candidates = [gatherHost(input), gatherSrflx(input), gatherRelay(input)];
  const { selected, reason } = pickPath(input, candidates);
  return {
    candidates,
    selected,
    selectedReason: reason,
    caveat:
      "이 표는 교육용 단순 모델입니다. 특히 '대칭 NAT면 무조건 relay'처럼 단정하지 마십시오 — 실제 성사 여부는 양쪽 NAT의 mapping/filtering 조합과 홀펀칭 타이밍, 방화벽 정책에 달려 있습니다.",
  };
}
