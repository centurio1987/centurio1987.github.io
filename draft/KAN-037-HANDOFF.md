# KAN-037 인계 문서 — VPN 해부 EP3 (IPsec① IKEv2 협상)

> 작성: 2026-07-28 · 선행 세션이 **집필 착수 전 조사·확인까지** 마치고 넘긴다.
> 본문(`draft/vpn-anatomy-3.mdx`)은 **아직 한 글자도 쓰지 않았다.** 이 문서는 "다시 조사하지 않아도
> 바로 쓸 수 있게" 하는 것이 목적이다. 확인한 사실에는 전부 출처를 달았다.

---

## 0. 이 카드가 지금 어디에 있나

| 항목 | 값 |
|---|---|
| 카드 | `KAN-037` VPN 해부 EP3 집필 — IPsec① IKEv2 협상 |
| 컬럼 | **할 일** (선행 세션이 `진행 중`으로 옮겼다가 main 리셋으로 되돌아감 — 착수 시 다시 `doing`으로) |
| 브랜치 | `centurio1987/kan-037` — `origin/main` 최신(`48681ab`)과 **동일**. 커밋 없음 |
| gate | KAN-033(스펙 코퍼스)·KAN-034(캡처 랩) 둘 다 **해제됨**. 막는 것 없음 |
| 산출 목표 | `src/content/posts/vpn-anatomy-3.mdx` 발행 + 레포 push |

**주의**: 선행 세션이 이 브랜치를 `origin/main`으로 `reset --hard` 후 force-push 했다. 브랜치에는
main 이외의 내용이 없다. 로컬 작업 사본이 따로 있었다면 이미 사라졌다(실제로 잃은 것은 kanban
이동 커밋 하나뿐).

---

## 1. 확정된 결정 (다시 묻지 말 것)

### 1.1 저자 퍼소나 = `ppangto` (빵토 연구원) — 유저 재확인 완료

리서치 angle(`~/blog-research/wiki/angles/vpn-anatomy-3.md`)의 "참고 톤" 항목이
`author: ppangto` 라 적으면서 괄호로 "빵토 선생님"을 병기하고 **선생님 문체 규칙 3·4**를 지목해
서로 어긋나 있다. 유저에게 두 번 물어 다음으로 확정했다:

- **`author: ppangto`(빵토 연구원)로 통일한다.** 이미 발행된 **EP1·EP4가 둘 다 `ppangto`**이고,
  한 편만 저자가 바뀌면 시리즈 안에서 배너·프로필 카드·목록 칩이 어긋난다.
- 다만 **"선생님식 장치"는 가져와 쓴다** — 개념 직후 ascii art, Before/After 대비, "여기서
  헷갈리기 쉬운 포인트는 ~입니다" 형식의 오해 지점 명시 호출. 이미 EP4가 그렇게 쓰여 있다.
- angle의 "(빵토 선생님)" 표기는 리서치 문서의 오기로 취급한다.

### 1.2 프론트매터 확정값

```yaml
title: "..."                     # 미정 — 아래 §6 후보 참조
description: "..."
pubDate: 2026-07-28
category: skills
author: ppangto
tags: []                          # post-finalize가 채움
series: "VPN의 해부"              # ← EP1·EP4와 정확히 일치해야 시리즈 내비가 붙는다
order: 3
draft: false                      # publish-post가 확정
```

`series` 문자열은 **"VPN의 해부"**다(EP1·EP4 실측). 오타 하나로 시리즈 내비가 통째로 끊긴다.

### 1.3 캡처는 **이미 떠 있다** — 랩을 새로 돌릴 필요 없음

선행 세션이 "이 머신에 Docker·tshark가 없다"고 판단했으나 **틀렸다.** 유저가 이미 랩을 구축해
실물 캡처를 확보했고, 아티팩트가 레포에 커밋돼 있다. 랩은 Docker가 아니라 **Lima VM + network
namespace** 방식이다.

```
~/blog-research/raws/captures/vpn-anatomy-3/
    ike_sa_init.txt   (11.5KB — 평문 IKE_SA_INIT 요청/응답 2프레임 전체 디섹션)
    ike_auth.txt      ( 3.1KB — IKE_AUTH 요청/응답 2프레임, SK{} 암호문)
    ike.pcap          ( 3.5KB — 원본, 독자에게 링크로 줄 수 있음)
```

