# 대담 준비 — 대시보드가 대규모 집계를 한 번에 당겨올 때

> 이 문서는 **대화에 들고 들어갈 것**이지 대담 원고가 아니다. 답을 적어 두지 않는다 —
> 적어 두면 대화가 이 문서의 낭독이 된다.
>
> 근거: `~/blog-research/raws/012-dashboard-bulk-aggregated-fetch.md` +
> `raws/014-dashboard-bulk-fetch-followup.md`(추가 라운드) ·
> 앵글 `wiki/angles/dashboard-aggregated-fetch-talk.md`(**mature**) ·
> topic `dashboard-data-transfer-reduction` · `request-splitting-http-versions` ·
> `server-push-streaming` · `cache-layer-stale-strategies` ·
> `perceived-performance-core-web-vitals`

## 1. 질문 순서

얕은 것에서 깊은 것으로. 한 질문에 한 갈래만 담는다.

1. **다 계산해 둔 집계인데 왜 페이지가 멈추는가.** 병목이 계산인지 전송인지 렌더인지부터
   가른다. 이걸 안 가르면 뒤의 모든 답이 엉뚱한 층을 고치게 된다.
2. **"전송량을 줄인다"는 실제로 몇 가지 다른 일인가.** 계산 시점(사전집계·롤업) · 점의 수
   (다운샘플링) · 바이트 표현(직렬화) · 압축은 서로 다른 층이다. 한 단어로 뭉뚱그리면
   어느 층을 이미 했는지 대화 중에 서로 다른 것을 말하게 된다.
3. **시각화 단위로 요청을 쪼개면 나아지는가.** HTTP/2·HTTP/3 에서 요청 수가 아직 비용인가.
4. **서버가 먼저 흘려보내는 방법 셋은 언제 갈리는가.** SSE · chunked+NDJSON · 엔진이 부분
   결과를 만들어 내는 아키텍처. 셋 다 "먼저 보여준다"인데 무엇이 다른가.
5. **캐시를 언제 버릴 것인가.** 배치 집계에 맞는 판정 기준은 무엇이고, "배치 완료 시각
   기준"은 표준인가 관행인가.
6. **IndexedDB 에 넣어 두면 그건 남아 있는가.** 용량 정책과 축출(eviction).
7. **스켈레톤이 정말 체감을 바꾸는가.** 그 근거는 어디에 있는가.
8. **먼저 보여주기와 안 흔들리기가 부딪히면 무엇을 고르는가.** 성능과 UX 가 한 몸이 아닌 자리.

> **회차는 주제별로 나누기로 정해졌다**(검토 판정, 2026-08-18). 이 노트가 한 회차이고
> 주제② 는 다른 회차다. 성능축·UX축으로 더 쪼개지 않는다 — 여덟 질문을 한 흐름으로 간다.

## 2. 의견 판정

지시 원문에서 이미 낸 의견 셋. 각각 **성립하는 조건 · 깨지는 조건 · 근거**로 닫는다.

### 의견 ① Service Worker + IndexedDB 프리패치, 이후엔 비었거나 stale 한 것만

- **성립하는 조건.** 배치 집계는 "새 값이 와도 사용자가 즉시 몰라도 되는" 데이터다. 그래서
  stale 응답을 즉시 주고 뒤에서 새로고침하는 구조가 데이터 성질과 맞는다. 이건 직접 구현할
  것이 아니라 **표준에 이미 있다** — `stale-while-revalidate`(RFC 5861).
