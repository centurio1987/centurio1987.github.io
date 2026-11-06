# 대담 준비 — 소켓으로 실시간 동기화할 때 서버 메모리에 띄운 상태는 장애·규모·비용 앞에서 어디에 두어야 하나

> 이 문서는 **대화에 들고 들어갈 것**이지 대담 원고가 아니다. 답을 적어 두지 않는다 —
> 적어 두면 대화가 이 문서의 낭독이 된다.
>
> 근거: `~/blog-research/raws/017-realtime-sync-server-state.md`(66 소스) ·
> 앵글 `wiki/angles/realtime-sync-server-state-talk.md`(mature) ·
> topic `realtime-connection-recovery` · `websocket-connection-scaling` ·
> `redis-messaging-semantics-cost` · `authoritative-state-placement`
>
> 원 질문(KAN-082-ER9NJ4 원문): "소켓을 사용해서 실시간으로 서버-클라이언트 데이터가 동기화 되어야
> 하는 경우, 서버에서는 데이터를 메모리에 띄워놓고, 클라이언트랑 소통할 것이다. 하지만 이 경우,
> 서버 장애에 대응하기 어렵다. 이에 대한 대처 방안을 알려줘. 또한, 세션이 늘어나면, 메모리 관리가
> 어렵다. redis 같은 캐시를 사용하면, 부담이 줄겠지만, 대신에 인스턴스 생성 비용이 발생한다. 모든
> 문제를 해결할 수 있는 최적의 솔루션이 있다면 알려줘."

## 1. 질문 순서

이 주제는 **원 질문이 하나처럼 보이지만 넷**이라는 것을 대화에서 드러내는 것이 목적이다. 그래서
"최적의 솔루션이 있는가"(7번)를 **맨 뒤에** 둔다 — 앞에 두면 "없습니다"로 끝나고 왜 없는지가 안
남는다. 3번(권위의 자리)을 4번(메모리)보다 앞에 두는 이유는, 권위가 어디 있느냐에 따라 "메모리가
는다"는 말의 뜻 자체가 달라지기 때문이다.

1. **"서버가 죽으면" 정확히 무엇이 사라지는가.** 연결 · 전송 중 메시지 · 서버 메모리의 상태 —
   셋을 갈라서 물어야 답이 갈린다. 프로토콜(RFC 6455)이 이 중 무엇을 되돌려 주는가.
2. **재연결하면 어디까지 돌아오는가.** 프로토콜이 아무것도 되돌려 주지 않는다면, 애플리케이션이
   정해야 할 계약은 무엇인가(커서 · 보관 창 · 창을 넘었을 때). 관리형(Socket.IO · Ably)은 그
   계약을 어디까지 대신 져 주는가.
3. **"메모리에 띄운다"와 "권위(authority)가 메모리에 있다"는 같은 말인가.** 서버 메모리가 정본이
   아니라 캐시인 설계는 어디서 갈리는가. 권위의 자리는 몇 갈래인가.
4. **세션이 늘면 무엇이 느는가.** 연결 하나의 값은 실제로 얼마인가. 그 숫자가 문제가 아니라면
   진짜 느는 것은 무엇인가.
5. **한 대를 넘을 때 먼저 필요한 것은 상태 공유인가, 메시지 팬아웃인가.** 둘을 섞으면 무엇이
   잘못 보이는가.
6. **Redis 를 두면 무엇이 해결되고 무엇이 남는가.** Redis 자신의 장애는 누가 대응하는가.
   "인스턴스 비용"은 실제로 어느 자릿수인가, 비용이 커지는 자리는 어디인가.
7. **그래서 "모든 문제를 해결하는 최적의 솔루션"이라는 물음은 성립하는가.** 성립하지 않는다면
   그 대신 무엇을 먼저 정해야 답이 서는가.

> 6번에서 5번의 구분을 되불러야 한다 — 팬아웃에 대한 답("Redis Pub/Sub 이면 된다")과 상태
> 내구성에 대한 답("Pub/Sub 은 저장하지 않는다")이 같은 낱말 Redis 아래서 엇갈리는 자리다.

## 2. 내 전제에 대한 판정

### 전제 A — "서버는 데이터를 메모리에 띄워놓고 클라이언트와 소통할 것이다"

**판정: 반은 필연이고 반은 선택이다. 그 경계가 대화의 첫 재료다.**