각 `.txt` 첫머리 주석에 생성 명령·tshark 버전·캡처 지점·일시·토폴로지·암호군이 박혀 있고,
**그 헤더가 곧 출처 표기**다.

---

## 2. 읽어야 할 자료 (경로)

| 자료 | 경로 | 무엇이 들었나 |
|---|---|---|
| **angle** (1순위 입력) | `~/blog-research/wiki/angles/vpn-anatomy-3.md` | 후크·핵심 주장 5개·글 구조 제안·viz 명세 4종·open questions |
| 스펙 코퍼스 | `~/blog-research/raws/009-vpn-anatomy-protocol-corpus.md` **§2** | IKE 헤더·Generic Payload Header·SA/Proposal/Transform·페이로드 표·교환종류·포트 |
| 캡처 랩 (설계) | `~/blog-research/raws/010-vpn-anatomy-capture-lab.md` §4.1 | 토폴로지·swanctl.conf·캡처 명령 |
| 캡처 랩 (실장 보고, **최신**) | `~/blog-research/raws/011-vpn-capture-lab-netns.md` | 실제로 지어 본 결과. 010과 달라진 4건 + 새로 알아낸 8건 |
| 위키 topic | `~/blog-research/wiki/topics/vpn-capture-lab.md` | **집필 시 인용 규약**이 여기 있다. 반드시 읽을 것 |
| 위키 topic | `~/blog-research/wiki/topics/rfc7296-ikev2.md`, `ipsec-architecture.md` | 근거 topic |
| 랩 코드 | `~/blog-research/lab/vpn-capture-lab/` | 재현이 필요할 때만 |
| 이웃 편 | `src/content/posts/vpn-anatomy-1.mdx`, `vpn-anatomy-4.mdx` | 문체·구조·링크 관례의 기준 |

### 2.1 인용 규약 (vpn-capture-lab topic §집필 시 인용 규약)

- 본문에는 **발췌만**. 한 인용 블록 **20줄 이내**, 그 편이 설명하는 필드가 보이는 구간만 자른다.
- 인용 블록 앞뒤로 **어느 파일의 어느 부분인지** 밝힌다.
- **디섹션 값은 위조하지 않는다 — 자른다.** 주소·MAC·키는 이미 문서용/합성값이라 가릴 것이 없다.
- 크기를 인용할 때 **계층을 함께 밝힌다**(프레임 길이 vs IKE Length는 42바이트 차이).
- 재현성의 기준은 byte-identical이 아니라 **구조적 동일**이다. "이 값이 그대로 나온다"가 아니라
  "이 구조가 그대로 나온다"로 쓴다. 키·nonce·SPI는 매 실행 달라진다.

---

## 3. 실제 캡처에서 확인한 사실 (전부 실측 — 이 값들은 그대로 써도 된다)

출처: `~/blog-research/raws/captures/vpn-anatomy-3/{ike_sa_init,ike_auth}.txt`
환경: 커널 6.8.0-134-generic · TShark 4.2.2 · strongSwan(Ubuntu 24.04) ·
IKE 암호군 `aes256gcm16-prfsha384-ecp384` · offload 전부 off · 캡처 지점 = netns c1(NAT 이전)

### 3.1 4개 메시지의 실제 모습

| 프레임 | 방향 | 포트 | Exchange | Flags | Message ID | IKE Length | 프레임 길이 |
|---|---|---|---|---|---|---|---|
| 1 | c1→s1 (192.0.2.10→203.0.113.10) | **500→500** | IKE_SA_INIT (34) | **0x08** Initiator·Request | 0x00000000 | 296 | 338 |
| 2 | s1→c1 | 500→500 | IKE_SA_INIT (34) | **0x20** Responder·Response | 0x00000000 | 304 | 346 |
| 3 | c1→s1 | **4500→4500** | IKE_AUTH (35) | 0x08 | 0x00000001 | 277 | 323 |
| 4 | s1→c1 | 4500→4500 | IKE_AUTH (35) | 0x20 | 0x00000001 | 231 | 277 |