- **깨지는 조건 둘.** ⑴ **stale 판정 기준 넷 중 표준이 있는 것은 셋뿐이다.** TTL(`max-age`)
  · ETag 대조(`If-None-Match`) · `stale-while-revalidate` 는 RFC 9111·5861 에 있지만,
  **"배치 잡 완료 시각을 기준으로 무효화"는 RFC·학술 수준의 표준이 없다.** RFC 9111 §4.2.2 의
  heuristic freshness 도 "`Last-Modified` 이후 경과 시간"만 볼 뿐 "작업이 끝났는가"라는 상태는
  다루지 않는다. 다만 **이름 붙은 정형 패턴 둘은 있다**(추가 라운드에서 확보) — 캐시 키에
  `updated_at` 을 박아 갱신되면 키 자체가 바뀌게 하는 **key-based cache expiration**(DHH·37signals)
  과, "어느 시점까지의 데이터가 다 관측됐다"를 나타내는 **watermark**(Akidau et al., PVLDB 8(12),
  2015). 후자는 논문 저자들이 **"완결성은 일반적으로 정확성과 양립하지 않아 watermark 를 엄밀한
  정확성 보장 수단으로 쓰지 않는다"**고 스스로 못박는다 — 배치 완료를 stale 신호로 쓰는 것은
  실용적 근사이지 보장이 아니라는 한계가 그대로 옮겨진다.
  ⑵ **캐시해 뒀다고 남아 있지 않다.** IndexedDB 는 Best-Effort 저장소면 공간 부족 시 LRU 로
  지워지고, **Safari 는 추적 방지가 켜져 있으면 7일 무상호작용 시 스크립트가 만든 데이터를
  선제적으로 지운다**(쿠키는 남긴다). 오리진 데이터는 부분 삭제가 안 되고 통째로 지워진다.
- **근거.** RFC 9111 · RFC 5861 · MDN storage eviction criteria. topic
  `cache-layer-stale-strategies`.
- **구조는 확정, 정량은 미확보.** W3C IndexedDB 스펙이 **스코프가 겹치는 `readwrite` 트랜잭션은
  동시에 시작할 수 없다**(직렬화된다)고 정하고, MDN 은 API 자체가 비동기라 메인스레드를 직접 막지
  않는다고 명시한다. 그러니 "프리패치가 쓰기에서 비용을 만드는가"의 **모양은 안다** — 겹치는 쓰기가
  줄을 선다. 다만 structured clone 직렬화 비용과 대량 쓰기 실제 처리량은 두 라운드 모두 조건 명시된
  벤치마크를 못 찾았다("단일 트랜잭션이 여러 트랜잭션보다 약 100배"라는 실무 서술은 측정 조건이
  없어 인용하지 않는다).

### 의견 ② HTTP 대신 socket + 압축 스트리밍

- **성립하는 조건.** "완성되는 순서대로 흘려보낸다"는 목표는 옳다. 다만 그 목표를 socket 이
  독점하지 않는다.
- **깨지는 조건 셋.** ⑴ **이득의 출처를 갈라야 한다.** 조기 렌더는 chunked transfer
  (RFC 9112 §7.1) + NDJSON 으로 HTTP 하나에서도 되고, 서버→클라이언트 단방향이면 **SSE 가
  더 단순한 기본값**이다 — SSE 는 자동 재연결과 `Last-Event-ID` 재개가 **스펙에 내장**돼
  있는데 WebSocket(RFC 6455)에는 그 급의 표준 재개가 없다. SSE 의 커넥션 수 제약은 실재하지만
  HTTP 버전에 달렸다 — WHATWG 스펙이 "탭을 여러 개 열면 서버당 커넥션 제한에 걸릴 수 있다"고
  직접 인정하고 **SharedWorker 로 EventSource 하나를 공유하라**고 권고하는데, HTTP/1.1 의
  오리진당 6 커넥션이 그 배경이고 HTTP/2 에서는 멀티플렉싱이 그 제한을 사실상 무의미하게 만든다. ⑵ **압축은 socket 의 몫이 아니다.**
  전송 압축은 어느 전송 위에서도 하는 일이고, 실측에서 최고 압축은 여전히 Brotli L11 이
  zstd L19 를 앞선다(gzip L6 대비 19.18% vs 14.11%). zstd 는 브라우저 지원이 45/100 이고
  Safari 는 26.1 에서야 부분 지원이다. ⑶ **바이너리 직렬화도 별개 층이다.** Arrow IPC 와
  Protobuf 는 경쟁이 아니라 역할 분담이라는 것이 Arrow 프로젝트 자신의 입장이다(Arrow Flight
  가 명령엔 Protobuf, 데이터엔 Arrow IPC 를 함께 쓴다).
