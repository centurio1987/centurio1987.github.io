/**
 * 데코 키트 — 자산 경로와 부품 카탈로그.
 *
 * 카탈로그 코드(T1·S3·M1…)는 시안에서 쓰던 이름 그대로다. "1a 히어로에 T6 크라프트로
 * 바꿔줘" 같은 지시가 코드에 바로 꽂히도록 유지한다. 화면 구현체는
 * src/components/deco/, 배치 규칙과 패턴은 design-concept/DECO_KIT.md.
 */

/**
 * 토니 다이컷 스티커(투명 배경, 원본 712×975 → 660px 폭).
 *
 * public/tony-deco.webp(장식이 구워진 1254² 합성물)에서 마스코트만 떼어낸 것이다.
 * 시안이 쓰던 tony-cutout.png / tony-sticker.png 는 들여오지 않았다 — 같은 그림이
 * PNG 로 1.7MB 더 늘어날 뿐이고, 흰 다이컷 테두리는 이미 합성물에 그려져 있다.
 */
export const TONY_DIECUT = "/images/deco/tony-diecut.webp";

/** 작은 자리(아바타·폴라로이드 안)용 컷아웃. 161×220 이라 ~160px 까지만 쓴다. */
export const TONY_CUTOUT = "/images/authors/tony-full.webp";

export type DecoGroup = "tape" | "sticker" | "doodle" | "clip" | "paper";

export interface DecoPart {
  /** 시안 카탈로그 코드 */
  code: string;
  /** 컴포넌트에 넘기는 variant 값 */
  variant: string;
  label: string;
  group: DecoGroup;
}

/** 카탈로그 — 쇼케이스(/design/deco)가 이 목록으로 그리드를 그린다. */
export const DECO_CATALOG: DecoPart[] = [
  { code: "T1", variant: "check", label: "체크 · 버터", group: "tape" },
  { code: "T2", variant: "stripe", label: "사선 스트라이프 · 핑크", group: "tape" },
  { code: "T3", variant: "vellum", label: "무지 벨럼 · 반투명", group: "tape" },
  { code: "T4", variant: "letter", label: "레터링 테이프", group: "tape" },
  { code: "T5", variant: "dot", label: "도트 테이프", group: "tape" },
  { code: "T6", variant: "kraft", label: "찢은 크라프트", group: "tape" },

  { code: "S1", variant: "speech", label: "말풍선 스티커", group: "sticker" },
  { code: "S2", variant: "ribbon", label: "리본 배너", group: "sticker" },
  { code: "S3", variant: "star", label: "별 스티커 3종", group: "sticker" },
  { code: "S4", variant: "diecut", label: "원형 다이컷", group: "sticker" },
  { code: "S5", variant: "tag", label: "택 라벨", group: "sticker" },
  { code: "S6", variant: "tony", label: "토니 다이컷", group: "sticker" },

  { code: "D1", variant: "sparkle", label: "반짝 (4각)", group: "doodle" },
  { code: "D2", variant: "heart", label: "하트", group: "doodle" },
  { code: "D3", variant: "arrow", label: "곡선 화살표", group: "doodle" },
  { code: "D4", variant: "wave", label: "물결 밑줄", group: "doodle" },
  { code: "D5", variant: "emphasis", label: "강조선 · 별표", group: "doodle" },
  { code: "D6", variant: "memo", label: "손글씨 메모", group: "doodle" },

  { code: "C1", variant: "clip", label: "종이 클립 · 집게", group: "clip" },
  { code: "M1", variant: "note", label: "포스트잇 메모", group: "clip" },
  { code: "M2", variant: "tab", label: "인덱스 탭", group: "clip" },
  { code: "F1", variant: "polaroid", label: "폴라로이드 프레임", group: "clip" },
  { code: "F2", variant: "mount", label: "사진 코너 마운트", group: "clip" },
  { code: "P1", variant: "stamp", label: "날짜 · 도장 스탬프", group: "clip" },
  { code: "P2", variant: "stub", label: "티켓 스텁", group: "clip" },
  { code: "B1", variant: "paper", label: "모눈 · 도트 · 노트 종이", group: "paper" },
];

/** 강도 프리셋 — [data-deco] 에 넣는 값과 그 뜻. */
export const DECO_INTENSITY = [
  { level: 1, name: "있는 듯 없는 듯", note: "티어 2 이상 전부 숨김" },
  { level: 2, name: "절제", note: "티어 2 반투명, 3·4 숨김" },
  { level: 3, name: "은근하게 (기본)", note: "티어 3 까지" },
  { level: 4, name: "넉넉히", note: "티어 4 까지" },
  { level: 5, name: "다이어리", note: "티어 4 + 각도·개수를 더" },
] as const;