**검산(직접 확인함 — 글에 쓸 수 있는 좋은 재료):**
- 프레임 1·2는 `프레임 − 42 = IKE Length` (Ethernet 14 + IPv4 20 + UDP 8 = 42). 338−42=296 ✓, 346−42=304 ✓
- 프레임 3·4는 `프레임 − 46 = IKE Length`. **4바이트가 더 붙는다** — UDP 4500 위의 **non-ESP
  marker(0값 4바이트)**다. 323−46=277 ✓, 277−46=231 ✓
  → tshark도 이 줄을 `UDP Encapsulation of IPsec Packets`로 따로 표시한다.
  → **EP4의 NON-ESP marker 설명과 정확히 이어지는 다리**다. EP3에서 "4바이트가 왜 늘었나"로 던지고
    EP4로 넘기면 시리즈 연결이 산다.

### 3.2 SPI 한 쌍의 실물

```
Frame 1:  Initiator SPI: 9f85f7745c53f73e
          Responder SPI: 0000000000000000     ← 아직 응답자가 정하지 않아 전부 0
Frame 2:  Initiator SPI: 9f85f7745c53f73e
          Responder SPI: 474b3074cfd05b67     ← 응답자가 여기서 자기 SPI를 채운다
```

angle의 핵심 주장 2("SPI가 한 쌍인 이유")를 **실물로 증명하는 최고의 그림**이다. 첫 메시지의
응답자 SPI가 0이라는 사실이 "협상 전이라 아직 상대 SA가 없다"를 그대로 보여 준다.

### 3.3 SA 페이로드의 Proposal/Transform 트리 (실측)

```
Payload: Security Association (33)   payload length 40
  └ Proposal #1   length 36 · Protocol ID: IKE(1) · SPI Size: 0 · transforms 3
      ├ Transform  len 12 · Type: ENCR(1) · ID: AES-GCM with a 16 octet ICV (20)
      │              └ Attribute (t=14,l=2) Key Length: 256  [Format: TV]
      ├ Transform  len  8 · Type: PRF(2)   · ID: PRF_HMAC_SHA2_384 (6)
      └ Transform  len  8 · Type: D-H(4)   · ID: 384-bit random ECP group (20)
```

**검산(확인함):** 12+8+8 = 28, +Proposal 고정 8바이트 = 36 = Proposal length ✓
36 + Generic Payload Header 4바이트 = 40 = SA payload length ✓
→ 필드 크기를 외우게 하는 대신 **덧셈이 맞아떨어지는 걸 보여 주는** 전개가 가능하다.

**교육적으로 중요한 부재**: Transform Type 3(INTEG, 무결성)이 **없다.** AEAD(AES-GCM)를 골랐기
때문이다. EP2의 AEAD 이야기와 곧장 연결되고, "왜 무결성 알고리즘 칸이 비었나"라는 좋은 질문이 된다.
`SPI Size: 0`인 것도 규격대로다 — 최초 IKE SA 협상에서는 SPI를 바깥 헤더에서 얻으므로 0이어야 한다
(RFC 7296 §3.3.1).

### 3.4 IKE_SA_INIT에 실제로 실려 온 Notify 페이로드

요청(프레임 1): `NAT_DETECTION_SOURCE_IP(16388)` · `NAT_DETECTION_DESTINATION_IP(16389)` ·
`IKEV2_FRAGMENTATION_SUPPORTED(16430)` · `SIGNATURE_HASH_ALGORITHMS(16431)` · `REDIRECT_SUPPORTED(16406)`

응답(프레임 2): 위 4개 + `CHILDLESS_IKEV2_SUPPORTED(16418)` · `MULTIPLE_AUTH_SUPPORTED(16404)`
(REDIRECT_SUPPORTED 대신)

`SIGNATURE_HASH_ALGORITHMS`의 Notification DATA `0002000300040005`가 SHA2-256/384/512/Identity로
디섹션되는 것도 그대로 보인다.