- **근거.** WHATWG HTML(SSE) · RFC 6455 · RFC 9112 · RFC 8878 · Paul Calvano, HTTP Archive
  2024-01 · caniuse · Arrow 공식 FAQ. topic `server-push-streaming` ·
  `dashboard-data-transfer-reduction`.

### 의견 ③ fallback skeleton 과 loading UI

- **성립하는 조건.** 응답이 1초를 넘으면 "작업 중" 표시가 필요하다는 것은 40년 된 인간공학
  근거가 있다(Miller 1968 · Card et al. 1991 을 딛은 NN/g 의 0.1초 / 1초 / 10초 세 한계).
  그리고 자리를 미리 예약하는 것은 레이아웃 이동(CLS)을 막는 표준적 대응이다.
- **깨지는 조건 셋.** ⑴ **1초 미만이면 스켈레톤도 스피너도 쓰지 말라는 것이 NN/g 원문의
  명시다** — 빠른 깜빡임이 오히려 불안을 만든다. ⑵ **실제 레이아웃을 안 닮은 "프레임만 있는"
  스켈레톤은 "페이지가 안 돌아간다"는 오해로 이탈을 부른다**(같은 원문). ⑶ **근거로 흔히
  드는 수치가 근거가 아니다** — 아래 별도 항목.
- **근거.** NN/g "Response Time Limits" · "Skeleton Screens 101"(2023-06-04) · web.dev CLS.
  topic `perceived-performance-core-web-vitals`.

### 이 셋 중 대화에서 제일 값나가는 자리 — ③의 근거 검증

**NN/g "Skeleton Screens 101" 원문에는 수치가 하나도 없다.** 참고문헌으로 Mejtoft et al.
(2018) 논문 한 편을 인용할 뿐 NN/g 자체 사용자 테스트 수치가 아니다. 그런데 웹에는
"이탈률 9~20% 감소" · "체감 로딩 20~30% 개선" 같은 구체 수치가 여러 블로그에서 **거의 동일한
문구로** 반복되고, NN/g 공식 사이트 어디에도 그 근거가 없다.

대화에서 쓸 수 있는 것은 "그 숫자는 틀렸다"가 아니라 **"다들 그렇게 말한다"와 "1차 출처가
실제로 그렇게 말했는가"는 다른 문제라는 구분**이다. Mejtoft·Långström·Söderström(2018, ECCE'18,
Article 22, pp.1–4)은 실재하는 연구지만 두 라운드 모두 원문을 확보하지 못했다(ACM DL·ResearchGate
모두 403, DiVA 에도 수치 재인용 없음). 그래서 **정확한 수치는 이 대담에서도 인용하지 않는다.**
4쪽 단편이라 통계적 검정력이 큰 연구가 아닐 가능성도 함께 염두에 둔다.

**정정 하나.** 1차 라운드가 "후속 논문 Mejtoft et al.(2022) 'Time for a change'"라고 적은 것은
틀렸다 — 그 DOI(10.1145/3552327.3552329)를 직접 확인하니 **저자가 Mejtoft 가 아니라 van Nimwegen
· van Rijn** 이고, 33rd ECCE(2022)에 실린 별개 논문이다. 대화에서 "Mejtoft 가 2022년에 후속
연구를 냈다"고 말하지 않는다. 인접 연구로는 Söderström·Bååth·Mejtoft(2018, 같은 ECCE'18)의
로딩 화면 애니메이션 속도 연구가 있다(서지정보만 확인).