- **필연인 반**: 연결은 프로세스에 묶인다. WebSocket 은 "as close to just exposing raw TCP to
  script as possible"(RFC 6455)이라 연결 상태 자체는 어느 설계에서도 서버 메모리에 있다.
- **선택인 반**: **권위 상태**가 메모리에 있어야 한다는 것은 선택이다. 권위의 자리는 넷이다 —
  ① 서버 메모리(Figma: "a separate process for each multiplayer document" · 게임 서버)
  ② 이벤트 로그(Fowler: "We can discard the application state completely and rebuild it")
  ③ 단일 소유자 액터 + 저널(Erlang · Durable Objects) ④ 클라이언트(local-first 7원칙).
  원 질문은 ①만을 전제로 깔았다.
- **성립하는 조건**: 문서·방 단위로 한 프로세스가 권위여야 하는 요구(순서화·충돌 해결을 서버가
  해야 하는 협업 편집, 판정을 클라이언트에 못 맡기는 게임)일 때.
- **깨지는 조건**: "최신값만 있으면 되는" 대시보드, 오프라인이 요구인 local-first.

### 전제 B — "이 경우 서버 장애에 대응하기 어렵다"

**판정: 맞다. 다만 "어렵다"의 내용이 세 겹으로 갈리고, 대응 방안은 겹마다 다르다.**

| 잃는 것 | 어느 설계에서든 잃는가 | 되돌리는 장치 | 창(window)·조건 |
| --- | --- | --- | --- |
| 연결 | **그렇다** — 프로토콜에 재개가 없다 | 재연결(새 핸드셰이크) | — |
| 전송 중 메시지 | 계약이 없으면 그렇다 | 커서(시퀀스/id) + 서버 보관 + 재생 — SSE `Last-Event-ID` · Socket.IO recovery · Ably resume · Discord `RESUME` | Socket.IO 예시 2분 · Ably "typically around two minutes" · 창을 넘으면 처음부터 |
| 권위 상태 | **어디에 두었느냐에 달렸다** | 체크포인트+저널(Figma) · 이벤트 재생(Akka) · activation 로드(Orleans) · 스토리지 증분 쓰기(Durable Objects) | Figma 체크포인트만 있던 시절 60초 유실 → 저널로 1초 미만 |

- **되받을 문장**: "Reopening a WebSocket restores only the transport."(2차) — 재연결은 연결만
  되돌린다. 구독·놓친 이벤트·"내 화면이 최신인가"는 전부 위 층의 일이다.
- **스티키 세션은 이 표 어디에도 없다** — AWS ALB: "After the WebSockets upgrade is complete,
  cookie-based stickiness is not used." 원 서버가 죽으면 돌아갈 곳 자체가 없다.

### 전제 C — "세션이 늘어나면 메모리 관리가 어렵다"

**판정: 조건부다. 연결 자체는 대개 문제가 아니고, 문제는 연결에 매달린 것이다.**

- **연결 자체의 값**: Discord 프로세스당 ~2KB(100만 ≈ 2GB) · Phoenix 200만/128GB(실질 한계는
  **ulimit**) · uWebSockets 100만/100~400MB. 수 KB 다.
- **진짜 느는 것**: 룸 멤버십 · 커서 · 인증 컨텍스트 · **송신 버퍼**(느린 소비자 → `bufferedAmount`
  → OOM). 이것을 연결과 분리해 실측한 1차 자료는 없다 — 대화에서 "그 숫자는 없다"고 말한다.
- **먼저 오는 다른 한계**: 중간 장비 타임아웃(ALB 60초 · nginx 60s)과 앱 ping 의 경합, ulimit.
- **성립하는 조건**: 세션마다 큰 상태를 서버가 들고 있을 때(협업 문서 전체를 메모리에).
- **깨지는 조건**: 상태가 작거나 밖에 있을 때 — 그때는 100만 연결이 2GB 다.

### 전제 D — "Redis 같은 캐시를 쓰면 부담이 줄겠지만, 대신 인스턴스 비용이 든다"

**판정: 두 절 다 부분적으로만 맞다. 이것이 이 대담에서 제일 값나가는 자리다.**