**여기가 이 편의 숨은 하이라이트다.** NAT_DETECTION_* 두 개가 첫 메시지에 이미 들어 있고 →
양쪽이 주소 해시를 비교해 NAT을 발견하고 → **그래서 프레임 3부터 포트가 4500으로 뜬다.**
angle이 말한 "UDP 500/4500 두 포트가 NAT-T를 예고한다"가 캡처 안에서 **원인→결과로 완결**된다.
(랩은 MASQUERADE NAT을 일부러 끼워 이걸 유발하도록 설계돼 있다 — raws/011 §3.1이 "NAT-T가
자동 발동했다"고 기록.)

### 3.5 IKE_AUTH — "여기부터 암호문"의 실물

```
Payload: Encrypted and Authenticated (46)
    Next payload: Identification - Initiator (35)     ← 안에 뭐가 들었는지 '종류'만 알려 준다
    Payload length: 249
    Initialization Vector: d06c79b5
    Encrypted Data                                     ← 이 줄이 전부. 내용은 안 보인다
```

- 응답(프레임 4)은 `Next payload: Identification - Responder (36)`, payload length 203, IV `4175f534`.
- **Next Payload 필드가 예외적으로 "안쪽 첫 페이로드의 종류"를 담는다**(RFC 7296 §3.14) — 봉투가
  마지막 페이로드라 원래대로면 0이어야 하는데, 안에 든 것의 타입을 넣을 자리가 없어 여기 넣었다.
  구조는 보이되 내용은 안 보이는 상태를 정확히 설명하는 근거.
- IV가 4바이트인 것은 AES-GCM(AEAD)이라 그렇다 — CBC였다면 블록 크기(16바이트)다.
- **복호는 미확립**이다(랩 open question ①). `SK_*` 키를 strongSwan에서 뽑는 표준 경로가 없다.
  "구조는 보이되 payload는 암호문"으로 정직하게 쓰고 넘어간다. 교육용으로 `null-sha256`을 쓸 수
  있지만 그 경우 **"teaching-only / 실제 운영 설정 아님"을 캡션에 반드시 명시**해야 한다.

---

## 4. RFC 원문에서 직접 확인한 사실 (재조사 불필요)

RFC 7296 원문을 내려받아(`https://www.rfc-editor.org/rfc/rfc7296.txt`) 해당 절을 직접 읽고 확인했다.

### 4.1 IKE 헤더 28바이트 (§3.1)

| 오프셋 | 필드 | 크기 |
|---|---|---|
| 0–7 | IKE SA Initiator's SPI | 8옥텟 |
| 8–15 | IKE SA Responder's SPI | 8옥텟 |
| 16 | Next Payload | 1옥텟 |
| 17 | Major Version(상위 4비트) / Minor Version(하위 4비트) | 1옥텟 (IKEv2 = 2.0) |
| 18 | Exchange Type | 1옥텟 |
| 19 | Flags | 1옥텟 |
| 20–23 | Message ID | 4옥텟 |
| 24–27 | Length (메시지 전체 길이) | 4옥텟 |

### 4.2 ★ Flags 비트 — **코퍼스(raws/009 §2.2)의 서술이 틀렸다. 정정해서 쓸 것**

raws/009 §2.2는 "bit 7 = Initiator, bit 6 = Version, bit 5 = Response"라고 적었는데 **틀렸다.**
RFC 7296 §3.1의 비트 그림은 좌(MSB)→우(LSB) 순으로 `X X R V I X X X` 이고, LSB를 bit 0으로 세면:

| 플래그 | 비트 | 마스크 | 캡처에서 본 값 |
|---|---|---|---|
| I(nitiator) | bit 3 | **0x08** | 프레임 1·3 = `Flags: 0x08 (Initiator, No higher version, Request)` |
| V(ersion) | bit 4 | **0x10** | — |
| R(esponse) | bit 5 | **0x20** | 프레임 2·4 = `Flags: 0x20 (Responder, ..., Response)` |

**실제 캡처 값(0x08 / 0x20)과 RFC 원문이 일치**하므로 이쪽이 확정이다. 글에는 비트 번호보다
**마스크 값(0x08·0x20)**으로 쓰는 편이 독자가 캡처와 대조하기 쉽다.

### 4.3 Generic Payload Header (§3.2) — 4옥텟

Next Payload(1) + Critical flag(1비트) + Reserved(7비트) + Payload Length(2옥텟).
캡처의 `0... .... = Critical Bit: Not critical` / `.000 0000 = Reserved: 0x00` 줄이 이것이다.

### 4.4 Proposal Substructure (§3.3.1) — 고정부 8옥텟

Last Substruc(1, **0=마지막·2=더 있음**) · RESERVED(1) · Proposal Length(2) · Proposal Num(1) ·
Protocol ID(1) · SPI Size(1) · Num Transforms(1) · SPI(가변) · Transforms(가변)

- Protocol ID: IKE=1, AH=2, ESP=3
- **SPI Size는 최초 IKE SA 협상에서 반드시 0**(SPI는 바깥 헤더에서 얻는다). 이후 협상에서는
  IKE 8 / ESP·AH 4.
- Proposal Num은 첫 제안이 1이고 이후 1씩 증가(제안들 사이는 **OR**).
- RFC가 스스로 "Last Substruc는 ISAKMP에서 물려받았고 길이로 알 수 있어 불필요하다"고 적어 둔다 —
  **레거시 흔적**으로 쓸 좋은 소재.

### 4.5 Transform Substructure (§3.3.2) — 고정부 8옥텟

Last Substruc(1, **0=마지막·3=더 있음**) · RESERVED(1) · Transform Length(2) ·
Transform Type(1) · RESERVED(1) · Transform ID(2) · Attributes(가변)

Transform Type: 1=ENCR(암호화) · 2=PRF · 3=INTEG(무결성) · 4=D-H(키교환) · 5=ESN.
Transform ID = 0을 제안에 넣으면 "이 변환을 생략해도 좋다"는 뜻(§3.3.2).

### 4.6 Transform Attributes (§3.3.5)

AF 비트(1) + Attribute Type(15비트) + 값. **AF=1이면 TV(2바이트 값 인라인), AF=0이면 TLV.**
현재 정의된 속성은 **Key Length(type 14, TV) 단 하나**다. 캡처의
`Transform Attribute (t=14,l=2): Key Length: 256 / Format: Type/Value (TV) / Value: 0100`이
정확히 이 구조다(0x0100 = 256).

### 4.7 Exchange Type / Payload Type 코드값 (IANA 레지스트리 확인 — angle open question ① 해소)

- Exchange Type: **34 IKE_SA_INIT · 35 IKE_AUTH · 36 CREATE_CHILD_SA · 37 INFORMATIONAL**
  (그 뒤로 38 IKE_SESSION_RESUME, 43 IKE_INTERMEDIATE 등이 추가됨)
- Payload Type: 33 SA · 34 KE · 35 IDi · 36 IDr · 37 CERT · 38 CERTREQ · 39 AUTH · 40 Nonce ·
  41 Notify · 42 Delete · 43 Vendor ID · 44 TSi · 45 TSr · **46 SK(Encrypted and Authenticated)** ·
  47 CP · 48 EAP
  → 캡처의 `Next payload: Security Association (33)`, `Encrypted and Authenticated (46)`와 일치.

### 4.8 4개 메시지가 나르는 것 (§1.2 표기 그대로)

```
1  HDR, SAi1, KEi, Ni
2  HDR, SAr1, KEr, Nr, [CERTREQ]
3  HDR, SK {IDi, [CERT,] [CERTREQ,] [IDr,] AUTH, SAi2, TSi, TSr}
4  HDR, SK {IDr, [CERT,] AUTH, SAr2, TSi, TSr}
```

§1.2가 이 넷을 "initial exchanges"로 묶고 "normally consist of four messages"라고 적는다 —
**2 RTT로 IKE SA와 첫 Child SA를 함께 세운다**는 서술의 근거. §1.3의 CREATE_CHILD_SA는 추가
Child SA 생성·rekey용.

### 4.9 키 유도 (§2.14) — 필요하면 쓸 수 있는 근거

```
SKEYSEED = prf(Ni | Nr, g^ir)
{SK_d | SK_ai | SK_ar | SK_ei | SK_er | SK_pi | SK_pr} = prf+(SKEYSEED, Ni | Nr | SPIi | SPIr)
```
- SK_d = Child SA 키 유도용 · SK_ai/ar = 무결성 · SK_ei/er = 암호화 · SK_pi/pr = AUTH 페이로드용
- **방향마다 키가 다르다**(개시자→ SK_ai·SK_ei / 반대방향 SK_ar·SK_er).
- **Ni·Nr과 SPIi·SPIr이 키 유도에 들어간다** = 프레임 1·2에서 평문으로 본 그 값들이 곧 키의 재료다.
  "평문으로 보이는데 왜 안전한가"를 설명할 때 쓸 것(공유 비밀 g^ir이 없으면 무의미).

### 4.10 AUTH 계산 (§2.15) — "왜 서로의 nonce에 서명하나"

- 개시자는 **첫 번째 메시지 전체**(SPIi 첫 옥텟 ~ 마지막 페이로드 마지막 옥텟) + **응답자의 nonce Nr**
  + `prf(SK_pi, IDi')`에 서명한다. 응답자는 두 번째 메시지 전체 + Ni + `prf(SK_pr, IDr')`.
- RFC 원문이 "**각자가 상대의 nonce에 서명하는 것이 이 교환의 안전에 결정적**"이라고 정한다.
- Ni/Nr과 prf 값 자체는 **전송되지 않는다**(양쪽이 이미 알고 있으므로).
- `GenIKEHDR = [ four octets 0 if using port 4500 ] | RealIKEHDR` — **포트 4500이면 non-ESP
  marker 4바이트를 서명 대상에 포함**한다. §3.1의 프레임 3·4가 4500이었으므로 여기에 걸린다.
  NAT-T와 인증이 맞물리는 지점이라 좋은 디테일.

### 4.11 NAT Traversal (§2.23)

- IKE 패킷은 500 또는 4500으로 보내되 **어느 포트에서 와도 받아야** 하고 응답은 온 포트로 보낸다
  (NAT이 포트를 바꾸므로).
- NAT을 발견한 엔드포인트는 **이후 모든 트래픽을 4500에서 보내야 한다**(MUST).
- IKE 페이로드에는 엔드포인트 IP를 넣지 않는다 — 암호로 보호돼 NAT이 고칠 수 없기 때문.
- 포트 500에서는 UDP 캡슐화를 하면 안 된다(MUST NOT).
- transport 모드는 NAT과 체크섬 문제가, tunnel 모드도 라우팅 문제가 생겨 UDP 캡슐화로 간다.

### 4.12 IPsec = 프레임워크 (RFC 4301, 코퍼스 §2.1)

- §1.1이 스스로 "base architecture"라고 부른다.
- **SA는 단방향(simplex)**. 양방향 통신에는 SA 한 쌍이 필요하다(§4.1).
- **SPD**(§4.4.1) = 패킷을 PROTECT / DISCARD / BYPASS 세 갈래로 가르는 정책 DB.
- **SAD**(§4.4.2) = 수립된 SA의 키·알고리즘 등 런타임 조회 테이블.
- 유니캐스트 SA는 **SPI 하나로 식별 가능**(구현에 따라 프로토콜 타입 병용).

---

## 5. angle이 제안한 글 구조 (그대로 따라도 되고, 캡처 중심으로 재배치해도 된다)

> 들어가며("IPsec을 쓴다"는 말의 부정확함) → RFC 4301 3개념(SA/SPD/SAD) 관계도 → IKE 헤더 28바이트
> 필드별 분해(ascii 바이트 그림) → SPI가 한 쌍인 이유 → Generic Payload Header →
> SA/Proposal/Transform 계층 구조(EP2의 AEAD·X25519가 Transform ID로 매핑) → KE/IDi·IDr/CERT/AUTH/
> Nonce/Notify 페이로드 순회 → IKE_SA_INIT→IKE_AUTH 4메시지 시퀀스 → CREATE_CHILD_SA 예고 →
> 헷갈리기 쉬운 포인트 → 스스로 점검하기 → EP4 예고

**선행 세션의 제안(참고)**: 실물 캡처가 있으니 "스펙 → 캡처 확인" 순서보다 **"캡처를 먼저 펼치고
필드를 짚어 가며 스펙으로 이유를 대는"** 전개가 이 편의 강점을 살린다. 특히 §3.1 검산(42 vs 46
바이트)과 §3.2 SPI 0값, §3.4 NAT_DETECTION→포트 4500 전환은 캡처가 아니면 만들 수 없는 장면이다.

