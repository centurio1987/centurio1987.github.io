# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1254 nodes · 2110 edges · 45 communities
- Extraction: 90% EXTRACTED · 8% INFERRED · 2% AMBIGUOUS · INFERRED: 171 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7c56344a`
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
- [[_COMMUNITY_WebRTC 혼잡제어 RFC 표준|WebRTC 혼잡제어 RFC 표준]]
- [[_COMMUNITY_직렬화와 표현 계층|직렬화와 표현 계층]]
- [[_COMMUNITY_Tauri 프로젝트 구조 진입점|Tauri 프로젝트 구조 진입점]]
- [[_COMMUNITY_VPN 위협모델과 신뢰 이전|VPN 위협모델과 신뢰 이전]]
- [[_COMMUNITY_Tauri 권한·케이퍼빌리티 모델|Tauri 권한·케이퍼빌리티 모델]]
- [[_COMMUNITY_Tauri 사이드카 번들링·빌드|Tauri 사이드카 번들링·빌드]]
- [[_COMMUNITY_VPN 정의와 표준 문서|VPN 정의와 표준 문서]]
- [[_COMMUNITY_Tauri 해부 시리즈 시각물|Tauri 해부 시리즈 시각물]]
- [[_COMMUNITY_Simulcast와 SVC 다중 화질|Simulcast와 SVC 다중 화질]]
- [[_COMMUNITY_정책 기반 접근제어(PBAC)|정책 기반 접근제어(PBAC)]]
- [[_COMMUNITY_UTF-8 문자 인코딩|UTF-8 문자 인코딩]]
- [[_COMMUNITY_HTTP 의미론과 버전 진화|HTTP 의미론과 버전 진화]]
- [[_COMMUNITY_프록시와 TLS-VPN 비교|프록시와 TLS-VPN 비교]]

## God Nodes (most connected - your core abstractions)
1. `VPN의 해부 1편 — VPN 아닌 것부터 지웁니다` - 40 edges
2. `인증·인가 해부 EP1` - 31 edges
3. `VPN의 해부 EP2 (AEAD·키교환)` - 30 edges
4. `OSI 7계층, 외우지 말고 데이터의 여행으로 이해하기` - 29 edges
5. `OpenVPN 해부: 웹의 자물쇠를 빌려 쓴다는 것 — opcode 한 바이트와 tls-crypt (VPN의 해부 EP6)` - 27 edges
6. `L7 해부: DNS와 HTTP, 그리고 한 줄의 curl로 끝나는 여행` - 24 edges
7. `인증·인가 해부 2편 — 토큰과 검증 (예고)` - 22 edges
8. `인증·인가 해부 4편 — 실무편/BFF (예고)` - 22 edges
9. `ESP 해부: 패킷이 국경을 두 번 넘는 법 — NAT-T와 MTU까지 (VPN의 해부 EP4)` - 21 edges
10. `컨테이너의 해부 EP3 — CRI (다음 편 예고)` - 20 edges

## Surprising Connections (you probably didn't know these)
- `RFC 8853 (SDP simulcast) — 3편 인용` --semantically_similar_to--> `RFC 8853 (simulcast)`  [INFERRED] [semantically similar]
  webrtc-3.mdx → webrtc-2.mdx
- `40살인데 알고리즘 해도 괜찮을까요 - 프롤로그` --semantically_similar_to--> `aside: 드디어 arc의 악령에서 벗어나나`  [AMBIGUOUS] [semantically similar]
  algorithm-at-40-prologue.md → aside-arc.md
- `RequestJourneyLab (curl 요청 여정 시뮬레이션)` --implements--> `한 줄의 curl이 깨우는 일곱 책임`  [INFERRED]
  src/components/posts/osi-7-layers-6/RequestJourneyLab.tsx → osi-7-layers-6.mdx
- `VizProcessSteps3 (캡슐화 단계 시각물)` --references--> `터널링 (캡슐화)`  [INFERRED]
  src/components/posts/vpn-anatomy-1/VizProcessSteps3.tsx → vpn-anatomy-1.mdx
- `ObserverView (관찰자별 노출 시뮬레이션)` --references--> `위협모델 — 누구로부터 무엇을 숨기는가`  [INFERRED]
  src/components/posts/vpn-anatomy-1/ObserverView.tsx → vpn-anatomy-1.mdx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **재능 자각 → 전략적 우회 → 40대 알고리즘 재대면 서사** — algorithm_at_40_prologue_programming_talent_realization, algorithm_at_40_prologue_strategic_detour, algorithm_at_40_prologue_cto_career, algorithm_at_40_prologue_coding_test_failure, algorithm_at_40_prologue_pro_mindset [EXTRACTED 0.90]
- **20년 학습으로 재구축한 사고 역량 스택** — algorithm_at_40_prologue_fundamentals_learning_method, algorithm_at_40_prologue_concept_abstraction_system, algorithm_at_40_prologue_domain_pattern_recognition, algorithm_at_40_prologue_multifaceted_thinking [EXTRACTED 0.85]
- **브라우저 노마드가 평가한 사이드바·탭관리 대안 집합** — aside_arc_arc_browser, aside_arc_dia, aside_arc_vivaldi, aside_arc_zen, aside_arc_aside, aside_arc_sidebar_ux, aside_arc_tidy [EXTRACTED 0.90]
- **docker run 한 줄의 5계층 릴레이** — container_anatomy_1_docker_cli, container_anatomy_1_dockerd, container_anatomy_1_containerd, container_anatomy_1_containerd_shim_runc_v2, container_anatomy_1_runc, container_anatomy_1_linux_kernel [EXTRACTED 0.95]
- **OverlayFS 레이어 쓰기·삭제 메커니즘** — container_anatomy_1_overlay2, container_anatomy_1_layer_dirs, container_anatomy_1_copy_up, container_anatomy_1_whiteout, container_anatomy_1_opaque_dir [EXTRACTED 0.90]
- **커널 격리 기본 요소 (시야·분량·권한)** — container_anatomy_1_namespace, container_anatomy_1_cgroup, container_anatomy_1_capabilities, container_anatomy_1_seccomp [EXTRACTED 0.90]
- **도커 실행 계보: CLI → dockerd → containerd → shim → runc → 커널** — container_anatomy_1_docker_cli, container_anatomy_1_dockerd, container_anatomy_1_containerd, container_anatomy_1_containerd_shim_runc_v2, container_anatomy_1_runc, container_anatomy_1_namespace, container_anatomy_1_cgroup [EXTRACTED 0.90]
- **OverlayFS 레이어 의미론: copy_up · whiteout · 삭제된 비밀 잔존** — container_anatomy_1_overlayfs, container_anatomy_1_copy_up, container_anatomy_1_whiteout, container_anatomy_1_image_layer_secret_leak [EXTRACTED 0.85]
- **데몬이 죽어도 컨테이너가 사는 메커니즘: shim + subreaper + 소켓 재연결** — container_anatomy_1_containerd_shim_runc_v2, container_anatomy_1_subreaper, container_anatomy_1_containerd, container_anatomy_1_ttrpc [EXTRACTED 0.85]
- **OCI 세 스펙의 분리 (실행·포장·운반)** — container_anatomy_2_oci, container_anatomy_2_runtime_spec, container_anatomy_2_image_spec, container_anatomy_2_distribution_spec [EXTRACTED 0.95]
- **다이제스트 사슬 — Index → Manifest → Config + Layers를 Descriptor로 잇는다** — container_anatomy_2_image_index, container_anatomy_2_image_manifest, container_anatomy_2_image_configuration, container_anatomy_2_filesystem_layer, container_anatomy_2_descriptor, container_anatomy_2_digest [EXTRACTED 0.90]
- **레지스트리 pull → Conversion → 번들 → create/start 실행 흐름** — container_anatomy_2_pull_flow, container_anatomy_2_image_manifest, container_anatomy_2_conversion, container_anatomy_2_filesystem_bundle, container_anatomy_2_config_json, container_anatomy_2_create_start_split [EXTRACTED 0.90]
- **v2 보안 모델 — permissions·scopes·capabilities와 런타임 강제** — tauri_1_permission, tauri_1_scope, tauri_1_capability, tauri_1_runtime_authority, tauri_1_trust_boundary [EXTRACTED 0.90]
- **invoke 왕복 흐름 — 프런트 호출에서 Rust 커맨드 실행까지** — tauri_1_invoke, tauri_1_ipc_bridge, tauri_1_runtime_authority, tauri_1_generate_handler, tauri_1_greet_command [EXTRACTED 0.85]
- **런타임 구성 — Core가 WRY·TAO·tauri-runtime으로 OS WebView를 오케스트레이션** — tauri_1_core_process, tauri_1_webview_process, tauri_1_wry, tauri_1_tao, tauri_1_tauri_runtime, tauri_1_os_webview [EXTRACTED 0.85]
- **권한 거절 → 케이퍼빌리티 개방 흐름** — tauri_2_dialog_plugin, tauri_2_runtime_authority, tauri_2_dialog_allow_open, tauri_2_capabilities_default_json, tauri_2_permission_scope [EXTRACTED 0.85]
- **커맨드 배선: 정의·등록·호출·상태 주입** — tauri_2_scan_folder, tauri_2_generate_handler, tauri_2_invoke_handler, tauri_2_invoke, tauri_2_manage_state, tauri_2_scan_cache [EXTRACTED 0.90]
- **내 커맨드로 읽을 때의 자기 검증 책임** — tauri_2_fs_vs_command_tradeoff, tauri_2_scan_folder, tauri_2_canonicalize_guard, tauri_2_toctou, tauri_2_fs_plugin [INFERRED 0.75]
- **사이드카 이름 세 곳 대조 (externalBin · 케이퍼빌리티 name · 호출 인자)** — tauri_2_external_bin, tauri_2_shell_allow_execute, tauri_2_checksum_file, tauri_2_command_sidecar_js, tauri_2_target_triple_suffix [EXTRACTED 0.90]
- **진행률 스트리밍 흐름 (Rust enum → Channel → 프런트 분기)** — tauri_2_scan_folder_streaming, tauri_2_scan_event, tauri_2_serde_tag_content, tauri_2_channel, tauri_2_invoke, tauri_2_onevent_handler [EXTRACTED 0.90]
- **네 층의 실패 지점 (권한·등록·상태·파일 이름)** — tauri_2_dialog_allow_open, tauri_2_generate_handler, tauri_2_app_manage, tauri_2_target_triple_suffix, tauri_2_error_triage [EXTRACTED 0.85]
- **데이터 국면의 세 약속을 떠받치는 부품들** — vpn_anatomy_2_three_promises, vpn_anatomy_2_aead, vpn_anatomy_2_nonce, vpn_anatomy_2_replay_protection [EXTRACTED 0.85]
- **ChaCha20-Poly1305 합성 구조 (블록 카운터 0 → 일회성 키)** — vpn_anatomy_2_chacha20_poly1305, vpn_anatomy_2_chacha20, vpn_anatomy_2_poly1305, vpn_anatomy_2_block_counter, vpn_anatomy_2_nonce [EXTRACTED 0.85]
- **키 수립 흐름: 키교환 → KDF → AEAD 키, 그리고 PFS** — vpn_anatomy_2_x25519, vpn_anatomy_2_kdf, vpn_anatomy_2_aead, vpn_anatomy_2_pfs [EXTRACTED 0.80]
- **매 패킷마다 반복되는 세 약속 (AEAD·키교환·카운터)** — vpn_anatomy_2_aead, vpn_anatomy_2_x25519, vpn_anatomy_2_anti_replay, vpn_anatomy_2_post [EXTRACTED 0.90]
- **PFS를 떠받치는 키 파생 흐름 (키교환→공유 비밀→KDF→방향별 키)** — vpn_anatomy_2_x25519, vpn_anatomy_2_shared_secret, vpn_anatomy_2_kdf, vpn_anatomy_2_pfs [EXTRACTED 0.85]
- **AEAD 교체 가능성을 만드는 공통 파라미터 규약** — vpn_anatomy_2_aes_gcm, vpn_anatomy_2_chacha20_poly1305, vpn_anatomy_2_aead_parameters, vpn_anatomy_2_aead [EXTRACTED 0.85]
- **SPD 판정 → IKEv2 협상 → SAD 등재 흐름** — vpn_anatomy_3_spd, vpn_anatomy_3_ikev2, vpn_anatomy_3_sad, vpn_anatomy_3_sa [EXTRACTED 0.90]
- **네 메시지 초기 교환 (IKE SA + 첫 CHILD SA 수립)** — vpn_anatomy_3_ike_sa_init, vpn_anatomy_3_ike_auth, vpn_anatomy_3_ike_sa, vpn_anatomy_3_child_sa, vpn_anatomy_3_key_derivation, vpn_anatomy_3_traffic_selector [EXTRACTED 0.90]
- **NAT 탐지 → 포트 4500 전환 → non-ESP marker 4바이트** — vpn_anatomy_3_nat_detection, vpn_anatomy_3_port_4500_switch, vpn_anatomy_3_non_esp_marker, vpn_anatomy_3_failure_udp4500_blocked [EXTRACTED 0.85]
- **IPsec 프레임워크의 뼈대 (SA·SPD·SAD + IKEv2·ESP)** — vpn_anatomy_3_ipsec, vpn_anatomy_3_sa, vpn_anatomy_3_spd, vpn_anatomy_3_sad, vpn_anatomy_3_ikev2, vpn_anatomy_3_esp [EXTRACTED 0.90]
- **네 메시지로 두 SA를 세우는 IKEv2 초기 교환 흐름** — vpn_anatomy_3_ike_sa_init, vpn_anatomy_3_ike_auth, vpn_anatomy_3_shared_secret, vpn_anatomy_3_key_derivation, vpn_anatomy_3_ike_sa, vpn_anatomy_3_child_sa [EXTRACTED 0.85]
- **캡처 재현 실습 절차 (네임스페이스 랩 → offload 해제 → 터널 → 캡처)** — vpn_anatomy_3_netns_lab, vpn_anatomy_3_offload_disable, vpn_anatomy_3_swanctl, vpn_anatomy_3_tshark_capture [EXTRACTED 0.85]
- **인증·인가 지형의 여덟 좌표** — auth_authz_1_identification, auth_authz_1_authentication, auth_authz_1_authorization, auth_authz_1_delegation, auth_authz_1_federation, auth_authz_1_session, auth_authz_1_token, auth_authz_1_policy [EXTRACTED 0.95]
- **인가 규칙 표현 모델 계열(RBAC·ABAC·ReBAC·PBAC + PDP/PEP + deny-by-default)** — auth_authz_1_rbac, auth_authz_1_abac, auth_authz_1_rebac, auth_authz_1_pbac, auth_authz_1_pdp_pep, auth_authz_1_deny_by_default [EXTRACTED 0.90]
- **OAuth 위임 → OIDC 신원 → 토큰 audience 검증 흐름** — auth_authz_1_oauth2, auth_authz_1_access_token, auth_authz_1_oidc, auth_authz_1_id_token, auth_authz_1_jwt, auth_authz_1_audience_validation [EXTRACTED 0.90]
- **JWT 검증 6단계 흐름** — auth_authz_2_alg_allowlist, auth_authz_2_kid_key_selection, auth_authz_2_jws_signature, auth_authz_2_registered_claims, auth_authz_2_aud_validation, auth_authz_2_jwks [EXTRACTED 0.95]
- **서명 검증을 우회하는 공격군** — auth_authz_2_alg_none_attack, auth_authz_2_alg_confusion, auth_authz_2_jku_x5u_key_injection, auth_authz_2_aud_validation, auth_authz_2_rfc8725 [EXTRACTED 0.90]
- **액세스 토큰 형태와 소지 증명 바인딩** — auth_authz_2_access_token, auth_authz_2_opaque_token, auth_authz_2_token_introspection, auth_authz_2_sender_constrained_token, auth_authz_2_dpop, auth_authz_2_mtls_bound_token [EXTRACTED 0.90]
- **OIDC 로그인 6스텝 플로우 (준비→인가→로그인→콜백→교환→검증)** — auth_authz_3_code_verifier, auth_authz_3_code_challenge, auth_authz_3_authorization_code, auth_authz_3_token_exchange, auth_authz_3_id_token_validation, auth_authz_3_oidc_discovery [EXTRACTED 0.90]
- **state·PKCE·nonce 삼중 방어 (CSRF / 코드 주입 / ID Token 재생)** — auth_authz_3_state, auth_authz_3_pkce, auth_authz_3_nonce, auth_authz_3_code_interception [EXTRACTED 0.85]
- **채널 분리 원칙 — 프론트채널엔 코드, 백채널엔 토큰** — auth_authz_3_front_channel, auth_authz_3_back_channel, auth_authz_3_authorization_code, auth_authz_3_token_exchange, auth_authz_3_implicit_grant [EXTRACTED 0.85]
- **심층 방어 계층: 프록시·세션·BFF·리소스 서버 인가** — auth_authz_4_nginx_auth_request, auth_authz_4_server_side_session, auth_authz_4_bff, auth_authz_4_authorization_enforcement, auth_authz_4_defense_in_depth [EXTRACTED 0.90]
- **A01 Broken Access Control 방어 요소** — auth_authz_4_scope_validation, auth_authz_4_rbac_abac, auth_authz_4_deny_by_default, auth_authz_4_record_ownership, auth_authz_4_idor [EXTRACTED 0.85]
- **인증·인가 해부 시리즈 4부작** — auth_authz_1_post, auth_authz_2_post, auth_authz_3_post, auth_authz_4_post [EXTRACTED 0.95]
- **파드 기동 CRI 호출 흐름 (RunPodSandbox → PullImage → CreateContainer → StartContainer)** — container_anatomy_3_kubelet, container_anatomy_3_runpodsandbox, container_anatomy_3_pullimage, container_anatomy_3_createcontainer, container_anatomy_3_cni, container_anatomy_3_pause_container, container_anatomy_3_podsandbox [EXTRACTED 0.90]
- **CRI를 말하는 런타임/어댑터 구현들** — container_anatomy_3_containerd, container_anatomy_3_crio, container_anatomy_3_dockershim, container_anatomy_3_cri_dockerd, container_anatomy_3_cri [EXTRACTED 0.85]
- **kubelet→CRI→런타임→OCI→runc 계층 스택** — container_anatomy_3_kubelet, container_anatomy_3_cri, container_anatomy_3_containerd, container_anatomy_3_runc_v2_shim, container_anatomy_3_oci, container_anatomy_3_runc [EXTRACTED 0.85]
- **같은 OCI 런타임 스펙을 구현해 서로 갈아 끼울 수 있는 런타임들** — container_anatomy_4_oci_runtime_spec, container_anatomy_4_runc, container_anatomy_4_crun, container_anatomy_4_youki, container_anatomy_4_runsc, container_anatomy_4_kata_containers [EXTRACTED 0.90]
- **docker run 한 줄의 실행 릴레이 (CLI→데몬→containerd→shim→저수준 런타임)** — container_anatomy_4_docker, container_anatomy_4_dockerd, container_anatomy_4_containerd, container_anatomy_4_containerd_shim, container_anatomy_4_runc [EXTRACTED 0.85]
- **gVisor 시스템 콜 처리 흐름 (runsc·Sentry·Gofer·systrap)** — container_anatomy_4_runsc, container_anatomy_4_sentry, container_anatomy_4_gofer, container_anatomy_4_systrap, container_anatomy_4_kernel_sharing_limit [EXTRACTED 0.85]
- **OSI 일곱 계층 책임 스택** — osi_7_layers_1_l1_physical, osi_7_layers_1_l2_data_link, osi_7_layers_1_l3_network, osi_7_layers_1_l4_transport, osi_7_layers_1_l5_session, osi_7_layers_1_l6_presentation, osi_7_layers_1_l7_application, osi_7_layers_1_osi_reference_model [EXTRACTED 0.95]
- **아래→위 장애 진단 흐름 (link→ARP→route→port→DNS→TLS/HTTP)** — osi_7_layers_1_layer_triage_workflow, osi_7_layers_1_l1_physical, osi_7_layers_1_arp_nd, osi_7_layers_1_ip_routing, osi_7_layers_1_refused_vs_timeout, osi_7_layers_1_dns, osi_7_layers_1_certificate_chain_failure, osi_7_layers_1_packet_capture [EXTRACTED 0.90]
- **MTU 블랙홀 진단·완화 체인** — osi_7_layers_1_mtu_blackhole, osi_7_layers_1_mss_clamping, osi_7_layers_1_ipv6_next_header, osi_7_layers_1_quic, osi_7_layers_1_rfc_8899, osi_7_layers_1_rfc_1191 [EXTRACTED 0.85]
- **Ethernet 프레임을 구성하는 필드와 크기 규약** — osi_7_layers_2_ethernet_frame, osi_7_layers_2_mac_address, osi_7_layers_2_fcs, osi_7_layers_2_frame_size_mtu, osi_7_layers_2_vlan_tag [EXTRACTED 0.90]
- **같은 링크의 주소 해석 계열 (ARP와 변종·IPv6 대체)** — osi_7_layers_2_arp, osi_7_layers_2_arp_cache, osi_7_layers_2_gratuitous_arp, osi_7_layers_2_proxy_arp, osi_7_layers_2_arp_spoofing, osi_7_layers_2_neighbor_discovery [EXTRACTED 0.85]
- **아래에서 위로 좁히는 L1·L2 장애 진단 흐름** — osi_7_layers_2_troubleshooting_walkthrough, osi_7_layers_2_duplex_mismatch, osi_7_layers_2_autonegotiation, osi_7_layers_2_vlan, osi_7_layers_2_arp_cache, osi_7_layers_2_arp [INFERRED 0.80]
- **한 홉 통과 시 유지/변경 규약** — osi_7_layers_3_next_hop_forwarding, osi_7_layers_3_ttl, osi_7_layers_3_mac_rewrite, osi_7_layers_3_header_checksum, osi_7_layers_3_arp_nd, osi_7_layers_3_end_to_end_principle [EXTRACTED 0.90]
- **목적지까지의 경로 결정 흐름 (서브넷 판정 → LPM → 다음 홉)** — osi_7_layers_3_subnet_decision, osi_7_layers_3_routing_table, osi_7_layers_3_longest_prefix_match, osi_7_layers_3_default_route, osi_7_layers_3_next_hop_forwarding, osi_7_layers_3_policy_routing [EXTRACTED 0.85]
- **ICMP 기반 진단 피드백 채널** — osi_7_layers_3_icmp, osi_7_layers_3_ping, osi_7_layers_3_traceroute, osi_7_layers_3_time_exceeded, osi_7_layers_3_destination_unreachable, osi_7_layers_3_mtu_fragmentation [EXTRACTED 0.90]
- **TCP가 신뢰성을 만드는 장치들** — osi_7_layers_4_sequence_cumulative_ack, osi_7_layers_4_retransmission_rto, osi_7_layers_4_fast_retransmit, osi_7_layers_4_sack, osi_7_layers_4_byte_stream [EXTRACTED 0.90]
- **전송량을 정하는 두 윈도우와 그 합성** — osi_7_layers_4_flow_control, osi_7_layers_4_congestion_control, osi_7_layers_4_min_rwnd_cwnd, osi_7_layers_4_window_scale, osi_7_layers_4_slidingwindowlab [EXTRACTED 0.85]
- **L4 실무 진단 흐름(안 됨 vs 느림)** — osi_7_layers_4_refused_vs_timeout, osi_7_layers_4_port_exhaustion, osi_7_layers_4_ss_diagnosis, osi_7_layers_4_mtu_blackhole, osi_7_layers_4_time_wait [EXTRACTED 0.85]
- **TLS handshake가 한 번에 세우는 기밀성·무결성·인증** — osi_7_layers_5_tls_handshake, osi_7_layers_5_ecdhe, osi_7_layers_5_certificate_chain, osi_7_layers_5_sni, osi_7_layers_5_alpn [EXTRACTED 0.90]
- **L6 표현의 네 갈래: 인코딩·직렬화·압축·암호화** — osi_7_layers_5_character_encoding, osi_7_layers_5_serialization, osi_7_layers_5_compression, osi_7_layers_5_tls, osi_7_layers_5_presentation_layer [EXTRACTED 0.90]
- **대화를 잇는 세션 연속성 메커니즘들** — osi_7_layers_5_cookie, osi_7_layers_5_tls_resumption, osi_7_layers_5_quic_migration, osi_7_layers_5_resumable_transfer, osi_7_layers_5_idempotency_backoff [EXTRACTED 0.90]
- **이름 해석 흐름: stub → 재귀 → 반복 질의 → 캐싱 → 실패 코드** — osi_7_layers_6_dns, osi_7_layers_6_stub_resolver, osi_7_layers_6_iterative_query, osi_7_layers_6_dns_caching_ttl, osi_7_layers_6_dns_failures, src_components_posts_osi_7_layers_6_dnsresolvelab [EXTRACTED 0.90]
- **같은 의미, 다른 전송: HTTP/1.1·2·3와 HOL blocking** — osi_7_layers_6_http, osi_7_layers_6_http11, osi_7_layers_6_http2, osi_7_layers_6_http3_quic, osi_7_layers_6_hol_blocking [EXTRACTED 0.90]
- **한 줄의 curl이 깨우는 일곱 계층 (DNS→TCP→TLS→HTTP + 시리즈 전편)** — osi_7_layers_6_curl_journey, osi_7_layers_6_dns, osi_7_layers_6_http, osi_7_layers_6_sni_host, osi_7_layers_2, osi_7_layers_3, osi_7_layers_4, osi_7_layers_5, src_components_posts_osi_7_layers_6_requestjourneylab [EXTRACTED 0.85]
- **계층·범위로 갈라 세운 네 가지 도구 (VPN·프록시·SSH 터널·NAT)** — vpn_anatomy_1_vpn, vpn_anatomy_1_proxy, vpn_anatomy_1_ssh_tunnel, vpn_anatomy_1_nat [EXTRACTED 0.95]
- **세 프로토콜 가족 지형도 (IPsec·WireGuard·TLS-VPN)** — vpn_anatomy_1_ipsec, vpn_anatomy_1_wireguard, vpn_anatomy_1_tls_vpn, vpn_anatomy_1_openvpn, vpn_anatomy_1_ikev2, vpn_anatomy_1_esp [EXTRACTED 0.90]
- **보호 범위가 무너지는 운영 함정 (split tunnel·DNS/IPv6 leak·kill switch·MTU)** — vpn_anatomy_1_split_tunnel, vpn_anatomy_1_dns_leak, vpn_anatomy_1_ipv6_leak, vpn_anatomy_1_kill_switch, vpn_anatomy_1_mtu_blackhole, vpn_anatomy_1_routing_table [EXTRACTED 0.90]
- **VPN 프로토콜 지형도 — 세 가족과 레거시** — vpn_anatomy_1_ipsec_family, vpn_anatomy_1_wireguard, vpn_anatomy_1_tls_vpn_family, vpn_anatomy_1_legacy_pptp_l2tp [EXTRACTED 0.90]
- **VPN 최소 구성 — 터널링 + 암호화, 경로가 정하는 보호 범위** — vpn_anatomy_1_tunneling, vpn_anatomy_1_encryption, vpn_anatomy_1_routing_table, vpn_anatomy_1_threat_model [EXTRACTED 0.85]
- **인접 도구 구분 — 계층과 범위로 가르기** — vpn_anatomy_1_proxy, vpn_anatomy_1_ssh_tunnel, vpn_anatomy_1_nat, vpn_anatomy_1_tunneling [EXTRACTED 0.85]
- **ESP 패킷 7개 필드 배치와 그 순서의 근거** — vpn_anatomy_4_spi, vpn_anatomy_4_sequence_number, vpn_anatomy_4_esp_trailer, vpn_anatomy_4_next_header, vpn_anatomy_4_icv, vpn_anatomy_4_esp [EXTRACTED 0.95]
- **UDP 4500 위의 세 손님 — 첫 바이트로 갈리는 IKE·keepalive·ESP** — vpn_anatomy_4_nat_t, vpn_anatomy_4_non_esp_marker, vpn_anatomy_4_nat_keepalive, vpn_anatomy_4_esp, vpn_anatomy_4_ikev2 [EXTRACTED 0.90]
- **ESP 수신 처리 흐름 — SA 조회 → 재생 1차 검사 → 검증·복호 → 윈도우 갱신** — vpn_anatomy_4_spi, vpn_anatomy_4_sa, vpn_anatomy_4_anti_replay, vpn_anatomy_4_icv, vpn_anatomy_4_aes_gcm [EXTRACTED 0.90]
- **MTU 블랙홀을 만드는 인과 사슬** — vpn_anatomy_4_esp_overhead, vpn_anatomy_4_df_bit_policy, vpn_anatomy_4_pmtud, vpn_anatomy_4_icmp_feedback, vpn_anatomy_4_mtu_blackhole, vpn_anatomy_4_mss_clamping [EXTRACTED 0.90]
- **NAT 뒤 ESP 데이터 경로 (감지→UDP 4500→keepalive)** — vpn_anatomy_4_nat_t, vpn_anatomy_4_nat_keepalive, vpn_anatomy_4_esp_header, vpn_anatomy_4_scenario_nat_no_data, vpn_anatomy_4_device_roles [EXTRACTED 0.85]
- **캡처 랩이 뒷받침하는 실측 증거 사슬** — vpn_anatomy_4_capture_lab, vpn_anatomy_4_capture_artifacts, vpn_anatomy_4_esp_header, vpn_anatomy_4_esp_overhead, vpn_anatomy_4_espoverheadlab [INFERRED 0.75]
- **WireGuard 네 종류 메시지** — vpn_anatomy_5_handshake_initiation, vpn_anatomy_5_handshake_response, vpn_anatomy_5_cookie_reply, vpn_anatomy_5_transport_data [EXTRACTED 0.95]
- **협상 없이 고정된 세 프리미티브 (Noise 구성 문자열)** — vpn_anatomy_5_noise_ikpsk2, vpn_anatomy_5_curve25519_public_key, vpn_anatomy_5_chacha20_poly1305, vpn_anatomy_5_blake2s, vpn_anatomy_5_no_crypto_agility [EXTRACTED 0.90]
- **1-RTT 세션 수립 흐름 (개시→응답→키 확인→데이터)** — vpn_anatomy_5_handshake_initiation, vpn_anatomy_5_handshake_response, vpn_anatomy_5_key_confirmation, vpn_anatomy_5_passive_keepalive, vpn_anatomy_5_transport_data, vpn_anatomy_5_session_index [EXTRACTED 0.90]
- **WireGuard 네 가지 메시지 타입(1·2·3·4)이 이루는 프로토콜 표면** — vpn_anatomy_5_handshake_initiation, vpn_anatomy_5_handshake_response, vpn_anatomy_5_cookie_reply, vpn_anatomy_5_transport_data, vpn_anatomy_5_keepalive_32byte [EXTRACTED 0.90]
- **NAT-T 없이 성립하는 로밍 설계** — vpn_anatomy_5_single_udp_socket, vpn_anatomy_5_endpoint_roaming, vpn_anatomy_5_cryptokey_routing, vpn_anatomy_5_persistent_keepalive, vpn_anatomy_5_nat_t [EXTRACTED 0.85]
- **핸드셰이크/데이터 분리 → AllowedIPs → keepalive → MTU 진단 절차** — vpn_anatomy_5_wg_show, vpn_anatomy_5_allowed_ips, vpn_anatomy_5_persistent_keepalive, vpn_anatomy_5_mtu_1420, vpn_anatomy_5_troubleshooting_flow [EXTRACTED 0.90]
- **OpenVPN 두 채널 분리 — opcode 한 바이트로 갈리는 제어/데이터 프레이밍** — vpn_anatomy_6_control_channel, vpn_anatomy_6_data_channel, vpn_anatomy_6_opcode_byte, vpn_anatomy_6_p_control, vpn_anatomy_6_p_data_v2, vpn_anatomy_6_key_id [EXTRACTED 0.95]
- **제어 채널 보호 모드 대비 — tls-auth(서명) vs tls-crypt(암호화)와 그 캡처 증거** — vpn_anatomy_6_tls_auth, vpn_anatomy_6_tls_crypt, vpn_anatomy_6_tls_crypt_v2, vpn_anatomy_6_hmac, vpn_anatomy_6_dpi, vpn_anatomy_6_capture_compare [EXTRACTED 0.90]
- **VPN의 해부 시리즈 — 공통 암호 기반(2편) → IPsec(4편) → WireGuard(5편) → OpenVPN(6편) → 선택 매트릭스(7편)** — vpn_anatomy_2_post, vpn_anatomy_4_post, vpn_anatomy_5_post, vpn_anatomy_6_post, vpn_anatomy_7_post [EXTRACTED 0.90]
- **무엇을 고르든 밟는 네 개의 운영 함정** — vpn_anatomy_7_mtu_blackhole, vpn_anatomy_7_split_tunneling, vpn_anatomy_7_dns_leak, vpn_anatomy_7_kill_switch, vpn_anatomy_7_post [EXTRACTED 0.95]
- **세 가족 × 다섯 축 선택 매트릭스** — vpn_anatomy_7_axis_security_design, vpn_anatomy_7_axis_performance_structure, vpn_anatomy_7_axis_nat_friendliness, vpn_anatomy_7_axis_mobile_roaming, vpn_anatomy_7_axis_ops_complexity_auditability, vpn_anatomy_7_ipsec_ikev2_esp, vpn_anatomy_7_wireguard, vpn_anatomy_7_tls_vpn_openvpn [EXTRACTED 0.90]
- **VPN의 해부 시리즈 7편 전체 논지 전개** — vpn_anatomy_1_post, vpn_anatomy_2_post, vpn_anatomy_3_post, vpn_anatomy_4_post, vpn_anatomy_5_post, vpn_anatomy_6_post, vpn_anatomy_7_post, vpn_anatomy_7_two_axes_thesis [EXTRACTED 0.90]
- **WebRTC 연결의 세 축 — 협상·연결성·보안** — webrtc_1_three_axes, webrtc_1_signaling, webrtc_1_offer_answer, webrtc_1_ice, webrtc_1_dtls_srtp [EXTRACTED 0.90]
- **NAT 트래버설 경로 확립 흐름 (후보 수집 → 점검 → 지명)** — webrtc_1_ice, webrtc_1_stun, webrtc_1_turn, webrtc_1_trickle_ice, webrtc_1_ice_candidate_types, webrtc_1_nat_traversal [EXTRACTED 0.88]
- **협상 가장자리 — glare·perfect negotiation·재협상·ICE restart** — webrtc_1_glare, webrtc_1_perfect_negotiation, webrtc_1_renegotiation, webrtc_1_ice_restart, webrtc_1_getstats_diagnosis [INFERRED 0.80]
- **측정→흡수→적응→선택지 확보 품질 파이프라인** — webrtc_2_rtp, webrtc_2_rtcp, webrtc_2_jitter_buffer, webrtc_2_congestion_control, webrtc_2_simulcast [EXTRACTED 0.95]
- **TWCC 기반 GCC 혼잡제어 루프** — webrtc_2_twcc, webrtc_2_delay_based_estimator, webrtc_2_loss_based_estimator, webrtc_2_bandwidth_probing, webrtc_2_pacer, webrtc_2_encoder [EXTRACTED 0.90]
- **getStats() 기반 품질 진단 지표군** — webrtc_2_getstats, webrtc_2_jitterbufferdelay, webrtc_2_interarrival_jitter, webrtc_2_rtt, webrtc_2_neteq [INFERRED 0.80]
- **mesh·SFU·MCU 토폴로지 트레이드오프 (RFC 7667 분류)** — webrtc_3_mesh, webrtc_3_sfu, webrtc_3_mcu, webrtc_3_rfc7667, webrtc_3_topology_decision_matrix [EXTRACTED 0.90]
- **SFU 역할을 구현하는 미디어 서버 구현체들** — webrtc_3_mediasoup, webrtc_3_livekit, webrtc_3_janus, webrtc_3_jitsi_videobridge, webrtc_3_sfu [EXTRACTED 0.85]
- **WebRTC 해부 3부작 (연결 → 품질 → 토폴로지)** — webrtc_1_post, webrtc_2_post, webrtc_3_post [EXTRACTED 0.95]

## Communities (45 total, 0 thin omitted)

### Community 0 - "Tauri IPC Commands & Security"
Cohesion: 0.06
Nodes (64): CryptokeyRoutingFlow (viz 컴포넌트), CryptokeyRoutingLab (인터랙티브 시뮬), OneRttFlow (viz 컴포넌트), WgVsIpsec (viz 비교 컴포넌트), Allowed IPs (소스 IP 허가 정책), 증폭 공격 방어 (응답 < 개시), BLAKE2s (해시·MAC), 캡처 아티팩트 (vpn-anatomy-5 랩) (+56 more)

### Community 1 - "Container Ecosystem & Tooling"
Cohesion: 0.06
Nodes (63): 인증·인가 해부 1편 (OAuth는 위임, OIDC는 인증), IkeHeaderDissector, ProposalTreeBuilder, VizComparisonSpi, VizFlowchartSpdSaSad, VizProcessStepsFourMessages, VPN 해부 2편 — 암호가 하는 세 가지 약속, VPN 해부 3편 — IKEv2는 무엇을 협상하는가 (+55 more)

### Community 2 - "OCI Image & Runtime Specs"
Cohesion: 0.07
Nodes (58): ESP 해부: 패킷이 국경을 두 번 넘는 법 — NAT-T와 MTU까지 (VPN의 해부 EP4), AAD (Additional Authenticated Data), AEAD (Authenticated Encryption with Associated Data), AES-GCM (AEAD 결합 모드, salt 4 + IV 8 nonce), AH (Authentication Header, IP 프로토콜 51), Anti-replay (재생 방지 슬라이딩 윈도우), AntiReplayLab (재생 방지 윈도우 시뮬레이션), 캡처 아티팩트 (esp-natt.txt · esp-decrypted.txt · esp.pcap) (+50 more)

### Community 3 - "Docker Layers & Kernel Isolation"
Cohesion: 0.06
Nodes (56): 컨테이너 해부 EP1 — 도커라는 조립품, BuildKit secret mount, Capabilities 박탈, capabilities · seccomp (격리 완성 요소), cgroup (control group), cgroup v2 통합 계층, 컨테이너 실행 릴레이 5계층, containerd (+48 more)

### Community 4 - "WebRTC Congestion Control"
Cohesion: 0.06
Nodes (54): 도커로 빌드한 이미지가 Podman에서도 도는 이유, OCI distribution-spec — spec.md, OCI image-spec — manifest.md · media-types.md · image-layout.md, OCI image-spec — spec.md, OCI — About the Open Container Initiative, OCI runtime-spec — bundle.md, OCI runtime-spec — config.md, OCI runtime-spec — runtime.md (+46 more)

### Community 5 - "Tauri Architecture & Bundle Size"
Cohesion: 0.06
Nodes (54): ObserverView (관찰자별 노출 시뮬레이션), VizComparison2 (프록시 vs VPN 비교 시각물), VizFlowchart4 (프로토콜 지형도 흐름도), VizProcessSteps3 (캡슐화 단계 시각물), AH (Authentication Header), Clientless SSL-VPN (애플리케이션 포털), DNS leak, DNS 질의·평문 SNI 메타데이터 (+46 more)

### Community 6 - "OAuth Authorization Code + PKCE"
Cohesion: 0.07
Nodes (53): ARP / IPv6 Neighbor Discovery, capture 함정 — SLL cooked capture·offload, 인증서 체인 누락·SNI 불일치 시나리오, 자주 틀리는 일곱 가지, DNS — 이름 해석 (진단의 길목), 캡슐화 (Encapsulation), end-to-end argument, Ethernet (IEEE 802.3) frame·MAC·FCS (+45 more)

### Community 7 - "IP Routing & NAT"
Cohesion: 0.06
Nodes (51): TCP byte stream과 메시지 경계, CLOSE-WAIT (앱이 close() 안 함), 혼잡 제어(cwnd), QUIC Connection ID와 연결 이동, 연결 종료(FIN 교환·half-close), CUBIC과 BBR, ECN(Explicit Congestion Notification), 임시 포트(ephemeral port) 범위 (+43 more)

### Community 8 - "Authentication vs Authorization Basics"
Cohesion: 0.07
Nodes (49): OpenVPN 2.6 릴리스 노트 (DCO · AEAD 기본화), OpenVPN wire protocol (openvpn.github.io/openvpn-rfc), RFC 5116 — An Interface and Algorithms for Authenticated Encryption, RFC 8446 — TLS Protocol Version 1.3, OpcodeByte (opcode/key-id 인터랙티브 시뮬레이션), VizComparison3 (tls-auth vs tls-crypt 비교), VizFlowchart2 (TLS 1.3 레코드/키 스케줄 도해), VizProcessSteps4 (TCP-over-TCP meltdown 단계 도해) (+41 more)

### Community 9 - "Kubernetes CRI Runtimes"
Cohesion: 0.06
Nodes (49): ALG (Application Layer Gateway), ARP / ND 주소 해석, CGNAT와 포트 고갈, CIDR prefix 표기, 연결 추적 (conntrack), Default route (0.0.0.0/0), Destination Unreachable / Packet Too Big, Dynamic routing (OSPF·IS-IS·BGP) (+41 more)

### Community 10 - "JWT Tokens & Signature Validation"
Cohesion: 0.07
Nodes (46): ABAC (속성 기반 접근제어), 액세스 토큰(bearer, 위임된 인가), IAL·AAL·FAL 보증 수준, audience(aud) 검증과 토큰 치환 사고, 인증(Authentication), 인가(Authorization), AuthzMap (인증·인가 인터랙티브 지도), 쿠키 속성(Secure·HttpOnly·SameSite) (+38 more)

### Community 11 - "Auth Production Best Practices"
Cohesion: 0.08
Nodes (44): OSI 7계층 해부 2편 (L1·L2), OSI 7계층 해부 3편 (L3 라우팅), OSI 7계층 해부 4편 (L4 TCP/UDP), OSI 7계층 해부 5편 (L5·L6 세션·표현), 콘텐츠 협상 (Accept·Accept-Language·Accept-Encoding), 한 줄의 curl이 깨우는 일곱 책임, 실무 워크스루: curl로 HTTP 실패 진단, 실무 워크스루: dig로 이름 해석 진단 (+36 more)

### Community 12 - "WebRTC ICE & SDP Negotiation"
Cohesion: 0.08
Nodes (44): Access Port, ARP (주소 해석 프로토콜), ARP Cache (IP → MAC 매핑), 직접 해보기: ARP 한 번을 캡처로 잡기, ARP Spoofing, Autonegotiation (IEEE 802.3 Clause 28), Broadcast Domain, Broadcast Storm (L2 루프, TTL 부재) (+36 more)

### Community 13 - "OSI Seven-Layer Model"
Cohesion: 0.07
Nodes (43): 축: 모바일 로밍, 축: NAT 친화, 축: 운영 복잡도·감사성, 축: 성능 구조(커널 vs 유저스페이스 데이터 패스), 축: 보안 설계(협상형 vs 고정 vs TLS 신뢰모델), Cryptokey routing / endpoint roaming, 디버깅 복호 가능성 ↔ 기밀성 트레이드오프, DNS 유출 (DNS leak) (+35 more)

### Community 14 - "WebRTC RFC References"
Cohesion: 0.08
Nodes (41): 교체 가능한 저수준 런타임 (crun·youki·runsc), annotations (스펙이 비워 둔 칸), 익명 베어러 토큰 인증 (401 + WWW-Authenticate), CNI (Container Network Interface), config.json, 내용 주소화의 세 결과 (무결성·중복 제거·캐시), Conversion (이미지 → 런타임 번들 변환), create / start 분리 (+33 more)

### Community 15 - "TLS Handshake & Character Encoding"
Cohesion: 0.07
Nodes (40): v1 allowlist (전역 허용목록), BundleMemoryExample (viz 컴포넌트), Capability (케이퍼빌리티), tauri::ipc::Channel (스트리밍 통로), Chromium 번들 렌더러, Command (invoke 요청-응답), Core 프로세스 (Rust), 콘텐츠 보안 정책 (CSP) · XSS 대비 (+32 more)

### Community 16 - "DNS Resolution & HTTP Basics"
Cohesion: 0.07
Nodes (38): ALPN (Application-Layer Protocol Negotiation), 인증서 체인 검증 (trust anchor·SAN·폐기), 문자 인코딩, 유니코드 코드 포인트, 압축 (gzip·brotli), HTTP cookie 기반 세션 유지, CRIME·BREACH 압축 사이드채널 공격, ECDHE 키 교환 / forward secrecy (+30 more)

### Community 17 - "Developer Career & Fundamentals"
Cohesion: 0.09
Nodes (37): 컨테이너의 해부 EP2 — OCI 3대 스펙, cgroup 드라이버 (cgroupfs vs systemd), CNI (Container Network Interface), --container-runtime-endpoint 소켓, containerd, containerd Getting Started, CreateContainer, CRI (Container Runtime Interface) (+29 more)

### Community 18 - "Browser Choice & AI Agents"
Cohesion: 0.07
Nodes (36): 40살인데 알고리즘 해도 괜찮을까요 - 프롤로그, "알고리즘은 실무에서 의미 없다"는 통념, 겸직으로 인한 코딩 밀도 저하, 코딩 테스트 실패 경험, 개념 추상화·사고 시스템 구축, OOP·소프트웨어공학·운영체제 학습, 스타트업 CTO 커리어, 새 도메인의 와꾸를 읽는 패턴 인식 (+28 more)

### Community 19 - "Ethernet Frames & ARP"
Cohesion: 0.11
Nodes (35): AEAD — 기밀성·무결성·재전송 방지, AAD (인증되지만 암호화되지 않는 연관 데이터), AEAD (Authenticated Encryption with Associated Data), AEAD 공통 파라미터 (nonce 12옥텟·태그 16옥텟), AES-GCM AEAD, 재전송 방지 (카운터 + 창), ChaCha20 블록 카운터, ChaCha20 스트림 암호 (512비트 상태) (+27 more)

### Community 20 - "TCP Reliability & Congestion"
Cohesion: 0.09
Nodes (34): 인증·인가 해부 2편 (토큰 검증), 인증·인가 해부 3편 — 플로우: 토큰은 어떻게 오는가, authorization code (일회용 코드), Authorization Code Grant 흐름, 백채널 (back channel), 클라이언트 인증 (client_secret / private_key_jwt / mTLS), code_challenge (S256), 코드 가로채기·주입 공격 (+26 more)

### Community 21 - "HTTP Semantics & Caching"
Cohesion: 0.12
Nodes (33): IceTraversalLab (ICE 경로 선택 랩), LoopbackNegotiationDemo (한 탭 루프백 협상 데모), SdpNegotiationStepper (협상 단계 스테퍼), BUNDLE · rtcp-mux 트랜스포트 통합, consent freshness (RFC 7675) · keepalive 겸업, DTLS-SRTP 의무 암호화 (RFC 5764), getStats() · webrtc-internals 진단 절차, getUserMedia() 미디어 캡처 (+25 more)

### Community 22 - "Session Layer & Cookies"
Cohesion: 0.16
Nodes (18): 액세스 토큰, 디코딩 ≠ 검증, ID Token, JWE (암호화된 JWT), JWS 서명 (무결성·진위), JWT (JSON Web Token), Keycloak (발급자 구현 예시), Keycloak — Securing apps with OpenID Connect (+10 more)

### Community 23 - "ARP Address Resolution Lab"
Cohesion: 0.18
Nodes (19): BFF (Backend-for-Frontend), HttpOnly·Secure·SameSite·__Host- 쿠키 속성, CORS ≠ CSRF 방어, CSRF 방어 (Synchronizer Token·Double-Submit), 심층 방어(Defense in Depth), OAuth 2.0 for Browser-Based Apps (Internet-Draft), 회전 grace period·분산 락, localStorage 토큰 저장 위험 (XSS) (+11 more)

### Community 24 - "Physical Layer & Switching"
Cohesion: 0.16
Nodes (18): alg 허용목록, alg confusion (RS256→HS256), alg:none 공격, 비대칭 서명 RS256 / ES256, aud(대상) 검증, 인가 (scope·역할 판단, 4편), clock skew 허용 오차, jku·x5u 키 주입 / SSRF (+10 more)

### Community 25 - "Transport Layer & UDP/QUIC"
Cohesion: 0.15
Nodes (16): 리소스 서버 인가 집행, deny-by-default, 백엔드 직접 접근(엣지 우회) 차단, 신원 헤더 sanitize (X-User 덮어쓰기), ID Token으로 API 인가 금지, IDOR (식별자 조작 접근), 엣지 서명 내부 JWT, mTLS·네트워크 격리 (+8 more)

### Community 26 - "Ports, Sockets & NAT State"
Cohesion: 0.17
Nodes (15): ParticipantScaleLab (참가자 수 스케일링 시뮬레이션), BlogGeek.me (Tsahi Levent-Levi) 업계 분석, SFU 캐스케이딩·HLS/CDN 하이브리드 전달, 레거시 SIP/H.323 회의 장비 상호운용, MCU (Multipoint Control/Conferencing Unit), mesh 토폴로지 (Point-to-Multipoint Using Mesh), 믹스-마이너스(mix-minus) 오디오, WebRTC 해부 3편 (토폴로지: mesh·SFU·MCU) (+7 more)

### Community 27 - "VLAN & Spanning Tree"
Cohesion: 0.19
Nodes (13): tauri::async_runtime::Mutex (비동기 Mutex), canonicalize 경로 자기검증, Result 에러 직렬화 (thiserror), do_scan 보조 함수, do_scan_async, await 너머로 가드를 들고 가는 함정, manage() / State<'_, T> 상태 주입, MutexGuard를 든 채 await 하는 안티패턴 (+5 more)

### Community 28 - "TCP Handshake & Options"
Cohesion: 0.26
Nodes (12): Channel 진행률 스트리밍, ChecksumEvent (Serialize enum), checksum_file (사이드카 중계 커맨드), child.kill() — 고아 프로세스 정리, CommandEvent (Stdout/Stderr 스트림), Event (느슨한 JSON 알림 통로), invoke — 프런트에서 커맨드 호출, onEvent.onmessage (프런트 채널 핸들러) (+4 more)

### Community 29 - "Encapsulation & Layer Models"
Cohesion: 0.18
Nodes (12): 발화자 감지(active/dominant speaker detection), Dynacast (미구독 계층 인코딩 중단), 네트워크 팬아웃(fan-out) 병목, Janus VideoRoom, Jitsi Videobridge, LiveKit SFU, mediasoup, RFC 7667 (RTP Topologies, Informational) (+4 more)

### Community 30 - "HTTP Version Evolution"
Cohesion: 0.24
Nodes (10): capabilities/default.json 권한 묶음, 케이퍼빌리티 (capability), core:default 기본 권한 묶음, dialog:allow-open 퍼미션, dialog 플러그인, src/main.ts — 프런트엔드 진입, 퍼미션 세트, Runtime Authority — 요청 심사 (+2 more)

### Community 31 - "Astro Blog Build"
Cohesion: 0.24
Nodes (10): create-tauri-app 스캐폴딩, not found vs not allowed 1차 분류, generate_handler! 커맨드 등록, invoke_handler — 한 번만 호출, src-tauri/src/lib.rs — 앱 본체, src-tauri/src/main.rs — 데스크톱 진입점, cfg_attr(mobile, mobile_entry_point), run() 앱 진입 함수 (+2 more)

### Community 32 - "WebRTC 혼잡제어 RFC 표준"
Cohesion: 0.24
Nodes (10): 혼잡제어 (congestion control), draft-ietf-rmcat-gcc (Google Congestion Control 초안), ICE 연결 상태 (connectivity ≠ quality), WebRTC 해부 2편 — 연결된 경로 위에서, 품질은 어떻게 지켜지는가, RFC 7587 (Opus RTP 페이로드 포맷), RFC 7741 (VP8 RTP 페이로드 포맷), RFC 8888 (RTCP Feedback for Congestion Control), draft-holmer-rmcat-transport-wide-cc-extensions (TWCC 초안) (+2 more)

### Community 33 - "직렬화와 표현 계층"
Cohesion: 0.33
Nodes (9): Command.sidecar (프런트 직접 호출), bundle.externalBin 설정, 크로스 컴파일 불가 — 플랫폼별 러너, scripts/rename-sidecar.mjs, shell:allow-execute 퍼미션, 사이드카 — 외부 CLI 번들링, 타깃 트리플 접미사 규칙, tauri build (플랫폼별 인스톨러) (+1 more)

### Community 34 - "Tauri 프로젝트 구조 진입점"
Cohesion: 0.28
Nodes (9): Bandwidth probing (능동 대역폭 탐색), CCFB (RFC 8888 혼잡제어 피드백), delay-based 추정 (AIMD 지연 추세), draft-ietf-rmcat-gcc (만료된 인터넷 초안), GCC (Google Congestion Control), loss-based 추정 (손실률 기반), pacer (전송 리듬 조절기), REMB (Receiver Estimated Maximum Bitrate, 레거시 폴백) (+1 more)

### Community 35 - "VPN 위협모델과 신뢰 이전"
Cohesion: 0.31
Nodes (9): 인코더 (목표 비트레이트 적용 대상), RFC 8852 (RTP Stream Identifier 헤더 확장), RFC 8853 (simulcast), RID (RTP Stream Identifier), RTCRtpEncodingParameters / setParameters(), RTCRtpTransceiver, SFU (Selective Forwarding Unit, 3편 주제), simulcast (다중 화질 동시 인코딩) (+1 more)

### Community 36 - "Tauri 권한·케이퍼빌리티 모델"
Cohesion: 0.31
Nodes (9): interarrival jitter (지터 추정치), Receiver Report (RR), RFC 3550 (RTP/RTCP), RFC 3551 (RTP/AVP 프로파일), RTP 페이로드 포맷 RFC (Opus RFC 7587, VP8 RFC 7741), RTCP (RTP Control Protocol), RTP (Real-time Transport Protocol), RTT (왕복 지연, LSR/DLSR 기반) (+1 more)

### Community 37 - "Tauri 사이드카 번들링·빌드"
Cohesion: 0.29
Nodes (8): getStats() / WebRTC-STATS 지표, jitter buffer (지연 변동 흡수 버퍼), jitterBufferDelay / EmittedCount / TargetDelay, JitterBufferLab (인터랙티브 랩 컴포넌트), libwebrtc (브라우저 구현 재량 영역), NetEQ (libwebrtc 적응형 오디오 jitter buffer), PLC (손실 은닉, Expand/Merge), W3C WebRTC-STATS 명세

### Community 38 - "VPN 정의와 표준 문서"
Cohesion: 0.29
Nodes (7): Tauri 해부 1편, Tauri 해부 2편 — 개념을 코드로, app.manage() 상태 등록, file-scout 예제 앱, 직접 해 보기 — 4층 실패 재현 과제, Tauri 2.x 공식 문서 (v2.tauri.app), VizFlowchart5 (file-scout 전체 배선)

### Community 39 - "Tauri 해부 시리즈 시각물"
Cohesion: 0.33
Nodes (6): Authorization Code + PKCE (3편 예고), RFC 9700 — OAuth 2.0 Security BCP, ROPC (grant_type=password) 금지, 인증·인가 해부 3편 — 플로우 (다음 편), 베스트 프랙티스 체크리스트, Authorization Code + PKCE(S256)

### Community 40 - "Simulcast와 SVC 다중 화질"
Cohesion: 0.33
Nodes (6): AVPF (Audio-Visual Profile with Feedback), FEC (RED/ULPFEC·FlexFEC 전방 오류 수정), NACK (Generic NACK) / RTX 재전송, PLI (Picture Loss Indication), RFC 4585 (AVPF), SDP 협상 (a=rtcp-fb, a=rid, a=simulcast)

### Community 41 - "정책 기반 접근제어(PBAC)"
Cohesion: 0.60
Nodes (5): fs_scope().allow_directory 런타임 확장, fs 플러그인, fs 플러그인 vs 내 커맨드 경계 설계, $HOME·$APPDATA 경로 변수, scope — 인자 검증 규칙

### Community 42 - "UTF-8 문자 인코딩"
Cohesion: 0.67
Nodes (3): do_scan_blocking, heavy_scan (spawn_blocking 커맨드), tauri::async_runtime::spawn_blocking

### Community 43 - "HTTP 의미론과 버전 진화"
Cohesion: 1.00
Nodes (3): Astro (정적 콘텐츠 우선 빌드), 블로그를 Astro로 새로 지었습니다, raws → draft → 발행 집필 워크플로우

### Community 44 - "프록시와 TLS-VPN 비교"
Cohesion: 0.40
Nodes (5): DPoP (cnf.jkt proof JWT), mTLS 인증서 바인딩 토큰 (cnf.x5t#S256), RFC 8705 — mTLS / Certificate-Bound Tokens, RFC 9449 — DPoP, sender-constrained(소지 증명) 토큰

## Ambiguous Edges - Review These
- `40살인데 알고리즘 해도 괜찮을까요 - 프롤로그` → `aside: 드디어 arc의 악령에서 벗어나나`  [AMBIGUOUS]
  algorithm-at-40-prologue.md · relation: semantically_similar_to
- `Tidy 탭 정리 기능` → `aside clear 기능(전체 탭 닫기)`  [AMBIGUOUS]
  aside-arc.md · relation: conceptually_related_to
- `OCI 런타임 스펙` → `shim 바이너리 이름 변환 규칙`  [AMBIGUOUS]
  container-anatomy-1.mdx · relation: conceptually_related_to
- `OverlayFS` → `이미지 레이어에 남는 삭제된 비밀 파일`  [AMBIGUOUS]
  container-anatomy-1.mdx · relation: conceptually_related_to
- `내용 주소화의 세 결과 (무결성·중복 제거·캐시)` → `레지스트리 GC 정책 (202는 즉시 삭제가 아니다)`  [AMBIGUOUS]
  container-anatomy-2.mdx · relation: conceptually_related_to
- `core:default 기본 권한 묶음` → `Channel 진행률 스트리밍`  [AMBIGUOUS]
  tauri-2.mdx · relation: conceptually_related_to
- `Channel 진행률 스트리밍` → `Command.sidecar (프런트 직접 호출)`  [AMBIGUOUS]
  tauri-2.mdx · relation: conceptually_related_to
- `IKEv2 해부: 두 낯선 장비가 같은 열쇠를 쥐기까지 — 4개의 메시지` → `VPN의 해부 EP2 (AEAD·키교환)`  [AMBIGUOUS]
  vpn-anatomy-2.mdx · relation: references
- `IKE_AUTH 교환 (35)` → `인증·인가 해부 1편 (OAuth는 위임, OIDC는 인증)`  [AMBIGUOUS]
  vpn-anatomy-3.mdx · relation: conceptually_related_to
- `캡처 랩 환경 (strongSwan 5.9.13 · TShark 4.2.2 · NAT 이전 캡처)` → `RFC 5737 (문서용 IPv4 대역)`  [AMBIGUOUS]
  vpn-anatomy-3.mdx · relation: references
- `VPN의 해부 EP2 (AEAD·키교환)` → `인증·인가 해부 EP1`  [AMBIGUOUS]
  vpn-anatomy-1.mdx · relation: conceptually_related_to
- `VPN의 해부 EP2 (AEAD·키교환)` → `ESP 해부: 패킷이 국경을 두 번 넘는 법 — NAT-T와 MTU까지 (VPN의 해부 EP4)`  [AMBIGUOUS]
  vpn-anatomy-2.mdx · relation: references
- `JWKS (JSON Web Key Set)` → `등록 클레임 (iss·sub·aud·exp·nbf·iat·jti)`  [AMBIGUOUS]
  auth-authz-2.mdx · relation: shares_data_with
- `토큰 교환 (token_endpoint)` → `인증·인가 해부 4편 (실무 베스트 프랙티스 · BFF)`  [AMBIGUOUS]
  auth-authz-3.mdx · relation: conceptually_related_to
- `ID Token 검증` → `인증·인가 해부 2편 (토큰 검증)`  [AMBIGUOUS]
  auth-authz-3.mdx · relation: conceptually_related_to
- `서버측 세션 (Redis)` → `회전 grace period·분산 락`  [AMBIGUOUS]
  auth-authz-4.mdx · relation: shares_data_with
- `cgroup 드라이버 (cgroupfs vs systemd)` → `--container-runtime-endpoint 소켓`  [AMBIGUOUS]
  container-anatomy-3.mdx · relation: shares_data_with
- `BuildKit (Docker 기본 빌더)` → `Kaniko (아카이브됨 — 선택 금지)`  [AMBIGUOUS]
  container-anatomy-4.mdx · relation: semantically_similar_to
- `OSI 7계층, 외우지 말고 데이터의 여행으로 이해하기` → `L1·L2 해부: 한 LAN 안에서 프레임은 어떻게 길을 찾는가`  [AMBIGUOUS]
  osi-7-layers-2.mdx · relation: references
- `L4 Transport — process까지의 전달` → `DNS — 이름 해석 (진단의 길목)`  [AMBIGUOUS]
  osi-7-layers-1.mdx · relation: conceptually_related_to
- `L6 Presentation — 표현과 보호` → `end-to-end argument`  [AMBIGUOUS]
  osi-7-layers-1.mdx · relation: conceptually_related_to
- `VPN (가상 사설망)` → `NAT (주소 변환)`  [AMBIGUOUS]
  vpn-anatomy-1.mdx · relation: semantically_similar_to
- `VPN (가상 사설망)` → `SSH 터널 (포트 포워딩)`  [AMBIGUOUS]
  vpn-anatomy-1.mdx · relation: semantically_similar_to
- `VPN (가상 사설망)` → `프록시 (L7 중개자)`  [AMBIGUOUS]
  vpn-anatomy-1.mdx · relation: semantically_similar_to
- `MTU 블랙홀 (PMTUD 실패)` → `VPN의 해부 EP5 (WireGuard)`  [AMBIGUOUS]
  vpn-anatomy-4.mdx · relation: references
- `Handshake Initiation (148바이트)` → `Cookie Reply (mac2 쿠키)`  [AMBIGUOUS]
  vpn-anatomy-5.mdx · relation: shares_data_with
- `WireGuard` → `캡처 아티팩트 (vpn-anatomy-5 랩)`  [AMBIGUOUS]
  vpn-anatomy-5.mdx · relation: references
- `OpenVPN 자체 신뢰성 계층 (packet_id·재전송·ACK)` → `전송 선택 (UDP 1194 기본 · TCP 443 우회로)`  [AMBIGUOUS]
  vpn-anatomy-6.mdx · relation: conceptually_related_to
- `Split tunneling` → `OS 이름 해석 정책 (NRPT·scoped resolver·systemd-resolved)`  [AMBIGUOUS]
  vpn-anatomy-7.mdx · relation: shares_data_with
- `Kill switch (fail-closed 원칙)` → `IPv6 leak (물리 인터페이스 잔존 기본 경로)`  [AMBIGUOUS]
  vpn-anatomy-7.mdx · relation: conceptually_related_to
- `DTLS-SRTP 의무 암호화 (RFC 5764)` → `getUserMedia() 미디어 캡처`  [AMBIGUOUS]
  webrtc-1.mdx · relation: conceptually_related_to
- `혼잡제어 (congestion control)` → `ICE 연결 상태 (connectivity ≠ quality)`  [AMBIGUOUS]
  webrtc-2.mdx · relation: conceptually_related_to
- `SFU (Selective Forwarding Unit)` → `트랜스코딩 (디코딩·합성·재인코딩)`  [AMBIGUOUS]
  webrtc-3.mdx · relation: conceptually_related_to
- `토폴로지 선택 5축 판단 기준(참가자 수·클라이언트 성능·서버 비용·레이턴시·녹화)` → `SFU 캐스케이딩·HLS/CDN 하이브리드 전달`  [AMBIGUOUS]
  webrtc-3.mdx · relation: conceptually_related_to

## Knowledge Gaps
- **211 isolated node(s):** `다면적(수학적·공학적) 사고`, `메타 인지와 겁 많은 천성`, `OOP·소프트웨어공학·운영체제 학습`, `실무자 맥락 공감 리더십`, `40대 구직 시장과 AI 시대의 능력 증명 압박` (+206 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `40살인데 알고리즘 해도 괜찮을까요 - 프롤로그` and `aside: 드디어 arc의 악령에서 벗어나나`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Tidy 탭 정리 기능` and `aside clear 기능(전체 탭 닫기)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `OCI 런타임 스펙` and `shim 바이너리 이름 변환 규칙`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `OverlayFS` and `이미지 레이어에 남는 삭제된 비밀 파일`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `내용 주소화의 세 결과 (무결성·중복 제거·캐시)` and `레지스트리 GC 정책 (202는 즉시 삭제가 아니다)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `core:default 기본 권한 묶음` and `Channel 진행률 스트리밍`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Channel 진행률 스트리밍` and `Command.sidecar (프런트 직접 호출)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._