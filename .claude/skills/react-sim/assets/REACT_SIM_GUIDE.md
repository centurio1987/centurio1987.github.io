# React 시뮬레이션 작성 규약 (Astro MDX)

ORDER가 요구한 "React simulation을 통한 설명"을 안전하게 넣는 방법. 이 규약은 실제 빌드/hydration로 검증됐다.
**이 가이드는 `react-sim` 스킬이 소유한다**(이전 위치: `tech-deepdive`). 집필(tech-deepdive)은 "어디에 어떤 시뮬이
필요한지"만 명세하고, 실제 `.tsx` 작성·타입검증은 `react-sim`(sonnet 서브에이전트)이 맡는다.

## 핵심 규칙 (반드시)

1. **co-located `.tsx` 컴포넌트로 작성하고 MDX에서 import 한다.**
   - 위치: `src/components/posts/<slug>/<Name>.tsx` (글마다 자기 폴더 = 공용 라이브러리 아님 = 글 단위 자급식).
   - MDX 상단에서 `import <Name> from "../../components/posts/<slug>/<Name>";` 후 본문에 `<Name client:visible />`.
   - ❌ **MDX 본문에 `export function Sim(){}` 식으로 인라인 정의하면 `client:*`가 hydration 되지 않는다**
     (Astro는 import된 프레임워크 컴포넌트만 island로 만든다). 반드시 별도 파일 + import.
2. **외부 라이브러리 금지.** React만 사용하고 스타일은 inline `style={{…}}`. (차트/애니메이션 라이브러리 도입 금지.)
3. **브라우저 API 가드.** `window`/`document`/`localStorage` 등은 SSR에서 없다 → `useEffect` 안에서만 접근하거나
   `typeof window !== "undefined"` 가드. 최초 렌더는 서버에서 돈다는 걸 잊지 말 것.
4. **빌드 안전 + 조기 타입검증.** JSX 문법 오류 1건이 **사이트 전체 빌드**를 깬다. 작성 직후 **`tsc --noEmit`(또는
   `astro check`)로 타입을 먼저 검증**하고, 최종적으로 `bun run build` 통과를 확인한다. 닫는 태그·중괄호 짝·`className`(React는 `class` 아님) 점검.
5. **접근성·절제.** 조작 요소는 실제 `<button>`/`<input>`(키보드 가능). 과한 모션 금지. 색은 `src/styles/tokens.css` 팔레트와 조화.
6. **교육 목적 우선.** 시뮬은 "조작하며 관찰"이 핵심. 본문에서 *무엇을 만지고 무엇을 보라*고 안내한다.

## 입력 명세 (집필자 → react-sim)

집필 단계는 시뮬이 필요한 자리에 **무엇을 시뮬레이션할지** JSON/산문으로 명세한다(컴포넌트명, 조작 파라미터,
관찰 대상, 교육 목표). react-sim이 이를 받아 `.tsx`를 작성하고 MDX에 import 줄과 `<Name client:visible />`를 삽입한다.

## 언제 쓰나 (vs 정적 그림)

- **시뮬레이션**: 상태 변화·단계 진행·파라미터가 결과에 미치는 영향처럼 *움직여야* 이해되는 것.
- **정적 그림(`make-image` / `[[[...]]]`) / 코드형 개념도**: 구조·관계처럼 한 장이면 충분한 것. 상호작용이 없으면 `client:*`도 불필요.

## 최소 예시 (그대로 빌드됨)

`src/components/posts/<slug>/WindowSim.tsx`:

```tsx
import { useState } from "react";

// TCP 수신 윈도우 크기가 전송량에 주는 영향을 슬라이더로 체험.
export default function WindowSim() {
  const [win, setWin] = useState(4); // 세그먼트 단위 윈도우
  const segments = Array.from({ length: 8 }, (_, i) => i < win);
  return (
    <figure style={{ margin: "1.5rem 0" }}>
      <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
        수신 윈도우: {win} 세그먼트
        <input
          type="range" min={1} max={8} value={win}
          onChange={(e) => setWin(Number(e.target.value))}
          style={{ display: "block", width: "100%", marginTop: 6 }}
        />
      </label>
      <div style={{ display: "flex", gap: 4 }}>
        {segments.map((inFlight, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 28, borderRadius: 4,
              border: "1px solid #b8b0a0",
              background: inFlight ? "#e8c97a" : "#f3efe6",
            }}
            aria-label={inFlight ? "전송 가능" : "대기"}
          />
        ))}
      </div>
      <figcaption style={{ fontSize: 13, color: "#6b6357", marginTop: 8 }}>
        노란 칸 = ACK 없이도 보낼 수 있는 세그먼트. 윈도우를 키우면 한 번에 더 많이 흐른다.
      </figcaption>
    </figure>
  );
}
```

MDX에서:

```mdx
import WindowSim from "../../components/posts/tcp-flow/WindowSim";

## 흐름 제어를 직접 만져보기

<WindowSim client:visible />

슬라이더로 윈도우를 키우며 노란 칸(in-flight 세그먼트)이 어떻게 늘어나는지 관찰하세요.
```

## 흔한 함정

- `class=` → React에선 `className=`. (인라인 style이면 회피 가능)
- 최초 렌더에서 `window` 접근 → SSR 크래시. `useEffect`로 미룬다.
- `client:load` 남발 → 모두 즉시 hydration. 본문 중간 시뮬은 `client:visible`이 적절.
- import 경로 오류: draft 위치(`draft/`) vs 발행 위치(`src/content/posts/`) 기준이 다르다. 발행 시 `publish-post`가 경로를 맞춘다.
- 컴포넌트는 `export default` 권장(import 이름 자유). named export면 import도 named로 맞춘다.
