# 대담 준비 — 저장도 안 하고 하나만 있으면 되는 그 객체는 도메인의 무엇인가

> 이 문서는 **대화에 들고 들어갈 것**이지 대담 원고가 아니다. 답을 적어 두지 않는다 —
> 적어 두면 대화가 이 문서의 낭독이 된다.
>
> 근거: `~/blog-research/raws/015-ddd-nonpersistent-invariant-holder.md` ·
> 앵글 `wiki/angles/ddd-invariant-holder-talk.md`(mature) ·
> topic `ddd-invariant-enforcement` · `ddd-tactical-building-blocks` · `ddd-entity-identity`
>
> 원 질문(KAN-081-QBTAPJ 원문): "A라는 모델이 있다. 다수의 A에 대해 불변식을 적용해야 해서
> AManager라는 모델을 새로 정의 했다. 하지만, AManager는 영속화 필요가 없고, 처리 맥락 안에서
> 하나만 존재하면 된다. 어쨌든 하나만 존재하면 된다는 자체로 식별성이 있다고 판단하면 될까?
> 그렇지 않다면 식별성이 필수인 Entity나 AR로는 정의할 수 없을 것 같은데 AManager는 도메인
> 모델에서 어떤 개념으로 상정할 수 있을까"

## 1. 질문 순서

이 주제는 **내가 답을 안 들고 들어간다.** 대신 전제 둘을 들고 들어간다 — ①"하나만 존재함"이
식별성일 수 있다는 가능성 ②"Entity·AR 은 식별성이 필수"라는 명제. 순서의 목적은 그 전제 둘을
차례로 시험하고, 시험이 끝난 자리에서 이름을 찾는 것이다. **분류 질문(4번)을 앞에 두지 않는다** —
앞의 셋을 안 거치고 물으면 답이 "도메인 서비스요"로 끝나고 왜 그런지가 안 남는다.

1. **DDD 에서 "불변식"이라는 낱말이 정확히 무엇을 가리키는가.** 즉시·원자적으로 지켜져야 하는
   것만인가, 나중에 맞춰도 되는 규칙도 포함인가.
2. **다수의 A 에 걸친 규칙은 Aggregate 가 담는 종류의 규칙인가.** 아니라면 그 규칙은 원래
   어디에서 지켜지는가.
3. **"처리 맥락 안에 하나만 존재하면 된다"는 것은 식별성인가.** 식별성이 무엇을 위해 요구되는
   것인지부터 되짚으면 답이 갈리는가.
4. **그것이 Entity 도 AR 도 아니라면 DDD 어휘의 어디에 앉는가.** Service · Knowledge Level ·
   Specification 셋을 차례로 대 보면 각각 어디서 어긋나는가.
5. **어긋남이 남는다면 그건 DDD 어휘의 부족인가, 내 모델의 신호인가.** "빌딩블록에 안 맞는
   객체"가 나왔다는 사실 자체가 무엇을 말하는가.
6. **이름을 `AManager` 라고 붙인 것은 결과인가 원인인가.** 이름을 바꾸면 자리도 바뀌는가.

> 6번을 마지막에 두는 이유: 이름 이야기를 먼저 꺼내면 "네이밍 지적"으로 축소된다. 앞의 다섯을
> 거친 뒤에 물어야 **개념이 아직 도메인 언어를 못 얻었다**는 진단으로 읽힌다.

## 2. 내 전제에 대한 판정

### 전제 A — "어쨌든 하나만 존재하면 된다는 것 자체가 식별성이다"

**판정: 성립하지 않는다. 다만 왜 성립하지 않는지가 대화의 재료다.**

- **깨지는 근거**: Evans 가 Entity 를 정의하며 식별성에 부여한 목적이 둘인데 단일 인스턴스는
  그 둘을 모두 잃는다. ① "An object must be distinguished from other objects even though they
  might have the same attributes" — 구별할 상대가 없다. ② "a thread of identity that runs through
  time and often across distinct representations" — 처리 맥락에서 끝나면 가로지를 시간이 없다.
  (DDD Reference 2015, Entities p.11)
- **뒤집어 보는 자리**: 그렇다면 "하나뿐임"은 무엇인가. 식별성이 아니라 **수명과 범위**의 성질
  아닌가. 이 되물음을 대화에서 꺼낸다.
- **성립할 뻔한 조건**: 만약 그 하나가 처리 맥락을 넘어 살아남고, 그것을 다른 실행의 것과
  구별해야 한다면(예: 감사 로그에서 "그때 그 집행자") 그때는 식별성이 생긴다. 지금은 아니다.

### 전제 B — "Entity·AR 은 식별성이 필수이므로 그것으로는 정의할 수 없다"

**판정: 명제 자체는 맞다. 다만 이 명제에서 "그러므로 정의할 수 없다"로 가는 길이 하나 더 있다.**

- **맞는 근거**: Evans 는 Entity 를 "distinguished by its identity, rather than its attributes"
  로 정의하고, Value Object 항목에서는 "Don't give a value object any identity" 로 반대편을
  긋는다. 식별성은 Entity 의 선택 사양이 아니다. (Reference 2015, p.11·p.12)
