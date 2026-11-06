# AManager 는 도메인 모델의 무엇인가 — 대화 원문 보관

이 파일은 폭신 대담의 L1 원문이다. 준비 노트(`raws/talks/_prep/nonpersistent-invariant-holder.md`)의 질문 순서·전제 판정·되받기를 글쓴이 발화로 삼아, 교수님 역할의 AI(Claude Code 세션, Claude Fable 5.1)가 답했다. 글쓴이가 직접 자판을 친 대화가 아니다. 글쓴이 쪽 발화는 준비 노트와 KAN-081 원문에 적힌 것 밖으로 나가지 않도록 했고, 답변은 이 세션에서 새로 생성됐다. 문답의 흐름을 보존하기 위해 시간 순서로 기록한다.

## 사용자 · 원 질문

A라는 모델이 있다. 다수의 A에 대해 불변식을 적용해야 해서 AManager라는 모델을 새로 정의했다. 하지만 AManager는 영속화 필요가 없고, 처리 맥락 안에서 하나만 존재하면 된다. 어쨌든 하나만 존재하면 된다는 것 자체로 식별성이 있다고 판단하면 될까? 그렇지 않다면 식별성이 필수인 Entity나 AR로는 정의할 수 없을 것 같은데, AManager는 도메인 모델에서 어떤 개념으로 상정할 수 있을까.

순서를 정해 왔다. 분류부터 묻지 않겠다. DDD에서 "불변식"이라는 낱말이 정확히 무엇을 가리키는지부터 묻고 싶다. 즉시·원자적으로 지켜져야 하는 것만 불변식인가, 나중에 맞춰도 되는 규칙도 포함인가.

## 답변 · 불변식이라는 낱말

그 질문부터 시작하신 것이 맞습니다. "불변식"이라는 낱말을 쓰는 순간 이미 결정 하나가 들어가 있거든요.

DDD 에서 이 낱말은 "항상 참이어야 하는 규칙" 정도의 느슨한 뜻이 아닙니다. Vaughn Vernon 이 Effective Aggregate Design 1부에서 이렇게 적어 두었습니다. "An invariant is a business rule that must always be consistent. ... When discussing invariants, we are referring to transactional consistency." 불변식이란 항상 일관돼야 하는 업무 규칙이고, 여기서 말하는 일관성은 트랜잭션 일관성이라는 겁니다. 트랜잭션이 끝나는 순간에 참이어야 하고, 그 사이의 어긋난 상태가 밖에서 관측되면 안 되는 규칙이요.

Evans 의 DDD Reference 도 같은 선을 긋습니다. Aggregate 항목에 "Within an aggregate boundary, apply consistency rules synchronously. Across boundaries, handle updates asynchronously." 경계 안에서는 동기로, 경계 밖에서는 비동기로. 그러니까 "나중에 맞춰도 되는 규칙"은 이 어휘에서 불변식이 아닙니다. 그건 결과적 일관성으로 다루는 규칙이고, Vernon 의 네 규칙 중 넷째가 바로 그것입니다. "Use Eventual Consistency Outside the Boundary."

그래서 되묻게 됩니다. 다수의 A 에 걸쳐 지켜야 한다는 그 규칙은, 한순간이라도 깨진 상태가 관측되면 업무가 잘못됐다고 말하는 규칙입니까. 아니면 잠깐 어긋났다가 맞춰져도 업무에는 아무 일도 안 생기는 규칙입니까. 이 답은 제가 못 드립니다. 도메인을 아는 분이 답해야 하고, 이 대화의 나머지가 전부 이 답에 걸립니다.

## 사용자 · 아직 갈라 보지 않았다

솔직히 그 구분을 해 본 적이 없다. 깨지면 안 되는 규칙이니까 불변식이라고 불렀지, 트랜잭션 안에서 지켜져야 하는지 나중에 맞춰도 되는지를 갈라서 생각한 적은 없다. 양쪽을 다 들고 가 보고 싶다.

그러면 다음 질문이다. 다수의 A 에 걸친 규칙은 Aggregate 가 담는 종류의 규칙인가. 아니라면 그 규칙은 원래 어디에서 지켜지는가.

## 답변 · Aggregate 가 담는 규칙인가

양쪽을 들고 가도 됩니다. 다만 두 갈래가 어디서 갈라지는지는 지금 표시해 두겠습니다.