## 3. 의견 셋이 안 덮는 갈래

"그 외에도 내가 생각하지 못한 방법이 있으면 알려달라"에 대한 답이다. 의견 ①②③ 은 **캐시 ·
전송 · 표시** 를 하나씩 짚었는데, 그 셋이 손대지 않는 자리가 넷 남는다. 갈래마다 **적용 조건 ·
치르는 비용 · 근거**를 함께 둔다 — 이름만 나열하면 대화에서 고를 수가 없다.

### (가) 계산을 조회 시점 밖으로 — 사전집계·롤업 계층화

- **적용 조건.** 조회 축(기간·차원)이 미리 정해져 있을 때. 대시보드는 보통 그렇다.
- **치르는 비용.** 적재 경로가 무거워지고 신선도가 롤업 주기에 묶인다. 축이 늘면 조합이 폭증한다.
- **근거.** ClickHouse Materialized View 는 INSERT 마다 새 블록에 집계를 돌려 타깃 테이블에
  쌓는다(주기적 refresh 형과 다르다). `AggregatingMergeTree` 는 집계 상태를 들고 있다가 조회
  시점에 병합한다. 일·주·월 계층("tiered rollup")이면 긴 기간도 원본을 안 스캔한다.
  **정량 지연 수치는 못 찾았다** — 정성적 서술만 있다.

### (나) 점의 수를 줄인다 — 다운샘플링

- **적용 조건.** 시계열 차트처럼 **화면 픽셀 수보다 점이 많을 때.** 표·카운터에는 해당 없다.
- **치르는 비용.** 원본과 다른 그림이 될 위험. 균등 샘플링은 뾰족한 변곡점을 지운다.
- **근거.** LTTB 는 버킷마다 "가장 넓은 삼각형"을 만드는 점만 남겨 **원본에 실재하는 점만**
  남기고 이상치를 평균으로 뭉개지 않는다. O(n) 한 번 순회. 정량 절감 효과의 1차 벤치마크는 없다.

### (다) 바이트 표현을 바꾼다 — 열 지향 바이너리 직렬화

- **적용 조건.** 같은 모양의 행이 대량으로 반복될 때(집계 결과가 대개 그렇다).
- **치르는 비용.** 클라이언트에 디코더가 필요하고, 개별 레코드·희소 optional 필드가 많은
  데이터에는 오히려 불리하다.
- **근거.** Arrow 공식 FAQ 가 그 경계를 스스로 밝힌다 — "Protobuf 는 개별 레코드나 희소
  optional 필드가 많은 데이터에 더 나은 선택일 수 있다. Arrow 와 Protobuf 는 보완적이다."

### (라) 무엇을 먼저 가져올지 브라우저에 알려준다 — 우선순위·뷰포트 신호

- **적용 조건.** 요청을 이미 쪼갠 뒤. 쪼개지 않았으면 우선순위를 줄 대상이 없다.
- **치르는 비용.** `fetchpriority` 는 **지시가 아니라 힌트**이고 Chrome 101+ 다.
  `IntersectionObserver` 의 `rootMargin` 을 너무 넓게 잡으면 결국 다 받아 온다.
- **근거.** 둘은 역할이 다르다 — `IntersectionObserver` 는 "언제 시작할지",
  `fetchpriority` 는 "동시에 나간 것 중 무엇을 먼저 처리할지". web.dev 가 인용한 Google
  Flights 사례에서 LCP 2.6초 → 1.9초(측정 조건 세부는 요약에 없다).

### 갈래를 고르는 순서

넷은 병렬 후보가 아니라 **층이 다르다.** (가)는 조회 시점의 계산을 없애고, (나)·(다)는 남은
결과의 바이트를 줄이고, (라)는 이미 쪼갠 요청의 순서를 정한다. 그래서 위에서부터 내려가며
"이 층에서 이미 할 수 있는 것이 남았는가"를 묻는 편이, 넷을 나란히 비교하는 것보다 대화가
빨리 좁혀진다.

