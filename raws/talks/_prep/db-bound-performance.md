# 대담 준비 — 성능이 DB 질의에 지배될 때 알고리즘은 어디서 도는가

> 이 문서는 **대화에 들고 들어갈 것**이지 대담 원고가 아니다. 답을 적어 두지 않는다 —
> 적어 두면 대화가 이 문서의 낭독이 된다.
>
> 근거: `~/blog-research/raws/013-db-bound-query-performance.md` ·
> 앵글 `wiki/angles/db-bound-query-strategies.md`(mature) ·
> topic `db-bound-query-performance` · `postgresql-index-internals` ·
> `approximate-data-structures` · `computation-pushdown-principle` · `in-memory-olap-engines`

## 1. 질문 순서

이 주제는 앞의 것과 결이 다르다. **내가 이미 답을 하나 들고 들어간다**(버퍼에 올리는 수밖에
없다는 전제). 그래서 순서의 목적이 정보 수집이 아니라 **내 전제를 검증받는 것**이다.

1. **"백엔드 로직에 개입할 여지가 없다"는 관찰은 맞는가.** 맞다면 그건 무엇을 뜻하는가 —
   개입이 불가능하다는 뜻인가, 개입 지점이 다른 층에 있다는 뜻인가.
2. **인덱스를 고르는 것은 알고리즘을 고르는 것인가.** B-tree · GIN · BRIN 이 각각 언제 성립하고,
   index-only scan 은 무엇을 전제로 성립하는가.
3. **근사 자료구조는 어디서 도는가.** HyperLogLog·t-digest 를 쓰려면 데이터가 앱까지 나와야 하는가.
4. **사전 계산은 이 질문을 없애는가.** materialized view·롤업이 read 경로에서 지우는 것은 정확히
   무엇이고, 대신 무엇을 떠안는가.
5. **반대 방향은 실재하는가.** 알고리즘을 UDF·확장으로 DB 안에 내리는 길. 실재한다면 왜 기본값이
   아닌가.
6. **"계산을 데이터로 보낸다"는 원칙은 어디서 왔는가.** 신조어인가, 이미 정식화된 것인가.
7. **그래서 언제 진짜로 메모리에 올려야 하는가.** 내 전제가 성립하는 조건은 무엇인가.

> 7번을 마지막에 두는 것이 핵심이다. 앞의 여섯을 거친 뒤에 물어야 "그래도 올려야 하는 자리"가
> 항복이 아니라 **판단**이 된다.

## 2. 내 전제에 대한 판정

**전제**: "알고리즘이나 자료구조를 이용하려면 일단 데이터를 버퍼 위에 올려 놓는 수밖에 없다."

**판정: 부분적으로만 성립한다.** 깨지는 자리가 셋이다.

### 성립하는 조건

DB 엔진이 그 자료구조를 네이티브로도 확장으로도 지원하지 않고, 팀이 UDF·확장을 직접 짤 의사가
없을 때. 그때는 실질적으로 유일한 경로가 맞다.

### 깨지는 조건 1 — 엔진이 이미 알고리즘을 고르고 있다

"일반적인 백엔드 로직에는 개입의 여지가 없다"는 **관찰 자체는 정확하다.** 다만 그것이 뜻하는
바는 개입이 불가능하다가 아니라 **개입 지점이 애플리케이션 코드가 아니라 스키마·DDL 층**이라는
것이다. 인덱스 종류 선택과 커버링 인덱스 설계가 그 자리다. BRIN 은 컬럼 값이 **물리적 행 순서와
상관될 때만** 효과가 있다는 조건이 붙는데, 이건 자료구조 선택 그 자체다.

근거: PostgreSQL 공식 문서(인덱스 종류 · index-only scan · BRIN). topic
`postgresql-index-internals`.

### 깨지는 조건 2 — 근사 자료구조는 DB 프로세스 안에서 돈다

