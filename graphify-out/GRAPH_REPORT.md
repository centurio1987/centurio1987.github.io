# Graph Report - .  (2026-07-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 657 nodes · 1064 edges · 30 communities
- Extraction: 91% EXTRACTED · 8% INFERRED · 1% AMBIGUOUS · INFERRED: 85 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7c75039c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_JWT 토큰 검증과 서명 공격|JWT 토큰 검증과 서명 공격]]
- [[_COMMUNITY_OSI 7계층 개요|OSI 7계층 개요]]
- [[_COMMUNITY_인증·인가 기초 개념|인증·인가 기초 개념]]
- [[_COMMUNITY_Tauri 런타임 구조와 IPC|Tauri 런타임 구조와 IPC]]
- [[_COMMUNITY_인증·인가 실무 베스트 프랙티스|인증·인가 실무 베스트 프랙티스]]
- [[_COMMUNITY_세션·표현 계층과 TLS|세션·표현 계층과 TLS]]
- [[_COMMUNITY_DNS와 HTTP 응용 계층|DNS와 HTTP 응용 계층]]
- [[_COMMUNITY_TCP 연결과 혼잡 제어|TCP 연결과 혼잡 제어]]
- [[_COMMUNITY_WebRTC 혼잡제어와 품질|WebRTC 혼잡제어와 품질]]
- [[_COMMUNITY_OAuth 인가 코드 플로우|OAuth 인가 코드 플로우]]
- [[_COMMUNITY_WebRTC ICE·NAT 연결 수립|WebRTC ICE·NAT 연결 수립]]
- [[_COMMUNITY_Tauri 비동기 커맨드와 상태|Tauri 비동기 커맨드와 상태]]
- [[_COMMUNITY_40대 알고리즘 학습 커리어|40대 알고리즘 학습 커리어]]
- [[_COMMUNITY_브라우저 전환 경험기|브라우저 전환 경험기]]
- [[_COMMUNITY_이더넷 프레임과 VLAN|이더넷 프레임과 VLAN]]
- [[_COMMUNITY_WebRTC SFU 다자 통화|WebRTC SFU 다자 통화]]
- [[_COMMUNITY_IP 포워딩과 ICMP|IP 포워딩과 ICMP]]
- [[_COMMUNITY_Tauri 사이드카 번들링|Tauri 사이드카 번들링]]
- [[_COMMUNITY_ARP와 IPv6 이웃 탐색|ARP와 IPv6 이웃 탐색]]
- [[_COMMUNITY_네트워크 계층 해부 시리즈|네트워크 계층 해부 시리즈]]
- [[_COMMUNITY_물리 계층과 스위치 학습|물리 계층과 스위치 학습]]
- [[_COMMUNITY_라우팅 테이블과 경로 추적|라우팅 테이블과 경로 추적]]
- [[_COMMUNITY_Tauri 파일시스템 권한 스코프|Tauri 파일시스템 권한 스코프]]
- [[_COMMUNITY_Tauri 이벤트·채널 스트리밍|Tauri 이벤트·채널 스트리밍]]
- [[_COMMUNITY_Tauri 케이퍼빌리티 권한 설정|Tauri 케이퍼빌리티 권한 설정]]
- [[_COMMUNITY_IP 주소 체계와 NAT|IP 주소 체계와 NAT]]
- [[_COMMUNITY_Tauri 앱 진입점 스캐폴딩|Tauri 앱 진입점 스캐폴딩]]
- [[_COMMUNITY_이더넷 링크 협상과 듀플렉스|이더넷 링크 협상과 듀플렉스]]
- [[_COMMUNITY_블로킹 작업 스레드풀 처리|블로킹 작업 스레드풀 처리]]
- [[_COMMUNITY_Astro 블로그 구축|Astro 블로그 구축]]

## God Nodes (most connected - your core abstractions)
1. `L7 해부: DNS와 HTTP, 그리고 한 줄의 curl로 끝나는 여행` - 27 edges
2. `OSI 7계층, 외우지 말고 데이터의 여행으로 이해하기` - 22 edges
3. `L3 해부: 패킷은 어떻게 모르는 네트워크를 건너 길을 찾는가` - 22 edges
4. `L1·L2 해부: 한 LAN 안에서 프레임은 어떻게 길을 찾는가` - 21 edges
5. `인증·인가 해부 1편 — 로그인 화면 뒤에 숨은 지형도` - 15 edges
6. `SFU / Selective Forwarding Middlebox` - 15 edges
7. `scan_folder 커맨드` - 14 edges
8. `인증·인가 해부 2편 — 토큰과 검증 (작성 예정)` - 13 edges
9. `인증·인가 해부 3편 — 플로우: Authorization Code + PKCE·OIDC 로그인 (작성 예정)` - 12 edges
10. `L5·L6 해부: 도착한 bytes를 '같은 뜻'으로, 그리고 대화를 잇기` - 12 edges

## Surprising Connections (you probably didn't know these)
- `VizFlowchart3 — 요청 차단 지점 흐름도` --references--> `Runtime Authority (요청 심사자)`  [INFERRED]
  src/components/posts/tauri-2/VizFlowchart3.tsx → tauri-2.mdx
