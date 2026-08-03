import fs from "node:fs";
import path from "node:path";
import { getAuthor } from "./authors";

const interviewee = getAuthor("ppangtolab-prof");

// 폭신 대담(인터뷰 시리즈) 설정 — TalkLayout · QA · PullQuote의 단일 소스
// interviewee(빵토 교수님)의 이름·아바타는 authors.ts 퍼소나 레지스트리에서 파생된다(중복 방지).
export const TALK = {
  /** 대담 포스트 상단 배너 (없으면 렌더링 생략) */
  banner: "/images/talk/banner.webp",
  bannerAlt: "폭신함 외길 인생, 빵토 교수님과의 대담!!",
  /** 제목 위 손글씨 리드 */
  handLead: "빵토 교수님과의 대담",
  interviewer: {
    name: "글쓴이",
    label: "INTERVIEWER",
    initial: "나",
  },
  interviewee: {
    name: interviewee.name,
    label: "AI AGENT",
    avatar: interviewee.avatar!,
  },
} as const;

/** public/ 기준 경로가 실제로 존재하는지 (빌드 타임 체크) */
export function publicFileExists(publicPath: string): boolean {
  return fs.existsSync(
    path.join(process.cwd(), "public", publicPath.replace(/^\//, "")),
  );
}
