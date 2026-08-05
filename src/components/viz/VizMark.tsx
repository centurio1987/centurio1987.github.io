/**
 * VizMark — 액자 귀퉁이에 얹는 **두들 마크**. 그리고 그 손맛 필터.
 *
 * 액자에 얹던 스티커(크레용 액자의 금별)를 두들 마크로 갈아 끼우면서 생긴 부품이다.
 * 스티커는 "붙인 종이"라 액자와 재질이 겹치는데(액자도 종이다), 마크는 **그 위에
 * 손으로 그은 자국**이라 겹치지 않는다.
 *
 * **그림과 표는 `src/lib/doodleMarks.ts` 하나에서 온다.** `DoodleMark.astro` 와
 * 같은 표를 읽으므로 본문 마크와 액자 마크가 같은 손으로 그려진다 — path 를
 * 베껴 오면 다음에 마크를 손볼 때 한쪽만 바뀐다.
 *
 * **왜 `.astro` 부품을 못 쓰나.** `VizFigure` 는 React 이고 데코 부품은 전부
 * `.astro` 라 트리에 못 들어간다. 그래서 표만 공유하고 그리는 쪽을 여기 다시 적는다
 * (액자 여섯 종을 CSS 로 옮겨 적은 것과 같은 사정).
 *
 * **본문 마크와 성격이 반대다.** `DoodleMark` 는 뜻을 져서 `role="img"` 를 달고
 * 강도로 사라지지 않는데, 여기 마크는 액자 장식이라 `aria-hidden` 이고 티어를 진다.
 * 같은 그림이라도 문장 안에 있으면 기호이고 액자 귀퉁이에 있으면 장식이다.
 */
import { useId } from "react";
import { DOODLE_MARKS } from "../../lib/doodleMarks";

/** 액자에 얹을 수 있는 마크. 51종을 다 열지 않는다 — 아래 주석. */
export const VIZ_MARK_NAMES = ["heart", "heart-outline", "check", "check-double"] as const;
export type VizMarkName = (typeof VIZ_MARK_NAMES)[number];

type FilterKind = "crayon" | "crayon-dense" | "ink" | "ink-fine";

/**
 * 손맛 필터 — `src/components/deco/CrayonFilters.astro` 의 React 판. 값은 그대로다.
 *
 * 정의를 문서에 한 번만 심지 않고 인스턴스마다 싣는 이유는 그 파일 머리글과 같다:
 * SVG 의 `filter` **속성**이 없는 id 를 가리키면 그 요소는 조용히 무시되는 게 아니라
 * **아예 안 그려진다.** 참조와 정의를 한 컴포넌트에 묶어 두면 그 사고가 구조적으로
 * 불가능해진다.
 */
export function HandFilters({ id, kinds }: { id: string; kinds: FilterKind[] }) {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {kinds.includes("crayon") && (
          <filter id={`${id}-crayon`} x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves={4} seed={5} result="ed" />
            <feDisplacementMap in="SourceGraphic" in2="ed" scale={5.5} xChannelSelector="R" yChannelSelector="G" result="wob" />
            <feTurbulence type="fractalNoise" baseFrequency="0.14 0.2" numOctaves={5} seed={17} result="blot" />
            <feColorMatrix in="blot" type="luminanceToAlpha" result="lum" />
            <feComponentTransfer in="lum" result="patch">
              <feFuncA type="table" tableValues="1 1 0.86 0.34 0.72 0.2" />
            </feComponentTransfer>
            <feComposite in="wob" in2="patch" operator="in" />
          </filter>
        )}
        {kinds.includes("ink") && (
          <filter id={`${id}-ink`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06 0.05" numOctaves={4} seed={11} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={3.4} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        )}
        {kinds.includes("ink-fine") && (
          <filter id={`${id}-ink-fine`} x="-22%" y="-22%" width="144%" height="144%">
            <feTurbulence type="fractalNoise" baseFrequency="0.09 0.11" numOctaves={3} seed={23} result="nf" />
            <feDisplacementMap in="SourceGraphic" in2="nf" scale={1.9} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        )}
      </defs>
    </svg>
  );
}

/**
 * 액자 마크 하나.
 *
 * **크기는 `--vzm` 하나가 정한다**(기본 34px — 크레용 액자에 있던 별과 같은 자리·같은
 * 크기다). 시안 자연 크기 40px 을 1 로 보고 나머지가 비율로 따라오므로, 액자마다
 * 크기를 달리하려면 CSS 에서 `--vzm` 만 바꾼다. 마크마다 세로가 다르니
 * (하트 36 · 체크 40) 높이를 따로 적으면 조용히 찌그러진다.
 *
 * 기울기는 표의 `tilt` 를 그대로 쓴다 — 마크마다 각도가 다른 게 "한 번에 그은 것"
 * 으로 읽히게 하는 값이라 여기서 0 으로 펴면 인쇄된 아이콘이 된다.
 */
export default function VizMark({ name }: { name: VizMarkName }) {
  const uid = useId().replace(/:/g, "");
  const mark = DOODLE_MARKS[name];
  /* 네 마크는 표에서 전부 kind:"svg" 다. 글씨 마크(O·X…)를 안 여는 이유는 그것들이
     **뜻을 지고 있어서**다 — 액자 귀퉁이의 X 는 장식이 아니라 "이 그림은 틀렸다"로
     읽힌다. 하트·체크는 그 위험이 없다. */
  if (mark.kind !== "svg") throw new Error(`[VizMark] 글씨 마크는 액자에 못 얹는다: ${name}`);
  const u = (n: number) => `calc(var(--vzm, 34px) * ${(n / 40).toFixed(4)})`;

  return (
    <span
      className="viz-mark"
      aria-hidden="true"
      style={{ transform: mark.tilt ? `rotate(${mark.tilt}deg)` : undefined }}
    >
      <svg
        width={u(mark.w)}
        height={u(mark.h)}
        viewBox={`0 0 ${mark.w} ${mark.h}`}
        fill="none"
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <HandFilters id={uid} kinds={mark.filters} />
        <g dangerouslySetInnerHTML={{ __html: mark.body.replaceAll("{ID}", uid) }} />
      </svg>
    </span>
  );
}
