import { useState } from "react";

/**
 * kubelet 이 파드 하나(컨테이너 2개)를 띄울 때의 CRI 호출 순서를 단계 실행으로 보는 시뮬레이션.
 *
 * 관찰 목표
 *  - 샌드박스가 컨테이너보다 먼저 만들어진다.
 *  - 샌드박스가 네트워크와 IP 를 소유하고, 컨테이너는 그 안에 들어간다.
 *  - RuntimeService 와 ImageService 가 번갈아 불린다.
 *
 * pause 컨테이너는 RunPodSandbox 를 받은 런타임이 내부적으로 세우는 것이라
 * 별도의 CRI 호출 단계로 두지 않는다(본문 서술과 일치).
 */

type Svc = "RuntimeService" | "ImageService";

interface Step {
  call: string;
  svc: Svc;
  arg?: string;
  what: string;
  ifMissing: string;
}

const STEPS: Step[] = [
  {
    call: "RunPodSandbox",
    svc: "RuntimeService",
    what: "파드의 껍데기를 만듭니다. 네트워크 네임스페이스가 생기고 IP가 할당되며, 런타임이 내부적으로 pause 컨테이너를 세워 그 네임스페이스를 붙잡습니다.",
    ifMissing: "컨테이너를 넣을 곳이 없습니다. 파드 IP도, localhost 통신도 성립하지 않습니다.",
  },
  {
    call: "PullImage",
    svc: "ImageService",
    arg: "nginx",
    what: "레지스트리에서 이미지를 받습니다. 이미 노드에 있으면 건너뜁니다.",
    ifMissing: "실행할 파일시스템이 없어 컨테이너를 만들 수 없습니다.",
  },
  {
    call: "CreateContainer",
    svc: "RuntimeService",
    arg: "nginx",
    what: "샌드박스 안에 컨테이너를 만듭니다. 어느 샌드박스 소속인지가 함께 전달됩니다.",
    ifMissing: "컨테이너가 파드에 속하지 못하고 네트워크를 공유할 수 없습니다.",
  },
  {
    call: "StartContainer",
    svc: "RuntimeService",
    arg: "nginx",
    what: "만들어 둔 컨테이너의 프로세스를 시작합니다.",
    ifMissing: "컨테이너는 존재하지만 아무것도 실행되지 않습니다.",
  },
  {
    call: "PullImage",
    svc: "ImageService",
    arg: "log-agent",
    what: "두 번째 컨테이너의 이미지를 받습니다.",
    ifMissing: "사이드카를 만들 수 없습니다.",
  },
  {
    call: "CreateContainer",
    svc: "RuntimeService",
    arg: "log-agent",
    what: "같은 샌드박스에 두 번째 컨테이너를 만듭니다. 새 샌드박스를 만들지 않는 게 핵심입니다.",
    ifMissing: "사이드카가 앱과 같은 네트워크·IP를 쓸 수 없습니다.",
  },
  {
    call: "StartContainer",
    svc: "RuntimeService",
    arg: "log-agent",
    what: "두 번째 컨테이너를 시작합니다. 이제 파드가 완성됐습니다.",
    ifMissing: "사이드카가 뜨지 않아 로그 수집이 되지 않습니다.",
  },
];

const C = {
  paper: "#F3EEE4",
  surface: "#FBF8F1",
  cream: "#EDE6D8",
  border: "#d8d0be",
  ink: "#20264A",
  ink3: "#6f7390",
  accent: "#2B3FD4",
  accentTint: "#dfe3ff",
  pop: "#d8a33f",
  popTint: "#f0dca8",
  popInk: "#8a6313",
  teal: "#3e6b6b",
};

