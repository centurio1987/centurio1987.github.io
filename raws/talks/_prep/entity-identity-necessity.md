# 대담 준비 — 로직이 한 번도 안 쓰는 id 를 Entity 에 두어야 하나

> 이 문서는 **대화에 들고 들어갈 것**이지 대담 원고가 아니다. 답을 적어 두지 않는다 —
> 적어 두면 대화가 이 문서의 낭독이 된다.
>
> 근거: `~/blog-research/raws/016-ddd-entity-identity-necessity.md` ·
> 앵글 `wiki/angles/ddd-entity-identity-talk.md`(mature) ·
> topic `ddd-entity-identity` · `ddd-tactical-building-blocks`
>
> 원 질문(KAN-081-QBTAPJ 원문): "entity는 식별성이 있어야 한다. 그래서 id가 있어야 하는데,
> 실제 로직에서는 사용하지 않는 값이다. 그렇다면 굳이 entity에 id가 있어야할 필요가 있나"

## 1. 질문 순서

이 주제는 앞의 것과 결이 다르다. **내가 회의(懷疑)를 하나 들고 들어간다** — "안 쓰는 값을 왜
드나". 그래서 순서의 목적은 개념 탐색이 아니라 **그 회의를 어디까지 밀 수 있는지 재는 것**이다.
1~2 번에서 낱말을 갈라 두지 않으면 3 번 이후가 전부 "그래도 관례상 둡니다"로 뭉개진다.

1. **식별성(identity)과 식별자(identifier)는 같은 말인가.** Entity 정의가 요구하는 것은
   둘 중 무엇인가.
2. **"모델의 식별 구분에 대응한다"는 조건은 실무에서 무엇을 요구하는가.** 임의값이어도 된다면
   그 조건은 무엇을 거르는 장치인가.
3. **"로직이 안 쓴다"는 관찰은 검증된 것인가.** 도메인 메서드 말고 그 값을 쓰는 자리가 정말
   없는가 — 어디를 봐야 확인되는가.
4. **영속화가 요구하는 id 와 도메인이 요구하는 id 는 같은 것인가.** 다르다면 지금 내가 보고
   있는 그 필드는 어느 쪽인가.
5. **Aggregate 안쪽 Entity 에도 같은 요구가 걸리는가.** 밖에서 참조되지 않는 객체의 식별자는
   무엇까지 만족하면 되는가.
6. **셋 다 아니라면 그것은 Entity 가 맞는가.** 즉 이 질문은 "id 를 뺄까"가 아니라 "분류가
   틀렸나"로 되돌아가는가.
7. **거꾸로, id 를 두는 쪽의 비용은 무엇인가.** 원문에 적힌 대가가 있는가.

> 6번이 이 대담의 전환점이다. 앞의 다섯이 전부 "id 는 필요하다"로 수렴하더라도, 마지막에
> **분류 자체를 의심하는 자리**가 열려 있어야 회의가 결론으로 닫힌다.

## 2. 내 전제에 대한 판정

### 전제 A — "Entity 는 식별성이 있어야 하니까 id 가 있어야 한다"

**판정: 앞 절반은 맞고, "그래서 id" 로 건너가는 대목이 헐겁다.**

- **맞는 근거**: Entity 는 "distinguished by its identity, rather than its attributes" 로
  정의되고, Value Object 항목은 "Don't give a value object any identity" 로 반대편을 긋는다.
  식별성은 Entity 의 선택 사양이 아니다. (DDD Reference 2015, p.11·p.12)
- **헐거운 대목**: Evans 가 요구한 것은 id 필드가 아니라 **구별 수단**이다 — 원문은 "Define a
  means of distinguishing each object" 이고 그걸 operation 이라 부른다. 속성 조합일 수도,
  붙여 둔 기호일 수도 있다.
- **동시에 방어되는 대목**: 그 기호가 "an arbitrary identifier created by and for the system"
  이어도 된다고 **원문이 명시한다.** 그러니 "로직이 안 쓰는 임의값"이라는 사실만으로는 정당성이
  깎이지 않는다. **깎는 것은 다른 조건이다** — "but it must correspond to the identity
  distinctions in the model."
- **그래서 판정선**: "로직이 쓰는가"가 아니라 **"이 id 가 말하는 같음이 업무가 말하는 같음과
  일치하는가"**. 이 자리를 대화에서 확정하고 싶다.

### 전제 B — "실제 로직에서 사용하지 않는 값이다"

**판정: 아직 검증되지 않은 관찰이다. 도메인 메서드만 봐서는 결론이 안 난다.**