- `VizComparison4 — fs 플러그인 vs 내 커맨드` --references--> `내 커맨드로 직접 읽기 (갈래 2 — 책임 이동)`  [INFERRED]
  src/components/posts/tauri-2/VizComparison4.tsx → tauri-2.mdx
- `SdpNegotiationStepper` --references--> `Offer/Answer 모델 (RFC 3264)`  [INFERRED]
  src/components/posts/webrtc-1/SdpNegotiationStepper.tsx → webrtc-1.mdx
- `인증·인가 해부 3편 — 플로우: Authorization Code + PKCE·OIDC 로그인 (작성 예정)` --references--> `토큰 엔드포인트 발급 (ROPC 데모)`  [AMBIGUOUS]
  auth-authz-1.mdx → auth-authz-2.mdx
- `인증·인가 해부 4편 — 실무 베스트 프랙티스: nginx·Redis 세션·BFF·인가 모델 (작성 예정)` --conceptually_related_to--> `토큰 교환 (token_endpoint)`  [AMBIGUOUS]
  auth-authz-1.mdx → auth-authz-3.mdx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **재능 자각 → 전략적 우회 → CTO 커리어 → 알고리즘 재대면** — algorithm_at_40_prologue_programming_talent_realization, algorithm_at_40_prologue_strategic_resolve, algorithm_at_40_prologue_topdown_design, algorithm_at_40_prologue_cto_career, algorithm_at_40_prologue_coding_density_drop, algorithm_at_40_prologue_coding_test_failure, algorithm_at_40_prologue_market_response_professionalism [EXTRACTED 0.85]
