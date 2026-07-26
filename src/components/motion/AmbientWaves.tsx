import { useEffect, useState } from "react";
import { Waves } from "@centurio1987/bbangto-ui-core";

/**
 * AmbientWaves — 푸터 뒤에 아주 은은하게 흐르는 사인파 배경(KAN-012 Phase C).
 *
 * core `Waves`(캔버스)를 얇게 감싼 장식 아일랜드다. 가드레일:
 *  - `aria-hidden` + `pointer-events:none` + 절대배치(콘텐츠 뒤 z-index:0) — 읽기/포커스 방해 0.
 *  - 색은 **명시적 코발트/크림 props**로 넘긴다 → `FoundationProvider` 불필요(폰트/토큰 오염 0).
 *  - opacity 상한 ≤0.12(기본 0.1) — "가장자리는 유쾌하게, 본문은 침범 금지"(DESIGN_CONCEPT #5).
 *  - **reduced-motion이면 아예 마운트하지 않는다.**
 *
 * reduced-motion 게이트는 2겹이다:
 *  1) 호출부의 `client:media="(prefers-reduced-motion: no-preference)"` — reduced 면
 *     아일랜드가 **하이드레이트조차 안 돼** 코어 청크·React 부하가 0(주 게이트).
 *  2) 여기 `useEffect`의 `armed` — SSR·하이드레이션 초기 렌더를 항상 `null`로 만들어
 *     (서버는 preference를 모르므로) 하이드레이트 전엔 **캔버스가 DOM에 아예 없게** 한다.
 *     하이드레이트되면(=no-preference) armed=true 로 Waves를 붙인다. matchMedia 재확인은
 *     방어(directive가 바뀌어도 reduced 면 안 붙음). 서버/클라 초기 출력이 같아 mismatch 0.
 */
interface Props {
  /** 파도 색(아래→위 겹). 기본: accent-tint2(옅은 코발트)·cream·surface. */
  colors?: string[];
  /** 컨테이너 opacity 상한(≤0.12). */
  opacity?: number;
  /** 애니메이션 속도 배율(낮을수록 느리고 차분). */
  speed?: number;
}

// tokens.css v0.3 — 아주 옅은 코발트+크림 3겹(페이퍼 위에서 거의 속삭임 수준).
const DEFAULT_COLORS = ["#dfe3ff", "#EDE6D8", "#F8F3E8"];

export default function AmbientWaves({
  colors = DEFAULT_COLORS,
  opacity = 0.1,
  speed = 0.6,
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
      <Waves colors={colors} speed={speed} />
    </div>
  );
}