- **"부담이 준다"**: 팬아웃에는 맞다(Socket.IO Redis adapter — "no keys stored in Redis", 릴레이).
  상태 내구성에는 **조건부**다 — Pub/Sub 은 "forever lost"(공식 문서), Streams 라야 재생이 되고,
  그 Streams 도 AOF `everysec` 면 "lose 1 second", Cluster 면 "will lose writes that were
  acknowledged". **문제가 사라진 것이 아니라 Redis 의 fsync 주기와 복제 지연으로 옮겨갔다.**
  그리고 Redis 의 HA(Sentinel/Cluster)는 이제 내가 운영한다.
- **"인스턴스 비용"**: 소규모에서 **작다** — Redis Cloud 최소 $5/월, ElastiCache t4g.micro
  ≈ $12/월(3rd-party 집계, 자릿수만). 커지는 자리는 ① HA 이중화(노드 2배) ② 서버리스 종량제
  ③ 관리형 실시간 서비스의 연결·메시지 요금. 원 질문이 걱정한 비용과 실제로 커지는 비용이 다르다.
- **성립하는 조건**: Redis 를 팬아웃과 "다시 만들 수 있는 캐시"로만 쓸 때(eviction `allkeys-lru`).
- **깨지는 조건**: Redis 를 세션·방 상태의 **유일한 원본**으로 쓸 때 — `allkeys-*` 는 TTL 없는
  키도 지운다. 정책이 `noeviction`/`volatile-*` 로 바뀌어야 하고, 그 순간 "캐시"가 아니다.

### 전제 E(암묵) — "모든 문제를 해결하는 최적의 솔루션이 있을 수 있다"

**판정: 성립하지 않는다. 다만 왜 성립하지 않는지를 1차 자료로 말하는 것이 답이다.**

- Brooks: "there is no single development … which by itself promises even one order of magnitude
  improvement" — 장애 복구·메모리·일관성은 essential complexity 라 아키텍처 선택으로 제거되지
  않고 **어디로 옮길지**만 정해진다.
- Brewer 2012: 선택은 이분법이 아니라 "언제·어느 부분에". PACELC: 분할이 없어도 지연 vs 일관성.
- 그리고 "실시간"이 넷으로 갈린다 — 협업 편집(수렴·의도 보존) · 채팅(순서·전달) · 대시보드(최신값)
  · 게임(서버 판정). 요구를 가르기 전에는 물음 자체가 서지 않는다. **이 분해의 1차 자료는 약하다**
  (2차 종합) — 대화에서 이것을 단정하지 않고 "요구부터 가르자"로만 민다.

## 3. 대응 방안의 갈래 — 미리 갈라 둔다

전제가 정리된 뒤에도 "그래서 어떻게"는 남는다. 갈래는 권위의 자리 넷이고 **넷 다 지는 것이 있다.**
그 부담을 덮지 않는 것이 이 대담의 값이다.

| 권위의 자리 | 대표 | 죽으면 | 지는 것 |
| --- | --- | --- | --- |
| 서버 메모리 + 주기 영속 | Figma · 게임 서버 | 마지막 체크포인트 이후 유실 — 저널을 더해 창을 줄인다 | 프로세스 하나가 문서 하나 — 그 프로세스의 수명이 곧 정합성 |
| 이벤트 로그 | Fowler · ShareDB | 잃는 것은 연결뿐 — 단 ack 는 로그 커밋 뒤에만, 메모리는 캐시 | 재생 비용(스냅샷 필요) · 로그 TTL 이 복구 범위를 정한다 |
| 단일 소유자 액터 + 저널 | Erlang supervisor · Durable Objects | 재시작 + 저널 복구 — "write state incrementally" | 하나만 있게 하는 대가(그 하나의 위치·지연) |
| 클라이언트 | local-first · Linear(2차) | 서버가 사라져도 동작 | 수렴(convergence)을 클라이언트가 진다 — CRDT 내부는 KAN-085 대담의 몫 |

"왜 하나만 있게 하는가"(Durable Objects): "since each piece of data belongs to a specific thread,
this synchronization is easy" — 여러 소유자 간 동기화 문제 자체를 없애는 것.

## 4. 예상 반론

- **"Redis 에 넣으면 되잖아요."** 되받을 자리: Pub/Sub 인가 Streams 인가. 꺼낼 근거: 공식 문서의
  "forever lost" · Socket.IO recovery 가 표준 Redis 어댑터에서 안 되는 이유 · AOF 1초 · Cluster
  ack 유실 원문. 그리고 "그 Redis 의 HA 는 누가 하나".
