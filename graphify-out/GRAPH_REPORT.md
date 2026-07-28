# Graph Report - /private/tmp/claude-501/-Users-centurio-orca-workspaces-centurio1987-github-io-kan-028/3fb26dd8-c358-434a-94a8-89d927090a49/scratchpad/extract  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 874 nodes · 1466 edges · 32 communities
- Extraction: 92% EXTRACTED · 7% INFERRED · 1% AMBIGUOUS · INFERRED: 102 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8072c289`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Tauri IPC Commands & Security|Tauri IPC Commands & Security]]
- [[_COMMUNITY_Container Ecosystem & Tooling|Container Ecosystem & Tooling]]
- [[_COMMUNITY_OCI Image & Runtime Specs|OCI Image & Runtime Specs]]
- [[_COMMUNITY_Docker Layers & Kernel Isolation|Docker Layers & Kernel Isolation]]
- [[_COMMUNITY_WebRTC Congestion Control|WebRTC Congestion Control]]
- [[_COMMUNITY_Tauri Architecture & Bundle Size|Tauri Architecture & Bundle Size]]
- [[_COMMUNITY_OAuth Authorization Code + PKCE|OAuth Authorization Code + PKCE]]
- [[_COMMUNITY_IP Routing & NAT|IP Routing & NAT]]
- [[_COMMUNITY_Authentication vs Authorization Basics|Authentication vs Authorization Basics]]
- [[_COMMUNITY_Kubernetes CRI Runtimes|Kubernetes CRI Runtimes]]
- [[_COMMUNITY_JWT Tokens & Signature Validation|JWT Tokens & Signature Validation]]
- [[_COMMUNITY_Auth Production Best Practices|Auth Production Best Practices]]
- [[_COMMUNITY_WebRTC ICE & SDP Negotiation|WebRTC ICE & SDP Negotiation]]
- [[_COMMUNITY_OSI Seven-Layer Model|OSI Seven-Layer Model]]
- [[_COMMUNITY_WebRTC RFC References|WebRTC RFC References]]
- [[_COMMUNITY_TLS Handshake & Character Encoding|TLS Handshake & Character Encoding]]
- [[_COMMUNITY_DNS Resolution & HTTP Basics|DNS Resolution & HTTP Basics]]
- [[_COMMUNITY_Developer Career & Fundamentals|Developer Career & Fundamentals]]
- [[_COMMUNITY_Browser Choice & AI Agents|Browser Choice & AI Agents]]
- [[_COMMUNITY_Ethernet Frames & ARP|Ethernet Frames & ARP]]
- [[_COMMUNITY_TCP Reliability & Congestion|TCP Reliability & Congestion]]
- [[_COMMUNITY_HTTP Semantics & Caching|HTTP Semantics & Caching]]
- [[_COMMUNITY_Session Layer & Cookies|Session Layer & Cookies]]
- [[_COMMUNITY_ARP Address Resolution Lab|ARP Address Resolution Lab]]
- [[_COMMUNITY_Physical Layer & Switching|Physical Layer & Switching]]
- [[_COMMUNITY_Transport Layer & UDPQUIC|Transport Layer & UDP/QUIC]]
- [[_COMMUNITY_Ports, Sockets & NAT State|Ports, Sockets & NAT State]]
- [[_COMMUNITY_VLAN & Spanning Tree|VLAN & Spanning Tree]]
- [[_COMMUNITY_TCP Handshake & Options|TCP Handshake & Options]]
- [[_COMMUNITY_Encapsulation & Layer Models|Encapsulation & Layer Models]]
- [[_COMMUNITY_HTTP Version Evolution|HTTP Version Evolution]]
- [[_COMMUNITY_Astro Blog Build|Astro Blog Build]]

## God Nodes (most connected - your core abstractions)
1. `OSI 7계층, 외우지 말고 데이터의 여행으로 이해하기` - 50 edges
2. `L3 해부: 패킷은 어떻게 모르는 네트워크를 건너 길을 찾는가` - 28 edges
3. `L4 해부: 포트와 소켓, 그리고 TCP가 신뢰를 만드는 법` - 23 edges
4. `L7 해부: DNS와 HTTP, 그리고 한 줄의 curl로 끝나는 여행` - 23 edges
5. `3편 — 플로우: Authorization Code + PKCE·OIDC 로그인 (작성 예정)` - 22 edges
6. `인증·인가 해부 1편 — 로그인 화면 뒤에 숨은 지형도` - 20 edges
7. `인증·인가 해부 2편 — 토큰과 검증: 서명을 믿는다는 것` - 20 edges
8. `4편 — 실무 베스트 프랙티스: nginx·Redis 세션·BFF·인가 모델 (작성 예정)` - 19 edges
9. `컨테이너의 해부 EP3 — CRI (다음 편 예고)` - 19 edges
10. `L1·L2 해부: 한 LAN 안에서 프레임은 어떻게 길을 찾는가` - 18 edges

## Surprising Connections (you probably didn't know these)
- `40살인데 알고리즘 해도 괜찮을까요 - 프롤로그` --semantically_similar_to--> `aside: 드디어 arc의 악령에서 벗어나나`  [AMBIGUOUS] [semantically similar]
  algorithm-at-40-prologue.md → aside-arc.md
- `VizFlowchart4 (흐름도)` --references--> `OverlayFS`  [AMBIGUOUS]
  src/components/posts/container-anatomy-1/VizFlowchart4.tsx → container-anatomy-1.mdx
- `VizProcessSteps2 (실행 릴레이 순서 도식)` --references--> `containerd-shim-runc-v2 (shim)`  [INFERRED]
  src/components/posts/container-anatomy-1/VizProcessSteps2.tsx → container-anatomy-1.mdx
- `VizProcessSteps2 (파드 기동 순서 도해)` --references--> `RunPodSandbox`  [INFERRED]
  src/components/posts/container-anatomy-3/VizProcessSteps2.tsx → container-anatomy-3.mdx
- `VizComparison3 (dockershim 전/후 비교)` --references--> `dockershim (kubelet↔Docker Engine 어댑터)`  [INFERRED]
  src/components/posts/container-anatomy-3/VizComparison3.tsx → container-anatomy-3.mdx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **재능 부재 자각 → 전략적 우회 → CTO 커리어 → 알고리즘 회귀** — algorithm_at_40_prologue_no_programming_talent, algorithm_at_40_prologue_strategic_resolve, algorithm_at_40_prologue_breadth_of_knowledge, algorithm_at_40_prologue_cto_career, algorithm_at_40_prologue_coding_test_failure, algorithm_at_40_prologue_pro_mindset [EXTRACTED 0.85]
- **20년간의 사고 시스템 최적화(경험주의 → 펀더멘털·추상화·패턴 인식)** — algorithm_at_40_prologue_empiricist_thinking, algorithm_at_40_prologue_fundamentals_learning_method, algorithm_at_40_prologue_concept_abstraction_system, algorithm_at_40_prologue_domain_pattern_recognition, algorithm_at_40_prologue_multifaceted_thinking [EXTRACTED 0.85]
- **브라우저 노마드의 후보 평가(사이드바·tidy·크로미움·AI 기준)** — aside_arc_arc_browser, aside_arc_dia, aside_arc_vivaldi, aside_arc_zen, aside_arc_aside_browser, aside_arc_sidebar_ux, aside_arc_tidy [EXTRACTED 0.90]
- **인증·인가 여덟 좌표 지형도** — auth_authz_1_identification, auth_authz_1_authentication, auth_authz_1_authorization, auth_authz_1_delegation, auth_authz_1_federation, auth_authz_1_session, auth_authz_1_token, auth_authz_1_policy [EXTRACTED 0.95]
- **인가 규칙 표현 모델군 (RBAC·ABAC·ReBAC·PBAC)** — auth_authz_1_rbac, auth_authz_1_abac, auth_authz_1_rebac, auth_authz_1_pbac, auth_authz_1_authorization [EXTRACTED 0.90]
- **OAuth 위임 → OIDC 신원 계층 → 토큰 검증 흐름** — auth_authz_1_oauth2, auth_authz_1_oidc, auth_authz_1_access_token, auth_authz_1_id_token, auth_authz_1_audience_validation, auth_authz_1_jwt [EXTRACTED 0.90]
- **JWT 검증 6단계 흐름 (alg→kid→서명→iss→aud→exp)** — auth_authz_2_alg_allowlist, auth_authz_2_kid, auth_authz_2_jwks, auth_authz_2_jws_signature, auth_authz_2_aud_validation, auth_authz_2_registered_claims, auth_authz_2_verification_six_steps [EXTRACTED 0.95]
- **서명 검증을 우회하는 공격군 (alg:none · alg confusion · jku/x5u 키 주입 · aud 미검증)** — auth_authz_2_alg_none_attack, auth_authz_2_alg_confusion, auth_authz_2_jku_x5u_injection, auth_authz_2_aud_validation, auth_authz_2_rfc8725 [EXTRACTED 0.90]
- **소지 증명으로 Bearer 약점을 막는 토큰 바인딩 (DPoP · mTLS · cnf 클레임)** — auth_authz_2_sender_constrained, auth_authz_2_dpop, auth_authz_2_mtls_bound, auth_authz_2_rfc9449, auth_authz_2_rfc8705 [EXTRACTED 0.90]
- **Authorization Code + PKCE 여섯 스텝 로그인 플로우** — auth_authz_3_code_verifier, auth_authz_3_code_challenge, auth_authz_3_authorization_code, auth_authz_3_token_exchange, auth_authz_3_id_token_validation, auth_authz_3_oidc_discovery [EXTRACTED 0.90]
- **state · PKCE · nonce 삼중 방어 조합** — auth_authz_3_state, auth_authz_3_pkce, auth_authz_3_nonce, auth_authz_3_mixup_attack, auth_authz_3_code_interception [EXTRACTED 0.85]
- **토큰 엔드포인트 클라이언트 인증 방식군** — auth_authz_3_client_authentication, auth_authz_3_private_key_jwt, auth_authz_3_mtls, auth_authz_3_confidential_client, auth_authz_3_public_client [EXTRACTED 0.85]
- **심층 방어 계층 — 프록시·세션·BFF·리소스 서버 인가** — auth_authz_4_defense_in_depth, auth_authz_4_nginx_auth_request, auth_authz_4_server_side_session, auth_authz_4_bff, auth_authz_4_authorization_enforcement [EXTRACTED 0.90]
- **엣지 신뢰 경계 사고 — X-User 위조와 백엔드 직접 접근** — auth_authz_4_nginx_auth_request, auth_authz_4_header_sanitize, auth_authz_4_direct_backend_access, src_components_posts_auth_authz_4_authrequestlab [EXTRACTED 0.85]
- **인증·인가 해부 시리즈 4부작 아크** — auth_authz_1_post, auth_authz_2_post, auth_authz_3_post, auth_authz_4_post [EXTRACTED 0.95]
- **docker run 실행 릴레이 5계층** — container_anatomy_1_docker_cli, container_anatomy_1_dockerd, container_anatomy_1_containerd, container_anatomy_1_containerd_shim_runc_v2, container_anatomy_1_runc, container_anatomy_1_linux_kernel [EXTRACTED 0.95]
- **OverlayFS 쓰기·삭제 경로 (copy_up · whiteout)** — container_anatomy_1_overlayfs, container_anatomy_1_lowerdir, container_anatomy_1_upperdir, container_anatomy_1_merged_dir, container_anatomy_1_copy_up, container_anatomy_1_whiteout, container_anatomy_1_opaque_directory [EXTRACTED 0.90]
- **커널 격리 기본기 (시야·분량·권한·시스템콜)** — container_anatomy_1_namespace, container_anatomy_1_cgroup, container_anatomy_1_capabilities, container_anatomy_1_seccomp [EXTRACTED 0.85]
- **컨테이너 기동 계보 — CLI에서 커널까지의 층 구조** — container_anatomy_1_docker_cli, container_anatomy_1_dockerd, container_anatomy_1_containerd, container_anatomy_1_shim, container_anatomy_1_runc, container_anatomy_1_namespace, container_anatomy_1_cgroup [EXTRACTED 0.95]
- **격리를 완성하는 커널 원시요소 묶음** — container_anatomy_1_namespace, container_anatomy_1_cgroup, container_anatomy_1_capabilities, container_anatomy_1_seccomp [EXTRACTED 0.90]
- **OverlayFS 레이어 의미론 — copy_up·whiteout·레이어 잔존** — container_anatomy_1_overlayfs, container_anatomy_1_copy_up, container_anatomy_1_whiteout, container_anatomy_1_image_layer [EXTRACTED 0.90]
- **OCI가 컨테이너를 쪼갠 세 스펙 (실행·포장·운반)** — container_anatomy_2_oci, container_anatomy_2_runtime_spec, container_anatomy_2_image_spec, container_anatomy_2_distribution_spec [EXTRACTED 0.95]
- **이미지→번들→실행으로 이어지는 변환 흐름** — container_anatomy_2_image_index, container_anatomy_2_image_manifest, container_anatomy_2_image_configuration, container_anatomy_2_conversion, container_anatomy_2_filesystem_bundle, container_anatomy_2_create_start [EXTRACTED 0.90]
- **내용이 주소라서 따라오는 것들 — 검증·중복제거·캐시와 그 한계** — container_anatomy_2_digest_chain, container_anatomy_2_descriptor, container_anatomy_2_diffid, container_anatomy_2_cross_repo_mount, container_anatomy_2_integrity_vs_trust, container_anatomy_2_tag_vs_digest [EXTRACTED 0.90]
- **파드 기동 CRI 호출 시퀀스 (샌드박스 선행 → 컨테이너 채우기)** — container_anatomy_3_kubelet, container_anatomy_3_run_pod_sandbox, container_anatomy_3_cni, container_anatomy_3_pull_image, container_anatomy_3_create_container, container_anatomy_3_pause_container, container_anatomy_3_podsandbox [EXTRACTED 0.95]
- **CRI를 구현·중계하는 런타임과 어댑터들** — container_anatomy_3_containerd, container_anatomy_3_cri_o, container_anatomy_3_cri_dockerd, container_anatomy_3_dockershim, container_anatomy_3_cri [EXTRACTED 0.90]
- **kubelet→CRI→런타임→OCI→runc 계층 스택** — container_anatomy_3_kubelet, container_anatomy_3_cri, container_anatomy_3_containerd, container_anatomy_3_oci, container_anatomy_3_runc [EXTRACTED 0.90]
- **같은 OCI 런타임 스펙을 구현해 서로 갈아 끼울 수 있는 런타임들** — container_anatomy_4_runc, container_anatomy_4_crun, container_anatomy_4_youki, container_anatomy_4_runsc, container_anatomy_4_kata_containers, container_anatomy_4_oci_runtime_spec [EXTRACTED 0.90]
- **gVisor 시스템 콜 처리 흐름 (runsc → Sentry → Gofer / systrap)** — container_anatomy_4_runsc, container_anatomy_4_sentry, container_anatomy_4_gofer, container_anatomy_4_systrap [EXTRACTED 0.85]
- **층마다 갈아 끼운다 — 시리즈 4편을 관통하는 주제** — container_anatomy_4_layer_map, container_anatomy_4_oci_runtime_spec, container_anatomy_4_cri, container_anatomy_4_selection_matrix, container_anatomy_1, container_anatomy_2, container_anatomy_3 [INFERRED 0.80]
- **OSI 일곱 책임 스택과 캡슐화** — osi_7_layers_1_l1_physical, osi_7_layers_1_l2_data_link, osi_7_layers_1_l3_network, osi_7_layers_1_l4_transport, osi_7_layers_1_l5_session, osi_7_layers_1_l6_presentation, osi_7_layers_1_l7_application, osi_7_layers_1_encapsulation [EXTRACTED 0.95]
- **아래에서 위로 좁히는 장애 진단 플로우** — osi_7_layers_1_layer_triage, osi_7_layers_1_l1_physical, osi_7_layers_1_l2_data_link, osi_7_layers_1_l3_network, osi_7_layers_1_dns_resolution_checkpoint, osi_7_layers_1_l4_transport, osi_7_layers_1_l6_presentation, osi_7_layers_1_l7_application, src_components_posts_osi_7_layers_1_layertriage [EXTRACTED 0.90]
- **OSI 7계층 해부 시리즈** — osi_7_layers_1_post, osi_7_layers_2, osi_7_layers_3, osi_7_layers_4, osi_7_layers_5, osi_7_layers_6 [EXTRACTED 0.95]
- **한 LAN 안에서 프레임이 목적지를 찾는 전체 흐름** — osi_7_layers_2_l1_physical, osi_7_layers_2_ethernet_frame, osi_7_layers_2_mac_learning, osi_7_layers_2_arp, osi_7_layers_2_vlan, osi_7_layers_2_switch [EXTRACTED 0.90]
- **아래에서 위로 좁히는 L1·L2 장애 진단 3단계** — osi_7_layers_2_ethtool_check, osi_7_layers_2_ip_neigh_check, osi_7_layers_2_tcpdump_arp_check, osi_7_layers_2_troubleshooting_walkthrough [EXTRACTED 0.90]
- **OSI 7계층 해부 시리즈 (EP1~EP6)** — osi_7_layers_1, osi_7_layers_2, osi_7_layers_3, osi_7_layers_4, osi_7_layers_5, osi_7_layers_6 [EXTRACTED 0.95]
- **한 홉 forwarding 처리 흐름 (LPM → TTL −1 → checksum 보정 → ARP/ND → 새 L2 프레임)** — osi_7_layers_3_router, osi_7_layers_3_longest_prefix_match, osi_7_layers_3_ttl, osi_7_layers_3_header_checksum, osi_7_layers_3_arp_nd, osi_7_layers_3_mac_address [EXTRACTED 0.90]
- **NAT 변환 생태계 (사설주소 → NAPT 매핑 → CGNAT·ALG·conntrack)** — osi_7_layers_3_nat, osi_7_layers_3_napt, osi_7_layers_3_cgnat, osi_7_layers_3_alg, osi_7_layers_3_private_address, osi_7_layers_3_conntrack [EXTRACTED 0.85]
- **OSI 7계층 해부 시리즈 (EP1~EP6)** — osi_7_layers_1_post, osi_7_layers_2_post, osi_7_layers_3_post, osi_7_layers_4_post, osi_7_layers_5_post, osi_7_layers_6_post [EXTRACTED 0.95]
- **신뢰할 수 없는 IP 위에 신뢰성을 쌓는 장치들** — osi_7_layers_4_reliability, osi_7_layers_4_retransmission_rto, osi_7_layers_4_fast_retransmit, osi_7_layers_4_sack, osi_7_layers_4_tcp [EXTRACTED 0.90]
- **전송량 결정 흐름: rwnd·cwnd·비행 중 데이터의 최솟값** — osi_7_layers_4_flow_control, osi_7_layers_4_congestion_control, osi_7_layers_4_min_rwnd_cwnd, osi_7_layers_4_window_scale, src_components_posts_osi_7_layers_4_slidingwindowlab [EXTRACTED 0.85]
- **패킷을 프로세스까지 가르는 식별 체계** — osi_7_layers_4_port, osi_7_layers_4_five_tuple, osi_7_layers_4_socket, osi_7_layers_4_ephemeral_port, osi_7_layers_4_multiplexing [EXTRACTED 0.90]
- **L6 표현 책임의 네 갈래 (인코딩·직렬화·압축·암호화)** — osi_7_layers_5_l6_presentation, osi_7_layers_5_character_encoding, osi_7_layers_5_serialization, osi_7_layers_5_compression, osi_7_layers_5_tls [EXTRACTED 0.95]
- **한 번의 TLS handshake로 세워지는 신뢰 (키 교환·인증·협상)** — osi_7_layers_5_tls13_handshake, osi_7_layers_5_ecdhe_forward_secrecy, osi_7_layers_5_certificate_verify, osi_7_layers_5_certificate_chain, osi_7_layers_5_sni, osi_7_layers_5_alpn [EXTRACTED 0.90]
- **대화를 잇는 세션 연속성 (쿠키·TLS 재개·QUIC 이동·이어받기)** — osi_7_layers_5_l5_session, osi_7_layers_5_cookie, osi_7_layers_5_tls_session_resumption, osi_7_layers_5_quic_connection_migration, osi_7_layers_5_resumable_transfer, osi_7_layers_5_disconnect_ready_design [EXTRACTED 0.90]
- **한 줄의 curl이 깨우는 일곱 계층 흐름 (DNS→TCP→TLS→HTTP)** — osi_7_layers_6_curl_journey, osi_7_layers_6_dns, osi_7_layers_6_http, osi_7_layers_6_sni_host_header, src_components_posts_osi_7_layers_6_requestjourneylab [EXTRACTED 0.90]
- **같은 의미(RFC 9110)를 다른 전송으로 싣는 HTTP 세 버전** — osi_7_layers_6_http11, osi_7_layers_6_http2, osi_7_layers_6_http3_quic, osi_7_layers_6_semantics_vs_transport, osi_7_layers_6_rfc9110 [EXTRACTED 0.90]
- **DNS 이름 해석 체인: stub → 재귀 → 반복 질의 → 캐싱/실패** — osi_7_layers_6_stub_resolver, osi_7_layers_6_recursive_resolver, osi_7_layers_6_iterative_query, osi_7_layers_6_dns_caching_ttl, osi_7_layers_6_dns_failures, src_components_posts_osi_7_layers_6_dnsresolvelab [EXTRACTED 0.90]
- **v2 보안 3요소 + 런타임 강제** — tauri_1_permission, tauri_1_scope, tauri_1_capability, tauri_1_runtime_authority, tauri_1_main_capability_json [EXTRACTED 0.95]
- **invoke 왕복 흐름 (프런트→Core→응답)** — tauri_1_invoke, tauri_1_ipc_bridge, tauri_1_generate_handler, tauri_1_greet_command, tauri_1_runtime_authority [EXTRACTED 0.90]
- **Tauri 런타임 스택 (Core·WebView·Rust 라이브러리)** — tauri_1_core_process, tauri_1_webview_process, tauri_1_tauri_crate, tauri_1_wry, tauri_1_tao, tauri_1_tauri_runtime [EXTRACTED 0.90]
- **권한 거절 흐름 — 플러그인 호출부터 케이퍼빌리티 해제까지** — tauri_2_dialog_plugin, tauri_2_runtime_authority, tauri_2_capabilities, tauri_2_permissions, tauri_2_scope [EXTRACTED 0.90]
- **커맨드·상태·직렬화 배선** — tauri_2_run, tauri_2_generate_handler, tauri_2_scan_folder, tauri_2_scan_cache, tauri_2_scan_summary, tauri_2_serde_contract, tauri_2_mutex_state [EXTRACTED 0.85]
- **파일 접근 경계 설계 — fs 플러그인 대 자체 커맨드** — tauri_2_fs_plugin, tauri_2_scan_folder, tauri_2_canonicalize_guard, tauri_2_scope, tauri_2_viz_comparison4 [INFERRED 0.80]
- **Channel 기반 진행률 스트리밍 흐름** — tauri_2_scan_folder_streaming, tauri_2_scan_event, tauri_2_channel, tauri_2_serde_tag_content, tauri_2_frontend_channel, tauri_2_invoke [EXTRACTED 0.90]
- **사이드카 배선 — 이름·권한·실행 3중 일치** — tauri_2_external_bin, tauri_2_target_triple_suffix, tauri_2_capabilities, tauri_2_shell_allow_spawn, tauri_2_checksum_file, tauri_2_command_sidecar_js [EXTRACTED 0.85]
- **네 층의 실패 — 권한·등록·상태·파일명** — tauri_2_capabilities, tauri_2_generate_handler, tauri_2_app_manage, tauri_2_target_triple_suffix, tauri_2_not_allowed_vs_not_found, tauri_2_exercise [EXTRACTED 0.90]
- **WebRTC 연결의 세 축 — 협상·연결성·보안** — webrtc_1_sdp, webrtc_1_offer_answer, webrtc_1_ice, webrtc_1_stun, webrtc_1_turn, webrtc_1_dtls_srtp [EXTRACTED 0.95]
- **연결 협상 타임라인 — addTrack→Offer→ICE 수집→Answer→DTLS→미디어** — webrtc_1_rtcrtptransceiver, webrtc_1_offer_answer, webrtc_1_trickle_ice, webrtc_1_ice, webrtc_1_dtls_srtp, webrtc_1_signaling [EXTRACTED 0.90]
- **연결 실패 진단·복구 흐름 — 방화벽·인터페이스 전환·경로 사망** — webrtc_1_getstats_diagnostics, webrtc_1_ice_restart, webrtc_1_consent_freshness, webrtc_1_turn, webrtc_1_ice_candidate_types [EXTRACTED 0.90]
- **연결 이후 품질을 지키는 네 메커니즘 파이프라인 (측정→흡수→적응→선택지)** — webrtc_2_rtcp, webrtc_2_jitter_buffer, webrtc_2_congestion_control, webrtc_2_simulcast, webrtc_2_webrtc_quality_pipeline [EXTRACTED 0.95]
- **TWCC 기반 GCC 혼잡제어 루프 (피드백→두 추정→인코더/pacer)** — webrtc_2_twcc, webrtc_2_delay_based_estimator, webrtc_2_loss_based_estimator, webrtc_2_encoder_bitrate, webrtc_2_pacer, webrtc_2_bandwidth_probing [EXTRACTED 0.90]
- **simulcast 계층 식별·제어 스택 (RID·SSRC·인코딩 파라미터·트랜시버)** — webrtc_2_simulcast, webrtc_2_rid, webrtc_2_ssrc, webrtc_2_rtcrtpencodingparameters, webrtc_2_rtcrtptransceiver [EXTRACTED 0.85]
- **WebRTC 해부 3부작 시리즈 (연결 → 품질 → 확장)** — webrtc_1_post, webrtc_2_post, webrtc_3_post [EXTRACTED 0.95]
- **세 토폴로지가 대역폭·연산 비용을 나눠 지는 트레이드오프** — webrtc_3_mesh, webrtc_3_sfu, webrtc_3_mcu, webrtc_3_topology_decision, webrtc_3_rfc7667 [EXTRACTED 0.90]
- **클라이언트 simulcast 인코딩 → SFU 계층 선택 → 구독자별 화질 전달 흐름** — webrtc_2_simulcast_rfc8853, webrtc_3_simulcast, webrtc_3_sfu, webrtc_3_dynacast, webrtc_3_active_speaker [INFERRED 0.80]

## Communities (32 total, 0 thin omitted)

### Community 0 - "Tauri IPC Commands & Security"
Cohesion: 0.05
Nodes (63): Tauri 해부 1편, app.manage() 상태 등록, 인자 validator로 권한 좁히기, async 커맨드에서 잠금 유지 함정, tauri::async_runtime::Mutex (비동기 Mutex), 커맨드 자체 경로 검증(canonicalize), capabilities/default.json 권한 묶음, Channel 진행률 스트리밍 (+55 more)

### Community 1 - "Container Ecosystem & Tooling"
Cohesion: 0.06
Nodes (57): 컨테이너의 해부 EP2 — OCI 3대 스펙, 컨테이너의 해부 EP3 — 쿠버네티스와 CRI, "도커 대신 뭘 쓰지"가 잘못된 질문인 이유 (컨테이너의 해부 EP4), 아카이브된 도구를 새로 고르면 안 되는 이유, 빌드 도구 층, Buildah, BuildKit, CNI (Container Network Interface) (+49 more)

### Community 2 - "OCI Image & Runtime Specs"
Cohesion: 0.07
Nodes (49): 교체 가능한 저수준 런타임 (crun·youki·runsc), annotations (스펙이 비워 둔 메타데이터 칸), CNI (Container Network Interface), config.json, Conversion (이미지 → 런타임 번들 변환), create / start 분리, 교차 저장소 마운트 (?mount=&from=), 직접 해보기 — curl·jq로 레지스트리 실습 (+41 more)

### Community 3 - "Docker Layers & Kernel Isolation"
Cohesion: 0.08
Nodes (48): 컨테이너 해부학 1편 — 도커의 층 구조, BuildKit secret mount (레이어에 남지 않는 빌드 시크릿), Capabilities 박탈, cgroup (자원 분량 제한), cgroup v2 통합 계층 · no internal process constraint, containerd, copy_up (첫 쓰기 시 파일 전체 복사), CRI (Container Runtime Interface) (+40 more)

### Community 4 - "WebRTC Congestion Control"
Cohesion: 0.06
Nodes (47): AVPF (RFC 4585, 즉시 피드백 프로파일), Bandwidth probing (패딩 패킷 능동 탐색), 혼잡제어 (congestion control), delay-based 추정 (AIMD, 지연 추세), 동적 페이로드 타입 (96~127, SDP 협상), 인코더 목표 비트레이트 조정 (해상도·프레임레이트), FEC (RED/ULPFEC·FlexFEC, 범위 밖), fraction lost / cumulative packets lost (+39 more)

### Community 5 - "Tauri Architecture & Bundle Size"
Cohesion: 0.06
Nodes (44): BundleMemoryExample 시각화 컴포넌트, InvokeRoundTrip 시각화 컴포넌트, TauriRuntimeArchitecture 시각화 컴포넌트, TauriVsElectron 시각화 컴포넌트, Tauri 해부 1편 — 작은 번들은 결과일 뿐, v1 allowlist (전역 허용목록), 번들·메모리 예시 측정, Capability (창별 권한 묶음) (+36 more)

### Community 6 - "OAuth Authorization Code + PKCE"
Cohesion: 0.07
Nodes (41): access_token, 일회용 인가 코드 (authorization code), Authorization Code Grant 흐름, 백채널 (back channel), 클라이언트 인증 (client_secret·private_key_jwt·mTLS), code_challenge (S256), 코드 가로채기·주입 공격, code_verifier (+33 more)

### Community 7 - "IP Routing & NAT"
Cohesion: 0.08
Nodes (41): L3 해부: 패킷은 어떻게 모르는 네트워크를 건너 길을 찾는가, ALG (Application Layer Gateway), ARP / ND (다음 홉 MAC 해석), CGNAT (Carrier-Grade NAT), CIDR prefix 길이 / subnet mask, conntrack (NAT·연결 추적 표), Default route (0.0.0.0/0), Dynamic routing (OSPF·IS-IS·BGP) (+33 more)

### Community 8 - "Authentication vs Authorization Basics"
Cohesion: 0.09
Nodes (40): ABAC (속성 기반 접근 제어, NIST SP 800-162), 액세스 토큰 (위임된 인가, bearer), IAL·AAL·FAL 보증 수준 3축, audience(aud) 검증 누락과 토큰 치환 사고, 인증(Authentication) — 너는 누구냐, 인가(Authorization) — 해도 되느냐, AuthzMap (인증·인가 인터랙티브 지도), 쿠키 속성 (Secure·HttpOnly·SameSite) (+32 more)

### Community 9 - "Kubernetes CRI Runtimes"
Cohesion: 0.09
Nodes (37): CRI (Container Runtime Interface), cgroup 드라이버 일치 (cgroupfs vs systemd), CNI (Container Network Interface), --container-runtime-endpoint 소켓 설정, containerd (CRI 플러그인 내장 런타임), CreateContainer, CRI (Container Runtime Interface), cri-dockerd (Mirantis·Docker 유지보수 어댑터) (+29 more)

### Community 10 - "JWT Tokens & Signature Validation"
Cohesion: 0.09
Nodes (36): 액세스 토큰 vs ID Token 구분, alg 허용목록, alg confusion (RS256→HS256) 공격, alg:none 공격, aud(대상) 검증, DPoP, jku·x5u 키 주입 / SSRF, JWE (암호화된 토큰) (+28 more)

### Community 11 - "Auth Production Best Practices"
Cohesion: 0.10
Nodes (33): 리소스 서버 인가 집행, 인증·인가 베스트 프랙티스 체크리스트, BFF(Backend-for-Frontend) 토큰 격리 패턴, CORS는 CSRF 방어가 아니다, CSRF 방어(Synchronizer Token·Double-Submit), 심층 방어(Defense in Depth), deny-by-default 원칙, 백엔드 직접 접근(엣지 우회) 차단 (+25 more)

### Community 12 - "WebRTC ICE & SDP Negotiation"
Cohesion: 0.11
Nodes (33): IceTraversalLab (ICE 트래버설 인터랙티브 랩), LoopbackNegotiationDemo (한 탭 루프백 협상 데모), SdpNegotiationStepper (SDP 협상 스테퍼), BUNDLE · rtcp-mux 트랜스포트 통합, consent freshness · NAT keepalive (RFC 7675), DTLS-SRTP 의무 암호화 (RFC 5764), getStats · webrtc-internals 진단, getUserMedia (미디어 캡처, secure context) (+25 more)

### Community 13 - "OSI Seven-Layer Model"
Cohesion: 0.16
Nodes (32): OSI 7계층, 외우지 말고 데이터의 여행으로 이해하기, ARP / IPv6 Neighbor Discovery (링크 내 주소 해석), 자주 틀리는 일곱 가지 오해, 장비와 계층 매핑 (hub·switch·router·LB·WAF·NIC), 이름 해석 검사 지점 (DNS는 L7이지만 진단의 길목), end-to-end argument (세션·표현을 종단 application에 맡김), IEEE 802.3-2018 — Ethernet MAC/PHY, L1 Physical — 비트를 매체 신호로 (+24 more)

### Community 14 - "WebRTC RFC References"
Cohesion: 0.08
Nodes (32): RFC 4585 (AVPF 즉시 피드백), RFC 8888 (CCFB 혼잡제어 피드백), 연결(connectivity)과 품질(quality)의 구분, GCC 초안 (draft-ietf-rmcat-gcc), RFC 7587 (Opus RTP 페이로드 포맷), WebRTC 해부 2편 — 연결된 경로 위에서, 품질은 어떻게 지켜지는가, RFC 8852 (RID 헤더 확장), RFC 3551 (RTP/AVP 프로파일) (+24 more)

### Community 15 - "TLS Handshake & Character Encoding"
Cohesion: 0.08
Nodes (31): 인증서 체인 검증 (leaf → 중간 CA → trust anchor), CertificateVerify·Finished (MITM 차단의 핵심), 도해: 글자 → 코드 포인트 → byte, 문자 인코딩 (글자 → 코드 포인트 → byte), charset 선언 (meta charset / Content-Type), 압축 협상 (gzip·brotli, Accept-Encoding), CRIME·BREACH (압축 크기로 새는 비밀), ECDHE와 forward secrecy (+23 more)

### Community 16 - "DNS Resolution & HTTP Basics"
Cohesion: 0.12
Nodes (24): ALPN (상위 프로토콜 협상), RFC 7301 — ALPN, DNS(Domain Name System), DNS 캐싱과 TTL, DNS 실패 코드: NXDOMAIN·SERVFAIL·NODATA·음성 캐싱, DNS 레코드 타입(A/AAAA·CNAME·MX·NS·SOA·TXT·CAA·HTTPS/SVCB), DNS 전송: UDP 53 · TC 비트 · TCP 53 · EDNS0, DNSSEC — 출처 인증·무결성 (+16 more)

### Community 17 - "Developer Career & Fundamentals"
Cohesion: 0.12
Nodes (20): "알고리즘은 실무에서 의미 없다"는 여론, 알고리즘 — 가장 큰 취약점, 외연 확장 학습(마케팅·AI·심리학·철학·경영·경제), 코딩 밀도 하락, 코딩 테스트 실패 경험, 개념 추상화·사고 시스템 구축, 스타트업 CTO 커리어, 새 도메인의 와꾸를 보는 패턴 인식 (+12 more)

### Community 18 - "Browser Choice & AI Agents"
Cohesion: 0.19
Nodes (17): AI 에이전트 UX 일체감, Arc Browser, aside 브라우저, 브라우저 자동화(크롤링·폼 채우기 위임), 브라우저 노마드, 크로미움 기반, 클로드의 웹 접근 실패(MCP 설정 필요), aside clear 기능(전 탭 강제 종료) (+9 more)

### Community 19 - "Ethernet Frames & ARP"
Cohesion: 0.15
Nodes (17): L1·L2 해부: 한 LAN 안에서 프레임은 어떻게 길을 찾는가, Autonegotiation (IEEE 802.3 Clause 28), 802.1Q 4바이트 태그 (TPID·TCI·VID·PCP·DEI), Duplex mismatch (반이중/전이중 불일치 장애), Ethernet II 프레임 구조, FCS (Frame Check Sequence), Gratuitous ARP와 ARP Probe (ACD, RFC 5227), IEEE 802.3 Ethernet 표준 (+9 more)

### Community 20 - "TCP Reliability & Congestion"
Cohesion: 0.16
Nodes (16): TCP는 byte stream (메시지 경계 없음), CLOSE-WAIT (앱이 close() 안 함), 혼잡 제어 (cwnd·slow start·AIMD·CUBIC·BBR·ECN), 연결 종료 (FIN 교환·half-close), 빠른 재전송 (중복 ACK 3개), 흐름 제어 (rwnd·zero window probe), Head-of-line blocking, 전송 한계 = min(rwnd, cwnd) − 비행 중 데이터 (+8 more)

### Community 21 - "HTTP Semantics & Caching"
Cohesion: 0.19
Nodes (15): 콘텐츠 협상: Accept·Accept-Language·Accept-Encoding, 한 줄의 curl이 깨우는 일곱 책임, 전달의 성공 ≠ 의미의 성공, HTTP(HyperText Transfer Protocol), HTTP 캐싱: Cache-Control·ETag·If-None-Match·304, HTTP 메서드와 safe·idempotent 성질, HTTP 요청 구조: 요청 라인·헤더·본문, L7 응용 계층(Application Layer) (+7 more)

### Community 22 - "Session Layer & Cookies"
Cohesion: 0.15
Nodes (14): cookie: L7 형식, L5 책임, 쿠키 속성 (Secure·HttpOnly·SameSite·세션 ID 회전), 끊김 전제 설계 (지수 backoff·멱등성 키·checkpoint), end-to-end argument (상위 기능을 양 끝에 두는 설계 철학), L5 세션 계층: 대화의 생명주기, QUIC connection migration (Connection ID), 계층은 형식이 아니라 책임으로 읽는다, 이어받기 (Range·ETag/If-Range·tus checkpoint) (+6 more)

### Community 23 - "ARP Address Resolution Lab"
Cohesion: 0.26
Nodes (13): ARP (Address Resolution Protocol, RFC 826), ARP cache (IP → MAC 매핑), ARP spoofing과 Dynamic ARP Inspection, 1단계: ethtool·ip link로 link/duplex 확인, 직접 해보기: ARP 한 번을 캡처로 잡기, IP 주소 (종단 여권), 2단계: ip neigh·ip addr로 VLAN·서브넷 확인, MAC 주소 구조 (OUI·I/G·U/L 비트) (+5 more)

### Community 24 - "Physical Layer & Switching"
Cohesion: 0.17
Nodes (13): 충돌 영역 (collision domain), CSMA/CA (Wi-Fi 802.11 충돌 회피), CSMA/CD (충돌 감지 매체 접근 제어), Echo cancellation (1000BASE-T, PAM-5), Hub (신호 반복 장비), L1 Physical (물리 계층), Line code 인코딩과 클럭 회복, MAC flooding 공격 (CAM 테이블 포화) (+5 more)

### Community 25 - "Transport Layer & UDP/QUIC"
Cohesion: 0.26
Nodes (12): L1·L2 해부: 한 LAN 안에서 프레임은 어떻게 길을 찾는가, L4 전송 계층 (Transport), 멀티플렉싱·디멀티플렉싱, L4 해부: 포트와 소켓, 그리고 TCP가 신뢰를 만드는 법, QUIC (UDP 위 연결·암호화·다중 스트림), RFC 768 — User Datagram Protocol, RFC 9000 — QUIC, RFC 9114 — HTTP/3 (+4 more)

### Community 26 - "Ports, Sockets & NAT State"
Cohesion: 0.20
Nodes (12): Connection ID / 연결 이동, 임시 포트 (ephemeral port), 5-튜플 (protocol, src IP/port, dst IP/port), 연결 재사용 (keep-alive·connection pool), MTU 블랙홀 / MSS clamping, NAPT / 포트 포워딩 (DNAT), 포트 (16비트 식별자), TIME-WAIT 누적과 포트 고갈 (+4 more)

### Community 27 - "VLAN & Spanning Tree"
Cohesion: 0.29
Nodes (10): Access port (untagged 호스트 포트), Broadcast domain (브로드캐스트 영역), 자주 틀리는 여섯 가지 오해, IEEE 802.1 Bridging 개요, IEEE 802.1Q (VLAN tagging·STP 통합), L2 루프와 broadcast storm (TTL 부재), RSTP·PortFast·MSTP·Rapid PVST+, STP (Spanning Tree Protocol) (+2 more)

### Community 28 - "TCP Handshake & Options"
Cohesion: 0.25
Nodes (9): ISN (초기 순서번호), RFC 7323 — TCP Extensions for High Performance, RFC 9293 — Transmission Control Protocol, ss/nc/tcpdump 진단 명령, SYN flood 공격 / SYN cookie, TCP 옵션 협상 (MSS·Window Scale·SACK 허용), 3-way handshake, Window Scale (RFC 7323) (+1 more)

### Community 29 - "Encapsulation & Layer Models"
Cohesion: 0.29
Nodes (7): 캡슐화 (계층마다 헤더가 덧붙는 포장), ISO/IEC 7498-1:1994 OSI Basic Reference Model, OSI 참조 모델 (구현 명세가 아닌 책임 분리 모델), RFC 1122 — Requirements for Internet Hosts, service · interface · peer protocol (OSI의 세 문법), 인터넷 4계층 모델 (Link/Internet/Transport/Application), EncapsulationLab (캡슐화 시뮬레이터)

### Community 30 - "HTTP Version Evolution"
Cohesion: 0.47
Nodes (6): HTTP/1.1 — 텍스트·keep-alive·HOL blocking, HTTP/2 — 바이너리 프레임·멀티플렉싱·HPACK, HTTP/3 — QUIC(UDP) 위 독립 stream, RFC 9110, HTTP Semantics, RFC 9114, HTTP/3, 의미는 그대로, 전송만 진화한다(RFC 9110)

### Community 31 - "Astro Blog Build"
Cohesion: 0.83
Nodes (4): Astro 정적 사이트 빌드, 콘텐츠 1급 시민 (마크다운 중심), 블로그를 Astro로 새로 지었습니다, raws → draft → 발행 집필 워크플로우

## Ambiguous Edges - Review These
- `40살인데 알고리즘 해도 괜찮을까요 - 프롤로그` → `aside: 드디어 arc의 악령에서 벗어나나`  [AMBIGUOUS]
  algorithm-at-40-prologue.md · relation: semantically_similar_to
- `Zen 브라우저` → `Tidy 탭 정리 기능`  [AMBIGUOUS]
  aside-arc.md · relation: references
- `위임(Delegation) — 권한을 넘긴다` → `PKCE (Proof Key for Code Exchange)`  [AMBIGUOUS]
  auth-authz-1.mdx · relation: conceptually_related_to
- `ID Token (누가 로그인했는가)` → `액세스 토큰 (위임된 인가, bearer)`  [AMBIGUOUS]
  auth-authz-1.mdx · relation: shares_data_with
- `containerd` → `OverlayFS`  [AMBIGUOUS]
  container-anatomy-1.mdx · relation: references
- `OverlayFS` → `VizFlowchart4 (흐름도)`  [AMBIGUOUS]
  container-anatomy-1.mdx · relation: references
- `CNI (Container Network Interface)` → `CRI (Container Runtime Interface)`  [AMBIGUOUS]
  container-anatomy-2.mdx · relation: semantically_similar_to
- `다이제스트 사슬 (내용이 곧 주소)` → `레지스트리 GC·삭제 정책 (202 ≠ 즉시 회수)`  [AMBIGUOUS]
  container-anatomy-2.mdx · relation: conceptually_related_to
- `OCI 이미지 스펙` → `LLB (content-addressable 빌드 그래프)`  [AMBIGUOUS]
  container-anatomy-4.mdx · relation: shares_data_with
- `L2 Data Link — 같은 링크의 다음 목적지` → `L1·L2 해부: 한 LAN 안에서 프레임은 어떻게 길을 찾는가`  [AMBIGUOUS]
  osi-7-layers-1.mdx · relation: conceptually_related_to
- `L6 Presentation — 같은 뜻을 같은 bytes로` → `L5·L6 해부: 도착한 bytes를 '같은 뜻'으로, 그리고 대화를 잇기`  [AMBIGUOUS]
  osi-7-layers-1.mdx · relation: conceptually_related_to
- `NAPT / PAT (포트까지 변환하는 다중화)` → `ALG (Application Layer Gateway)`  [AMBIGUOUS]
  osi-7-layers-3.mdx · relation: references
- `TCP 옵션 협상 (MSS·Window Scale·SACK 허용)` → `MTU 블랙홀 / MSS clamping`  [AMBIGUOUS]
  osi-7-layers-4.mdx · relation: shares_data_with
- `endianness / network byte order (big-endian)` → `직렬화와 스키마 진화 계약`  [AMBIGUOUS]
  osi-7-layers-5.mdx · relation: conceptually_related_to
- `OS 시스템 WebView (동적 링크)` → `타깃 트리플 접미사 규칙`  [AMBIGUOUS]
  tauri-1.mdx · relation: conceptually_related_to
- `fs 플러그인과 런타임 scope 확장` → `커맨드 자체 경로 검증(canonicalize)`  [AMBIGUOUS]
  tauri-2.mdx · relation: conceptually_related_to
- `Channel 진행률 스트리밍` → `Command.sidecar (@tauri-apps/plugin-shell)`  [AMBIGUOUS]
  tauri-2.mdx · relation: conceptually_related_to
- `getUserMedia (미디어 캡처, secure context)` → `시그널링 MITM · fingerprint 신뢰 모델 (RFC 8827)`  [AMBIGUOUS]
  webrtc-1.mdx · relation: conceptually_related_to
- `혼잡제어 (congestion control)` → `REMB (Receiver Estimated Maximum Bitrate, 레거시 폴백)`  [AMBIGUOUS]
  webrtc-2.mdx · relation: implements

## Knowledge Gaps
- **142 isolated node(s):** `다면적(수학적·공학적) 사고`, `메타인지와 겁 많은 천성`, `top-down 모델 설계 관점`, `새 도메인의 와꾸를 보는 패턴 인식`, `Vivaldi 브라우저` (+137 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `40살인데 알고리즘 해도 괜찮을까요 - 프롤로그` and `aside: 드디어 arc의 악령에서 벗어나나`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Zen 브라우저` and `Tidy 탭 정리 기능`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `위임(Delegation) — 권한을 넘긴다` and `PKCE (Proof Key for Code Exchange)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `ID Token (누가 로그인했는가)` and `액세스 토큰 (위임된 인가, bearer)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `containerd` and `OverlayFS`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `OverlayFS` and `VizFlowchart4 (흐름도)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `CNI (Container Network Interface)` and `CRI (Container Runtime Interface)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._