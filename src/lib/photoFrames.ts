/**
 * 사진 프레임 PF1~PF12 — 시안 "데코 키트"의 `PHOTO FRAME` 절을 들여온 표.
 *
 * 기존 부품(T·S·D·F·P…)이 **하나짜리 조각**이라면 이쪽은 **사진 한 장을 담는 액자**다.
 * 카탈로그의 F1(폴라로이드)·F2(코너 마운트)와 겹쳐 보이지만 격이 다르다 — F1·F2 는
 * 액자 부품 자체이고, PF1~PF12 는 그 부품에 테이프·집게·도장을 얹어 굳힌 **조합**이다.
 * 그래서 사는 곳도 `components/deco/patterns/` 다(TapedBoard·ClippedCard 와 같은 층).
 *
 * 이 표가 단일 소스다 — 부품(PhotoFrame.astro)도 카탈로그(/design/deco)도 여기를 읽는다.
 * `doodleMarks.ts` 와 같은 짜임이고, 이유도 같다: 목록이 두 곳에 있으면 한 곳만 고쳐진다.
 *
 * **비율(ratio)은 시안 사진 칸의 실측값이다.** 액자마다 담기는 그림의 성격이 달라서
 * (정사각 폴라로이드 · 가로로 긴 필름 컷 · 세로로 긴 인스탁스) 하나로 못 묶는다.
 * 쓰는 쪽이 `ratio` 로 덮을 수 있지만, 기본값은 시안대로 둔다.
 */

export type PhotoFrameVariant =
  | "polaroid-tape"
  | "taped-corners"
  | "scrapbook"
  | "film"
  | "pegged"
  | "kraft"
  | "crayon"
  | "diecut"
  | "instax"
  | "collage"
  | "vellum"
  | "stamped";

export interface PhotoFramePart {
  /** 시안 카탈로그 코드 */
  code: string;
  variant: PhotoFrameVariant;
  label: string;
  /**
   * 사진 칸 개수. 1 이면 기본 slot, 2 이상이면 named slot(`a`·`b`·`c`)으로 받는다 —
   * Astro 는 slot 자식을 순회하지 못해서, 여러 칸은 이름으로 가르는 수밖에 없다.
   */
  slots: 1 | 2 | 3;
  /** 시안 사진 칸의 세로/가로 */
  ratio: number;
  /**
   * 캡션 자리가 액자 구조의 일부인가. true 인 액자는 캡션을 비우면 아래 여백이
   * 빈 채로 남는다(폴라로이드가 그렇게 생긴 물건이라 여백을 접지 않는다).
   */
  caption: boolean;
  /** 이 액자가 무엇으로 만들어졌나 — 카탈로그 셀의 한 줄 주석 */
  note: string;
  /** 어떤 케이스에 쓸 수 있는가 — 아래 선택 로직이 읽는 값 */
  caps: PhotoFrameCaps;
}

/* ══ 선택 로직 ══════════════════════════════════════════════════════════════
 *
 * "어떤 케이스에 어떤 액자를 쓰나"를 사람 머리가 아니라 표가 정하게 한다. 액자가
 * 열둘이라 그때그때 고르면 같은 성격의 그림이 지면마다 다른 액자를 입는다 — 데코
 * 강도를 손잡이 하나로 접은 것과 같은 이유다.
 *
 * ── 축이 넷인 이유 ─────────────────────────────────────────────────────────
 * 액자를 떨어뜨리는 사유가 실제로 넷뿐이다. 칸 수가 안 맞거나(PF4 는 두 장), 비율이
 * 안 맞거나(PF8 원형·PF9 세로), 담긴 것을 건드리면 안 되거나, 지면이 감당 못 할 만큼
 * 시끄럽거나. 나머지(색·기울기·캡션)는 **탈락 사유가 아니라 취향**이라 축에 안 넣는다.
 *
 * ── 이 로직의 결론 하나 ────────────────────────────────────────────────────
 * `content: "diagram"` 은 **열두 종이 전부 탈락한다.** 사진 액자는 칸 비율이 고정이라
 * 담긴 것을 `object-fit: cover` 로 자르는데, 도식은 자르면 축 이름과 범례가 잘려 나가
 * 그림이 거짓말이 된다. 그래서 도식은 이 표가 아니라 **무늬만 물려받은 별도 계보**를
 * 쓴다(`VIZ_FRAME_LINEAGE` · `src/styles/viz-frame.css`). 액자를 고르다 막힌 게 아니라,
 * 고르는 과정이 "둘은 같은 물건이 아니다"를 증명한 것이다.
 */

