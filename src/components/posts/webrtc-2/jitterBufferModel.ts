// jitter buffer 랩의 순수 계산 모델. 교육용 단순화 — libwebrtc의 NetEQ를 재현하지 않는다.
//
// 실제 NetEQ는 10ms마다 Normal/Accelerate/Preemptive Expand/Expand/Merge 중 하나를 골라 목표
// 지연(target delay)을 forgetting histogram 기반으로 계속 재계산한다(percentile 읽기). 이 모델은
// "target delay를 고정값으로 두고, 그 예산 안에서 패킷이 제때 도착하는가"만 단순화해 보여준다.
// 도착이 재생 시각(playout deadline)보다 늦으면 PLC(패킷 손실 은닉)로 대체된다고 가정한다.

export type JitterLevel = "low" | "medium" | "high";

export interface Packet {
  seq: number;
  sendTime: number; // ms, 스트림 시작 기준
  arrivalTime: number; // ms, 스트림 시작 기준 (네트워크 지연+지터 반영)
}

export interface PlayoutResult extends Packet {
  playoutTime: number; // ms, 이 패킷이 재생되는(또는 재생되어야 했던) 시각
  status: "on-time" | "concealed"; // concealed = 재생 시각까지 도착 못해 PLC로 대체
  headroomMs: number; // playoutTime - arrivalTime (양수=여유, 음수=지각)
  reordered: boolean; // 도착 순서가 시퀀스 순서와 달랐는가(참고용 표시)
}

export const PACKET_INTERVAL_MS = 20; // 20ms 프레임 패킷화(예: Opus 20ms)
export const BASE_NETWORK_DELAY_MS = 60; // 편도 기본 전파+처리 지연(고정, 단순화)
export const PACKET_COUNT = 16;

const JITTER_STDDEV_MS: Record<JitterLevel, number> = {
  low: 8,
  medium: 25,
  high: 55,
};

export const JITTER_LEVEL_LABEL: Record<JitterLevel, string> = {
  low: "낮음 (안정된 망)",
  medium: "보통 (일반 인터넷)",
  high: "높음 (혼잡·모바일 전환 등)",
};

// 결정론적 의사난수(시드 고정) — 서버/클라이언트 초기 렌더가 항상 같은 값을 내도록 함(hydration mismatch 방지).
function mulberry32(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 평균 0, 근사 표준편차 stddev — 세 개의 균등분포 합(Irwin-Hall류)으로 정규분포를 근사해
// 극단값을 완화한다(진짜 가우시안일 필요는 없음, 교육용 시각화 목적).
function approxNormal(rand: () => number, stddev: number): number {
  const u = rand() + rand() + rand() - 1.5; // 평균 0, 분산 0.75
  return u * stddev * (2 / Math.sqrt(3));
}

export function generatePackets(level: JitterLevel, seed: number): Packet[] {
  const rand = mulberry32(seed);
  const stddev = JITTER_STDDEV_MS[level];
  const packets: Packet[] = [];
  for (let i = 0; i < PACKET_COUNT; i++) {
    const sendTime = i * PACKET_INTERVAL_MS;
    const noise = approxNormal(rand, stddev);
    const arrivalTime = Math.max(0, sendTime + BASE_NETWORK_DELAY_MS + noise);
    packets.push({ seq: i + 1, sendTime, arrivalTime });
  }
  return packets;
}

export function simulatePlayout(packets: Packet[], targetDelayMs: number): PlayoutResult[] {
  if (packets.length === 0) return [];
  const playoutStart = packets[0].sendTime + BASE_NETWORK_DELAY_MS + targetDelayMs;

  // 도착 순서(시퀀스 기준 정렬 전) 랭크를 매겨 reordering 여부 판단.
  const arrivalOrder = [...packets].sort((a, b) => a.arrivalTime - b.arrivalTime).map((p) => p.seq);

  return packets.map((p, i) => {
    const playoutTime = playoutStart + i * PACKET_INTERVAL_MS;
    const headroomMs = playoutTime - p.arrivalTime;
    const status: PlayoutResult["status"] = headroomMs >= 0 ? "on-time" : "concealed";
    const reordered = arrivalOrder[i] !== p.seq;
    return { ...p, playoutTime, status, headroomMs, reordered };
  });
}

export function summarize(results: PlayoutResult[]) {
  const concealedCount = results.filter((r) => r.status === "concealed").length;
  const avgHeadroom =
    results.reduce((sum, r) => sum + Math.max(0, r.headroomMs), 0) / Math.max(1, results.length);
  const reorderedCount = results.filter((r) => r.reordered).length;
  return { concealedCount, avgHeadroom, reorderedCount, total: results.length };
}
