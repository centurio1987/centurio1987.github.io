/**
 * VizNote — 폴라로이드 아래 여백의 캡션을 **말린 화살표 + 손글씨 메모** 두들로 그리는 부품.
 *
 * F-H `note` 액자(마테를 뗀 폴라로이드)만 쓴다. 캡션을 인쇄된 설명문이 아니라
 * **사진 밑에 손으로 적어 둔 쪽지**로 읽히게 하는 게 이 액자의 전부다.
 *
 * ── 왜 `Doodle.astro` 를 못 쓰나 ────────────────────────────────────────────
 * D3 곡선 화살표와 D6 손글씨 메모가 이미 있는데(`src/components/deco/Doodle.astro`),
 * 그건 `.astro` 라 React 트리인 `VizFigure` 안에 못 들어간다. `VizMark` 가 두들
 * 마크를 옮겨 적은 것과 같은 사정이다 — **펜은 원본 그대로**다:
 *   stroke 2.6 · linecap round · `--deco-crayon-blue` · ink-fine 필터
 *   메모    --font-hand 700 · ink-fine 필터
 *
 * ── 길만 새로 그렸다 (유저 지시) ───────────────────────────────────────────
 * D3 는 왼쪽 아래에서 오른쪽 위로 **한 번에 긋는** 곡선이다. 처음엔 그걸 뒤집어
 * 썼는데, 지시는 "**돼지 꼬리처럼 한 번 말리고**, 설명 텍스트 좌측에서 시작해서
 * 이미지 쪽으로 휘어지는" 모양이었다. 그래서 세 구간으로 다시 그렸다:
 *   ① 꼬리   (92,62)→(54,56)  메모 왼쪽에서 시작해 왼쪽으로 흐른다
 *   ② 고리   (54,56)→(40,47)  스스로를 한 번 감는다 — 자기교차하는 큐빅 두 개
 *   ③ 몸통   (40,47)→(29,12)  그림 쪽으로 휘어 오르고 끝에 화살촉이 선다
 * viewBox 는 96×72(가로로 눕힌 판)이고 72×54 로 그린다.
 *
 * ── 세로를 줄이고 가로를 늘린 건 "침범 한도"가 정했다 (유저 지시) ──────────
 * 처음엔 84×96 을 63×72 로 그려 **그림 위로 12px 올라탔다**. 지시는 "화살표가
 * **이미지의 바깥 컨테이너까지만** 침범"이라, 화살촉이 그림칸(`.viz-frame-inner`)
 * 윗쪽으로 못 들어간다. 세로 여유가 사라진 만큼을 가로에서 벌었다 — 꼬리를
 * 길게 빼야 "메모 왼쪽에서 출발했다"가 남고, 고리도 같이 커져야 흘림이 아니라
 * 말린 꼬리로 읽힌다(짧게 줄인 판을 나란히 놓고 골랐다).
 * **판 아래 여백이 그만큼 두꺼워지는 건 부작용이 아니라 F-A 의 물성이다.**
 * 화살촉이 그림칸 아래변에서 2px 아래 서는 계산은 `viz-frame.css` 의 `margin-top`.
 *
 * ── 크기를 px 로 못 박는 이유 ──────────────────────────────────────────────
 * `viz.css` 의 `.viz-figure svg { width:100%; height:auto }` 가 **도식 SVG 를 칸
 * 폭에 맞추려고** 있는 규칙인데 선택자가 `.viz-figure` 안의 모든 svg 를 잡는다.
 * 안 막으면 이 화살표가 캡션 폭까지 늘어나고 비율대로 세로도 커진다(실측: 판
 * 하나가 화살표로 가득 찼고 메모는 한 글자씩 세로로 쌓였다). 막는 자리는
 * `viz-frame.css` 다 — `viz.css` 는 패키지 계약 shim 이라 못 고친다.
 *
 * `overflow: visible` 이 필수다 — `feDisplacementMap` 이 선을 상자 밖으로 밀어내서,
 * 안 주면 화살촉 끝이 잘린다(`Doodle.astro` 의 `.arrow` 규칙과 같은 이유).
 */
import { useId, type ReactNode } from "react";
import { HandFilters } from "./VizMark";

const PEN = {
  stroke: "var(--deco-crayon-blue, #2540e8)",
  strokeWidth: 2.6,
  strokeLinecap: "round",
} as const;

/** 꼬리 → 고리 → 몸통. 한 path 로 이어 그어야 손이 한 번 지나간 자국이 된다. */
const TAIL =
  "M92 62C80 67 60 68 54 56C48 44 70 32 74 44C78 56 50 62 40 47C32 35 28 26 29 12";
/** 화살촉. 몸통 끝(29,12)보다 4 위에 꼭짓점을 두어 둥근 캡과 겹치게 한다. */
const HEAD = "M18 25L29 8L41 23";

export default function VizNote({ children }: { children: ReactNode }) {
  const uid = useId().replace(/:/g, "");
  return (
    <>
      <HandFilters id={uid} kinds={["ink-fine"]} />
      <svg
        className="viz-note-arrow"
        width={72}
        height={54}
        viewBox="0 0 96 72"
        fill="none"
        aria-hidden="true"
        style={{ filter: `url(#${uid}-ink-fine)` }}
      >
        <path d={TAIL} {...PEN} />
        <path d={HEAD} {...PEN} strokeLinejoin="round" />
      </svg>
      {/* 메모 글씨에도 같은 ink-fine 을 건다 — 화살표만 흔들리면 둘이 다른 펜이 된다.
          CSS filter 라 좌표계가 CSS px 이고, 그래서 글씨 크기를 바꾸면 결의 굵기가
          상대적으로 달라진다(`doodleMarks.ts` 머리글의 글씨 마크 절과 같은 함정).
          17px 은 폴라로이드 캡션과 같은 값이고 거기서 결이 시안과 맞는다. */}
      <span className="viz-note-text" style={{ filter: `url(#${uid}-ink-fine)` }}>
        {children}
      </span>
    </>
  );
}
