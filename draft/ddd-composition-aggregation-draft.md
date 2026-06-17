---
source: raws/IDEAS.md
generated: 2026-06-10
category: design
---

<!--
이 파일은 draft/ 의 작업용 스캐폴드입니다. 정식 글이 아닙니다.
플롯을 고르고 본문을 채운 뒤 publish-post 로 src/content/posts/ 에 발행합니다.
발행 시 publish-post 가 아래 frontmatter를 정식 스키마로 변환합니다:
  title, description, pubDate(YYYY-MM-DD), category, tags[], (선택) series, order, draft
-->

# DDD에서 Composition과 Aggregation을 어떻게 구분할 것인가

> Composition은 생명주기를 공유하는 소속 관계이고, Aggregation은 바깥 생명주기를 가진 대상을 필요할 때 참조하는 관계다.

## 플롯 후보

### Plot A: 개념 정립형
- **적합한 독자/상황**: UML 용어와 DDD Aggregate 경계가 섞여 혼란스러운 독자
- **구성 흐름**:
  1. Composition과 Aggregation을 사전적 정의가 아니라 생명주기 기준으로 다시 정의한다.
  2. Composition으로 연관된 모델이 Aggregate 내부로 들어가는 이유를 설명한다.
  3. Aggregation은 참조이며, 참조 대상의 생명주기는 Aggregate 바깥에 있음을 설명한다.
  4. DB에서는 key 칼럼이 필요할 수 있지만 도메인 모델에 참조를 노출할 필요는 없다는 점을 설명한다.
  5. 경계 판단 질문으로 마무리한다.
- **이 플롯의 강점**: 개념 혼동을 직접 해소하기 좋다.
- **주의할 점**: UML의 Composition/Aggregation 정의와 DDD의 Aggregate 개념을 무리하게 동일시하지 않아야 한다.

### Plot B: 도메인 메서드 설계 사례형
- **적합한 독자/상황**: 참조 Aggregate를 도메인 객체 안에 필드로 들고 있어야 하는지 고민하는 개발자
- **구성 흐름**:
  1. 한 Aggregate가 다른 Aggregate의 데이터가 필요한 기능을 예시로 든다.
  2. 참조 Aggregate를 필드로 들고 있는 설계의 문제를 설명한다.
  3. DAO로 필요한 데이터를 구해 도메인 메서드 파라미터로 전달하는 대안을 설명한다.
  4. DB의 foreign key와 도메인 객체 참조는 다른 층위의 선택임을 구분한다.
  5. 의존성과 생명주기를 분리하는 설계 원칙으로 정리한다.
- **이 플롯의 강점**: 코드 설계 판단으로 바로 연결된다.
- **주의할 점**: DAO를 도메인 내부에서 호출하는 방식으로 오해되지 않게 application service 위치를 분명히 해야 한다.

### Plot C: 경계 검토 Q&A형
- **적합한 독자/상황**: Aggregate 경계 리뷰에서 빠르게 판단 질문을 던지고 싶은 팀
- **구성 흐름**:
  1. "이 객체는 부모 없이는 존재할 수 있는가?"라는 질문으로 Composition을 판별한다.
  2. "변경 트랜잭션을 함께 묶어야 하는가?"라는 질문으로 Aggregate 소속 여부를 본다.
  3. "기능 수행에 데이터만 필요한가?"라는 질문으로 Aggregation 참조를 판별한다.
  4. "DB FK가 있다고 도메인 참조가 필요한가?"라는 질문으로 persistence와 domain을 분리한다.
  5. 질문 목록을 설계 리뷰 체크리스트로 정리한다.
- **이 플롯의 강점**: 짧고 실용적인 글로 만들 수 있다.
- **주의할 점**: 질문만 나열하면 개념 설명이 부족해질 수 있다.

## 주의사항 / 잊지 말아야 할 점

- Composition의 핵심은 포함 모양이 아니라 의존적 생명주기다.
- Aggregation은 참조이며, 참조 대상의 생성·변경·삭제 생명주기는 바깥에서 발생한다.
- DB의 key 칼럼 존재와 도메인 객체 참조는 같은 결론이 아니다.
- 참조 Aggregate의 데이터가 필요할 때는 application/service 계층에서 조회한 뒤 도메인 메서드 인자로 전달하는 방식을 설명해야 한다.
- Aggregate 경계는 데이터 접근 편의가 아니라 일관성 경계와 생명주기 기준으로 판단한다.
- Composition/Aggregation 용어를 UML 문법 설명으로 끝내지 말고 DDD 모델링 판단으로 연결한다.

## 선택한 플롯

<!-- A / B / C 중 하나를 적어주세요. 이후 본문 초안 작성의 기준이 됩니다. -->