- **"스티키 세션으로 같은 서버에 보내면 됩니다."** ALB 원문 — upgrade 뒤 쿠키 stickiness 는 안
  쓴다. 그리고 원 서버가 죽었다는 것이 전제인데 돌아갈 서버가 없다.
- **"Ably 같은 관리형 쓰면 끝입니다."** 재개 창 2분 · **재연결 뒤 순서 미보장**(Ably 원문) ·
  Pusher 는 "We don't provide an absolute guarantee". 사는 것은 문제의 위치이지 소멸이 아니다.
  비용도 종량제라 트래픽에 비례한다.
- **"Erlang/액터 모델이면 됩니다."** supervisor 는 **재시작**이지 상태 복구가 아니다. Durable
  Objects 도 "the object instance is automatically restarted" 이지만 "design your application to
  write state incrementally". 저널 없는 액터는 서버 메모리 갈래와 같다.
- **"그럼 로그를 정본으로 하면 다 해결 아닌가요."** 조건 셋(ack 시점 · 내구 저장소 · 메모리는
  캐시)이 지켜질 때만이고 그 조건은 Fowler 원문이 아니라 **추론**이다 — 그렇게 말한다. ShareDB 의
  TTL 단서를 함께 꺼낸다.
- **"숫자를 대라."** 있는 숫자: Discord 2KB/연결 · Phoenix 200만/128GB · AOF 1초 · Socket.IO
  2분 · Ably 2분 · ALB 60초 · nginx 60s · Redis Cloud $5/월 · t4g.micro ≈ $12/월(자릿수).
  없는 숫자: 상태 포함 연결당 메모리 · 2026 시점 한 대의 한계 · ElastiCache 공식 표. 없는 것은
  없다고 말한다.
- **"그래서 뭘 쓰라는 겁니까."** 요구를 먼저 가르자(협업 편집/채팅/대시보드/게임). 여기서 내가
  물러설 자리: 그 분해의 1차 자료가 약하다는 것. 안 물러설 자리: "모든 문제를 푸는 하나"는 없다는
  것(Brooks · Brewer · PACELC).

## 5. 앵커