id 가 도메인 메서드에 안 나타나도 실제로는 아래 넷 중 하나 이상이 쓰고 있다. **대화 전에 내가
세어 볼 것**이고, 대화에서는 "넷 중 무엇에 해당하는가"로 물어야 답이 구체화된다.

| 소비자 | 쓰는 방식 | 없앨 때 대체물 |
| --- | --- | --- |
| 동일성 판정 | `equals`/`hashCode`, 컬렉션 중복 제거·정렬 | 속성 전체 비교(= Value Object 로 바뀐다) |
| 영속화 | PK·FK, ORM 의 dirty checking·identity map | 자연키 또는 복합키 |
| 외부 참조 | 다른 Aggregate 가 id 로 참조 | 없음 — 참조되면 id 는 협상 대상이 아니다 |
| 시스템 경계 | API 응답·로그·이벤트에서 그 객체를 지칭 | 없음 |

셋째 줄의 근거는 Vernon 의 규칙 3 "Reference Other Aggregates By Identity" 다. 참조되는 쪽에
id 가 없으면 이 규칙 자체가 성립하지 않는다.

### 전제 C(암묵) — "id 를 두는 것은 공짜다"

**판정: 원문이 대가를 적어 두었다.** "attaching identity to other objects can hurt system
performance, add analytical work, and **muddle the model by making all objects look the same**"
(Reference 2015, p.12). 마지막 대목이 특히 이 질문에 걸린다 — 식별성을 아무 데나 붙이면 Entity 와
Value Object 의 구분이 흐려진다. **id 를 빼는 쪽에도 근거가 있다**는 뜻이다.

## 3. 두 갈래를 미리 갈라 둔다 — 안 갈라면 대화가 섞인다

### (가) 그게 surrogate 라면, 문제는 존재가 아니라 노출이다

Vernon *IDDD*(2013) 5장은 식별자 생성 전략 넷(사용자 제공 · 애플리케이션 생성 · 영속화 메커니즘
생성 · 다른 Bounded Context 할당)과 **surrogate identity** 를 따로 다룬다. ORM 이 원하는 식별자와
도메인이 원하는 식별자가 충돌하므로 **둘을 나누고**, surrogate 는 Layer Supertype 이 들고 가시성
제한으로 감춘다. → "안 쓰는 id"가 사실 surrogate 면 **없앨 것이 아니라 감출 것**이다.

**단서**: 이 절은 본문을 1차로 확보하지 못했다(목차와 2차 요약만). 대화에서 원문 문구로 인용하지
않는다 — "Vernon 이 두 식별자를 분리하는 절을 따로 두었다"는 사실 수준까지만 쓴다.

### (나) Aggregate 안쪽이면 요구가 약해진다 — local identity

내부 Entity 는 밖에서 참조되지 않으므로 Aggregate 안에서만 유일하면 된다. Root 만 전역 유일
식별자를 갖는다. 커뮤니티 정식화는 "aggregate id + local id = global id".

**단서**: 2015 Reference 에는 "local identity" 라는 표현이 **없다.** 2차 출처(dddcqrs 그룹 토론 ·
Vaadin 튜토리얼)만 확보했으므로 Evans 인용으로 쓰지 않는다. "커뮤니티에서 굳은 구분"으로 말한다.

## 4. 예상 반론

- **"ORM 이 요구하니까 두는 겁니다."** 되받을 자리는 층이다 — 그렇다면 그것은 도메인 모델의
  식별자가 아니라 영속화 관심사이고, 도메인에 노출돼 있는 것 자체가 설계 문제 아닌가. 꺼낼 근거:
  Vernon 의 surrogate 분리(위 3-가).
- **"그럼 Value Object 로 만드세요."** 성급하다. 판정 기준은 "id 를 쓰느냐"가 아니라 **추적
  필요성**이다 — 속성이 바뀐 뒤에도 그것을 다른 것과 구별해 추적해야 하면 Entity 다. 꺼낼 근거:
  "First ask whether that part must itself change over time, or whether it can be completely
  replaced ... If instances can be completely replaced, it points to the use of a value object"
  (Vernon 2011 Part I) + Khorikov 의 교체 가능성 기준.
- **"Entity 로 만들 일이 원래 드뭅니다."** 근거가 있는 반론이다 — 한 프로젝트에서 Aggregate 의
  약 70% 가 root entity + value-typed 속성만이었다는 전언. **다만 조건을 반드시 함께 말한다**:
  Qi4j 프레임워크 · 금융 파생상품 도메인 · 한 팀의 보고이고, Vernon 본인이 "모든 도메인 모델이
  70/30 이라는 뜻은 아니다"라고 단서를 달았다.
