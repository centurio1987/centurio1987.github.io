export interface AuthorMeta {
  id: string;
  name: string;
  role: string;
  handle: string;
  bio: string;
  avatar?: string;
  /**
   * 배경을 오려낸 전신 컷아웃(투명 webp) — 푸터 저자 라인업에 세워지는 그림.
   * `scripts/extract-author-cutout.ts`로 저자 데코 원본에서 굽는다.
   * 채운 저자만 라인업에 서므로, 전신 원본이 없는 퍼소나는 비워 둔다(죽은 링크 방지).
   */
  fullBody?: string;
  /** 퍼소나 고유 상단 배너 — 실제로 AiBanner가 렌더하는 퍼소나에만 채운다(죽은 데이터 방지) */
  banner?: string;
  /** 배너 alt 텍스트. 생략 시 AiBanner가 author.name 기반 일반 문구로 폴백한다 */
  bannerAlt?: string;
  /** true면 AI 완전 집필 — 글 상단에 AI 배너가 표시된다 */
  isAI: boolean;
  links: { label: string; href: string }[];
}

// 작성자/퍼소나 레지스트리 — 목록/프로필/배너의 단일 소스
// id 매핑: ppangto=빵토 연구원(베이스) · ppangto-prof=빵토 교수님(폭신 대담) · ppangto-teacher=빵토 선생님(자료구조·알고리즘 강의)
// 각 퍼소나의 voice 가이드는 src/lib/personas/<id>-voice.md 컨벤션으로 별도 관리한다(정의된 퍼소나만).
export const AUTHORS: AuthorMeta[] = [
  {
    id: "tony",
    name: "빵관 토니",
    role: "글 굽는 사람",
    handle: "@ppangwan-tony",
    bio: "Serious Work, Joyful Wit. 진지한 일 이야기를 토실토실하게 구워 씁니다.",
    avatar: "/tony-deco.webp",
    fullBody: "/images/authors/tony-full.webp",
    isAI: false,
    links: [{ label: "글 더 보기", href: "/posts" }],
  },
  {
    id: "ppangto",
    name: "빵토 연구원",
    role: "AI 연구원 · 완전 집필",
    handle: "@ppangto-lab",
    bio: "토니의 연구실에서 토실토실하게 구워낸 연구 성과를 공유하는 AI 연구원입니다.",
    avatar: "/images/authors/ppangto.webp",
    fullBody: "/images/authors/ppangto-full.webp",
    banner: "/images/authors/ai-banner.webp",
    bannerAlt: "토실토실하게 구워낸 연구 성과를 공유합니다 — 이 글은 AI 빵토 연구원이 집필했습니다",
    isAI: true,
    links: [{ label: "글 더 보기", href: "/posts" }],
  },
  {
    id: "ppangto-prof",
    name: "빵토 교수님",
    role: "AI 학과장 · 폭신 대담",
    handle: "@ppangto-prof",
    bio: "질문 하나도 끝까지 붙들고 답을 파고드는, 폭신 대담을 진행하는 AI 교수님입니다.",
    avatar: "/images/authors/ppangto-prof.webp",
    fullBody: "/images/authors/ppangto-prof-full.webp",
    isAI: true,
    links: [{ label: "글 더 보기", href: "/posts" }],
  },
  {
    id: "ppangto-teacher",
    name: "빵토 선생님",
    role: "AI 강사 · 자료구조와 알고리즘",
    handle: "@ppangto-teacher",
    bio: "작은 단계로 쪼개 끝까지 이해시키는, 자료구조와 알고리즘을 가르치는 AI 선생님입니다.",
    avatar: "/images/authors/ppangto-teacher.webp",
    fullBody: "/images/authors/ppangto-teacher-full.webp",
    banner: "/images/authors/ppangto-teacher-banner.webp",
    isAI: true,
    links: [{ label: "글 더 보기", href: "/posts" }],
  },
];

export const AUTHOR_IDS = AUTHORS.map((a) => a.id) as [string, ...string[]];

export const DEFAULT_AUTHOR = "tony";

const BY_ID = new Map(AUTHORS.map((a) => [a.id, a]));

export function getAuthor(id: string): AuthorMeta {
  return BY_ID.get(id) ?? BY_ID.get(DEFAULT_AUTHOR)!;
}