**분량**: angle 권고 7,000~8,000자. 다만 EP4가 358줄이므로 그에 준하는 밀도가 실제 기준.

### 5.1 viz 명세(angle 제안 4종)

| kind | target | 내용 |
|---|---|---|
| `PosterEditorial` | **hero** | "VPN의 해부 EP3 — IPsec ①, IKEv2 협상" |
| `Flowchart` | inline | RFC 4301 SPD → SA 협상 → SAD 관계 |
| `ProcessSteps` | inline | IKE_SA_INIT → IKE_AUTH 4메시지 시퀀스 |
| `Comparison` | inline | IKE SPI(8+8바이트 쌍) vs ESP SPI(4바이트 하나) — 왜 다른가 |

**렌더 규격(IMAGE_GUIDE R1~R5)을 명세 쓰는 시점에 지킬 것**: viewBox 폭 620 이하 · Flowchart는
모든 엣지에 `routing:"straight"` + 두 노드 중심을 x나 y로 축정렬 · 엣지 label은 렌더 안 되니
정보는 노드 label에 · hero는 `"0 0 600 338"` 안팎에 제목/부제 위주 · 발행 전 실제 렌더 육안 확인.

### 5.2 React 시뮬 후보 (선택)

EP4는 `AntiReplayLab`·`EspOverheadLab` 2종을 넣었다. EP3라면:
- **IKE 헤더 바이트 해부기** — Exchange Type·Flags를 토글하면 28바이트 hex가 바뀌는 것
- **Proposal/Transform 트리 빌더** — 변환을 넣고 빼면 Proposal Length·SA payload length가
  덧셈으로 맞아떨어지는 것(§3.3 검산을 인터랙티브로)

