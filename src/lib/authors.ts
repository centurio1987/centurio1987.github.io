export interface AuthorMeta {
  id: string;
  name: string;
  role: string;
  handle: string;
  bio: string;
  /**
   * 프로필 카드(104px 원)·목록(22px)에 쓰는 **얼굴 샷**. 배경을 오려낸 투명 webp 라
   * 어느 지면의 종이색 위에도 그대로 앉는다(`.ap-avatar` 가 `--paper` 를 깔아 둔다).
   * `scripts/make-author-face.ts` 가 전신 마스터에서 머리 + 어깨만 잘라 굽는다 —
   * 네 저자의 프레이밍이 서로 맞아야 하므로 크롭 자리는 그 스크립트의 표 하나에 모여 있다.
   * **전신샷을 넣지 마라**: 원 안에서 얼굴이 20px 로 줄어 누가 누군지 안 보인다.
   */
  avatar?: string;
  /**
   * 배경을 오려낸 전신 컷아웃(투명 webp) — 푸터 저자 라인업에 세워지는 그림.
   * `scripts/extract-author-cutout.ts`로 저자 데코 원본에서 굽는다.
   * 채운 저자만 라인업에 서므로, 전신 원본이 없는 퍼소나는 비워 둔다(죽은 링크 방지).
   */
  fullBody?: string;
  /**
   * 목록·필터칩용 소형 아바타(64px). 원본 avatar 는 프로필 카드용 512~1254px 이라
   * 20px 남짓으로 그리는 자리에 쓰면 낭비가 크다. `bun scripts/make-author-avatars.ts`
   * 가 `/images/authors/<id>-sm.webp` 규약으로 생성한다(경로를 바꾸면 스크립트도 함께).
   */
  avatarSm?: string;
  /** 퍼소나 고유 상단 배너 — 실제로 AiBanner가 렌더하는 퍼소나에만 채운다(죽은 데이터 방지) */
  banner?: string;
  /** 배너 alt 텍스트. 생략 시 AiBanner가 author.name 기반 일반 문구로 폴백한다 */
  bannerAlt?: string;
  /** true면 AI 완전 집필 — 글 상단에 AI 배너가 표시된다 */
  isAI: boolean;
  links: { label: string; href: string }[];
}

// 작성자/퍼소나 레지스트리 — 목록/프로필/배너의 단일 소스
//
// **사람 하나 + AI 퍼소나 셋.** `ppangto`(ppang-gwan-tony 의 줄임말)가 사람이고,
// AI 셋은 그 사람의 연구실(빵토랩) 소속이라 `ppangtolab-` 접두를 쓴다.
// 예전엔 `tony` 와 `ppangto` 가 따로 있었는데 **둘 다 같은 사람의 표기**였고,
// `ppangto` 라는 id 를 AI 연구원이 쓰고 있어 이름이 충돌했다 — 2026-08-03 정리.
//
// id 매핑: ppangto=빵관 토니(사람) · ppangtolab-researcher=빵토랩 연구원
//        · ppangtolab-prof=빵토랩 교수님(폭신 대담) · ppangtolab-teacher=빵토랩 선생님(자료구조·알고리즘)
//
// 각 퍼소나의 문체 규칙(voice)은 `authoring-kit` 플러그인의 레지스트리가 소유한다
// (`~/.claude/authoring/voices/<id>/`). 사람인 `ppangto` 의 voice 는 `usage: "preserve"` 라
// **AI 가 그 목소리로 쓰지 않는다** — 초안을 다듬을 때 지킬 색으로만 쓴다.
export const AUTHORS: AuthorMeta[] = [
  {
    id: "ppangto",
    name: "빵관 토니",
    role: "글 굽는 사람",
    handle: "@ppangwan-tony",
    bio: "Serious Work, Joyful Wit. 진지한 일 이야기를 토실토실하게 구워 씁니다.",
    // 예전엔 /tony-deco.webp(장식 구운 전신 합성물)를 그대로 썼다 — 원 안에서 얼굴이
    // 뭉개지고 혼자만 모눈 배경을 지고 있었다. 그 파일은 OG 기본 이미지로 계속 산다.
    avatar: "/images/authors/ppangto.webp",
    fullBody: "/images/authors/ppangto-full.webp",
    avatarSm: "/images/authors/ppangto-sm.webp",
    isAI: false,
    links: [{ label: "글 더 보기", href: "/posts/" }],
  },
  {
    id: "ppangtolab-researcher",
    name: "빵토랩 연구원",
    role: "AI 연구원 · 완전 집필",
    handle: "@ppangtolab-researcher",
    bio: "토니의 연구실에서 토실토실하게 구워낸 연구 성과를 공유하는 AI 연구원입니다.",
    avatar: "/images/authors/ppangtolab-researcher.webp",
    fullBody: "/images/authors/ppangtolab-researcher-full.webp",
    avatarSm: "/images/authors/ppangtolab-researcher-sm.webp",
    banner: "/images/authors/ai-banner.webp",
    bannerAlt: "토실토실하게 구워낸 연구 성과를 공유합니다 — 이 글은 AI 빵토랩 연구원이 집필했습니다",
    isAI: true,
    links: [{ label: "글 더 보기", href: "/posts/" }],
  },
  {
    id: "ppangtolab-prof",
    name: "빵토랩 교수님",
    role: "AI 학과장 · 폭신 대담",
    handle: "@ppangtolab-prof",
    bio: "질문 하나도 끝까지 붙들고 답을 파고드는, 폭신 대담을 진행하는 AI 교수님입니다.",
    avatar: "/images/authors/ppangtolab-prof.webp",
    fullBody: "/images/authors/ppangtolab-prof-full.webp",
    avatarSm: "/images/authors/ppangtolab-prof-sm.webp",
    isAI: true,
    links: [{ label: "글 더 보기", href: "/posts/" }],
  },
  {
    id: "ppangtolab-teacher",
    name: "빵토랩 선생님",
    role: "AI 강사 · 자료구조와 알고리즘",
    handle: "@ppangtolab-teacher",
    bio: "작은 단계로 쪼개 끝까지 이해시키는, 자료구조와 알고리즘을 가르치는 AI 선생님입니다.",
    avatar: "/images/authors/ppangtolab-teacher.webp",
    fullBody: "/images/authors/ppangtolab-teacher-full.webp",
    avatarSm: "/images/authors/ppangtolab-teacher-sm.webp",
    banner: "/images/authors/ppangtolab-teacher-banner.webp",
    isAI: true,
    links: [{ label: "글 더 보기", href: "/posts/" }],
  },
];

export const AUTHOR_IDS = AUTHORS.map((a) => a.id) as [string, ...string[]];

export const DEFAULT_AUTHOR = "ppangto";

const BY_ID = new Map(AUTHORS.map((a) => [a.id, a]));

export function getAuthor(id: string): AuthorMeta {
  return BY_ID.get(id) ?? BY_ID.get(DEFAULT_AUTHOR)!;
}