- **20년에 걸친 사고 체계 전환 (경험주의 → 펀더멘털·추상화·직관)** — algorithm_at_40_prologue_empiricist_thinking, algorithm_at_40_prologue_short_term_memory_limit, algorithm_at_40_prologue_fundamentals_learning_method, algorithm_at_40_prologue_concept_abstraction_system, algorithm_at_40_prologue_multifaceted_thinking, algorithm_at_40_prologue_new_domain_intuition [EXTRACTED 0.85]
- **사이드바·탭관리 기준으로 평가된 브라우저 후보군** — aside_arc_arc_browser, aside_arc_dia, aside_arc_zen, aside_arc_vivaldi, aside_arc_chrome, aside_arc_firefox, aside_arc_aside_browser, aside_arc_sidebar_ux, aside_arc_tidy_feature [EXTRACTED 0.90]
- **인증·인가 지형의 여덟 좌표** — auth_authz_1_identification, auth_authz_1_authentication, auth_authz_1_authorization, auth_authz_1_delegation, auth_authz_1_federation, auth_authz_1_session, auth_authz_1_token, auth_authz_1_policy [EXTRACTED 0.95]
- **인가 모델 4종과 정책 집행 구조** — auth_authz_1_rbac, auth_authz_1_abac, auth_authz_1_rebac, auth_authz_1_pbac, auth_authz_1_pdp_pep, auth_authz_1_deny_by_default [EXTRACTED 0.90]
- **audience 검증 누락 토큰 치환 사고 흐름** — auth_authz_1_oauth2, auth_authz_1_access_token, auth_authz_1_audience_validation, auth_authz_1_oidc, auth_authz_1_id_token [EXTRACTED 0.90]
- **JWT 검증 6단계 플로우** — auth_authz_2_alg_allowlist, auth_authz_2_kid_key_selection, auth_authz_2_signature, auth_authz_2_payload_claims, auth_authz_2_jwks, auth_authz_2_verification_six_steps [EXTRACTED 0.95]
- **서명 검증 누락이 여는 공격면** — auth_authz_2_alg_none_attack, auth_authz_2_alg_confusion, auth_authz_2_jku_x5u_injection, auth_authz_2_audience_bypass, auth_authz_2_decode_vs_verify, auth_authz_2_rfc8725 [EXTRACTED 0.90]
- **소지 증명 토큰 계열 (Bearer 약점 방어)** — auth_authz_2_sender_constrained, auth_authz_2_dpop, auth_authz_2_mtls_bound, auth_authz_2_access_token [EXTRACTED 0.90]
- **Authorization Code + PKCE 여섯 스텝 로그인 플로우** — auth_authz_3_pkce, auth_authz_3_code_verifier, auth_authz_3_code_challenge, auth_authz_3_front_channel, auth_authz_3_authorization_code, auth_authz_3_back_channel, auth_authz_3_token_exchange, auth_authz_3_id_token_validation [EXTRACTED 0.95]
- **state·PKCE·nonce 3중 방어 (CSRF·코드주입·ID Token 재생)** — auth_authz_3_state, auth_authz_3_pkce, auth_authz_3_nonce, auth_authz_3_mixup_defense [EXTRACTED 0.90]
- **고보안 강화 확장 (PAR·클라이언트 인증·redirect_uri 정확매칭)** — auth_authz_3_par, auth_authz_3_client_authentication, auth_authz_3_redirect_uri_exact_match, auth_authz_3_rfc9700 [INFERRED 0.75]
- **심층 방어 계층(프록시·세션·BFF·리소스 서버 인가)** — auth_authz_4_defense_in_depth, auth_authz_4_nginx_auth_request, auth_authz_4_redis_session, auth_authz_4_bff, auth_authz_4_authorization_enforcement [EXTRACTED 0.90]
- **BFF 토큰 보관 흐름(서버 세션·HttpOnly 쿠키·리프레시 회전)** — auth_authz_4_bff, auth_authz_4_redis_session, auth_authz_4_httponly_cookie, auth_authz_4_refresh_token_rotation, auth_authz_4_short_lived_access_token [EXTRACTED 0.85]
- **프록시 신뢰 경계(auth_request·헤더 sanitize·직접접근 차단·내부 JWT)** — auth_authz_4_nginx_auth_request, auth_authz_4_header_sanitize, auth_authz_4_direct_backend_access, auth_authz_4_internal_jwt, src_components_posts_auth_authz_4_authrequestlab [EXTRACTED 0.85]
- **OSI 일곱 계층이 함께 이루는 참조 모델의 책임 분리** — osi_7_layers_1_l1_physical, osi_7_layers_1_l2_data_link, osi_7_layers_1_l3_network, osi_7_layers_1_l4_transport, osi_7_layers_1_l5_session, osi_7_layers_1_l6_presentation, osi_7_layers_1_l7_application, osi_7_layers_1_osi_reference_model [EXTRACTED 0.95]
- **L1→L2→L3→DNS→L4→L6/L7 순서로 좁히는 장애 진단 플로우** — osi_7_layers_1_bottom_up_triage, osi_7_layers_1_l1_physical, osi_7_layers_1_l2_data_link, osi_7_layers_1_l3_network, osi_7_layers_1_dns_gate, osi_7_layers_1_l4_transport, osi_7_layers_1_l6_presentation, osi_7_layers_1_l7_application [EXTRACTED 0.90]
- **OSI 7계층 해부 시리즈 6부작이 이루는 하나의 학습 경로** — osi_7_layers_1_post, osi_7_layers_2_post, osi_7_layers_3_post, osi_7_layers_4_post, osi_7_layers_5_post, osi_7_layers_6_post [EXTRACTED 0.95]
- **ARP 주소 해석 흐름 (broadcast 질의 → unicast 응답 → cache → 프레임 송신)** — osi_7_layers_2_arp, osi_7_layers_2_broadcast, osi_7_layers_2_arp_cache, osi_7_layers_2_mac_address, osi_7_layers_2_gateway_mac [EXTRACTED 0.90]
- **아래에서 위로 좁히는 L1→L2 장애 진단 흐름** — osi_7_layers_2_troubleshoot_walkthrough, osi_7_layers_2_ethtool_check, osi_7_layers_2_ip_neigh_check, osi_7_layers_2_tcpdump_arp, osi_7_layers_2_duplex_mismatch, osi_7_layers_2_vlan [EXTRACTED 0.85]
- **Broadcast 영역 제어 메커니즘 (VLAN 분할·STP 루프 차단·flooding 억제)** — osi_7_layers_2_broadcast_domain, osi_7_layers_2_vlan, osi_7_layers_2_stp, osi_7_layers_2_broadcast_storm, osi_7_layers_2_flooding [INFERRED 0.80]
- **한 홉 통과 시 유지·변경되는 요소들** — osi_7_layers_3_hop_forwarding, osi_7_layers_3_ttl, osi_7_layers_3_mac_rewrite, osi_7_layers_3_header_checksum, osi_7_layers_3_arp_nd, osi_7_layers_3_end_to_end [EXTRACTED 0.90]
- **다음 한 걸음을 정하는 결정 연쇄 (서브넷 판정 → LPM → default route)** — osi_7_layers_3_subnet_decision, osi_7_layers_3_cidr_prefix, osi_7_layers_3_routing_table, osi_7_layers_3_longest_prefix_match, osi_7_layers_3_default_route [EXTRACTED 0.90]
- **L3 장애 진단 3단계 도구 흐름** — osi_7_layers_3_troubleshooting, osi_7_layers_3_ip_route_get, osi_7_layers_3_traceroute, osi_7_layers_3_conntrack, osi_7_layers_3_icmp [EXTRACTED 0.85]
- **TCP가 신뢰성을 만드는 장치들** — osi_7_layers_4_reliability, osi_7_layers_4_rto_rtt, osi_7_layers_4_fast_retransmit, osi_7_layers_4_sack, osi_7_layers_4_tcp [EXTRACTED 0.90]
- **보낼 양을 정하는 두 윈도우 결합** — osi_7_layers_4_flow_control, osi_7_layers_4_congestion_control, osi_7_layers_4_min_rwnd_cwnd, osi_7_layers_4_window_scale, src_components_posts_osi_7_layers_4_slidingwindowlab_slidingwindowlab [EXTRACTED 0.85]
- **OSI 7계층 해부 시리즈 6부 구성** — osi_7_layers_1_osi_overview, osi_7_layers_2_l1_l2_anatomy, osi_7_layers_3_l3_anatomy, osi_7_layers_4_l4_transport_layer, osi_7_layers_5_l5_l6_anatomy, osi_7_layers_6_l7_anatomy [EXTRACTED 0.95]
- **L6 표현의 네 갈래: 인코딩·직렬화·압축·암호화** — osi_7_layers_5_presentation_layer_l6, osi_7_layers_5_character_encoding, osi_7_layers_5_serialization, osi_7_layers_5_compression, osi_7_layers_5_tls [EXTRACTED 0.95]
- **TLS handshake가 기밀성·무결성·인증을 함께 세우는 흐름** — osi_7_layers_5_tls_handshake, osi_7_layers_5_ecdhe_forward_secrecy, osi_7_layers_5_certificate_chain, osi_7_layers_5_sni_ech, osi_7_layers_5_alpn, osi_7_layers_5_rfc8446 [EXTRACTED 0.90]
- **세션 연속성 책임을 나눠 지는 메커니즘들** — osi_7_layers_5_session_layer_l5, osi_7_layers_5_cookie_session, osi_7_layers_5_tls_session_resumption, osi_7_layers_5_quic_connection_migration, osi_7_layers_5_resumable_transfer, osi_7_layers_5_disconnect_resilient_design [EXTRACTED 0.90]
- **DNS 이름 해석 흐름 (stub → 재귀 → root/TLD/권한 → 캐시 → 실패 코드)** — osi_7_layers_6_dns, osi_7_layers_6_recursive_resolver, osi_7_layers_6_iterative_query, osi_7_layers_6_dns_caching_ttl, osi_7_layers_6_dns_records, osi_7_layers_6_dns_failure_codes, osi_7_layers_6_dnsresolvelab [EXTRACTED 0.90]
- **한 줄의 curl이 깨우는 일곱 계층 (DNS→TCP→TLS→HTTP + 시리즈 전편)** — osi_7_layers_6_curl_journey, osi_7_layers_6_dns, osi_7_layers_6_http, osi_7_layers_6_sni_host_header, osi_7_layers_6_requestjourneylab, osi_7_layers_2, osi_7_layers_3, osi_7_layers_4, osi_7_layers_5 [EXTRACTED 0.85]
- **HTTP: 의미(RFC 9110)는 고정, 전송(1.1/2/3·HOL·QUIC)만 진화** — osi_7_layers_6_http, osi_7_layers_6_http_versions, osi_7_layers_6_hol_blocking, osi_7_layers_6_quic, osi_7_layers_6_status_codes, osi_7_layers_6_http_methods, osi_7_layers_6_rfc9110 [EXTRACTED 0.88]
- **v2 인가 흐름 — permissions·scopes·capabilities를 Runtime Authority가 강제** — tauri_1_permission, tauri_1_scope, tauri_1_capability, tauri_1_runtime_authority, tauri_1_ipc_bridge, tauri_1_webview_process [EXTRACTED 0.90]
- **invoke 왕복 흐름 — 프런트 호출에서 Rust 커맨드 응답까지** — tauri_1_invoke, tauri_1_ipc_bridge, tauri_1_generate_handler, tauri_1_greet_command, tauri_1_core_process, tauri_1_runtime_authority [EXTRACTED 0.85]
- **Tauri 런타임 네이티브 스택 — tauri 크레이트·tauri-runtime·WRY·TAO·OS WebView** — tauri_1_tauri_crate, tauri_1_tauri_runtime, tauri_1_wry, tauri_1_tao, tauri_1_os_webview, tauri_1_core_process [EXTRACTED 0.85]
- **권한 거절 → 케이퍼빌리티 개방 흐름** — tauri_2_dialog_open, tauri_2_runtime_authority, tauri_2_permission_denied_error, tauri_2_capabilities_default_json, tauri_2_permission_identifier [EXTRACTED 0.90]
- **커맨드 배선 한 바퀴 (프런트 invoke → 등록 → Rust 커맨드)** — tauri_2_main_ts, tauri_2_invoke, tauri_2_generate_handler, tauri_2_scan_folder, tauri_2_scan_summary, tauri_2_serde_bridge [EXTRACTED 0.90]
- **상태 등록·주입·잠금 수명주기** — tauri_2_manage, tauri_2_scan_cache, tauri_2_state, tauri_2_state_not_managed_panic, tauri_2_mutex_guard_await [EXTRACTED 0.85]
- **진행률 스트리밍 흐름 (커맨드→Channel→프런트)** — tauri_2_scan_folder_streaming, tauri_2_scan_event, tauri_2_serde_tag_content, tauri_2_channel, tauri_2_frontend_channel_listener, tauri_2_invoke [EXTRACTED 0.90]
- **사이드카 배선 계약 (externalBin·케이퍼빌리티 name·호출 인자 문자열 일치)** — tauri_2_external_bin, tauri_2_shell_allow_execute, tauri_2_shell_allow_spawn, tauri_2_command_sidecar_frontend, tauri_2_checksum_file, tauri_2_target_triple_suffix [EXTRACTED 0.85]
- **async 커맨드 함정 (가드·비동기 Mutex·블로킹 오프로드)** — tauri_2_scan_folder, tauri_2_scan_cache, tauri_2_guard_drop_pattern, tauri_2_async_mutex, tauri_2_heavy_scan, tauri_2_spawn_blocking [EXTRACTED 0.85]
- **WebRTC 연결의 세 축 — 협상·연결성·보안** — webrtc_1_signaling, webrtc_1_sdp, webrtc_1_ice, webrtc_1_dtls_srtp [EXTRACTED 0.95]
- **연결 협상 플로우 — Offer/Answer → 후보 수집 → 연결성 점검 → DTLS** — webrtc_1_rtcpeerconnection, webrtc_1_offer_answer, webrtc_1_trickle_ice, webrtc_1_ice, webrtc_1_dtls_srtp [EXTRACTED 0.90]
- **장애 진단 축 — 방화벽·네트워크 전환·경로 사망** — webrtc_1_diagnostics, webrtc_1_turn, webrtc_1_ice_restart, webrtc_1_consent_freshness, webrtc_1_nat_traversal [INFERRED 0.80]
- **품질 파이프라인: 측정 → 흡수 → 적응 → 선택지 확보** — webrtc_2_rtp, webrtc_2_rtcp, webrtc_2_jitter_buffer, webrtc_2_congestion_control, webrtc_2_simulcast [EXTRACTED 0.95]
- **TWCC 기반 GCC 혼잡제어 루프 (피드백→추정→인코더/pacer)** — webrtc_2_twcc, webrtc_2_delay_based_estimator, webrtc_2_loss_based_estimator, webrtc_2_gcc, webrtc_2_encoder, webrtc_2_pacer [EXTRACTED 0.90]
- **simulcast 계층 식별·제어 체계 (RID·SDP·API 파라미터)** — webrtc_2_simulcast, webrtc_2_rid, webrtc_2_sdp_negotiation, webrtc_2_rtcrtpencodingparameters, webrtc_2_rtcrtptransceiver [EXTRACTED 0.85]
- **mesh · SFU · MCU 토폴로지 트레이드오프 삼각** — webrtc_3_mesh, webrtc_3_sfu, webrtc_3_mcu, webrtc_3_rfc_7667, webrtc_3_topology_decision_axes [EXTRACTED 0.95]
- **simulcast 계층 준비(클라이언트) → SFU 선택 전달 흐름** — webrtc_2_simulcast, webrtc_3_sfu, webrtc_3_rfc_8853, webrtc_3_dynacast, webrtc_3_active_speaker_detection [EXTRACTED 0.85]
- **WebRTC 해부 3부작 서사 아크 (연결 → 품질 → 확장)** — webrtc_2_series_references, webrtc_3, webrtc_2_simulcast, webrtc_2_congestion_control_refs [EXTRACTED 0.80]