/** 액자에 담기는 것의 성격. 무엇을 담느냐가 자를 수 있는지를 정한다. */
export type FrameContent =
  /** 사진 · 밈 · 움짤 — 가장자리가 잘려도 뜻이 안 상한다 */
  | "photo"
  /** 인물 컷아웃 — 얼굴이 가운데 있어야 하고 세로로 길다 */
  | "portrait"
  /** 도식 · 차트 — 글씨가 있어 **한 픽셀도 못 자른다** */
  | "diagram";

export type FrameOrient = "wide" | "square" | "tall";

/** 액자가 놓이는 자리. */
export type FrameSurface =
  /** 본문 흐름 안 — 읽는 눈이 지나가는 자리라 조용해야 한다 */
  | "body"
  /** 목록·카드 썸네일 — 여럿이 나란히 서므로 액자가 반복된다 */
  | "card"
  /** 여백 · 푸터 · 히어로 — 데코가 주인공이어도 되는 자리 */
  | "margin";

export interface PhotoFrameCaps {
  shape: "rect" | "circle";
  /** 담을 수 있는 비율 */
  holds: FrameOrient[];
  /**
   * 담긴 것을 칸 비율에 맞춰 자르는가. **열둘 다 true 다** — 사진 액자는 칸이 먼저
   * 있고 사진이 거기 맞춰 들어가는 물건이라서다. 그래도 필드로 두는 이유는 이게
   * 도식을 떨어뜨리는 사유라서, 값이 아니라 **사유가 보여야** 하기 때문이다.
   */
  crops: boolean;
  /**
   * 담긴 것 **위에** 구조적으로 뭔가 얹히는가. 티어로 접히는 장식(PF7 의 별,
   * PF12 의 도장)은 여기 안 센다 — 강도를 낮추면 사라지므로 구조가 아니다.
   * true 인 셋은 각각 테이프(PF2)·겹침(PF10)·캡션 밴드(PF11)가 액자의 정의다.
   */
  occludes: boolean;
  /** 시끄러움 1(조용)~4(요란). `data-deco` 강도와 같은 눈금으로 읽는다. */
  noise: 1 | 2 | 3 | 4;
  /** 어울리는 자리 */
  surfaces: FrameSurface[];
  /**
   * 같은 자리에 **여럿 나란히** 놓아도 되는가. 도장이 든 액자(PF12)만 false 다 —
   * `Stamp.astro` 가 이미 못 박아 둔 규칙이다: "목록의 모든 줄에 찍으면 도장의 뜻
   * (= 이것만 특별)이 사라진다." 액자를 하나만 볼 때는 몰라도 목록에서는 규칙이 된다.
   */
  repeatable: boolean;
}

