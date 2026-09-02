import { useEffect, useRef, useState } from "react";

// 단일 탭 가상 루프백 데모 — 한 페이지에서 localPC/remotePC 두 RTCPeerConnection을
// 만들고 SDP·ICE candidate를 로컬 메모리로 직접 주고받아 1:1 DataChannel을 연다.
//
// ⚠️ 이것은 "협상 API 실습"이다. 같은 origin·같은 장비라서 NAT/STUN/TURN 문제는
//   재현하지 못한다(그건 본문의 시뮬레이션·진단 절이 다룬다). 여기서 보는 것은
//   createOffer/Answer → setLocal/RemoteDescription → onicecandidate → 연결 성사의
//   "협상 절차" 그 자체다.
//
// 보안 컨텍스트 주의: RTCPeerConnection 자체는 secure context 전용이 아니다(그 제약은
//   getUserMedia 등 미디어 캡처에 걸린다). 이 데모는 미디어를 쓰지 않는 DataChannel만
//   다루므로 HTTP에서도 대개 동작하지만, 비보안 컨텍스트일 땐 경고를 표시한다.
//
// 실제 브라우저 API(RTCPeerConnection)를 호출하므로 MDX에서 client:only="react"로
// 마운트해야 SSR 미스매치가 없다.

type Log = { t: string; who: "local" | "remote" | "sys"; msg: string };

// 시각 값은 토큰을 쓴다 (KAN-072-CPJCT1). fallback 은 tokens.css 값과 정확히 같다.
const INK = "var(--ink, #20264A)";
const INK_2 = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const PANEL = "var(--surface-hi, #fffdf8)";
const IDLE = "var(--paper, #F3EEE4)";
const HAIR = "var(--stroke-hair, 1px)";
const LOCAL = "var(--cat-skills, #3e6b6b)"; // 로컬 피어 · 연결 성사 강조
const REMOTE = "var(--cat-architecture, #4e6ca8)"; // 원격 피어
const DANGER = "var(--cat-strategy, #a84b4b)";
const NOTICE = "var(--pop, #d8a33f)"; // 비보안 컨텍스트 안내 테두리
const NOTICE_BG = "var(--surface, #F8F3E8)";
const NOTICE_INK = "var(--ink-notice, #5c4a1f)"; // 안내문 글자 — 「주의」이지 --danger(「오류」)가 아니다
const MUTED_INK = "var(--ink-muted, #a59c8b)"; // 흐린 글자 — 로그 타임스탬프
/** 성사·도달 배경 — 기술 축 색의 옅은 단(배치6 유저 판정). 토큰을 안 늘리고 관계만 드러낸다. */
const REACHED = "color-mix(in srgb, var(--cat-skills) 11%, var(--surface-hi))";

const whoColor = { local: LOCAL, remote: REMOTE, sys: INK_2 } as const;