## Communities (30 total, 0 thin omitted)

### Community 0 - "JWT 토큰 검증과 서명 공격"
Cohesion: 0.06
Nodes (50): 액세스 토큰, alg 허용목록, alg confusion (RS256→HS256), alg:none 공격, 비대칭 서명 RS256/ES256, aud 미검증 우회, clock skew leeway, 디코딩 ≠ 검증 (+42 more)

### Community 1 - "OSI 7계층 개요"
Cohesion: 0.09
Nodes (45): ARP / IPv6 Neighbor Discovery — 링크 내 주소 해석, 아래에서 위로 좁히는 장애 triage 사다리, 자주 틀리는 일곱 가지 오해, 장비는 한 계층에만 갇히지 않는다, DNS 이름 해석 — 모든 진단의 길목, 캡슐화 (Encapsulation), EncapsulationLab (캡슐화 시뮬레이터), end-to-end argument (+37 more)

### Community 2 - "인증·인가 기초 개념"
Cohesion: 0.07
Nodes (42): ABAC (Attribute-Based Access Control), 액세스 토큰 (Access Token, bearer), IAL·AAL·FAL (보증 수준 3축), audience(aud) 검증 · 토큰 치환 사고, 인증 (Authentication), 인가 (Authorization), AuthzMap (인증·인가 인터랙티브 지도 컴포넌트), 쿠키 속성 (Secure·HttpOnly·SameSite) (+34 more)