export const PHOTO_FRAMES: PhotoFramePart[] = [
  {
    code: "PF1",
    variant: "polaroid-tape",
    label: "폴라로이드 + 마테",
    slots: 1,
    ratio: 1,
    caption: true,
    note: "F1 에 T2 한 장을 위에 물린 것",
    caps: {
      shape: "rect",
      holds: ["wide", "square", "tall"],
      crops: true,
      occludes: false,
      noise: 2,
      surfaces: ["body", "card", "margin"],
      repeatable: true,
    },
  },
  {
    code: "PF2",
    variant: "taped-corners",
    label: "네 모서리 마테",
    slots: 1,
    ratio: 0.75,
    caption: false,
    note: "판 없이 T1·T4·T5·T2 네 장이 사진을 직접 문다",
    caps: {
      shape: "rect",
      holds: ["wide", "square"],
      crops: true,
      occludes: true,
      noise: 3,
      surfaces: ["card", "margin"],
      repeatable: true,
    },
  },
  {
    code: "PF3",
    variant: "scrapbook",
    label: "코너 마운트 · 스크랩북",
    slots: 1,
    ratio: 0.733,
    caption: false,
    note: "B1 도트 종이 + F2 — 사진을 하나도 안 가린다",
    caps: {
      shape: "rect",
      holds: ["wide", "square", "tall"],
      crops: true,
      occludes: false,
      noise: 1,
      surfaces: ["body", "card", "margin"],
      repeatable: true,
    },
  },
  {
    code: "PF4",
    variant: "film",
    label: "필름 스트립 2컷",
    slots: 2,
    ratio: 0.44,
    caption: false,
    note: "두 컷이 한 줄로 이어진다 — 시간 순서가 있는 짝에",
    caps: {
      shape: "rect",
      holds: ["wide"],
      crops: true,
      occludes: false,
      noise: 3,
      surfaces: ["body", "margin"],
      repeatable: true,
    },
  },
  {
    code: "PF5",
    variant: "pegged",
    label: "마 실 + 나무 집게",
    slots: 1,
    ratio: 0.747,
    caption: false,
    note: "W1 + W2 — 매단 것으로 읽힌다",
    caps: {
      shape: "rect",
      holds: ["wide", "square", "tall"],
      crops: true,
      occludes: false,
      noise: 2,
      surfaces: ["margin"],
      repeatable: true,
    },
  },
  {
    code: "PF6",
    variant: "kraft",
    label: "찢은 크라프트",
    slots: 1,
    ratio: 0.738,
    caption: true,
    note: "네 변이 다 찢겨 있다 — 오려 붙인 조각",
    caps: {
      shape: "rect",
      holds: ["wide", "square"],
      crops: true,
      occludes: false,
      noise: 2,
      surfaces: ["body", "margin"],
      repeatable: true,
    },
  },
  {
    code: "PF7",
    variant: "crayon",
    label: "크레용 두들 테두리",
    slots: 1,
    ratio: 0.77,
    caption: false,
    note: "종이가 아니라 손으로 두른 선이 액자다",
    caps: {
      shape: "rect",
      holds: ["wide", "square", "tall"],
      crops: true,
      occludes: false,
      noise: 2,
      surfaces: ["body", "margin"],
      repeatable: true,
    },
  },
  {
    code: "PF8",
    variant: "diecut",
    label: "원형 다이컷 스티커",
    slots: 1,
    ratio: 1,
    caption: false,
    note: "유일한 원형 — 가로로 긴 그림은 잘린다",
    caps: {
      shape: "circle",
      holds: ["square"],
      crops: true,
      occludes: false,
      noise: 3,
      surfaces: ["card", "margin"],
      repeatable: true,
    },
  },
  {
    code: "PF9",
    variant: "instax",
    label: "인스탁스 + 인덱스 탭",
    slots: 1,
    ratio: 1.2,
    caption: true,
    note: "유일한 세로 액자 + M2 탭으로 묶음을 표시",
    caps: {
      shape: "rect",
      holds: ["tall"],
      crops: true,
      occludes: false,
      noise: 2,
      surfaces: ["card", "margin"],
      repeatable: true,
    },
  },
  {
    code: "PF10",
    variant: "collage",
    label: "겹친 콜라주 3장",
    slots: 3,
    ratio: 0.81,
    caption: false,
    note: "세 장이 겹친다 — 한 장을 크게 볼 자리가 아니다",
    caps: {
      shape: "rect",
      holds: ["wide", "square"],
      crops: true,
      occludes: true,
      noise: 4,
      surfaces: ["margin"],
      repeatable: true,
    },
  },
  {
    code: "PF11",
    variant: "vellum",
    label: "벨럼 캡션 + 말풍선",
    slots: 1,
    ratio: 0.816,
    caption: true,
    note: "캡션이 사진 위에 반투명으로 얹히는 유일한 액자",
    caps: {
      shape: "rect",
      holds: ["wide", "square"],
      crops: true,
      occludes: true,
      noise: 3,
      surfaces: ["body", "margin"],
      repeatable: true,
    },
  },
  {
    code: "PF12",
    variant: "stamped",
    label: "도장 + 날짜 스탬프",
    slots: 1,
    ratio: 0.862,
    caption: false,
    note: "P1 둘 — 액자보다 '찍은 날'이 주인공",
    caps: {
      shape: "rect",
      holds: ["wide", "square", "tall"],
      crops: true,
      occludes: false,
      noise: 2,
      surfaces: ["body", "card", "margin"],
      repeatable: false,
    },
  },
];

/* ── 고르기 ───────────────────────────────────────────────────────────────── */