### 5.3 제목 후보 (미확정)

- "IKEv2 해부: 두 낯선 장비가 같은 열쇠를 쥐기까지 4개의 메시지"
- "IPsec은 프로토콜이 아니다 — IKEv2가 협상하는 것들"
- EP1은 "VPN의 해부 1편 — …", EP4는 "ESP 해부: … — …" 형식이라 **편 번호를 제목에 넣는 관례는
  없다**(EP1만 넣음). EP4 스타일(주제 중심 + 부제)이 최신이다.

---

## 6. 이웃 편이 EP3에 걸어 둔 약속 (반드시 지킬 것)

**EP1이 예고한 것** (`vpn-anatomy-1.mdx`):
- 24행: "실제 패킷의 바이트는 **3편부터 캡처와 함께** 뜯습니다"
- 123행: "3편(IKEv2)부터 6편까지는 **RFC 원문 근거와 실제 캡처를 나란히 놓고** 뜯습니다" ←
  이 약속 때문에 캡처 인용이 **선택이 아니라 필수**다
- 169행: "3편에서 협상을, 4편에서 캡슐화와 NAT·MTU 문제를" / 215행: "IPsec은 프레임워크"
- 296행: RFC 4301을 "(3편 예고)"로 링크해 둠
- 323행: 시리즈 목록에 "3편 — IPsec ①: IKEv2는 무엇을 협상하는가 **(작성 예정)**" ← 발행 후
  이 줄을 링크로 바꾸는 것은 **KAN-042**(별도 카드) 소관. EP3 집필 중에 손대지 말 것.