## 4. 예상 반론

상대가 되받을 자리와, 그때 꺼낼 근거.

- **"그건 전송이 아니라 렌더 문제 아닌가."** 맞을 수 있으므로 질문 1에서 층부터 가른다.
  다만 층이 갈린 뒤에도 전송 축은 남는다 — 사전집계·다운샘플링은 렌더 부하도 같이 줄인다.
- **"HTTP/2 면 요청 수는 신경 안 써도 된다."** 절반만 맞다. 도메인 샤딩이 폐기된 근거는
  확실하지만(멀티플렉싱을 방해하므로 불필요를 넘어 해롭다), **요청 세분화의 순비용을 잰 실측이
  있다** — 25개 요청 기준으로 HTTP/1.1 개별 요청을 100% 라 할 때 HTTP/2 개별 요청 56%, 복합
  응답은 두 버전 모두 30%. 즉 **HTTP/2 에서도 쪼개면 복합 응답보다 약 1.9배 느리다**(HTTP/1.1
  의 약 3.3배보다는 훨씬 낫다). 요청 수와 시간이 선형은 아니되 무관하지도 않다는 것까지 같은
  실측에 있다(501개 요청이 51개의 약 2.3배).
- **"숫자를 대라."** 정량 근거가 있는 곳과 없는 곳이 갈린다. **있다**: 압축 비율(HTTP Archive
  2024-01) · Core Web Vitals 임계값 · `fetchpriority` 적용 사례(LCP 2.6초 → 1.9초, 단 측정 조건
  세부는 web.dev 요약에 없다) · 요청 세분화 순비용(Evert Pot 2020 실측) · HTTP/2 스트림 한도
  (RFC 권장 100 이상, nginx 128, Cloudflare 100~200, Chromium 100·최대 256) · Arrow Flight 처리량
  (단 HPC 클러스터 조건). **없다**: LTTB 의 정량 절감(원논문이 hCaptcha 로 막혀 두 번 다 못 봤다)
  · Arrow vs Protobuf vs JSON **동일 조건** 3자 비교 · IndexedDB 대량 쓰기 처리량 · 스켈레톤의
  실측 수치.
- **"부분 렌더가 CLS 를 올린다는 건 실측인가."** 아니다, 그리고 **두 라운드를 돌리고도
  아니다.** CLS 정의가 "비동기 로드"와 "기존 콘텐츠 앞 DOM 동적 삽입"을 대표 원인으로 꼽으므로
  **정의로부터의 논리적 귀결**이고, RUM 실측 사례는 끝내 못 찾았다(흔히 인용되는 DebugBear 의
  "1.2초 뒤 박스가 커진다" 사례도 확인해 보니 실측이 아니라 저자가 만든 합성 데모였다).
  이 구분을 먼저 말하고 들어간다 — "실측됐다"고 말하지 않는다.

## 5. 앵커

대화 중에 인용할 값. **출처 없는 값은 이 목록에 넣지 않는다.**