### Community 3 - "Tauri 런타임 구조와 IPC"
Cohesion: 0.08
Nodes (42): BundleMemoryExample 시각화 컴포넌트, InvokeRoundTrip 시각화 컴포넌트, TauriRuntimeArchitecture 시각화 컴포넌트, TauriVsElectron 시각화 컴포넌트, 번들·메모리 예시 측정 (대표값 아님), Capability — 창/WebView에 부착하는 권한 묶음, tauri::ipc::Channel — 스트리밍 통로, Command (요청-응답형 IPC) (+34 more)

### Community 4 - "인증·인가 실무 베스트 프랙티스"
Cohesion: 0.06
Nodes (40): 인증·인가 해부 1편 — 로그인 화면 뒤에 숨은 지형도, 인증·인가 해부 2편 — 토큰과 검증, 인증·인가 해부 3편 — 플로우: 토큰은 어떻게 오는가, 인증·인가 해부 4편 — 실무 베스트 프랙티스, 리소스 서버 인가 집행, 인증·인가 베스트 프랙티스 체크리스트, BFF(Backend-for-Frontend) 토큰 격리 패턴, CORS는 CSRF 방어가 아니다 (+32 more)

### Community 5 - "세션·표현 계층과 TLS"
Cohesion: 0.07
Nodes (40): L1·L2 해부: 한 LAN 안에서 프레임은 어떻게 길을 찾는가, L3 해부: 패킷은 어떻게 모르는 네트워크를 건너 길을 찾는가, L4 해부: 포트와 소켓, 그리고 TCP가 신뢰를 만드는 법, ALPN 상위 프로토콜 협상, 인증서 체인 검증과 trust anchor, 문자 인코딩 (글자 → 코드 포인트 → byte), 압축 협상 (gzip·brotli), cookie 기반 세션 유지 (무상태 HTTP) (+32 more)