export interface FrameCase {
  /** 무엇을 담나 */
  content: FrameContent;
  /** 몇 장 */
  count?: 1 | 2 | 3;
  /** 담기는 것의 비율 */
  orient?: FrameOrient;
  /** 어디에 놓나 */
  surface: FrameSurface;
  /**
   * 이 자리가 감당하는 시끄러움의 상한(1~4). 지면의 `data-deco` 강도와 같은 눈금이라
   * 그 값을 그대로 넘기면 된다. 안 넘기면 자리에서 뽑는다 — body 2 · card 3 · margin 4.
   */
  noise?: 1 | 2 | 3 | 4;
  /**
   * 같은 액자가 이 자리에 **여러 번** 나오는가. 안 넘기면 자리에서 뽑는다 —
   * card 는 목록이라 항상 true, body 도 한 글에 그림이 여럿이라 true, margin 만 false.
   */
  repeats?: boolean;
}

const DEFAULT_NOISE: Record<FrameSurface, 1 | 2 | 3 | 4> = {
  body: 2,
  card: 3,
  margin: 4,
};

const DEFAULT_REPEATS: Record<FrameSurface, boolean> = {
  body: true,
  card: true,
  margin: false,
};

/** 왜 떨어졌는지. 카탈로그가 "안 쓴 것"과 "못 쓰는 것"을 갈라 보여줄 때 쓴다. */
export type FrameReject =
  | "slots"
  | "orient"
  | "crops"
  | "occludes"
  | "noise"
  | "surface"
  | "repeat";

export interface FrameVerdict {
  frame: PhotoFramePart;
  /** 비어 있으면 통과 */
  rejects: FrameReject[];
}

/**
 * 케이스 하나를 열두 액자에 전부 대 본다. 통과·탈락과 **탈락 사유**를 함께 돌려준다 —
 * 통과한 것만 돌려주면 "왜 이건 안 되나"를 다음 사람이 다시 추론해야 한다.
 * 순서는 카탈로그 순(PF1→PF12)이고, 통과한 것의 우선순위는 `pickPhotoFrames` 가 매긴다.
 */
export function judgePhotoFrames(c: FrameCase): FrameVerdict[] {
  const count = c.count ?? 1;
  const orient = c.orient ?? "wide";
  const noise = c.noise ?? DEFAULT_NOISE[c.surface];
  const repeats = c.repeats ?? DEFAULT_REPEATS[c.surface];

  return PHOTO_FRAMES.map((frame) => {
    const { caps } = frame;
    const rejects: FrameReject[] = [];

    if (frame.slots !== count) rejects.push("slots");
    if (!caps.holds.includes(orient)) rejects.push("orient");
    // 도식은 자를 수도 가릴 수도 없다 — 이 둘이 열두 종을 전부 떨어뜨린다.
    if (c.content === "diagram" && caps.crops) rejects.push("crops");
    if (c.content === "diagram" && caps.occludes) rejects.push("occludes");
    // 인물은 얼굴이 가운데 있어야 해서 위를 덮는 액자를 못 쓴다.
    if (c.content === "portrait" && caps.occludes) rejects.push("occludes");
    if (caps.noise > noise) rejects.push("noise");
    if (!caps.surfaces.includes(c.surface)) rejects.push("surface");
    if (repeats && !caps.repeatable) rejects.push("repeat");

    return { frame, rejects };
  });
}

/**
 * 통과한 액자를 **쓸 만한 순서로** 돌려준다. 정렬 기준은 하나뿐이다 — **조용한 것이
 * 먼저다.** 상한을 넘지 않는 한 시끄러운 쪽이 나을 이유가 없고, 여러 개가 나란히 서는
 * 자리(카드 목록)에서는 조용한 쪽이 반복을 견딘다. 같으면 카탈로그 순으로 끊는다
 * (무작위로 고르면 같은 케이스가 빌드마다 다른 액자를 입는다).
 */
export function pickPhotoFrames(c: FrameCase): PhotoFramePart[] {
  return judgePhotoFrames(c)
    .filter((v) => v.rejects.length === 0)
    .map((v) => v.frame)
    .sort((a, b) => a.caps.noise - b.caps.noise);
}

/** 첫 번째 후보 하나. 쓸 수 있는 액자가 없으면 `null` — 그 자리는 액자를 안 씌운다. */
export function pickPhotoFrame(c: FrameCase): PhotoFramePart | null {
  return pickPhotoFrames(c)[0] ?? null;
}

/**
 * 로직을 돌려 굳힌 케이스들. 이게 곧 "어디에 무엇을 쓰나"의 답이고, 카탈로그
 * (/design/deco)가 이 표를 그대로 그린다 — 문서에 손으로 적으면 로직과 갈린다.
 *
 * 지면은 이 저장소에 **실재하는 것만** 적는다. 안 쓰는 케이스를 미리 적어 두면
 * 액자가 붙은 적 없는 자리에 규칙만 남는다.
 */