| 값 | 출처 |
| --- | --- |
| 응답시간 세 한계 — 0.1초(직접 반응) · 1초(사고 흐름) · 10초(주의 유지) | NN/g "Response Time Limits"(1993 원게시, 2014 갱신), Miller 1968 · Card et al. 1991 기반 |
| LCP Good ≤ 2.5초 · INP Good ≤ 200ms · CLS Good ≤ 0.1 (모두 75번째 백분위수, CrUX 28일 롤링) | web.dev/articles/{lcp,inp,cls} |
| CLS = 영향도 비율 × 이동 거리 비율. Poor > 0.25 | web.dev/articles/cls |
| `stale-while-revalidate` · `stale-if-error` | RFC 5861 |
| HTTP 캐시 정본(`max-age`·ETag·`no-cache`의 뜻) | RFC 9111(2022, RFC 7234 대체) |
| SSE 는 자동 재연결 + `Last-Event-ID` 재개가 스펙 내장 | WHATWG HTML Living Standard |
| WebSocket 핸드셰이크 `101 Switching Protocols` | RFC 6455(2011) |
| chunked transfer coding | RFC 9112 §7.1(2022) |
| 압축률: gzip L6 대비 Brotli L11 19.18%, zstd L19 14.11% / Facebook JS 2.37MB → gzip 645KB · Brotli 526KB · zstd 514KB | Paul Calvano 2024-03-19, HTTP Archive 2024-01 |
| zstd Content-Encoding 브라우저 지원 45/100 (Safari 26.1 부분) | caniuse |
| zstd 표준 등록 | RFC 8878(2020, Informational) |
| 도메인 샤딩은 HTTP/2 에서 불필요를 넘어 **해롭다** | imgix 블로그 2019-05-03 · HTTP/2 공식 FAQ |
| HTTP/2 멀티플렉싱 정의 | RFC 9113(2022) |
| `fetchpriority` 적용 사례 LCP 2.6초 → 1.9초 (측정 조건 세부 미기재) | web.dev, Google Flights |
| IndexedDB 용량은 **전체 디스크 크기 기준** — Firefox Best-Effort 10%(최대 10GiB) · Chrome/Edge 60% · Safari 앱 약 60% | MDN storage quotas |
| Safari: 추적 방지 켜짐 + 7일 무상호작용 → 스크립트 생성 데이터 선제 삭제(쿠키 유지) | MDN storage eviction criteria |
| localStorage/sessionStorage 각 5MiB | MDN |
| LTTB 출처 | Sveinn Steinarsson 석사논문(2013). TimescaleDB Toolkit `lttb()` |
| Arrow 와 Protobuf 는 보완적 — Flight 가 명령=Protobuf, 데이터=Arrow IPC | Apache Arrow 공식 FAQ |
| 요청 세분화 순비용 — 25개 요청에서 HTTP/1.1 개별 100% 대비 HTTP/2 개별 56%, 복합 응답은 두 버전 모두 30%(= HTTP/2 에서도 쪼개면 약 1.9배 손해). 501개 요청은 51개의 약 2.3배 | Evert Pot, 2020-01-02. AWS t2.medium(us-west-2), 실제 주거용 회선, 50회 반복 |
| HTTP/2 동시 스트림 한도 — 스펙은 "초기 무제한"이되 100 이상 권장. nginx 기본 128, Cloudflare 기본 100(최대 200), Chromium 커넥션당 100·서버 설정 시 최대 256 | RFC 9113 · nginx·Cloudflare 문서 · Eric Lawrence(Edge) 2019-12-04 |
| SSE 는 서버당 커넥션 제한에 걸릴 수 있고 스펙이 **SharedWorker 공유**를 권고 | WHATWG HTML §9.2 Authoring notes |
| HTTP/1.1 오리진당 6 커넥션 — HTTP/2 멀티플렉싱이 이 제한을 사실상 무의미하게 만든다 | Eric Lawrence(Edge) |
| 겹치는 스코프의 `readwrite` 트랜잭션은 동시 시작 불가(직렬화). API 자체는 비동기라 메인스레드를 직접 막지 않는다 | W3C IndexedDB 스펙 · MDN |
| 배치 완료를 캐시 무효화 신호로 쓰는 이름 붙은 패턴 둘 — key-based cache expiration(캐시 키에 `updated_at` 을 박는다) · watermark | DHH(37signals) · Akidau et al., "The Dataflow Model", PVLDB 8(12), 2015 |
| watermark 는 "완결성은 일반적으로 정확성과 양립하지 않는다"고 논문이 스스로 못박는다 — 실용적 근사이지 보장이 아니다 | 같은 논문 |
| Arrow Flight 처리량 — localhost 16스트림 병렬 최대 10GB/s, 원격 DoGet 1.5~2GB/s, Dremio 쿼리에서 turbodbc 대비 20배·ODBC 대비 30배 | Ahmad·Al Ars·Hofstee, arXiv:2204.03032v2(2022). SurfSara Cartesius HPC, Xeon E5-4650, InfiniBand 4×FDR — **HPC 조건이라 웹 대시보드에 그대로 옮기지 않는다** |
| 스켈레톤 1차 연구 서지 — Mejtoft·Långström·Söderström(2018), ECCE'18 Article 22, pp.1–4, DOI 10.1145/3232078.3232086 | ACM(본문 미확보) |