### Community 6 - "DNS와 HTTP 응용 계층"
Cohesion: 0.09
Nodes (40): 콘텐츠 협상 (Accept · Accept-Language · Accept-Encoding), 한 줄의 curl이 깨우는 일곱 계층, 전달의 성공 ≠ 의미의 성공, DNS (Domain Name System), DNS 캐싱과 TTL (음성 캐싱 포함), DNS 실패 코드: NXDOMAIN · SERVFAIL · NOERROR/NODATA, DNS 레코드 타입 (A/AAAA·CNAME·MX·NS·SOA·TXT·CAA·HTTPS/SVCB), DNS 전송: UDP 53 · TC 비트 · TCP 53 · EDNS0 (+32 more)

### Community 7 - "TCP 연결과 혼잡 제어"
Cohesion: 0.08
Nodes (39): OSI 7계층, 외우지 말고 데이터의 여행으로 이해하기 (1편), L1·L2 해부: 한 LAN 안에서 프레임은 어떻게 길을 찾는가 (2편), L3 해부: 패킷은 어떻게 모르는 네트워크를 건너 길을 찾는가 (3편), 자주 틀리는 여섯 가지, 혼잡 제어 (cwnd, slow start, AIMD, CUBIC, BBR, ECN), 연결 종료: FIN 교환·half-close·TIME-WAIT, 임시 포트 (ephemeral port) 범위와 고갈, 빠른 재전송 (중복 ACK 3개) (+31 more)

### Community 8 - "WebRTC 혼잡제어와 품질"
Cohesion: 0.08
Nodes (39): AVPF (RFC 4585) — 즉시성 피드백 프로파일, RFC 8888 CCFB — 차세대 혼잡제어 피드백, 혼잡제어(congestion control) — 대역폭 적응, 혼잡제어 근거 (GCC · TWCC · RFC 8888 CCFB), delay-based 추정 (AIMD, 지연 추세 기반), 인코더 비트레이트/해상도 조정, FEC (RED/ULPFEC·FlexFEC) — 전방 오류 수정, GCC (Google Congestion Control, draft-ietf-rmcat-gcc) (+31 more)

### Community 9 - "OAuth 인가 코드 플로우"
Cohesion: 0.10
Nodes (28): OAuth 2.1 (진행 중 Internet-Draft), PKCE (Proof Key for Code Exchange), 일회용 authorization code, Authorization Code Grant 흐름, 백채널 (직접 HTTP 요청), 클라이언트 인증 (client_secret·private_key_jwt·mTLS), code_challenge (S256), code_verifier (+20 more)

### Community 10 - "WebRTC ICE·NAT 연결 수립"
Cohesion: 0.14
Nodes (26): IceTraversalLab, LoopbackNegotiationDemo, SdpNegotiationStepper, consent freshness / NAT keepalive (RFC 7675), 진단: webrtc-internals와 getStats(), DTLS-SRTP 의무 암호화 (RFC 5764), getUserMedia / 미디어 캡처와 secure context, ICE (RFC 8445) (+18 more)

### Community 11 - "Tauri 비동기 커맨드와 상태"
Cohesion: 0.15
Nodes (20): async 커맨드 (메인 스레드 차단 회피), 정석 2 — tauri::async_runtime::Mutex, canonicalize() 경로 검증 가드, Result 기반 커맨드 에러 전파 (thiserror), do_scan 보조 함수, do_scan_async, 정석 1 — await 전에 가드 해제, invoke — 프런트엔드 IPC 호출 (+12 more)

### Community 12 - "40대 알고리즘 학습 커리어"
Cohesion: 0.13
Nodes (19): 40살인데 알고리즘 해도 괜찮을까요 - 프롤로그, "알고리즘은 실무에서 의미 없다"는 통념, 겸직으로 인한 코딩 밀도 저하, 코딩 테스트 실패 경험, 개념 추상화·사고 시스템 구축, 스타트업 CTO 커리어, 실무자 맥락 공감 리더십 (경영·마케팅·UX 학습), 경험주의적 사고방식의 한계 (+11 more)

### Community 13 - "브라우저 전환 경험기"
Cohesion: 0.18
Nodes (18): aside: 드디어 arc의 악령에서 벗어나나, "누가 대신 해줬으면" 순간의 즉각적 AI 위임 발상, Arc Browser, aside 브라우저, 사용 무게중심의 브라우저 이동이 만드는 맥락적 변화, 브라우저 노마드, Chrome, 크로미움 기반 (+10 more)

### Community 14 - "이더넷 프레임과 VLAN"
Cohesion: 0.16
Nodes (17): Access port, Broadcast (ff:ff:ff:ff:ff:ff), Broadcast domain, Broadcast storm과 L2 TTL 부재, 자주 틀리는 여섯 가지, 802.1Q 4바이트 태그 (TPID·TCI·VID·PCP·DEI), Ethernet II 프레임 구조, FrameAnatomy (Ethernet 프레임 해부 시뮬레이션) (+9 more)