export const FRAME_CASES: { where: string; note: string; case: FrameCase }[] = [
  {
    where: "본문 밈 · 움짤",
    note: "meme-inserter 가 넣는 그림. 문단 사이에 앉으므로 가장 조용해야 한다",
    case: { content: "photo", surface: "body", orient: "wide" },
  },
  {
    where: "시리즈 에피소드 썸네일",
    note: "여럿이 나란히 서는 카드 — 액자가 반복되는 자리",
    case: { content: "photo", surface: "card", orient: "wide" },
  },
  {
    where: "푸터 저자 라인업",
    note: "유저 지시로 이미 W1+W2+F1(= PF5 계보)로 굳어 있다 — 로직은 그 선택이 규칙 안인지만 확인한다(PF5 통과)",
    case: { content: "portrait", surface: "margin", orient: "tall" },
  },
  {
    where: "본문 viz 도식",
    note: "열두 종이 전부 탈락한다 — 아래 viz 계보로 간다",
    case: { content: "diagram", surface: "body", orient: "wide" },
  },
];

/**
 * 도식으로 내려간 계보 — 사진 액자에서 **무늬만** 물려받은 것들이다.
 *
 * 위 로직이 도식을 전부 떨어뜨렸으므로 `PhotoFrame` 을 그대로 쓸 수 없다. 대신 액자의
 * 생김새(판·테이프·코너·찢은 종이)를 `src/styles/viz-frame.css` 로 옮겨 **비율을 안
 * 강제하는** 형태로 다시 짰다 — 높이를 그림에서 되뽑고, 담긴 것 위에 아무것도 안 얹는다.
 * 부품을 못 부르는 이유는 하나 더 있다: 데코 부품은 전부 `.astro` 라 React 트리
 * (`VizFigure.tsx`) 안에 못 들어간다.
 *
 * **넷이 떨어진 사유는 각각 다르다** — 칸 수(PF4·PF10), 모양(PF8 원형·PF9 세로),
 * 구조적 가림(PF2·PF11), 그리고 SVG 필터가 필요해 순수 CSS 로 안 되는 것(PF7).
 */
export const VIZ_FRAME_LINEAGE: {
  frame: string;
  from: string;
  why: string;
}[] = [
  { frame: "polaroid", from: "PF1", why: "테이프가 판 위에만 있어 그림을 안 덮는다" },
  {
    frame: "note",
    from: "PF1 + D3·D6",
    why: "폴라로이드에서 마테를 떼고 캡션을 말린 화살표·손글씨 메모 두들로 바꾼 것. 판을 붙잡는 대신 가리켜서 같은 손이 지나간 티를 낸다(유저 지시). 아래 여백은 F-A 그대로 두고 화살표만 그림 위로 올라탄다",
  },
  { frame: "scrapbook", from: "PF3", why: "코너 마운트는 귀만 문다 — 도식에 가장 안전" },
  { frame: "kraft", from: "PF6", why: "찢긴 변이 여백에만 있다" },
  {
    frame: "crayon",
    from: "PF7",
    why: "테두리가 판 가장자리에만 있다 — 다만 손맛이 SVG 필터라 이 액자만 마크업이 더 붙는다. PF7 의 금별 스티커는 두들 마크로 갈아 끼웠다(액자 공통)",
  },
  { frame: "taped", from: "TapedBoard", why: "시안 PF 가 아니라 이 저장소 패턴 계보" },
  { frame: "quiet", from: "—", why: "대응 시안 없음. 액자가 거의 없는 선택지" },
  { frame: "bare", from: "—", why: "대응 시안 없음. 바탕과 여백만" },
];

/** variant → 시안 비율. PhotoFrame 이 기본 높이를 여기서 뽑는다. */
export const PHOTO_FRAME_RATIO = Object.fromEntries(
  PHOTO_FRAMES.map((f) => [f.variant, f.ratio]),
) as Record<PhotoFrameVariant, number>;

/** variant → 사진 칸 개수. */
export const PHOTO_FRAME_SLOTS = Object.fromEntries(
  PHOTO_FRAMES.map((f) => [f.variant, f.slots]),
) as Record<PhotoFrameVariant, 1 | 2 | 3>;
