# Graph Report - src/content/posts  (2026-07-02)

## Corpus Check
- Corpus is ~21,178 words - fits in a single context window. You may not need a graph.

## Summary
- 38 nodes · 33 edges · 10 communities (5 shown, 5 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.9)
- Token cost: 58,574 input · 6,018 output

## Community Hubs (Navigation)
- [[_COMMUNITY_WebRTC 연결 수립|WebRTC 연결 수립]]
- [[_COMMUNITY_OSI 모델과 상위 계층|OSI 모델과 상위 계층]]
- [[_COMMUNITY_링크·네트워크 계층|링크·네트워크 계층]]
- [[_COMMUNITY_DNS와 HTTP 여정|DNS와 HTTP 여정]]
- [[_COMMUNITY_전송 계층 프로토콜|전송 계층 프로토콜]]
- [[_COMMUNITY_TCPIP 모델|TCP/IP 모델]]
- [[_COMMUNITY_STP 스패닝 트리|STP 스패닝 트리]]
- [[_COMMUNITY_NAT 주소 변환|NAT 주소 변환]]
- [[_COMMUNITY_라우팅 테이블|라우팅 테이블]]
- [[_COMMUNITY_블로그 소개|블로그 소개]]

## God Nodes (most connected - your core abstractions)
1. `WebRTC 해부 1편 — 두 브라우저는 어떻게 직접 손을 잡는가` - 8 edges
2. `OSI Reference Model` - 8 edges
3. `L7 해부: DNS와 HTTP, 그리고 한 줄의 curl로 끝나는 여행` - 4 edges
4. `L2 Data Link Layer` - 4 edges
5. `L3 Network Layer` - 4 edges
6. `ICE (Interactive Connectivity Establishment)` - 3 edges
7. `L4 Transport Layer` - 3 edges
8. `STUN (Session Traversal Utilities for NAT)` - 2 edges
9. `TURN (Traversal Using Relays around NAT)` - 2 edges
10. `L5 Session Layer` - 2 edges

## Surprising Connections (you probably didn't know these)
- `WebRTC 해부 1편 — 두 브라우저는 어떻게 직접 손을 잡는가` --references--> `IceTraversalLab`  [EXTRACTED]
  src/content/posts/webrtc-1.mdx → src/components/posts/webrtc-1/IceTraversalLab.tsx
- `WebRTC 해부 1편 — 두 브라우저는 어떻게 직접 손을 잡는가` --references--> `LoopbackNegotiationDemo`  [EXTRACTED]
  src/content/posts/webrtc-1.mdx → src/components/posts/webrtc-1/LoopbackNegotiationDemo.tsx
- `WebRTC 해부 1편 — 두 브라우저는 어떻게 직접 손을 잡는가` --references--> `SdpNegotiationStepper`  [EXTRACTED]
  src/content/posts/webrtc-1.mdx → src/components/posts/webrtc-1/SdpNegotiationStepper.tsx
- `L7 해부: DNS와 HTTP, 그리고 한 줄의 curl로 끝나는 여행` --references--> `DnsResolveLab`  [EXTRACTED]
  src/content/posts/osi-7-layers-6.mdx → src/components/posts/osi-7-layers-6/DnsResolveLab.tsx
- `L7 해부: DNS와 HTTP, 그리고 한 줄의 curl로 끝나는 여행` --references--> `RequestJourneyLab`  [EXTRACTED]
  src/content/posts/osi-7-layers-6.mdx → src/components/posts/osi-7-layers-6/RequestJourneyLab.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **WebRTC Connectivity Stack** — src_content_posts_webrtc_1_ice, src_content_posts_webrtc_1_stun, src_content_posts_webrtc_1_turn, src_content_posts_webrtc_1_sdp, src_content_posts_webrtc_1_dtls_srtp [EXTRACTED 0.95]
- **OSI Layer 7 Web Protocols** — src_content_posts_osi_7_layers_6_dns, src_content_posts_osi_7_layers_6_http [EXTRACTED 0.90]
- **OSI 7 Layer Stack** — src_content_posts_osi_7_layers_1_l1_physical, src_content_posts_osi_7_layers_1_l2_data_link, src_content_posts_osi_7_layers_1_l3_network, src_content_posts_osi_7_layers_1_l4_transport, src_content_posts_osi_7_layers_1_l5_session, src_content_posts_osi_7_layers_1_l6_presentation, src_content_posts_osi_7_layers_1_l7_application [EXTRACTED 1.00]
- **Network Triage Ladder** — src_content_posts_osi_7_layers_1_l1_physical, src_content_posts_osi_7_layers_1_l2_data_link, src_content_posts_osi_7_layers_1_l3_network, src_content_posts_osi_7_layers_1_l4_transport, src_content_posts_osi_7_layers_1_l7_application [EXTRACTED 0.90]

## Communities (10 total, 5 thin omitted)

### Community 0 - "WebRTC 연결 수립"
Cohesion: 0.28
Nodes (9): DTLS-SRTP, ICE (Interactive Connectivity Establishment), SDP (Session Description Protocol), STUN (Session Traversal Utilities for NAT), TURN (Traversal Using Relays around NAT), WebRTC 해부 1편 — 두 브라우저는 어떻게 직접 손을 잡는가, IceTraversalLab, LoopbackNegotiationDemo (+1 more)

### Community 1 - "OSI 모델과 상위 계층"
Cohesion: 0.25
Nodes (8): Encapsulation, L1 Physical Layer, L5 Session Layer, L6 Presentation Layer, L7 Application Layer, OSI Reference Model, HTTP Cookie, TLS

### Community 2 - "링크·네트워크 계층"
Cohesion: 0.29
Nodes (7): L2 Data Link Layer, L3 Network Layer, ARP (Address Resolution Protocol), Ethernet (IEEE 802.3), VLAN (IEEE 802.1Q), ICMP, IP (Internet Protocol)

### Community 3 - "DNS와 HTTP 여정"
Cohesion: 0.40
Nodes (5): DnsResolveLab, RequestJourneyLab, DNS (Domain Name System), HTTP (HyperText Transfer Protocol), L7 해부: DNS와 HTTP, 그리고 한 줄의 curl로 끝나는 여행

### Community 4 - "전송 계층 프로토콜"
Cohesion: 0.50
Nodes (4): L4 Transport Layer, QUIC, TCP, UDP

## Knowledge Gaps
- **25 isolated node(s):** `DNS (Domain Name System)`, `HTTP (HyperText Transfer Protocol)`, `DnsResolveLab`, `RequestJourneyLab`, `SDP (Session Description Protocol)` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OSI Reference Model` connect `OSI 모델과 상위 계층` to `링크·네트워크 계층`, `전송 계층 프로토콜`?**
  _High betweenness centrality (0.193) - this node is a cross-community bridge._
- **Why does `L4 Transport Layer` connect `전송 계층 프로토콜` to `OSI 모델과 상위 계층`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `L2 Data Link Layer` connect `링크·네트워크 계층` to `OSI 모델과 상위 계층`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `DNS (Domain Name System)`, `HTTP (HyperText Transfer Protocol)`, `DnsResolveLab` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._