### Community 15 - "WebRTC SFU 다자 통화"
Cohesion: 0.28
Nodes (16): WebRTC 해부 3편 — 참가자가 늘어나면, 서버는 무엇을 해야 하는가, 발화자 감지 (active/dominant speaker detection), BlogGeek.me — WebRTC P2P mesh / Multipoint Video 분석, Dynacast (LiveKit 고유 계층 인코딩 중단 최적화), Janus VideoRoom 문서, 레거시 SIP/H.323 상호운용 하이브리드 게이트웨이, LiveKit SFU 공식 문서·블로그, MCU (Multipoint Control/Conferencing Unit) (+8 more)

### Community 16 - "IP 포워딩과 ICMP"
Cohesion: 0.19
Nodes (15): ARP / ND 주소 해석, IPv4 header checksum 증분 갱신, 한 홉 forwarding 처리 순서, ICMP / ICMPv6 제어 메시지, IPv6 L3 재설계, 홉마다 새로 쓰이는 L2 MAC 헤더, PMTUD와 MTU 블랙홀, 서브넷 판정 (같은 동네인가 gateway로 가는가) (+7 more)

### Community 17 - "Tauri 사이드카 번들링"
Cohesion: 0.23
Nodes (14): Tauri 2편 — 구현 8단계, 케이퍼빌리티 권한 설정, 프런트 Command.sidecar(), bundle.externalBin 설정, 실패의 네 층(권한·등록·상태·파일이름), file-scout 예제 앱, tauri::generate_handler! 커맨드 등록, invoke_handler (앱당 1회 호출 규칙) (+6 more)

### Community 18 - "ARP와 IPv6 이웃 탐색"
Cohesion: 0.19
Nodes (13): ARP (Address Resolution Protocol), ARP cache (IP → MAC 매핑), ARP spoofing, Gratuitous ARP와 ARP Probe (ACD), 직접 해보기: ARP 한 번을 눈으로 잡기, ip neigh로 gateway 도달성 확인, IPv6 Neighbor Discovery (ND), Proxy ARP (+5 more)

### Community 19 - "네트워크 계층 해부 시리즈"
Cohesion: 0.29
Nodes (12): OSI 7계층, 외우지 말고 데이터의 여행으로 이해하기 (1편), L1·L2 해부: 한 LAN 안에서 프레임은 어떻게 길을 찾는가, IEEE 802.1 Bridging 개요, RFC 894, Transmission of IP Datagrams over Ethernet, L3 해부: 패킷은 어떻게 모르는 네트워크를 건너 길을 찾는가, L3 네트워크 계층, Router (라우터), L4 해부: 포트와 소켓, 그리고 TCP가 신뢰를 만드는 법 (+4 more)

### Community 20 - "물리 계층과 스위치 학습"
Cohesion: 0.20
Nodes (12): 충돌 영역 (Collision domain), CSMA/CD, Echo cancellation (1000BASE-T), Unknown unicast flooding, Hub, L1 Physical 계층, Line code 인코딩과 클럭 회복, MAC flooding 공격 (CAM 테이블 포화) (+4 more)

### Community 21 - "라우팅 테이블과 경로 추적"
Cohesion: 0.27
Nodes (11): conntrack NAT 상태 조회, Default route (0.0.0.0/0), 동적 라우팅 (OSPF·IS-IS·BGP), 직접 해보기: traceroute를 IP 헤더로 해부, ip route get (커널 경로 조회), 최장 프리픽스 매칭 (LPM), 자주 틀리는 여섯 가지, 라우팅 테이블 (+3 more)

### Community 22 - "Tauri 파일시스템 권한 스코프"
Cohesion: 0.18
Nodes (11): Tauri 해부 1편 — 구조와 보안 모델, fs_scope().allow_directory 런타임 scope 확장, fs 플러그인 (갈래 1), Tauri 2.x 공식 문서 (v2.tauri.app, 2026-07-26 조회), 경로 변수 ($HOME·$APPDATA 등), Tauri 해부 2편 — 개념을 코드로, scope — 인자 검증 규칙, VizComparison4 — fs 플러그인 vs 내 커맨드 (+3 more)

### Community 23 - "Tauri 이벤트·채널 스트리밍"
Cohesion: 0.27
Nodes (11): Channel 진행률 스트리밍, ChecksumEvent 열거형, checksum_file 커맨드, 자식 프로세스 핸들 정리(child.kill), Event 시스템, 프런트 Channel onmessage 리스너, ScanEvent 열거형, scan_folder_streaming 커맨드 (+3 more)

### Community 24 - "Tauri 케이퍼빌리티 권한 설정"
Cohesion: 0.24
Nodes (10): capabilities/default.json, 케이퍼빌리티 (창별 권한 묶음), core:default 기본 권한 묶음, open() 폴더 선택 API, dialog 플러그인 (tauri add dialog), dialog.open not allowed 권한 거절 에러, PermissionGate 권한 시뮬레이션, 퍼미션 식별자 규칙 (plugin:allow-command) (+2 more)