- **다만 놓치는 갈래**: Evans 가 요구하는 것은 **id 필드가 아니라 구별 수단**이고, 그 수단은
  "an arbitrary identifier created by and for the system" 이어도 된다 — **단 모델의 식별 구분에
  대응해야 한다.** 그러니 "id 를 못 붙이니까 Entity 가 아니다"가 아니라 "**구별할 것이 없으니까**
  Entity 가 아니다"가 정확한 진술이다. 결론은 같고 이유가 다르다. 이 차이를 대화에서 짚는다.

### 전제 C(암묵) — "다수의 A 에 걸친 규칙은 불변식이므로 어딘가에서 즉시 집행돼야 한다"

**판정: 조건부다. 이것이 이 대담에서 제일 값나가는 자리다.**

- **불변식의 정의부터**: "An invariant is a business rule that must always be consistent. ...
  When discussing invariants, we are referring to **transactional consistency**." (Vernon 2011
  Part I) — 나중에 맞춰도 되는 규칙은 이 낱말의 대상이 아니다.
- **기본값이 반대쪽이다**: Vernon 의 규칙 4 가 "Use Eventual Consistency Outside the Boundary"
  다. 경계 밖의 규칙을 즉시 일관으로 지키겠다는 요구는 **기본값에서 벗어나는 선택**이고 근거를
  대야 한다.
- **같은 상황이 정반대 두 신호로 읽힌다**(대화에서 반드시 갈라야 할 자리):
  - "false invariants ... artificial constraints imposed by developers" — 개발자가 만든 인공
    제약일 수 있다.
  - "Trying to keep multiple aggregate instances consistent may be telling you that your team has
    **missed an invariant.** You may end up folding the multiple aggregates into one new concept
    with a new name" — 놓친 진짜 불변식일 수 있고, 그러면 AManager 가 바로 그 "새 이름을 가진
    하나의 개념"이다.
  - 가르는 기준은 **그 규칙이 즉시·원자적으로 지켜져야 하는가** 하나다. 이 물음을 대화에서
    내가 먼저 답해야 한다(내 도메인 사정이라 상대가 모른다).

## 3. 후보 자리 셋과 각각의 어긋남

전제가 정리된 뒤에도 "그래서 무엇인가"는 남는다. 후보가 셋인데 **셋 다 어긋나는 데가 있다.**
그 어긋남을 덮지 않는 것이 이 대담의 값이다.

| 후보 | 붙는 근거 | 어긋나는 곳 |
| --- | --- | --- |
| Service | "Sometimes, it just isn't a thing." Entity·VO 로 억지로 만들면 "무의미한 인공 객체"가 된다는 경고가 이 항목에 있다 | 2004 원서는 Service 에 stateless 를 요구한다. AManager 는 A 들을 들고 판정하므로 상태가 있다 — **다만 2015 Reference 의 Services 항목에는 stateless 라는 낱말이 자체가 없다**(판본을 밝혀야 하는 자리) |
| Knowledge Level | "다른 객체 무리가 어떻게 행동해야 하는지를 기술하는 객체 무리" — 규칙이 기본 모델과 다른 층에 산다는 발상 자체 | 동기가 "사용자·슈퍼유저가 커스터마이즈하는 규칙"이고 그 규칙 객체들은 보통 영속화된다 |
| Specification | 판정을 도메인 객체로 세우는 자리. 불변식 판정과 결이 같다 | **2015 Reference 에 항목이 없다**(2004 원서 9장에는 있다). 인용 시 판본을 밝혀야 한다 |

## 4. 예상 반론

- **"그건 그냥 도메인 서비스입니다."** 되받을 자리는 상태다 — 서비스가 A 들을 들고 있어도 되는가.
  꺼낼 근거: 2015 Reference Services 항목에 stateless 요구가 없다는 사실과, 2004 원서에는 있다는
  사실 **둘 다**. 어느 판본을 근거로 말하는지 물어야 대화가 갈라지지 않는다.
- **"영속화 안 되는 Aggregate 도 있습니다."** 되받을 자리는 Aggregate 의 정의 목적이다 —
  Evans 는 집행 책임을 "the root **or some designated framework mechanism**" 에 준다. 이 두 번째
  갈래가 무엇을 가리키는지 물을 것. 다만 이 문장은 Aggregate **하나**의 불변식에 대한 것이라
  여러 인스턴스에 걸친 규칙으로 확장 인용하면 안 된다(내가 먼저 이 단서를 달 것).
- **"유일성 검사 같은 거면 set-based validation 문제입니다."** 실무 갈래 넷(도메인 서비스 /
  전용 Aggregate / DB 제약 / 결과적 일관성)이 있다는 건 맞다. 다만 **넷 다 영속화된 집합을
  전제한다.** 내 경우는 영속화가 없다 — 이 어긋남을 대화에 올린다.