export default function CriCallTrace() {
  const [i, setI] = useState(0);

  const sandboxUp = i >= 0;
  const nginxUp = i >= 3;
  const nginxMade = i >= 2;
  const agentUp = i >= 6;
  const agentMade = i >= 5;

  const step = STEPS[i];
  const mono: React.CSSProperties = { fontFamily: "var(--font-code, monospace)" };

  const panel: React.CSSProperties = {
    border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface,
    padding: 12, minWidth: 0,
  };

  function box(label: string, made: boolean, up: boolean, sub?: string) {
    return (
      <div
        style={{
          ...mono, fontSize: 12, padding: "8px 10px", marginBottom: 6, borderRadius: 6,
          border: made ? `1px solid ${up ? C.pop : C.border}` : `1px dashed ${C.border}`,
          background: made ? (up ? C.popTint : "#fff") : "transparent",
          color: made ? C.ink : C.ink3,
        }}
      >
        {label}
        {sub && <span style={{ color: made ? C.popInk : C.ink3 }}> {sub}</span>}
        {!made && <span style={{ color: C.ink3 }}> (아직 없음)</span>}
        {made && !up && <span style={{ color: C.ink3 }}> · 생성됨, 미실행</span>}
      </div>
    );
  }

  return (
    <figure style={{ margin: "2rem 0", padding: 18, border: `1px solid ${C.border}`, borderRadius: 12, background: C.paper }}>
      {/* 컨트롤 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <button
          type="button" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}
          style={{ fontSize: 13, padding: "6px 14px", borderRadius: 999, border: `1px solid ${C.border}`, background: C.cream, color: C.ink, cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.45 : 1 }}
        >← 이전</button>
        <button
          type="button" onClick={() => setI((v) => Math.min(STEPS.length - 1, v + 1))} disabled={i === STEPS.length - 1}
          style={{ fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 999, border: `1px solid ${C.border}`, background: C.popTint, color: C.ink, cursor: i === STEPS.length - 1 ? "default" : "pointer", opacity: i === STEPS.length - 1 ? 0.45 : 1 }}
        >다음 단계 →</button>
        <button
          type="button" onClick={() => setI(0)}
          style={{ fontSize: 13, padding: "6px 14px", borderRadius: 999, border: `1px solid ${C.border}`, background: "#fffdf8", color: C.ink, cursor: "pointer" }}
        >처음으로</button>
        <span style={{ ...mono, fontSize: 12.5, color: C.ink3, marginLeft: 4 }}>{i + 1} / {STEPS.length}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {/* 좌: 호출 로그 */}
        <div style={panel}>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: C.ink }}>kubelet 의 CRI 호출</p>
          {STEPS.map((s, n) => {
            const on = n === i;
            const done = n < i;
            return (
              <button
                key={`${s.call}-${n}`}
                type="button"
                onClick={() => setI(n)}
                aria-current={on ? "step" : undefined}
                style={{
                  ...mono, display: "block", width: "100%", textAlign: "left",
                  fontSize: 11.5, padding: "6px 8px", marginBottom: 4, borderRadius: 6,
                  border: on ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                  background: on ? C.accentTint : done ? C.cream : "#fffdf8",
                  color: on || done ? C.ink : C.ink3, cursor: "pointer",
                }}
              >
                <span style={{
                  fontSize: 9.5, padding: "1px 5px", borderRadius: 999, marginRight: 5,
                  background: s.svc === "ImageService" ? C.popTint : "#e4e8ff",
                  color: s.svc === "ImageService" ? C.popInk : C.accent,
                }}>
                  {s.svc === "ImageService" ? "Image" : "Runtime"}
                </span>
                {s.call}{s.arg ? `(${s.arg})` : "()"}
              </button>
            );
          })}
        </div>

        {/* 우: 노드 상태 */}
        <div style={panel}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.ink }}>노드 위의 상태</p>
          <p style={{ margin: "0 0 10px", fontSize: 11.5, color: C.ink3 }}>점선 = 아직 만들어지지 않음</p>

          <div style={{
            border: sandboxUp ? `2px solid ${C.teal}` : `1px dashed ${C.border}`,
            borderRadius: 8, padding: 10, background: sandboxUp ? "#eef4f3" : "transparent",
          }}>
            <div style={{ ...mono, fontSize: 11.5, color: sandboxUp ? C.teal : C.ink3, marginBottom: 8, fontWeight: 700 }}>
              PodSandbox {sandboxUp ? "· IP 10.244.1.7" : "(아직 없음)"}
              {sandboxUp && <div style={{ fontWeight: 400, color: C.ink3, marginTop: 2 }}>pause 가 네임스페이스를 붙잡는 중</div>}
            </div>
            {box("nginx", nginxMade, nginxUp)}
            {box("log-agent", agentMade, agentUp)}
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div role="status" style={{ marginTop: 12, padding: 11, borderRadius: 8, background: "#fffdf8", border: `1px solid ${C.border}` }}>
        <p style={{ margin: "0 0 6px", fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>
          <strong style={mono}>{step.call}</strong> — {step.what}
        </p>
        <p style={{ margin: 0, fontSize: 12.5, color: C.popInk, lineHeight: 1.6 }}>
          이 단계가 없으면: {step.ifMissing}
        </p>
      </div>

      <figcaption style={{ fontSize: 13, color: C.ink3, marginTop: 10, lineHeight: 1.6 }}>
        <strong>1단계에서 이미 IP가 붙는 것</strong>을 보세요. 컨테이너는 하나도 없는데 파드는 벌써 주소를 가집니다.
        그리고 6단계에서 두 번째 컨테이너가 <strong>새 샌드박스를 만들지 않고</strong> 기존 샌드박스에 들어가는 것도요 —
        두 컨테이너가 같은 IP를 쓰는 이유가 여기 있습니다.
      </figcaption>
    </figure>
  );
}