### Community 25 - "IP 주소 체계와 NAT"
Cohesion: 0.22
Nodes (9): CIDR prefix 길이와 subnet mask, end-to-end 주소 유지 원칙, IP 주소 (network/host 두 부분), NAT / NAPT 주소 변환, 사설 주소 대역 (RFC 1918), RFC 1918, Address Allocation for Private Internets, RFC 2663, NAT Terminology, RFC 3022, Traditional IP NAT (+1 more)

### Community 26 - "Tauri 앱 진입점 스캐폴딩"
Cohesion: 0.33
Nodes (7): lib.rs — 앱 본체 run(), main.rs — 데스크톱 진입점, cfg_attr(mobile, tauri::mobile_entry_point), run() 앱 진입 함수, 0단계 스캐폴딩 (create-tauri-app), tauri.conf.json 앱 설정, 디렉터리로 드러나는 신뢰 경계 (src ↔ src-tauri)

### Community 27 - "이더넷 링크 협상과 듀플렉스"
Cohesion: 0.40
Nodes (5): Autonegotiation (IEEE 802.3 Clause 28), Duplex mismatch, ethtool/ip link로 link·duplex 확인, FCS (Frame Check Sequence), IEEE 802.3 Ethernet 표준

### Community 28 - "블로킹 작업 스레드풀 처리"
Cohesion: 0.67
Nodes (3): do_scan_blocking, heavy_scan 커맨드, spawn_blocking 블로킹 스레드풀

### Community 29 - "Astro 블로그 구축"
Cohesion: 1.00
Nodes (3): 블로그를 Astro로 새로 지었습니다, Astro 정적 사이트 아키텍처 선택, raws → draft → 발행 집필 워크플로우

## Ambiguous Edges - Review These
- `Zen 브라우저` → `Tidy 탭 정리 기능`  [AMBIGUOUS]
  aside-arc.md · relation: references
- `인증·인가 해부 3편 — 플로우: Authorization Code + PKCE·OIDC 로그인 (작성 예정)` → `토큰 엔드포인트 발급 (ROPC 데모)`  [AMBIGUOUS]
  auth-authz-2.mdx · relation: references
- `인증·인가 해부 4편 — 실무 베스트 프랙티스: nginx·Redis 세션·BFF·인가 모델 (작성 예정)` → `sender-constrained (소지 증명) 토큰`  [AMBIGUOUS]
  auth-authz-2.mdx · relation: references
- `인증·인가 해부 4편 — 실무 베스트 프랙티스: nginx·Redis 세션·BFF·인가 모델 (작성 예정)` → `토큰 교환 (token_endpoint)`  [AMBIGUOUS]
  auth-authz-3.mdx · relation: conceptually_related_to
- `L3 Network — 여러 링크를 건너는 경로` → `socket/connection 단위 demultiplexing (5-tuple)`  [AMBIGUOUS]
  osi-7-layers-1.mdx · relation: shares_data_with
- `Default route (0.0.0.0/0)` → `동적 라우팅 (OSPF·IS-IS·BGP)`  [AMBIGUOUS]
  osi-7-layers-3.mdx · relation: conceptually_related_to
- `5-튜플 (protocol, src IP/port, dst IP/port)` → `초기 순서번호 (ISN)`  [AMBIGUOUS]
  osi-7-layers-4.mdx · relation: shares_data_with
- `async 커맨드 (메인 스레드 차단 회피)` → `Channel 진행률 스트리밍`  [AMBIGUOUS]
  tauri-2.mdx · relation: conceptually_related_to
- `정석 2 — tauri::async_runtime::Mutex` → `spawn_blocking 블로킹 스레드풀`  [AMBIGUOUS]
  tauri-2.mdx · relation: conceptually_related_to
- `scripts/rename-sidecar.mjs` → `tauri build 배포 빌드`  [AMBIGUOUS]
  tauri-2.mdx · relation: conceptually_related_to
- `RTCP (RTP Control Protocol) — SR/RR 품질 피드백` → `jitter buffer — 지연 변동 흡수`  [AMBIGUOUS]
  webrtc-2.mdx · relation: shares_data_with

## Knowledge Gaps
- **143 isolated node(s):** `40살인데 알고리즘 해도 괜찮을까요 - 프롤로그`, `단기기억 한계와 절차 구상 실패`, `겁 많은 천성과 강한 메타인지`, `40대 구직 시장과 AI 시대의 능력 증명 압박`, `Chrome` (+138 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Zen 브라우저` and `Tidy 탭 정리 기능`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `인증·인가 해부 3편 — 플로우: Authorization Code + PKCE·OIDC 로그인 (작성 예정)` and `토큰 엔드포인트 발급 (ROPC 데모)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `인증·인가 해부 4편 — 실무 베스트 프랙티스: nginx·Redis 세션·BFF·인가 모델 (작성 예정)` and `sender-constrained (소지 증명) 토큰`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `인증·인가 해부 4편 — 실무 베스트 프랙티스: nginx·Redis 세션·BFF·인가 모델 (작성 예정)` and `토큰 교환 (token_endpoint)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `L3 Network — 여러 링크를 건너는 경로` and `socket/connection 단위 demultiplexing (5-tuple)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `Default route (0.0.0.0/0)` and `동적 라우팅 (OSPF·IS-IS·BGP)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `5-튜플 (protocol, src IP/port, dst IP/port)` and `초기 순서번호 (ISN)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._