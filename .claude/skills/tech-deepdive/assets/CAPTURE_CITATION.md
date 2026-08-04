# 패킷 캡처 인용 규약 (VPN 캡처 랩)

> 이 문서는 `CLAUDE.md` 에 있던 "Packet captures: VPN 캡처 랩" 절을 옮겨 온 것이다.
> wire-level 증거를 인용하는 글을 쓸 때만 필요해서 상주 컨텍스트에서 뺐다.

Wire-level 증거가 필요한 글(현재는 **VPN 해부 EP3~EP7**)은 캡처를 **직접 뜨지 않는다.**
실물 패킷 아티팩트가 이미 생성되어 리서치 레포에 있다:

```
~/blog-research/raws/captures/vpn-anatomy-3/   ike_sa_init.txt  ike_auth.txt  ike.pcap
~/blog-research/raws/captures/vpn-anatomy-4/   esp-natt.txt  esp-decrypted.txt  esp.pcap
~/blog-research/raws/captures/vpn-anatomy-5/   wg-handshake.txt  wg-transport.txt  wg-sizes.txt  wg.pcap
~/blog-research/raws/captures/vpn-anatomy-6/   openvpn-opcode.txt  openvpn-tls-auth.txt  openvpn-compare.txt  *.pcap
```

- 각 `.txt` 첫머리 주석에 **생성 명령·패키지 버전·캡처 지점·일시**가 박혀 있다 — 그게 출처 표기다.
- 본문에는 **발췌만**(한 블록 20줄 이내 기준) 넣고, 전문이 필요하면 파일을 가리킨다.
  **디섹션 값은 위조하지 않는다 — 자른다.** 주소·MAC·키는 이미 문서용/합성값이라 가릴 게 없다.
- 크기를 인용할 땐 **계층을 밝힌다**(예: WireGuard 148/92는 UDP 페이로드 길이이지 프레임 길이가 아니다).
- 인용 지침과 편별 매핑은 `~/blog-research/wiki/topics/vpn-capture-lab.md` 와 각 angle 페이지 상단에 있다.

랩 자체는 `~/blog-research/lab/vpn-capture-lab/`(**Lima VM 1개 + network namespace 3개, 컨테이너
런타임 없음**). 새 캡처가 필요할 때만 그쪽 `README.md` 로 간다 — `make vm && make probe && make topo`.
설계 근거는 `raws/010`, 실장 보고(함정·실측값)는 **`raws/011`** 이며 후자가 최신이다.