Aggregate 는 일관성의 단위입니다. Evans 는 Aggregate 의 불변식 집행 책임을 "the root or some designated framework mechanism", 루트 또는 지정된 프레임워크 장치에 줍니다. 그런데 이 문장은 Aggregate 하나의 불변식에 대한 것입니다. 여러 Aggregate 인스턴스에 걸친 규칙을 어디서 지키느냐에 대한 문장이 아니에요. 이 문장을 끌어다가 "AManager 가 그 designated mechanism 이다"라고 하면 인용 범위를 넘습니다.

여러 A 에 걸친 규칙의 기본값은 Aggregate 가 아닙니다. 방금 본 넷째 규칙이 그 기본값을 정해 두었죠. 경계 밖은 결과적 일관성입니다. 그래서 "다수의 A 를 즉시 일관으로 묶겠다"는 요구는 기본값에서 벗어나는 선택이고, 벗어나려면 근거를 대야 합니다.

여기서 Vernon 이 같은 상황을 정반대의 두 신호로 읽습니다. 하나는 "the large cluster aggregate was designed with false invariants in mind, not real business rules. These false invariants are artificial constraints imposed by developers." 개발자가 만든 인공 제약이라는 겁니다. 다른 하나는 "Trying to keep multiple aggregate instances consistent may be telling you that your team has missed an invariant. You may end up folding the multiple aggregates into one new concept with a new name." 여러 Aggregate 를 일관되게 유지하려 애쓰고 있다면 팀이 진짜 불변식을 놓친 것일 수 있고, 그러면 그 여럿을 새 이름을 가진 하나의 개념으로 접게 된다는 겁니다.

AManager 는 이 두 문장 사이에 서 있습니다. 인공 제약을 집행하려고 만든 물건이거나, 놓친 개념이 이름을 못 얻은 채 먼저 나타난 것이거나. 어느 쪽인지 가르는 기준은 하나뿐입니다. 그 규칙이 정말 트랜잭션 안에서 지켜져야 하는가. 첫 질문이 여기로 되돌아옵니다.

하나 더 확인할 것이 있습니다. A 하나하나가 각자 Aggregate 입니까, 아니면 무언가의 안에 들어 있는 Entity 입니까. "A 들에 대해 불변식을 적용한다"고 하셔서 저는 A 를 각자 저장되고 각자 불려 오는 Aggregate 로 듣고 있습니다. 만약 A 들이 원래 하나의 Aggregate 안에 사는 것이라면 얘기가 달라집니다. 그때는 그 규칙을 지킬 자리가 이미 있어요. 루트입니다. AManager 는 루트가 할 일을 밖에서 대신하고 있는 것이고, 그건 루트가 비어 있다는 신호입니다.

## 사용자 · 하나만 존재한다는 것

A 가 각자 Aggregate 인지는 돌아가서 확인하겠다. AManager 가 A 들을 밖에서 들고 판정하는 모양이라는 것만 놓고 가자.

그러면 원래 궁금했던 자리로 가겠다. "처리 맥락 안에 하나만 존재하면 된다"는 것은 식별성인가. 하나뿐이니까 다른 것과 헷갈릴 일이 없고, 그러면 그것으로 식별된다고 볼 수 있지 않나. 식별성이 무엇을 위해 요구되는 것인지부터 되짚으면 답이 갈리는가.

## 답변 · 하나뿐임은 식별성이 아니다

그 질문에 답하려면 식별성이 무엇을 위해 요구되는지부터 봐야 합니다. 요구의 목적을 보면 "하나뿐임"이 그 목적을 채우는지 바로 보이거든요.

Evans 가 Entity 를 정의하면서 식별성에 준 역할은 둘입니다. 하나는 "An object must be distinguished from other objects even though they might have the same attributes." 같은 속성을 가진 다른 객체와 구별돼야 한다. 다른 하나는 Entity 가 "a thread of identity that runs through time and often across distinct representations", 시간을 가로지르고 여러 표현을 가로지르는 정체성의 실을 나타낸다는 것. 구별과 연속. 이 둘이 식별성이 하는 일입니다.