**EP4가 이미 EP3를 링크 중** (`vpn-anatomy-4.mdx`):
- 21행·47행: `[3편](/posts/vpn-anatomy-3/)` — **이미 죽은 링크 상태다.** EP3 발행으로 살아난다.
- 21행: "3편에서 IKEv2 협상이 끝났습니다. **양쪽은 이제 같은 키를 쥐고 있고, 어떤 트래픽을 어떻게
  보호할지도 합의했습니다**" → EP3는 **키 유도(§4.9)와 TS(Traffic Selector) 합의까지** 닿아야
  EP4의 도입이 성립한다.
- 47행: "알고리즘은 **3편에서 협상한 SA가 정합니다**"
- 295행: "실제 데이터를 나르는 SA(**3편의 CHILD_SA**)" → CHILD_SA 용어를 EP3에서 세워야 한다.
- EP4가 이미 다룬 것(**중복 금지**): ESP 7필드·transport/tunnel·anti-replay·NAT-T의 UDP
  캡슐화와 NON-ESP marker·MTU/PMTUD/MSS clamping. EP3는 **NAT 탐지(NAT_DETECTION_* Notify)와
  포트 4500으로의 전환**까지만 다루고 캡슐화 자체는 EP4로 넘긴다.

**EP2(vpn-anatomy-2)는 아직 미발행**이다(KAN-036, 할 일). EP4는 이미 `[2편](/posts/vpn-anatomy-2/)`
링크를 걸어 둔 선례가 있으므로, EP3도 **EP2 링크를 걸어 두는 것이 관례에 맞다**(발행 시 살아난다).

