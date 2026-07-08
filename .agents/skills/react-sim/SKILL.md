---
name: react-sim
description: >
  글에 들어갈 **인터랙티브 React 시뮬레이션**(조작하며 관찰하는 교육용 컴포넌트)을 작성하는 스킬.
  집필자가 남긴 시뮬 명세(컴포넌트명·조작 파라미터·관찰 대상·교육 목표)를 받아 `assets/REACT_SIM_GUIDE.md`
  규약대로 co-located `.tsx`를 만들고 MDX에 `import` + `<Name client:visible />`를 삽입한 뒤,
  **작성 즉시 `tsc --noEmit`(또는 `astro check`)로 타입을 검증**하고 최종 `bun run build` 통과를 확인한다.
  "/react-sim <명세>", "이 자리에 시뮬레이션 넣어줘", "TCP 윈도우 슬라이더 만들어줘" 같은 표현에 반응한다.
  한 장으로 충분한 정적 구조도는 `make-image`, 개념·은유 일러스트는 `post-finalize`(OpenAI)가 맡는다.
argument-hint: <시뮬 명세(JSON/산문) + 대상 MDX 경로>
---

# react-sim 스킬

ORDER가 요구한 "React simulation을 통한 설명"을 **안전하게**(빌드·hydration 깨짐 없이) 글에 넣는 스킬이다.
`tech-deepdive`(집필)는 *어디에 어떤 시뮬이 필요한지*만 명세하고, 실제 `.tsx` 작성·타입검증은 이 스킬
(`react-sim-builder`, sonnet 서브에이전트)이 맡는다. **`assets/REACT_SIM_GUIDE.md`를 이 스킬이 소유한다**
(이전 위치: tech-deepdive).

## 워크플로우 상의 위치

```
tech-deepdive (시뮬 명세 + figure는 make-image로) → [react-sim: .tsx 작성 + import 삽입 + tsc --noEmit] → 본문 빌드 통과
```

집필 단계가 시뮬이 필요한 자리에 명세를 남기면, 오케스트레이터가 이 스킬을 위탁 호출한다.

## 입력 / 출력 계약

- **입력**: 시뮬 명세(JSON 또는 산문) — 컴포넌트명, 조작 파라미터, 관찰 대상, 교육 목표 + **대상 MDX 경로**와 글 slug.
- **출력**: `src/components/posts/<slug>/<Name>.tsx` 파일 + 대상 MDX에 삽입된 `import` 줄과 `<Name client:visible />`.
  + **`tsc --noEmit` 통과 결과**(실패면 고쳐서 통과시키거나 원인 보고).

## 동작 순서

### 1. 명세 해석 + 적합성 판단
- 명세를 읽고 *정말 시뮬이 맞는지* 확인한다. **상태 변화·단계 진행·파라미터→결과 관계처럼 움직여야 이해되는 것**만 시뮬.
  한 장으로 충분한 구조·관계는 `make-image`(또는 코드형 개념도)로 돌려보낸다(`REACT_SIM_GUIDE.md` "언제 쓰나").

### 2. `.tsx` 작성 (REACT_SIM_GUIDE 규약)
`assets/REACT_SIM_GUIDE.md`를 **그대로** 따른다. 핵심:
- **co-located**: `src/components/posts/<slug>/<Name>.tsx`. (draft 단계면 draft slug 폴더. 발행 시 `publish-post`가 경로 정리.)
- **외부 라이브러리 금지**, 스타일은 inline `style={{…}}`. 색은 `src/styles/tokens.css` 팔레트와 조화.
- **브라우저 API 가드**: `window`/`document` 등은 `useEffect` 안에서만, 또는 `typeof window !== "undefined"`.
- 조작 요소는 실제 `<button>`/`<input>`(키보드 가능). 과한 모션 금지. `export default` 권장.

### 3. MDX에 삽입
- 대상 MDX 상단에 `import <Name> from "../../components/posts/<slug>/<Name>";` (발행/draft 위치에 맞는 상대경로).
- 본문 해당 자리에 `<Name client:visible />` + *무엇을 만지고 무엇을 보라*는 안내 문장.
- ❌ **MDX 본문 인라인 정의 금지**(`export function`은 hydration 안 됨) — 반드시 별도 파일 + import.

### 4. 타입검증 (작성 즉시) + 빌드
- **`tsc --noEmit`** 또는 **`astro check`**로 먼저 타입을 검증한다(JSX 오류 1건이 사이트 전체 빌드를 깬다).
- 닫는 태그·중괄호 짝·`className`(React는 `class` 아님)·import 경로를 점검한다.
- 마지막에 **`bun run build`** 통과를 확인한다. 실패하면 고치고, 못 고치면 원인을 명확히 보고한다(조용한 skip 금지).

### 5. 종료 보고
만든 `.tsx` 경로, MDX에 삽입한 import/태그 위치, `tsc`/build 결과를 보고한다. 시뮬이 부적합해 반려했으면 그 사유와 대안(make-image)을 알린다.

## 참조 파일
- `assets/REACT_SIM_GUIDE.md` — co-located/import/hydration/타입검증 규약 + 빌드되는 최소 예시.

## 주의
- **빌드 안전이 최우선**: 작성 직후 `tsc --noEmit`, 최종 `bun run build`. 실패를 완성으로 보고하지 않는다.
- 인라인 정의 금지(hydration 안 됨). 외부 라이브러리 금지. 브라우저 API는 가드.
- draft↔발행 import 경로 차이 주의(발행 시 `publish-post`가 정리).
- 움직일 필요 없는 그림은 이 스킬이 아니라 `make-image`/`[[[…]]]`.
