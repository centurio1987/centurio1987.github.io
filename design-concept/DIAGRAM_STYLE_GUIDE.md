# Diagram Style Guide v0.2

> 적용 대상: 본문 ```` ```viz``` ```` 블록 → **@centurio1987/bbangto-ui-visualization** 컴포넌트(코드로 구현하는 다이어그램·차트·인포그래픽·hero).
> 기준 문서: `design-concept/DESIGN_CONCEPT.md` v0.3 · 스타일가이드 구현: `src/lib/viz/blogVizStyleGuide.ts` · kind 규격: `.claude/skills/make-image/assets/IMAGE_GUIDE.md`.
> 목표: **엄밀한 구조를 밝고 손맛 있는 표면으로 설명한다.**

viz 시각물은 일반 일러스트가 아니라, 글의 논리 구조를 독자가 빠르게 잡도록 돕는 설명 장치다. `make-image`(viz 엔진)가 ```viz``` 블록을 유저 디자인 시스템 패키지 컴포넌트로 구현한다: 본문은 **SSR 정적 SVG**(무JS 페인트), hero는 **webp 래스터**. **ChatGPT 이미지 생성을 쓰지 않는다**(KAN-013). 아래 §1~§6 디자인 원칙은 `blogVizStyleGuide`(색·폰트)와 kind 선택의 기준이다.

---

## 1. 원칙

1. **관계가 주인공이다.** 노드보다 연결과 방향이 먼저 읽혀야 한다.
2. **색은 의미다.** 장식용 색을 쓰지 않고, 역할 구분에만 쓴다.
3. **텍스트는 최소화한다.** 생성 이미지에는 긴 문장을 넣지 않는다. 상세 설명은 본문 캡션과 주변 문장으로 처리한다.
4. **기술적으로 정확하고 표면은 유쾌하게.** DDD, 아키텍처, 모델링 글의 엄밀함을 유지하되, 차가운 SaaS 다이어그램처럼 보이지 않게 한다.
5. **본문을 방해하지 않는다.** 다이어그램은 읽기 흐름을 끊는 포스터가 아니라, 글 중간의 사고 지도다.

## 2. 팔레트

기본 배경은 v0.3 토큰 `paper #F3EEE4` 또는 `surface #F8F3E8`만 사용한다(blogVizStyleGuide canvas.bg).

| 역할 | 색 |
| --- | --- |
| 배경 | `#F3EEE4` / `#F8F3E8` |
| 선·외곽 | `#20264A` (ink, navy) |
| 보조 텍스트·옅은 선 | `#6B665C` |
| 핵심 흐름 | `#4E6CA8` |
| 강조·전환점 | `#D8A33F` |
| 위험·충돌·반례 | `#A84B4B` |
| 도메인·업무 맥락 | `#3E6B4F` |
| 기술·구현 | `#3E6B6B` |
| 설계 결정 | `#7A5C7E` |
| 품질·검증 | `#6B6B3E` |

색 면은 10-18% tint로 얕게 쓰고, 모든 노드와 색칩은 `ink #1C1B18` 외곽선으로 닫는다. 그라데이션, 네온, 유리 효과, 과한 그림자는 금지한다.

## 3. 형태

- 선: 검은 잉크, 1.5-2px, round cap, 살짝 손그림 같은 불규칙함.
- 노드: 둥근 사각형 8-12px, `surface` 채움, `ink` 외곽선.
- 핵심 노드: 좌측 컬러 바 또는 작은 원형 색칩으로만 강조.
- 연결선: 직선보다 완만한 곡선 또는 90도에 가까운 정돈된 꺾은선.
- 화살표: 작고 단순하게. 두꺼운 화살표와 3D 형태 금지.
- 구분선: 점선·대시·물결선을 제한적으로 사용.
- 배경 텍스처: 아주 옅은 모눈은 허용하지만 본문 가독성을 방해하면 제거한다.

## 4. 타이포그래피

React/SVG/HTML 다이어그램 컴포넌트를 만들 때:

- 글꼴: `--font-body`(Gowun Dodum). **Pretendard 는 v0.2 의 값이고 지금 어디에도 없다.**
- 라벨: `--text-meta`~`--text-small`(13~15px), `--font-weight-medium`~`--font-weight-bold`(500~700).
- 보조 라벨: `--text-meta`~`--text-label`(12~13px), `ink-2`.
- 줄 수: 노드당 1-2줄, 줄당 12자 안팎.
- 코드·타입 이름: `--font-code`(JetBrains Mono, 한글은 Gowun Dodum 으로 떨어진다 — DESIGN_CONCEPT §5).

3차 산출물용 이미지로 export할 때:

- 긴 설명 문장을 이미지 안에 밀어 넣지 않는다.
- 라벨은 React 원본과 동일하게 유지하되, 작은 화면에서 읽히지 않으면 컴포넌트 레이아웃을 먼저 수정한다.
- 실제 설명 문구는 산출물 본문과 캡션에 둔다.

## 5. 레이아웃