| 값 | 출처 |
| --- | --- |
| "Basically it is intended to be as close to just exposing raw TCP to script as possible." / 종료 뒤 "a peer discards any further data received." | RFC 6455 (raws/017 S1) |
| "Reopening a WebSocket restores only the transport." | OneUptime 블로그 2026-08-15, **2차** (S2) |
| Socket.IO Connection State Recovery — `maxDisconnectionDuration: 2*60*1000` 예시 · 인메모리/Redis Streams/MongoDB 어댑터만 · "the recovery will not always be successful" | Socket.IO v4 공식 문서 (S5) |
| Ably — "provided that a dropped connection is re-established by the client within a limited interval (typically around two minutes)" / "the system does not guarantee that messages received after reconnection are delivered in the same order" | Ably 공식 문서 (S6) |
| Pusher — "We don't provide an absolute guarantee as a message delivery could be failed by many reasons." | Pusher 공식 문서 (S7) |
| Discord `RESUME` — `session_id` + 마지막 `s` → "the Gateway will send the missed events in order" · 늦으면 Invalid Session(opcode 9) | Discord 개발자 문서 (S8) |
| AWS ALB — "WebSocket connections are inherently sticky." / "After the WebSockets upgrade is complete, cookie-based stickiness is not used." | AWS 공식 문서, **스니펫 기반** (S10) |
| Durable Objects — "When a Durable Object is shut down, the object instance is automatically restarted" / "design your application to write state incrementally" / "Each Durable Object runs in exactly one location, in one single thread, at a time." | Cloudflare 공식 문서 (S11) · 공식 블로그 2021-08-03 (S59) |
| Akka — "An event sourced actor is automatically recovered on start and on restart by replaying journaled events." | Akka 공식 문서 (S13) |
| Figma — "The server is the ultimate authority on what the document looks like" · 체크포인트 30~60초 · "checkpoint + journal reduced data loss from 60 seconds to under 1 second" · "our server currently runs a separate process for each multiplayer document" | Figma 공식 블로그 2019-10 · 후속 글(게시일 미확인, **스니펫 기반**) (S14) |
| Discord — "a million processes at ~2KB each only consumes about 2GB of memory just for the process overhead" | Discord 공식 블로그, 게시일 미확인 (S15) |
| Phoenix — 200만 연결, 128GB RAM · 40코어, "2 million clients, limited by ulimit" | Phoenix 공식 블로그 2015-11-03 (S16) |
| RFC 6455 §5.5.3 — "An endpoint MUST send a Pong frame in response to each Ping frame" | RFC 6455 (S1) |
| AWS ALB `idle_timeout` "The default is 60 seconds." · nginx `proxy_read_timeout` 기본 60s | AWS 공식 문서 (S24) · nginx 공식 문서 (S26) |
| Socket.IO Redis adapter — "uses the Pub/Sub mechanism to forward the packets between the Socket.IO servers, so there are no keys stored in Redis." · sticky session "Yes. Failing to do so will result in HTTP 400 responses" | Socket.IO 공식 문서 (S27) |
| Core NATS — "If a subscriber is offline, restarting, or not subscribed yet, it never sees that message." | NATS 공식 문서 (S29) |
| WHATWG `bufferedAmount` — "queued using send() but … had not yet been transmitted to the network" | WHATWG WebSockets Standard (S30) |
| Redis Pub/Sub — "at-most-once … If the subscriber is unable to handle the message … the message is forever lost." / "Messages in streams are persisted" | Redis 공식 문서 (S32) |
| Redis AOF — "you may lose 1 second of data if there is a disaster"(everysec) · RDB "be prepared to lose the latest minutes of data" | Redis 공식 문서 (S38) |
| Redis Cluster — "does not guarantee strong consistency. … it is possible that Redis Cluster will lose writes that were acknowledged by the system to the client." / WAIT 로도 "does not implement strong consistency even when synchronous replication is used" | Redis 공식 문서 (S39) |
| `maxmemory-policy` — `allkeys-lru` "a good default option if you have no reason to prefer any others" · `noeviction` 은 에러 반환 | Redis 공식 문서 (S40) |
| Redis Cloud Essentials $0.007/hr(최소 $5/월) · Upstash $0.20/100K commands | 공식 가격 페이지 (S47 · S46) |
| ElastiCache `cache.t4g.micro` ≈ $0.016/hr — **3rd-party 집계, 자릿수로만** | Vantage (S42) |
| PostgreSQL NOTIFY — payload "must be shorter than 8000 bytes" · 큐가 차면 "transactions calling NOTIFY will fail at commit" | PostgreSQL 공식 문서 (S49) |
| Fowler — "We can discard the application state completely and rebuild it by re-running the events from the event log on an empty application." | martinfowler.com, 2005 (S56) |
| Durable Objects — "With classical databases, in-memory state is extremely difficult to keep synchronized between all database clients. But with Durable Objects, since each piece of data belongs to a specific thread, this synchronization is easy." | Cloudflare 블로그 2021-08-03 (S59) |
| Local-first 7원칙 — Fast · Multi-device · Offline · Collaboration · Longevity · Privacy · User control | Ink & Switch 2019 (S60) |
| Brooks — "there is no single development, in either technology or management technique, which by itself promises even one order of magnitude improvement within a decade in productivity, in reliability, in simplicity." | No Silver Bullet, 1986 (S65) |
| Brewer 2012 — 분할은 드물고, 분할이 없을 때 C·A 동시 가능, 선택은 서브시스템·오퍼레이션 단위 | IEEE Computer 2012-02 (S63) |

**인용하지 않기로 한 것**: ElastiCache·EC2 의 정확한 시간당 가격(3rd-party 집계 — 자릿수만 말한다)
· Pusher 가격(공식 페이지 404) · Liveblocks MAU(소스 상충) · `ws` 연결당 3KB(2차 벤치마크, 조건
불명) · "fire and forget" 을 Redis 공식 문서의 말로(원문에 없다 — 뜻만 같다) · Linear 가 OT 에
가깝다는 주장(2차만) · Gilbert-Lynch 증명 원문 문구와 PACELC 정의 원문 문장(미확보 — 요지만) ·
Ericsson AXD301 "9개의 9"(1차 미확인) · Discord 블로그 게시일 · Figma 후속 글 게시일 ·
2026 시점 "한 대의 한계"(최신 1차 없음 — 인용 사례가 2012~2015 임을 밝힌다) · Kafka(미조사).