처리 맥락 안에 하나만 사는 객체는 이 둘을 모두 잃습니다. 구별할 상대가 없고, 가로지를 시간이 없어요. 맥락이 시작할 때 생겨서 맥락이 끝나면 사라지는데, 그 사이에 "이게 아까 그것인가"를 물을 일이 없습니다. 그러니 "하나뿐이니까 식별된다"는 말은 식별성이 아니라 다른 것을 말하고 있는 겁니다. 수명과 범위요. 한 처리 맥락이라는 범위 안에 인스턴스가 하나라는 것은 개수의 성질이지 정체성의 성질이 아닙니다.

뒤집어 보면 언제 식별성이 생기는지도 보입니다. 그 하나가 처리 맥락을 넘어 살아남고, 다른 실행의 것과 구별해야 할 때요. 감사 기록에서 "그때 그 집행이 어느 판정이었나"를 되짚어야 한다면 그 순간 구별할 상대가 생기고, 그때는 식별자가 필요해집니다. 지금 말씀하신 조건에서는 그게 없습니다.

그러면 두 번째 전제, "Entity 와 AR 은 식별성이 필수이므로 그것으로는 정의할 수 없다"는 것은 어떻게 되느냐. 명제는 맞습니다. Entity 는 "distinguished by its identity, rather than its attributes" 로 정의되고, Value Object 항목은 "Don't give a value object any identity" 로 반대편을 긋습니다. 식별성은 Entity 의 선택 사양이 아니에요. 다만 그 결론에 이르는 길이 하나 더 있고, 저는 그쪽이 더 정확하다고 봅니다. Evans 는 식별 수단이 "an arbitrary identifier created by and for the system" 이어도 된다고 명시합니다. 그러니 id 를 붙이는 것 자체는 언제든 할 수 있어요. AManager 에 UUID 하나 달아 주는 건 한 줄입니다. 그런데 바로 이어서 "but it must correspond to the identity distinctions in the model" 이라고 합니다. 그 식별자가 모델 안의 어떤 구별에 대응해야 한다는 겁니다. AManager 에는 대응할 구별이 없습니다. 그래서 정확한 진술은 "id 를 못 붙이니까 Entity 가 아니다"가 아니라 "구별할 것이 없으니까 Entity 가 아니다"입니다. 결론은 같은데 이유가 다르고, 이 차이가 다음 질문에서 쓰입니다.

## 사용자 · 그러면 어디에 앉는가

Entity 도 AR 도 아니라는 건 받아들이겠다. 그러면 DDD 어휘의 어디에 앉는가. 후보를 셋 생각해 왔다. Service, Knowledge Level, Specification. 차례로 대 보면 각각 어디서 어긋나는가.

## 답변 · 후보 셋과 각각의 어긋남

셋 다 붙는 데가 있고 셋 다 어긋나는 데가 있습니다. 어긋나는 데를 덮지 않고 가겠습니다.

Service 부터요. Evans 의 Services 항목은 이 상황을 거의 그대로 적어 놓은 것처럼 읽힙니다. "Sometimes, it just isn't a thing." 때로는 그것이 사물이 아니라는 겁니다. 이어서 "Forcing the required domain functionality to be the responsibility of an entity or value either distorts the definition of a model-based object or adds meaningless artificial objects." 필요한 도메인 기능을 억지로 Entity 나 Value 의 책임으로 만들면 모델 객체의 정의가 비틀리거나 무의미한 인공 객체가 생긴다. AManager 에 id 를 달아 Entity 로 세우려던 시도가 정확히 이 경고의 대상입니다. 그리고 항목이 이렇게 끝납니다. "Give the service a name, which also becomes part of the ubiquitous language." 이름이 유비쿼터스 언어의 일부가 된다.

어긋나는 곳은 상태입니다. 2004 년 원서가 Service 의 특징 셋을 들면서 stateless 를 넣었다고 알려져 있는데, 저는 그 원문을 이 자리에서 확인해 드리지 못합니다. 2차 인용으로만 압니다. 확인된 것은 반대쪽입니다. 2015 년 DDD Reference 의 Services 항목에는 stateless 라는 낱말이 없습니다. 전문을 검색해도 안 나와요. 그러니 "서비스는 무상태여야 하니까 A 들을 들고 있는 AManager 는 서비스가 아니다"라고 말하려면 어느 판본을 근거로 말하는지 먼저 밝혀야 합니다. 2015 Reference 를 근거로 삼으면 그 반론은 성립하지 않습니다.