- **"id 없는 엔티티는 프레임워크가 허용 안 합니다."** 여기서 **어느 프레임워크인지 밝혀야 한다.**
  JPA `@Embeddable` 컬렉션, EF Core owned entity type 등 제약이 제품마다 다른데 이번 조사에서
  확인하지 않았다 — 대화에서 단정하지 말고 "확인 안 함"으로 남긴다.
- **"숫자를 대라."** 있는 것은 Hedhman 70% 전언 하나뿐이고 조건이 좁다. 나머지는 정의와 규칙의
  문구다. 이 주제에서 수치로 밀면 진다 — 문구로 민다.

## 5. 앵커

| 값 | 출처 |
| --- | --- |
| Entity — "Some objects are not defined primarily by their attributes. They represent a thread of identity that runs through time and often across distinct representations." | Eric Evans, *DDD Reference*(2015-03, CC BY 4.0) p.11 |
| "Define a **means of distinguishing** each object regardless of its form or history. ... Define an operation that is guaranteed to produce a unique result for each object" | 같은 곳 |
| "This means of identification may come from the outside, or it may be **an arbitrary identifier created by and for the system, but it must correspond to the identity distinctions in the model.**" | 같은 곳 |
| "The model must define what it means to be the same thing." | 같은 곳 |
| Value Object — "Tracking the identity of entities is essential, but **attaching identity to other objects can hurt system performance, add analytical work, and muddle the model by making all objects look the same.**" / "Don't give a value object any identity" | 같은 문서 p.12 |
| Aggregate 규칙 3 — "Reference Other Aggregates By Identity"(다른 Aggregate 는 객체 참조가 아니라 식별자로 참조한다) | Vaughn Vernon, *Effective Aggregate Design*(2011) |
| "First ask whether that part must itself change over time, or whether it can be completely replaced when change is necessary. **If instances can be completely replaced, it points to the use of a value object rather than an entity.**" | 같은 글 Part I |
| 한 프로젝트에서 Aggregate 의 **약 70% 가 root entity + value-typed 속성만**, 나머지 30% 도 총 2~3 엔티티 — **조건: Qi4j · 금융 파생상품 · Niclas Hedhman 의 보고를 Vernon 이 전언. "모든 도메인 모델이 70/30 이라는 뜻은 아니다"라는 단서가 원문에 있다** | 같은 글 Part I |
| 식별자 생성 전략 넷(사용자 제공 · 애플리케이션 생성 · 영속화 메커니즘 생성 · 다른 BC 할당) + **surrogate identity** 를 별도 절로 다룸 | Vaughn Vernon, *Implementing Domain-Driven Design*(2013) 5장 — **목차·2차 요약만 확보, 본문 미확보** |
| "속성 집합이 같은 다른 인스턴스로 안전히 바꿔치기할 수 있으면 그것은 value object 신호" | Vladimir Khorikov, "Entity vs Value Object"(2016-01-11) |
| Aggregate — 밖에서는 root 만 참조하고, 트랜잭션은 경계를 넘지 않는다 | Martin Fowler, "DDD_Aggregate"(2013-04-23) |

**인용하지 않기로 한 것**: Vernon *IDDD* surrogate identity 절의 **원문 문구**(본문 미확보 —
"그런 절이 있다"는 사실까지만) · **local identity 를 Evans 의 것으로 돌리는 인용**(2015 Reference
에 그 표현이 없다. 커뮤니티 정식화로만 말한다) · Hedhman 70% 의 원자료(측정 방식·표본 미확인이라
조건 없이 인용하지 않는다) · JPA/EF Core 의 식별자 없는 엔티티 허용 범위(미조사).

## 6. 용어

- **식별성(identity)** — 어떤 것을 다른 것과 구별하고 시간을 가로질러 같은 것으로 잇는 성질.
- **식별자(identifier)** — 그 구별을 실제로 담아내는 값. 식별성과 같은 말이 아니다.
- **surrogate identity(대리 식별자)** — 도메인이 아니라 영속화 메커니즘이 요구해서 두는 식별자.
- **local identity** — Aggregate 안에서만 유일하면 되는 식별자(내부 Entity 용).
- **자연키(natural key) / 대리키(surrogate key)** — 업무 데이터 자체를 키로 쓰는 것 /
  업무와 무관한 값을 키로 만드는 것.
- **identity map** — ORM 이 한 세션 안에서 같은 행을 같은 객체 하나로 유지하는 장치.
- **dirty checking** — ORM 이 로딩 시점 스냅샷과 비교해 바뀐 필드를 찾아내는 방식.
- **Layer Supertype** — 한 층의 여러 클래스가 공통으로 상속하는 상위 타입(Fowler, *PoEAA*).
- **Bounded Context(BC)** — 하나의 모델이 정의되고 통하는 경계.