**인용하지 않기로 한 값** (추가 라운드 뒤에도 유지):

- 스켈레톤 관련 "이탈률 9~20% 감소" 류 — 1차 출처가 없다.
- Mejtoft et al.(2018)의 구체 수치 — 두 라운드 모두 원문 미확보(ACM DL·ResearchGate 403).
- "Mejtoft 가 2022년에 후속 연구를 냈다" — **사실이 아니다.** 그 논문의 저자는 van Nimwegen·van Rijn 이다.
- LTTB 의 정량 절감 — 원논문(skemman.is)이 두 번 다 hCaptcha 로 막혔다.
- IndexedDB "단일 트랜잭션이 여러 트랜잭션보다 약 100배" — 측정 조건이 없다.
- "프로그레시브 렌더링이 CLS 를 올린다" 를 **실측으로** 말하는 것 — 정의로부터의 추론까지만 말한다.

## 6. 용어

처음 나올 때 한 번 푼다.

- **집계(aggregated) 데이터** — 원본 행이 아니라 합계·평균·카운트처럼 이미 줄여 놓은 값.
- **사전집계·롤업(rollup)** — 계산을 조회 시점이 아니라 적재 시점으로 옮겨 두는 것. 일·주·월로
  계층화하면 긴 기간을 봐도 원본을 스캔하지 않는다.
- **LTTB(Largest-Triangle-Three-Buckets)** — 시계열 다운샘플링 알고리즘. 버킷마다 "가장 넓은
  삼각형"을 만드는 점을 남겨, 평균으로 뭉개지 않고 변곡점·이상치를 보존한다.
- **Arrow IPC** — Apache Arrow 의 열 지향 직렬화 형식. 스트림 포맷은 순차 처리 전용이다.
- **NDJSON** — 한 줄에 JSON 하나. IETF 표준이 아니라 커뮤니티 스펙이고, 한 줄씩 읽고 버리는
  O(1) 메모리 스트리밍이 핵심이다.
- **SSE(Server-Sent Events)** — 서버→클라이언트 단방향 이벤트 스트림. `EventSource`.
- **SWR(`stale-while-revalidate`)** — 신선도가 지난 뒤에도 지정 시간 동안 낡은 응답을 즉시
  주고 뒤에서 재검증하는 캐시 지시자.
- **ETag** — 응답의 버전 식별자. 재검증 때 `If-None-Match` 로 보내고 안 바뀌었으면 304.
- **LCP · INP · CLS** — Core Web Vitals. 각각 주요 콘텐츠 표시 시점 · 상호작용 응답 지연 ·
  예기치 않은 레이아웃 이동.
- **CrUX(Chrome UX Report)** — Core Web Vitals 의 실사용자 필드 데이터 출처. 28일 롤링.
- **축출(eviction)** — 브라우저가 저장 공간을 회수하려고 오리진 데이터를 지우는 것.
- **SharedWorker** — 같은 오리진의 여러 탭이 함께 쓰는 워커. SSE 커넥션을 하나로 모으는 데 쓴다.
- **watermark** — 스트리밍 처리에서 "이 시점까지의 데이터는 다 관측됐다"고 보는 하한선. 휴리스틱이다.
- **RUM(Real User Monitoring)** — 실제 사용자 환경에서 모은 성능 데이터. 합성 측정과 구분된다.