그리고 "들고 있다"가 상태인지도 따져 볼 만합니다. AManager 가 처리 맥락이 열릴 때 A 들을 받아 판정하고 맥락이 닫히면 사라진다면, 그 A 들은 서비스의 상태라기보다 연산의 입력에 가깝습니다. 입력을 객체 안에 묶어 두었다고 해서 서비스가 아니게 되지는 않아요. 다만 이 부분은 제 해석입니다. Evans 나 Vernon 이 이렇게 갈라 말한 문장을 저는 갖고 있지 않습니다.

Knowledge Level 은 Fowler 의 Analysis Patterns 에서 온 것인데, Reference 가 이렇게 정의합니다. "A group of objects that describe how another group of objects should behave." 다른 객체 무리가 어떻게 행동해야 하는지를 기술하는 객체 무리. 규칙이 기본 모델과 다른 층에 산다는 발상 자체는 AManager 와 결이 같습니다. A 들의 행동을 A 밖에서 규정하니까요. 어긋나는 곳은 동기와 수명입니다. 이 패턴의 동기는 사용자나 관리자가 규칙을 커스터마이즈하는 상황이고, 그래서 규칙 객체들이 보통 영속화됩니다. AManager 는 영속화되지 않는다고 하셨으니 그 동기와 다릅니다. 붙는 것은 발상이고 어긋나는 것은 용도입니다.

Specification 은 판정을 도메인 객체로 세우는 패턴이라 불변식 판정과 결이 가장 가깝습니다. 어긋나는 곳은 출처입니다. 2015 Reference 에는 Specification 항목 자체가 없습니다. 2004 원서 9장에는 있습니다. 왜 빠졌는지는 저도 모릅니다. 그러니 이걸 인용하려면 판본을 밝혀야 하고, 2015 Reference 만 근거로 삼는 자리에서는 꺼낼 수 없는 이름입니다.

셋을 늘어놓고 보면 가장 가까운 것은 Service 입니다. 남는 어긋남은 상태 하나이고, 그 어긋남의 무게는 어느 판본을 인용하느냐에 따라 달라집니다.

## 사용자 · 그렇다면 그냥 도메인 서비스라는 말인가

그러면 결국 "그건 그냥 도메인 서비스입니다"로 끝나는 건가. 그 답이 너무 쉽게 나와서 오히려 의심스럽다. 어긋남이 남는다면 그건 DDD 어휘가 부족한 것인가, 아니면 내 모델이 보내는 신호인가. 빌딩블록 어디에도 딱 안 맞는 객체가 나왔다는 사실 자체가 무엇을 말하는가.

## 답변 · 어휘의 부족이 아니라 결정의 부재

그 의심이 맞습니다. "도메인 서비스요"로 끝내면 왜 그런지가 안 남고, 그러면 다음에 비슷한 객체가 나왔을 때 또 처음부터 묻게 됩니다.

먼저 전제를 하나 흔들겠습니다. DDD 의 빌딩블록은 모든 객체를 빠짐없이 분류하는 체계가 아닙니다. 모델을 만들 때 쓰는 도구 몇 가지예요. 그러니 어느 칸에도 안 들어가는 객체가 나왔다고 해서 체계에 구멍이 난 것이 아닙니다. 그 객체는 정보입니다. 무엇에 대한 정보냐면, 아직 안 내려진 결정에 대한 정보입니다.

두 번째 답변에서 표시해 둔 갈림길로 돌아가 보죠. 그 규칙이 진짜 불변식이라면, Vernon 의 말대로 팀이 놓친 개념이 있는 겁니다. 여러 A 를 "새 이름을 가진 하나의 개념"으로 접게 되고, 그 개념이 곧 Aggregate 입니다. 이때 AManager 는 도메인 서비스가 아니라 그 개념이 이름을 못 얻은 채 먼저 나타난 것이에요. 그리고 이 갈래에서는 전제 하나가 뒤집힙니다. "영속화 필요가 없다"는 전제요. A 들을 접어 넣은 새 개념은 A 들과 함께 저장되는 것이 자연스럽고, 그러면 그 물건은 처리 맥락 안에 하나만 사는 것이 아니라 A 들의 수명을 같이 삽니다. 지금 보고 계신 AManager 의 모양과는 다른 물건이 되는 거죠.