- 기본 캔버스: 1536x1024, 3:2 비율.
- 여백: 바깥 64px 이상, 노드 간 32-48px.
- 노드 수: 한 장당 3-7개 권장. 9개를 넘기면 분할한다.
- 흐름: 시간·처리 과정은 좌→우, 계층·분해는 상→하, 비교는 좌우 2열.
- 중심: 가장 중요한 개념은 중앙 또는 좌상단 시작점에 둔다.
- 캡션 공간: 이미지 아래 Markdown 캡션으로 설명할 수 있게, 이미지 자체는 과밀하게 만들지 않는다.

## 6. 다이어그램 유형별 규칙

### Concept Map

개념의 의미 관계를 보여줄 때 쓴다. 중앙 핵심 노드 1개, 주변 보조 노드 3-5개, 연결선에는 가능한 한 긴 문장을 넣지 않는다.

### Flow / Pipeline

입력→처리→출력, 판단→실행→변화를 보여줄 때 쓴다. 핵심 경로는 signature 색 선으로, 예외나 되돌림은 얇은 dashed ink-2 선으로 표현한다.

### Architecture Boundary

레이어, 모듈, 외부 시스템 경계를 보여줄 때 쓴다. 박스 중첩은 2단계까지만 허용하고, 외부 시스템은 점선 외곽으로 구분한다.

### Domain Model

Aggregate, Entity, Value Object, Policy 같은 도메인 구성요소를 보여줄 때 쓴다. UML처럼 차갑게 보이기보다 카드형 노드와 간결한 관계선으로 표현한다.

### Trade-off / Decision

선택지와 버린 대안을 보여줄 때 쓴다. 선택한 경로는 signature, 보류·위험은 strategy red, 근거는 mustard dot으로 표시한다.

## 7. `viz` 블록 사용 규칙

집필자는 시각물이 필요한 자리에 단독 ```` ```viz``` ```` 블록(JSON)을 남긴다. `make-image`(apply-viz)가 처리한다.

````markdown
```viz
{ "kind": "Flowchart",
  "caption": "Aggregate 경계가 RDB 스키마로 내려오는 흐름",
  "alt": "도메인 규칙 → Aggregate Root → Repository → RDB Schema",
  "data": {
    "nodes": [ {"id":"a","x":40,"y":40,"width":170,"height":60,"label":"도메인 규칙"},
               {"id":"b","x":260,"y":40,"width":170,"height":60,"label":"Aggregate Root"} ],
    "edges": [ {"id":"e1","from":"a","to":"b"} ] } }
```
````

- `target:"inline"`(기본) → co-located `.tsx`(SSR 정적 SVG). `target:"hero"` → `public/images/<slug>/hero.webp`.
- 텍스트 최소화, 핵심 흐름은 좌→우. kind별 `data` 규격은 `IMAGE_GUIDE.md`.
- 색은 `blogVizStyleGuide`가 자동 주입한다(아래 §2 역할 팔레트). 블록에서 색을 직접 지정하지 않는다.

## 8. 다이어그램 유형 → viz kind 매핑

§6 유형을 v1 지원 kind(5종)로 고른다:

| 유형(§6) | viz kind | 비고 |
| --- | --- | --- |
| Concept Map / Domain Model / Architecture Boundary | `Flowchart` | 노드+엣지, 좌표 배치 |
| Flow / Pipeline / Trade-off·Decision | `Flowchart` 또는 `ProcessSteps` | 순차면 ProcessSteps |
| 절차·단계 | `ProcessSteps` | horizontal/vertical/zigzag |
| 좌우 비교 | `Comparison` | split/magnitude |
| 수치·지표 | `Statistics` | cards/isotype/… |
| hero 대표 이미지 | `PosterEditorial` | `target:"hero"` → webp |

색·폰트는 `blogVizStyleGuide`가 주입하므로(§2 팔레트, ink 외곽선, Gowun Dodum/Space Mono) 블록에서 지정하지 않는다.
~65종 나머지 kind는 후속 확장(패키지에는 C4·ERDiagram·SequenceDiagram·Timeline 등도 있다).

## 9. 금지 사항

- 어두운 배경, 네온 블루·퍼플 위주의 테크 스타일.
- 유리 효과, 과한 glow, 3D isometric 장식.
- stock illustration 같은 인물/사무실 장면.
- 긴 문장 라벨, 작은 글씨가 빽빽한 화면.
- 브랜드 팔레트 밖의 임의 색상 남발.
- 본문보다 다이어그램이 더 큰 시각적 주인공이 되는 구성.

## 10. 검수 체크리스트

- [ ] 글의 핵심 관계가 3초 안에 읽히는가?
- [ ] 색이 역할을 설명하고 있는가?
- [ ] 배경과 선이 `DESIGN_CONCEPT.md`의 흙빛 다색·손맛 감성과 맞는가?
- [ ] 긴 텍스트를 이미지 안에 밀어 넣지 않았는가?
- [ ] 모바일 폭에서도 노드가 과밀해 보이지 않는가?
- [ ] alt text와 주변 본문만으로도 의미가 보완되는가?