export default function LoopbackNegotiationDemo() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [insecure, setInsecure] = useState(false);
  const [running, setRunning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [echo, setEcho] = useState<string>("");
  const localPcRef = useRef<RTCPeerConnection | null>(null);
  const remotePcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    // API 존재 가드. RTCPeerConnection 자체는 secure context 전용이 아니므로(그 제약은
    // getUserMedia 같은 미디어 캡처 API에 걸린다) 여기서는 API 존재만 확인한다.
    // 보안 컨텍스트가 아니면 일부 환경에서 제한될 수 있어 경고만 따로 노출한다.
    const ok = typeof window !== "undefined" && typeof RTCPeerConnection !== "undefined";
    setSupported(ok);
    setInsecure(typeof window !== "undefined" && !(window.isSecureContext ?? false));
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function push(who: Log["who"], msg: string) {
    setLogs((prev) => [...prev, { t: new Date().toLocaleTimeString(), who, msg }]);
  }

  function cleanup() {
    try {
      channelRef.current?.close();
    } catch {
      /* noop */
    }
    try {
      localPcRef.current?.close();
    } catch {
      /* noop */
    }
    try {
      remotePcRef.current?.close();
    } catch {
      /* noop */
    }
    channelRef.current = null;
    localPcRef.current = null;
    remotePcRef.current = null;
  }

  async function start() {
    if (!supported) return;
    cleanup();
    setLogs([]);
    setConnected(false);
    setEcho("");
    setRunning(true);

    try {
      const localPc = new RTCPeerConnection();
      const remotePc = new RTCPeerConnection();
      localPcRef.current = localPc;
      remotePcRef.current = remotePc;

      // ICE 후보를 "시그널링 채널"인 척, 메모리로 상대에게 직접 전달(trickle).
      localPc.onicecandidate = (e) => {
        if (e.candidate) {
          push("local", `local → remote 로 ICE candidate 전달 (${e.candidate.type ?? "?"})`);
          remotePc.addIceCandidate(e.candidate).catch((err) => push("sys", `addIceCandidate 실패: ${err}`));
        }
      };
      remotePc.onicecandidate = (e) => {
        if (e.candidate) {
          push("remote", `remote → local 로 ICE candidate 전달 (${e.candidate.type ?? "?"})`);
          localPc.addIceCandidate(e.candidate).catch((err) => push("sys", `addIceCandidate 실패: ${err}`));
        }
      };

      localPc.oniceconnectionstatechange = () => {
        push("local", `iceConnectionState = ${localPc.iceConnectionState}`);
        if (localPc.iceConnectionState === "connected" || localPc.iceConnectionState === "completed") {
          setConnected(true);
        }
      };

      // 수신측은 datachannel 이벤트로 채널을 받는다.
      remotePc.ondatachannel = (e) => {
        const ch = e.channel;
        ch.onmessage = (m) => push("remote", `수신: "${m.data}"`);
        ch.onopen = () => {
          push("remote", "DataChannel open — 수신 준비 완료");
          // 받은 메시지를 그대로 되돌려주는 echo 역할은 위 onmessage에서 처리하고,
          // 여기서는 인사만 보낸다.
        };
      };

      // 발신측이 채널을 연다.
      const channel = localPc.createDataChannel("loopback");
      channelRef.current = channel;
      channel.onopen = () => {
        push("local", "DataChannel open — 양쪽 연결 성사!");
        setConnected(true);
      };
      channel.onmessage = (m) => setEcho(String(m.data));

      // 수신측이 받은 걸 그대로 되돌리도록 ondatachannel 안에서 echo를 건다.
      remotePc.ondatachannel = (e) => {
        const ch = e.channel;
        ch.onopen = () => push("remote", "DataChannel open — 수신 준비 완료");
        ch.onmessage = (m) => {
          push("remote", `수신: "${m.data}" → 그대로 echo`);
          try {
            ch.send(`echo: ${m.data}`);
          } catch (err) {
            push("sys", `echo 전송 실패: ${err}`);
          }
        };
      };

      // ---- Offer/Answer 협상 (createOffer → setLocal/Remote → createAnswer …) ----
      push("sys", "협상 시작: localPc.createOffer()");
      const offer = await localPc.createOffer();
      await localPc.setLocalDescription(offer);
      push("local", "setLocalDescription(offer) — have-local-offer");

      await remotePc.setRemoteDescription(offer);
      push("remote", "setRemoteDescription(offer) — have-remote-offer");

      const answer = await remotePc.createAnswer();
      await remotePc.setLocalDescription(answer);
      push("remote", "createAnswer → setLocalDescription(answer) — stable");

      await localPc.setRemoteDescription(answer);
      push("local", "setRemoteDescription(answer) — stable, 이제 ICE·DTLS 진행");
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name === "NotAllowedError") {
        push("sys", "NotAllowedError — 권한/보안 정책에 막혔습니다. HTTPS(보안 컨텍스트)인지 확인하세요.");
      } else {
        push("sys", `오류: ${e?.name ?? "Error"} — ${e?.message ?? String(err)}`);
      }
      setRunning(false);
    }
  }

  function sendPing() {
    const ch = channelRef.current;
    if (ch && ch.readyState === "open") {
      try {
        ch.send("ping");
        push("local", '송신: "ping"');
      } catch (err) {
        push("sys", `전송 실패: ${err}`);
      }
    }
  }

  function reset() {
    cleanup();
    setRunning(false);
    setConnected(false);
    setLogs([]);
    setEcho("");
  }

  if (supported === false) {
    return (
      <figure
        style={{
          margin: "2rem 0",
          padding: "var(--space-16)",
          border: `${HAIR} solid ${BORDER}`,
          borderRadius: "var(--radius-md)",
          background: PANEL,
        }}
      >
        <p style={{ margin: 0, color: DANGER, lineHeight: "var(--font-leading-ui)" }}>
          이 환경에서는 <code>RTCPeerConnection</code> API가 없어 실습을 띄울 수 없습니다.
        </p>
      </figure>
    );
  }

  return (
    <figure
      style={{
        margin: "2rem 0",
        padding: "var(--space-16)",
        border: `${HAIR} solid ${BORDER}`,
        borderRadius: "var(--radius-md)",
        background: PANEL,
      }}
    >
      <p style={{ margin: "0 0 var(--space-12, 12px)", fontWeight: "var(--font-weight-bold)", color: INK }}>
        한 탭 안에서 두 RTCPeerConnection이 협상하는 모습을 직접 돌려봅니다.
      </p>

      {insecure ? (
        <p
          style={{
            margin: "0 0 var(--space-12, 12px)",
            padding: "var(--space-8, 8px) var(--space-12, 12px)",
            border: `${HAIR} solid ${NOTICE}`,
            borderRadius: "var(--radius-sm)",
            background: NOTICE_BG,
            // 최근접 --cat-quality 가 Δ47.7 로 멀어 밀지 않고 --ink-notice 를 세웠다(KAN-072 배치7).
            color: NOTICE_INK,
            fontSize: "var(--text-meta)",
            lineHeight: "var(--font-leading-ui)",
          }}
        >
          참고: 지금 보안 컨텍스트(HTTPS/localhost)가 아닙니다. DataChannel-only 협상은 대개 동작하지만, 카메라·마이크가
          필요한 미디어 캡처(<code>getUserMedia</code>)는 보안 컨텍스트에서만 허용됩니다.
        </p>
      ) : null}

      <div style={{ display: "flex", gap: "var(--space-8)", flexWrap: "wrap", marginBottom: "var(--space-14)" }}>
        <button
          type="button"
          onClick={start}
          disabled={running && connected}
          style={{
            padding: "var(--space-8, 8px) var(--space-14, 14px)",
            border: `${HAIR} solid ${LOCAL}`,
            borderRadius: "var(--radius-sm)",
            background: REACHED,
            cursor: "pointer",
            color: INK,
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          협상 시작
        </button>
        <button
          type="button"
          onClick={sendPing}
          disabled={!connected}
          style={{
            padding: "var(--space-8, 8px) var(--space-14, 14px)",
            border: `${HAIR} solid ${BORDER}`,
            borderRadius: "var(--radius-sm)",
            background: connected ? PANEL : IDLE,
            cursor: connected ? "pointer" : "default",
            color: INK,
          }}
        >
          "ping" 보내기
        </button>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "var(--space-8, 8px) var(--space-14, 14px)",
            border: `${HAIR} solid ${BORDER}`,
            borderRadius: "var(--radius-sm)",
            background: PANEL,
            cursor: "pointer",
            color: INK,
          }}
        >
          초기화
        </button>
        <span style={{ alignSelf: "center", fontSize: "var(--text-meta)", color: connected ? LOCAL : INK_2 }}>
          상태: {connected ? "연결됨 ✅" : running ? "협상 중…" : "대기"}
        </span>
      </div>

      {echo ? (
        <p
          role="status"
          style={{
            margin: "0 0 var(--space-12, 12px)",
            padding: "var(--space-8, 8px) var(--space-12, 12px)",
            border: `${HAIR} solid ${LOCAL}`,
            borderRadius: "var(--radius-sm)",
            background: REACHED,
            color: INK,
          }}
        >
          echo 응답 수신: <strong>{echo}</strong> — 로컬 메모리만으로 1:1 채널이 양방향으로 열렸습니다.
        </p>
      ) : null}

      <div
        style={{
          maxHeight: 220,
          overflowY: "auto",
          border: `${HAIR} solid ${BORDER}`,
          borderRadius: "var(--radius-sm)",
          background: PANEL,
          padding: "var(--space-8, 8px) var(--space-10, 10px)",
          fontSize: "var(--text-label)",
          lineHeight: "var(--font-leading-ui)",
        }}
      >
        {logs.length === 0 ? (
          <p style={{ margin: 0, color: INK_2 }}>"협상 시작"을 누르면 단계별 로그가 여기 쌓입니다.</p>
        ) : (
          logs.map((l, idx) => (
            <div key={idx} style={{ color: whoColor[l.who] }}>
              {/* 최근접 --ink-3 이 Δ68 로 멀어 밀지 않고 --ink-muted 를 세웠다(KAN-072 배치7). */}
              <span style={{ color: MUTED_INK }}>{l.t}</span> [{l.who}] {l.msg}
            </div>
          ))
        )}
      </div>

      <figcaption style={{ fontSize: "var(--text-meta)", color: INK_2, marginTop: "var(--space-10)", lineHeight: "var(--font-leading-ui)" }}>
        이 실습은 <strong>협상 API 실습</strong>입니다. 같은 origin·같은 장비라 NAT/STUN/TURN 트래버설 문제는 재현하지
        못합니다(그건 위 시뮬레이션과 진단 절에서 다룹니다). 여기서 관찰할 것은 createOffer/Answer →
        setLocal/RemoteDescription → onicecandidate 교환 → 연결 성사로 이어지는 협상 절차 그 자체입니다. 이 데모는
        DataChannel만 쓰므로 카메라/마이크 권한이 필요 없습니다(<code>getUserMedia</code>의 보안 컨텍스트 제약과는 다른
        이야기입니다).
      </figcaption>
    </figure>
  );
}