그 규칙이 진짜 불변식이 아니라면, 즉 잠깐 어긋나도 업무에 아무 일도 안 생긴다면, 그 규칙은 경계 밖에서 결과적으로 맞추는 것이고 즉시 집행할 자리가 필요 없습니다. 판정은 도메인 서비스 하나로 충분하고, 그때 "Sometimes, it just isn't a thing" 이 그대로 적용됩니다. 물건이 아니니까 이름을 가진 객체를 세울 필요가 없어요.

두 갈래 모두에서 AManager 는 지금 모양대로 남지 않습니다. 한쪽에서는 Aggregate 로 자라고, 다른 쪽에서는 서비스로 얇아집니다. 그러니까 "빌딩블록에 안 맞는 객체"는 어휘가 모자라다는 뜻이 아니라, 첫 질문의 답이 아직 안 나왔다는 뜻입니다. 그 답이 나오는 순간 자리가 정해지고, 그 전까지는 어느 칸에도 안 들어가는 것이 정상입니다.

실무에서 이런 규칙을 다루는 갈래를 넷 정도 봅니다. 도메인 서비스, 그 규칙만을 위한 전용 Aggregate, 데이터베이스 제약, 결과적 일관성. 유일성 검사 같은 set-based validation 논의에서 늘 나오는 넷인데, 넷 다 영속화된 집합을 전제한다는 점을 말씀드려야겠습니다. AManager 의 경우는 영속화가 없다고 하셨으니 이 넷을 그대로 가져다 쓰기 전에 무엇이 다른지부터 봐야 합니다. 그 차이까지는 제가 도메인을 몰라서 못 짚습니다.

## 사용자 · 이름은 결과인가 원인인가

마지막 질문이다. 이름을 AManager 라고 붙인 것은 결과인가 원인인가. 이름을 바꾸면 자리도 바뀌는가.

## 답변 · 이름이 안 찾아지면 자리가 정해진다

결과입니다. 그리고 결과인데도 쓸모가 있습니다.

`-Manager` 라는 접미사는 그 객체가 무엇을 하는지 말해 주지 않는 이름으로 오래전부터 지목돼 왔습니다. Jeff Atwood 가 "I Shall Call It... SomethingManager" 라고 놀린 그 이름이고, Peter Hilton 의 naming smells 목록에도 있습니다. 왜 그 이름이 붙느냐면, 무엇을 하는지는 알겠는데 도메인에서 그것을 부르는 말을 아직 못 찾았을 때 붙습니다. 그러니 이름은 원인이 아니라 증상입니다.

그런데 Services 항목의 마지막 문장을 다시 보세요. "Give the service a name, which also becomes part of the ubiquitous language." 서비스라면 이름이 곧 유비쿼터스 언어의 일부가 돼야 합니다. 그 규칙을 업무에서 뭐라고 부르는지 물어보시면 됩니다. 그 이름이 있으면 그것이 서비스의 이름입니다. 앞 답변의 다른 갈래, 놓친 개념이라면 그 개념의 이름이 있을 것이고 그것은 Aggregate 의 이름이 됩니다.

이름을 바꾼다고 자리가 바뀌지는 않습니다. 순서가 반대예요. 자리가 정해지면 이름이 따라오고, 이름이 안 찾아지면 그것이 자리를 말해 줍니다. 업무에서 그 규칙을 부르는 말이 아무리 찾아도 없다면, 그건 "인공 제약" 쪽 신호입니다. 개발자가 만든 제약에는 도메인의 이름이 없으니까요.

이름을 제가 지어 드릴 수는 없습니다. 도메인을 모르니까요. 다만 순서는 드릴 수 있습니다. 규칙이 즉시 지켜져야 하는지 먼저 답하고, 그 답에 따라 자리를 정하고, 그 자리에서 업무의 말로 이름을 찾는 겁니다. 이름은 맨 끝입니다.

## 보관 메모

이 대화는 KAN-081-QBTAPJ 의 첫 번째 주제다. 준비 노트의 앵커 밖 주장을 답변에 넣지 않았고, 준비 노트가 "인용하지 않기로 한 것"(2004 원서 Services 절의 stateless 원문 · 2015 Reference 에서 Specification 이 빠진 이유)은 답변에서도 "확인하지 못했다"로만 다뤘다. 글쓴이의 도메인 사정(그 규칙이 트랜잭션 안에서 지켜져야 하는가 · A 가 각자 Aggregate 인가)은 이 대화에서 답해지지 않았고, 답해지지 않은 채로 남긴다.