`postgresql-hll` · `tvondra/tdigest` · ClickHouse `uniqCombined` · Elasticsearch cardinality
agg 는 전부 **DB(또는 검색엔진) 프로세스 메모리에서 유지·갱신된다.** 원본 행이 앱까지 나올
필요가 없다. 즉 "자료구조를 쓰려면 데이터를 옮겨야 한다"가 여기서 끊긴다.

근거: 각 프로젝트 공식 문서 · HyperLogLog 원논문(Flajolet et al., AofA'07). topic
`approximate-data-structures`.

### 깨지는 조건 3 — 사전 계산은 질문 자체를 지운다

materialized view·롤업은 계산을 write/refresh 시점으로 옮겨 **read 경로에서 계산을 없앤다.**
"어디서 계산할까"라는 질문이 성립하지 않게 만드는 쪽이다. 대신 갱신 주기만큼 신선도를 내준다.

근거: PostgreSQL `REFRESH MATERIALIZED VIEW CONCURRENTLY`(컬럼 전용 UNIQUE 인덱스 필수, 임시본
생성 후 **차이분만** 반영). topic `postgresql-index-internals`.

### 덧 — 반대 방향은 실재하지만 공짜가 아니다

UDF · 저장 프로시저 · C 확장으로 알고리즘을 DB 안에 내리는 길은 실재한다(`postgresql-hll` ·
`tdigest` 확장 자체가 그 산물이다). 다만 배포 마찰 · CI 가 못 잡는 오류 · 버전 관리 드리프트 ·
이식성이 반복 지적된다. **"내릴 수 있는가"와 "내려야 하는가"는 다른 질문**이고, 이 구분이
대화에서 한 번 짚여야 한다.

## 3. 메모리에 올린다는 것도 한 가지가 아니다

전제가 깨진 뒤에도 "올리는" 선택지는 남는다. 다만 그것도 층이 넷이다 — 대화에서 뭉뚱그리지 않는다.

| 층 | 무엇 | 언제 |
| --- | --- | --- |
| 앱 프로세스 힙 | 조회 결과를 그대로 들고 계산 | 결과 집합이 작고 재사용이 짧을 때 |
| 임베디드 분석 엔진 | DuckDB — 열 지향 + 벡터화 실행 | 분석형 질의를 앱 옆에서 반복할 때 |
| 별도 캐시 프로세스 | Redis 의 자료구조(HLL 포함) | 여러 인스턴스가 같은 상태를 볼 때 |
| 스트리밍 집계 | 이벤트가 DB 에 닿기 전에 가로채 집계 | 원본이 애초에 스트림일 때 |

넷 다 "메모리"라는 한 단어를 쓰지만 **소유자 · 수명 · 일관성 모델이 다르다.** 이 표를 들고
들어가는 이유가 그것이다.

## 4. 예상 반론

- **"인덱스는 알고리즘이 아니라 인프라 설정 아닌가."** 되받을 근거는 BRIN 의 성립 조건과
  index-only scan 의 전제다. 조건이 붙는다는 것 자체가 선택이 있다는 뜻이다.
- **"근사값은 못 쓴다."** 조건을 물어야 한다 — 대시보드의 unique 카운트에 0.81% 오차가
  문제인가. Redis HyperLogLog 는 키당 최대 12KB 로 표준오차 0.81% 다. 정확값이 필요한 자리와
  아닌 자리를 가르는 것이 답이지, 근사 자체를 버리는 것이 답은 아니다.
- **"materialized view 는 증분 갱신이 안 되잖나."** 여기서 **대상 DB 를 밝혀야 한다.**
  "증분 materialized view"는 RisingWave 같은 **벤더 제품의 개념**이지 바닐라 PostgreSQL 기능이
  아니다. 이 구분을 안 하면 대화가 서로 다른 제품을 말하게 된다.
- **"숫자를 대라."** 있는 것과 없는 것이 갈린다. 있다: HLL 표준오차 공식과 Redis 의 12KB /
  0.81%, Elasticsearch `precision_threshold` 기본 3000·최대 40000(메모리 ≈ threshold×8B),
  DuckDB `STANDARD_VECTOR_SIZE` 2048. 없다(인용 보류): Roaring bitmap 의 "2배 압축 · 900배"
  측정 조건, t-digest "45배" 의 조건, Count-Min sketch 의 정확한 오차 공식(저널 원문 미확인).

## 5. 앵커

| 값 | 출처 |
| --- | --- |
| `REFRESH MATERIALIZED VIEW CONCURRENTLY` — 컬럼 전용 UNIQUE 인덱스 필수, 임시본 생성 후 **차이분만** 반영 | PostgreSQL 공식 문서 |
| BRIN 은 컬럼 값이 물리적 행 순서와 상관될 때만 효과적(블록 범위별 min/max) | PostgreSQL 공식 문서 |
| HyperLogLog 표준오차 ≈ 1.04/√m, 1.5KB 로 10억+ 카디널리티를 약 2% 오차로, LogLog 대비 메모리 64% | Flajolet et al., AofA'07 |
| Redis HyperLogLog — 키당 최대 12KB, 표준오차 0.81%, 상한 2^64 | Redis 공식 문서 |
| Elasticsearch cardinality agg — `precision_threshold` 기본 3000 / 최대 40000, 메모리 ≈ threshold × 8바이트 | Elasticsearch 공식 문서 |
| ClickHouse `uniqHLL12` — 고정 2^12(4096) 레지스터, 전형 오차 약 1.6% | ClickHouse 공식 문서 |
| DuckDB 벡터화 실행 `STANDARD_VECTOR_SIZE` 기본 2048 | DuckDB 공식 문서. 계보는 MonetDB/X100(Boncz et al., CIDR 2005) |
| "네트워크 대역폭은 상대적으로 희소한 자원" — locality 스케줄링 | MapReduce, Dean & Ghemawat, OSDI 2004 §3.4 |
| Count-Min sketch 원논문 | Cormode & Muthukrishnan, LATIN 2004 / *J. Algorithms* 55(1):58-75 (2005) |
| t-digest 원논문 — 정확도가 max(q, 1−q) 에 상대적 | Dunning & Ertl, arXiv:1902.04023 (2019) |
| Roaring bitmap 원논문 | Chambi/Lemire/Kaser/Godin, *Software: Practice and Experience* 46(5), 2016 |

**인용하지 않기로 한 값**: Roaring 의 "2배 압축 · 최대 900배 빠른 교집합"(측정 조건 미확인) ·
t-digest "45배 빠른 percentile"(조건 미확인) · Count-Min 의 구체 오차 공식(저널 원문 미확인).

## 6. 용어

- **영속성(persistence) 데이터** — 디스크에 남는 데이터. 여기서는 DB 에 저장된 것.
- **index-only scan** — 필요한 컬럼이 인덱스에 전부 있어 테이블(heap)을 안 읽는 스캔.
  visibility map 이 받쳐 줘야 성립한다.
- **커버링 인덱스** — 질의가 요구하는 컬럼을 전부 담아 index-only scan 을 가능하게 하는 인덱스.
- **BRIN(Block Range INdex)** — 블록 범위마다 min/max 만 들고 있는 아주 작은 인덱스.
- **materialized view** — 뷰의 결과를 실제로 저장해 둔 것. 갱신 시점이 곧 신선도다.
- **HyperLogLog(HLL)** — 아주 적은 메모리로 "서로 다른 값의 개수"를 근사하는 자료구조.
- **t-digest** — 분위수(percentile)를 근사하는 자료구조. 양 끝이 더 정확하다.
- **Count-Min sketch** — 항목별 빈도를 근사하는 자료구조.
- **Roaring bitmap** — 정수 집합을 압축해 담고 집합 연산을 빠르게 하는 비트맵.
- **pushdown** — 필터·투영 같은 연산을 데이터에 더 가까운 쪽으로 내려보내는 것.
- **UDF(User-Defined Function)** — DB 안에서 도는 사용자 정의 함수.
- **벡터화 실행(vectorized execution)** — 한 행씩이 아니라 값 묶음 단위로 처리하는 실행 방식.