---

## 7. 파이프라인 절차 + 이 시리즈에만 적용되는 정책

```
tech-deepdive(집필+외부검토) → make-image(viz) [+ react-sim]
  → review-post(4축) → review-writing(거시) → quality-gate(기술)
  → post-finalize → publish-post → ship-post(빌드 재검증 + push)
```

### 7.1 시리즈 정책 (main 최신 커밋에서 확정된 것)

- **KAN-044**: graphify 그래프 재생성은 **편당 하지 않는다.** VPN 7편 전량 발행·머지 후 1회
  일괄 재생성한다. → `ship-post` 1.5단계(그래프 재생성)를 **건너뛴다.** EP1·EP4도 그렇게 했다.
- **KAN-042**: 시리즈 링크 섹션 삽입(EP1 323행의 "작성 예정"을 링크로)은 **별도 카드**. EP3
  집필 중에 하지 않는다.
- **KAN-043**: 캡처 아티팩트 생성 카드 — EP3 몫은 **이미 완료**(§1.3). 추가 캡처 불필요.

### 7.2 커밋

`scripts/git-commit-push.sh --repo <abs> --branch centurio1987/kan-037 --message "..." -- <paths>`
로 **지정 경로만** 커밋한다(전체 add 금지·force 금지). 커밋 메시지 관례는 `git log` 참조:
- 발행: `post: vpn-anatomy-3 발행 — VPN 해부 EP3 IPsec① IKEv2 협상`
- 칸반: `kanban: KAN-037 진행 중으로 이동 — …`

칸반 조작은 `python3 ~/.claude/skills/manage-kanban/scripts/kanban.py <sub> . [옵션]`
(`validate` → `reconcile` → `apply --actor ai --op move --id KAN-037 --to doing|review`).
`KANBAN.archive.jsonl`도 회전으로 바뀔 수 있으니 **커밋 경로에 4파일 모두** 넣을 것
(선행 세션이 이걸 빠뜨려 rebase가 막혔다).

---

## 8. 남은 open questions / 주의

| # | 항목 | 상태 |
|---|---|---|
| ① | **IKE_AUTH 복호(`SK_*` 키 추출)** | **미확립.** "구조는 보이되 payload는 암호문"으로 정직하게 쓴다. 교육용 `null-sha256` 대안을 쓸 경우 "teaching-only" 명시 필수 |
| ② | Proposal/Transform **바이트 오프셋 표 원문 인용** | RFC 원문 그림을 직접 확인 완료(§4.4·4.5). angle open question ②는 **해소**됨 |
| ③ | Exchange Type 코드값 IANA 재확인 | **완료**(§4.7). angle open question ①은 해소됨 |
| ④ | **EAP 인증(§3.16)** | 코퍼스 미수집. 원격접속 클라이언트 인증에 흔하므로 다루려면 추가 조사 필요. 다루지 않기로 해도 되지만 **"PSK/인증서 말고 EAP도 있다"** 한 줄은 언급하는 편이 정확하다 |
| ⑤ | 코퍼스 §2.2 Flags 서술 오류 | §4.2대로 **정정해서** 쓸 것. 코퍼스를 그대로 옮기면 틀린다 |
| ⑥ | 캡처의 strongSwan 버전 | `ike_sa_init.txt` 헤더의 `strongSwan:` 줄이 **비어 있다.** 버전을 본문에 적으려면 `~/blog-research/lab/vpn-capture-lab/versions.lock` 또는 위키 topic(5.9.13-2ubuntu4.24.04.4)에서 확인할 것 |

### 주의 (선행 세션이 실제로 밟은 것)

- 이 머신에서 `docker`·`tshark`는 **없다.** 그러나 **랩은 Lima VM 안에** 있고 캡처는 이미 떠 있다.
  "도구가 없으니 캡처를 못 쓴다"는 결론은 **틀린 결론**이다.
- `raws/010`보다 **`raws/011`이 최신**이다(010은 설계, 011은 실장 보고). 충돌하면 011이 우선한다.
- RFC 본문을 길게 옮기지 말 것. 필드명·크기 같은 **사실**은 표로 옮기되, 그림·문장은 직접 그리고
  직접 쓴다.
