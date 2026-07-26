import { useEffect, useState } from "react";
import { Aurora } from "@centurio1987/bbangto-ui-core";

/**
 * AmbientAurora — hero 뒤에 아주 옅게 번지는 오로라 배경(KAN-012 Phase C, 선택 적용).
 *
 * core `Aurora`(캔버스)를 얇게 감싼 장식 아일랜드. 가드레일은 AmbientWaves와 동일:
 *  - `aria-hidden` + `pointer-events:none` + 절대배치(콘텐츠 뒤 z-index:0).
 *  - **명시적 코발트/크림 props** → provider 불필요(폰트/토큰 오염 0).
 *  - opacity 상한 ≤0.12 — hero는 above-the-fold라 특히 옅게(기본 0.06).
 *  - **reduced-motion이면 아예 마운트하지 않는다** (2겹 게이트: 호출부 `client:media` +
 *    여기 `armed`. 상세는 AmbientWaves 주석 참조).
 *
 * hero는 above-the-fold라 media 매치 시 즉시 하이드레이트된다. 그래서 기본값을 footer보다
 * 더 낮은 opacity·느린 speed로 잡아 첫 페인트의 부담과 시각적 소음을 함께 줄인다.
 */
interface Props {
  /** 오로라 밴드 색. 기본: accent-tint2(옅은 코발트)·paper·cream. */
  colors?: string[];
  /** 컨테이너 opacity 상한(≤0.12). hero 기본은 0.06. */
  opacity?: number;
  /** 애니메이션 속도 배율(낮을수록 느리고 차분). */
  speed?: number;
}

// tokens.css v0.3 — 옅은 코발트 + 페이퍼 + 크림. hero 텍스트 대비를 해치지 않는 저채도.
const DEFAULT_COLORS = ["#dfe3ff", "#F3EEE4", "#EDE6D8"];

export default function AmbientAurora({
  colors = DEFAULT_COLORS,
  opacity = 0.06,
  speed = 0.5,
}: Props) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setArmed(true);
  }, []);

  if (!armed) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        zIndex: 0,
      }}
    >
      <Aurora colors={colors} speed={speed} />
    </div>
  );
}