## 6. 용어

- **권위 상태(authoritative state)** — 충돌이 났을 때 "이것이 맞다"고 최종 판정하는 쪽이 들고
  있는 상태. 메모리에 있는 것과 권위인 것은 다른 말이다.
- **재개(resume)** — 끊긴 연결을 새로 맺은 뒤, 끊긴 동안 놓친 것을 이어받는 것. 프로토콜이 아니라
  애플리케이션 계약이다.
- **커서(cursor) / 시퀀스** — 클라이언트가 "여기까지 받았다"를 나타내려고 드는 값(`Last-Event-ID`
  · Discord 의 `s`).
- **in-flight 메시지** — 보냈지만 상대가 받았다는 확인이 아직 없는 메시지.
- **스티키 세션(sticky session)** — 로드밸런서가 같은 클라이언트를 같은 백엔드로 보내는 것.
  WebSocket 은 업그레이드 뒤 이 장치를 안 쓴다.
- **체크포인트 / 저널(journal)** — 상태 전체를 주기적으로 저장하는 것 / 변경을 순서대로 붙여 쓰는
  로그. 저널이 있으면 유실 창이 마지막 체크포인트가 아니라 마지막 저널 항목까지 줄어든다.
- **이벤트 소싱(event sourcing)** — 상태가 아니라 상태를 바꾼 이벤트를 저장하고, 상태는 재생으로
  만드는 것.
- **액터(actor) / supervisor** — 메시지로만 소통하는 상태 단위 / 그 액터가 죽으면 재시작을 결정하는
  상위 프로세스(Erlang/OTP).
- **Durable Objects** — Cloudflare 의 "한 객체가 한 곳 한 스레드에서만 실행되는" 상태 단위. 인메모리
  상태는 하이버네이션·재시작에서 사라지고 스토리지에 쓴 것만 남는다.
- **local-first** — 데이터의 정본이 사용자 기기에 있고 서버는 동기화 릴레이인 설계(Ink & Switch).
- **팬아웃(fan-out)** — 한 메시지를 여러 수신자(여기서는 여러 서버 노드)로 퍼뜨리는 것. 상태 공유와
  다른 문제다.
- **백프레셔(backpressure)** — 소비가 생산을 못 따라갈 때 생산 쪽을 늦추거나 끊는 것. 안 하면
  송신 버퍼가 메모리를 먹는다(`bufferedAmount`).
- **at-most-once / at-least-once** — 최대 한 번(유실 가능, 중복 없음) / 최소 한 번(유실 없음, 중복
  가능). Redis Pub/Sub 은 전자, Streams·JetStream 은 후자.
- **PEL(Pending Entries List)** — Redis Streams 에서 "전달했지만 ACK 안 된" 항목의 목록.
- **AOF / RDB** — Redis 의 두 영속화 방식. 추가 전용 로그 / 시점 스냅샷.
- **eviction / `maxmemory-policy`** — 메모리가 찼을 때 어떤 키를 지울지의 규칙.
- **CAP / PACELC** — 분할 시 일관성·가용성 중 택일 / 분할이 없을 때도 지연·일관성 중 택일이 있다는
  확장.
- **essential / accidental complexity** — 문제 자체에서 오는 복잡도 / 도구·기술의 한계에서 오는
  복잡도(Brooks).
- **CRDT** — 충돌 없이 병합되는 복제 자료구조. 이 대담에서는 이름만 — KAN-085 대담의 몫.

## 7. 의견이 안 덮는 갈래

- **CRDT 내부(수렴 알고리즘 · 방 단위 최적화)** — `raws/talks/crdt-room-optimization/` 대담이 다룬다.
  이 편에서 (라) 갈래를 말할 때 그쪽으로 넘긴다.
- **Kafka 를 상태 로그로 쓰는 갈래** — 미조사. 대화에서 나오면 "확인 안 함".
- **Linear 의 sync engine 이 정말 중앙 순서화인가** — 2차만 있다. 사례로 쓰되 "2차"라고 말한다.
- **연결에 매달린 상태의 실측** — 없다. 이 대담이 그 숫자를 만들 수는 없고, 없다는 사실만 말한다.