- **"이름이 문제입니다."** 맞는 지적이지만 순서가 있다. 이름 논의는 6번 질문 자리에서 받는다.
- **"숫자를 대라."** 이 주제에는 인용할 수치가 사실상 없다. 있는 것은 정의와 규칙의 문구뿐이고,
  실측 비슷한 것은 Hedhman 의 70% 전언 하나인데 그건 주제②의 재료다(조건도 좁다).

## 5. 앵커

| 값 | 출처 |
| --- | --- |
| "An invariant is a business rule that must always be consistent. ... we are referring to transactional consistency." | Vaughn Vernon, *Effective Aggregate Design Part I*(2011), "Model True Invariants" 절 |
| Aggregate 설계 네 규칙 — ①Model True Invariants In Consistency Boundaries ②Design Small Aggregates ③Reference Other Aggregates By Identity ④Use Eventual Consistency Outside the Boundary | 같은 에세이 3부작(2011) |
| "the large cluster aggregate was designed with **false invariants** in mind, not real business rules. These false invariants are artificial constraints imposed by developers." | 같은 글 Part I |
| "Trying to keep multiple aggregate instances consistent may be telling you that your team has missed an invariant. You may end up folding the multiple aggregates into one new concept with a new name" | 같은 글 Part I |
| Aggregate 정의 — "give enforcement responsibility to **the root or some designated framework mechanism**" / "Within an aggregate boundary, apply consistency rules synchronously. Across boundaries, handle updates asynchronously." | Eric Evans, *DDD Reference*(2015-03, CC BY 4.0) p.16 |
| Entity 정의 — "An object must be distinguished from other objects even though they might have the same attributes." / "The model must define what it means to be the same thing." | 같은 문서 p.11 |
| Value Object — "attaching identity to other objects can hurt system performance, add analytical work, and muddle the model" / "Don't give a value object any identity" | 같은 문서 p.12 |
| Service — "Sometimes, it just isn't a thing." / "Forcing the required domain functionality to be the responsibility of an entity or value either **distorts the definition of a model-based object or adds meaningless artificial objects.**" / "Give the service a name, which also becomes part of the ubiquitous language." | 같은 문서 p.14 |
| Knowledge Level — "A group of objects that describe how another group of objects should behave." (원 출처: Fowler, *Analysis Patterns*, 1997) | 같은 문서 p.51 |
| **2015 Reference 의 Services 항목에는 "stateless" 가 없다** (2004 원서의 Service 3특징에는 있다) | 같은 문서 전문 검색으로 확인 |
| **2015 Reference 에는 Specification 패턴 항목 자체가 없다** (2004 원서 9장에는 있다) | 같은 문서 목차·전문 검색으로 확인 |
| set-based validation 실무 갈래 넷(도메인 서비스 · 전용 Aggregate · DB 제약 · 결과적 일관성) | AxonIQ code-samples `set-based-validation-actor-model` · ardalis/DDD-NoDuplicates · Kamil Grzybek "Domain Model Validation" |
| `-Manager` 이름 스멜 — 그 객체가 무엇을 하는지 말해 주지 않는다 | Jeff Atwood "I Shall Call It... SomethingManager" · Peter Hilton "Naming smells" · Poltergeist 안티패턴 |

**인용하지 않기로 한 것**: 2004 원서 Services 절의 "stateless" 3특징 원문(1차 미확인 — 2차
인용만 확보했다. 판본 차이를 말할 때는 "2015 Reference 에 없다"는 확인된 사실 쪽만 쓴다) ·
2015 Reference 에서 Specification 이 빠진 이유(미확인, 사실만 말하고 해석하지 않는다).

## 6. 용어

- **불변식(invariant)** — 항상 참이어야 하는 업무 규칙. DDD 에서는 **트랜잭션 일관성**을 뜻한다.
- **Aggregate** — 함께 일관성을 지키는 Entity·Value Object 묶음과 그 경계.
- **Aggregate Root(AR)** — 그 묶음의 대표 Entity. 밖에서는 이것만 참조한다.
- **Entity** — 속성이 아니라 식별성으로 정의되는 객체.
- **Value Object(VO)** — 식별성 없이 속성만으로 정의되는 불변 객체.
- **Domain Service** — Entity·VO 의 자연스러운 책임이 아닌 도메인 연산을 독립 인터페이스로 세운 것.
- **Specification** — 어떤 객체가 기준을 만족하는지 판정하는 도메인 객체(2004 원서 9장).
- **Knowledge Level** — 기본 모델의 구조·행동을 기술·제약하는 별도 층의 객체 무리.
- **set-based validation** — 한 인스턴스가 아니라 **집합 전체**를 봐야 판정되는 규칙의 검증
  (대표 사례가 유일성 제약).
- **TOCTOU(time-of-check to time-of-use)** — 검사 시점과 사용 시점 사이에 상태가 바뀌어 검사가
  무의미해지는 경합.
- **유비쿼터스 언어(ubiquitous language)** — 팀과 코드가 함께 쓰는, 도메인에서 온 한 벌의 말.
