import { useState } from "react";

/**
 * OverlayFS 3층(lowerdir / upperdir / merged)을 눌러보며
 * copy_up 과 whiteout 을 관찰하는 시뮬레이션.
 *
 * 관찰 목표
 *  - 쓰기: lowerdir 에만 있던 파일은 통째로 upperdir 로 복사된다(copy_up) → 컨테이너 레이어 사용량이 뛴다.
 *  - 삭제: lowerdir 원본은 남고, upperdir 에 whiteout(캐릭터 디바이스 0/0)이 생겨 merged 에서만 사라진다.
 */

type UpperState = "none" | "copy" | "own" | "whiteout";

interface FileModel {
  name: string;
  bytes: number;
  /** 이미지 레이어(lowerdir)에 원본이 있는가 */
  inLower: boolean;
  upper: UpperState;
  note: string;
}

const INITIAL: FileModel[] = [
  { name: "app.log", bytes: 1024 * 1024 * 1024, inLower: true, upper: "none", note: "이미지에 들어 있는 큰 파일" },
  { name: "secret.key", bytes: 4 * 1024, inLower: true, upper: "none", note: "이미지에 들어 있는 작은 파일" },
  { name: "new.txt", bytes: 8 * 1024, inLower: false, upper: "own", note: "컨테이너가 직접 만든 파일" },
];

/**
 * 시각 값은 토큰을 쓴다 (KAN-072-CPJCT1). fallback 은 tokens.css 값과 정확히 같다.
 *
 * `surface` 는 원래 #FBF8F1 이었다 — 같은 뜻(종이 흰색)에 값이 넷으로 갈려 있던 자리를
 * `--surface-hi` 한 단으로 모은다(tokens.css:6-11 의 실측 근거). ΔRGB 9.5.
 */
const C = {
  paper: "var(--paper, #F3EEE4)",
  surface: "var(--surface-hi, #fffdf8)",
  cream: "var(--cream, #EDE6D8)",
  border: "var(--border, #d8d0be)",
  ink: "var(--ink, #20264A)",
  ink3: "var(--ink-3, #6f7390)",
  accent: "var(--accent, #2B3FD4)",
  accentTint: "var(--accent-tint2, #dfe3ff)",
  pop: "var(--pop, #d8a33f)",
  popTint: "var(--pop-tint, #f0dca8)",
  popInk: "var(--pop-ink, #8a6313)",
  teal: "var(--cat-skills, #3e6b6b)",
};

const HAIR = "var(--stroke-hair, 1px)";
const BOLD = "var(--stroke-bold, 2px)";
/**
 * 코드 글꼴만 fallback 을 안 적는다 — `tokens.css` 는 전 페이지에 있어 fallback 이 뜰 일이
 * 없고, 스택을 베껴 두면 폰트가 바뀔 때 조용히 어긋난다(`global.css:88` 과 같은 표기).
 */
const MONO = "var(--font-code)";

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))}MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
}

/** merged 에서 보이는가 */
function isVisible(f: FileModel): boolean {
  if (f.upper === "whiteout") return false;
  return f.inLower || f.upper === "own" || f.upper === "copy";
}

export default function OverlayLab() {
  const [files, setFiles] = useState<FileModel[]>(INITIAL);
  const [selected, setSelected] = useState<string>("app.log");
  const [log, setLog] = useState<string[]>([]);

  const current = files.find((f) => f.name === selected) ?? files[0];

  const usedBytes = files.reduce(
    (sum, f) => sum + (f.upper === "copy" || f.upper === "own" ? f.bytes : 0),
    0,
  );

  function addLog(line: string) {
    setLog((prev) => [...prev.slice(-5), line]);
  }

  function update(name: string, patch: Partial<FileModel>) {
    setFiles((prev) => prev.map((f) => (f.name === name ? { ...f, ...patch } : f)));
  }

  function handleRead() {
    const f = current;
    if (!isVisible(f)) {
      addLog(`읽기 실패: ${f.name} — merged 에 없습니다(whiteout 으로 가려짐)`);
      return;
    }
    const from = f.upper === "copy" || f.upper === "own" ? "upperdir" : "lowerdir";
    addLog(`읽기: ${f.name} ← ${from} (복사 없음, 사용량 변화 없음)`);
  }

  function handleWrite() {
    const f = current;
    if (f.upper === "whiteout") {
      addLog(`쓰기 실패: ${f.name} — 삭제된 파일입니다. [초기화] 후 다시 해보세요`);
      return;
    }
    if (f.upper === "copy" || f.upper === "own") {
      addLog(`쓰기: ${f.name} → upperdir 사본에 직접 기록 (copy_up 없음, 사용량 그대로)`);
      return;
    }
    update(f.name, { upper: "copy" });
    addLog(`copy_up: ${f.name} (${formatSize(f.bytes)}) lowerdir → upperdir 전체 복사 · 사용량 +${formatSize(f.bytes)}`);
  }

  function handleDelete() {
    const f = current;
    if (f.upper === "whiteout") {
      addLog(`삭제 실패: ${f.name} — 이미 삭제된 상태입니다`);
      return;
    }
    if (!f.inLower) {
      update(f.name, { upper: "none" });
      addLog(`삭제: ${f.name} — upperdir 에만 있던 파일이라 그냥 지워집니다 · 사용량 −${formatSize(f.bytes)}`);
      return;
    }
    const freed = f.upper === "copy" ? ` · 사용량 −${formatSize(f.bytes)}` : "";
    update(f.name, { upper: "whiteout" });
    addLog(`삭제: ${f.name} — upperdir 에 whiteout(c 0,0) 생성. lowerdir 원본은 남아 있습니다${freed}`);
  }

  function handleReset() {
    setFiles(INITIAL);
    setSelected("app.log");
    setLog([]);
  }

  const colStyle: React.CSSProperties = {
    border: `${HAIR} solid ${C.border}`,
    borderRadius: 10,
    background: C.surface,
    padding: 12,
    minWidth: 0,
  };
  const colTitle: React.CSSProperties = {
    margin: "0 0 var(--space-2)", fontSize: 13, fontWeight: 700, color: C.ink,
  };
  const colHint: React.CSSProperties = {
    margin: "0 0 var(--space-10)", fontSize: 11.5, color: C.ink3, lineHeight: 1.45,
  };
  const rowBase: React.CSSProperties = {
    fontFamily: MONO, fontSize: 12.5,
    padding: "var(--space-6) var(--space-8)", borderRadius: 6, marginBottom: 5,
    border: `${HAIR} solid transparent`, lineHeight: 1.4,
  };

  return (
    <figure style={{ margin: "2rem 0", padding: 18, border: `${HAIR} solid ${C.border}`, borderRadius: 12, background: C.paper }}>
      {/* 파일 선택 */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginRight: 8 }}>파일</span>
        <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
          {files.map((f) => (
            <button
              key={f.name}
              type="button"
              onClick={() => setSelected(f.name)}
              aria-pressed={selected === f.name}
              style={{
                fontFamily: MONO, fontSize: 12.5,
                padding: "var(--space-4) var(--space-10)", borderRadius: 999, cursor: "pointer",
                border: selected === f.name ? `${BOLD} solid ${C.accent}` : `${HAIR} solid ${C.border}`,
                background: selected === f.name ? C.accentTint : C.surface,
                color: C.ink,
              }}
            >
              {f.name} <span style={{ color: C.ink3 }}>{formatSize(f.bytes)}</span>
            </button>
          ))}
        </span>
        <p style={{ margin: "var(--space-6) 0 0", fontSize: 12, color: C.ink3 }}>{current.note}</p>
      </div>

      {/* 연산 버튼 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        <button type="button" onClick={handleRead} style={btn(C.cream)}>읽기</button>
        <button type="button" onClick={handleWrite} style={btn(C.popTint)}>쓰기(append)</button>
        <button type="button" onClick={handleDelete} style={btn(C.cream)}>삭제</button>
        <button type="button" onClick={handleReset} style={btn(C.surface)}>초기화</button>
      </div>

      {/* 3열 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        <div style={colStyle}>
          <p style={colTitle}>lowerdir</p>
          <p style={colHint}>읽기 전용 이미지 레이어</p>
          {files.filter((f) => f.inLower).map((f) => (
            <div key={f.name} style={{ ...rowBase, background: C.cream, color: C.ink3 }}>
              {f.name}
              {f.upper === "whiteout" && (
                <span style={{ color: C.popInk }}> ← 남아 있음</span>
              )}
            </div>
          ))}
        </div>

        <div style={colStyle}>
          <p style={colTitle}>upperdir</p>
          <p style={colHint}>쓰기 가능한 컨테이너 레이어</p>
          {files.filter((f) => f.upper !== "none").length === 0 && (
            <div style={{ ...rowBase, color: C.ink3 }}>(비어 있음)</div>
          )}
          {files.filter((f) => f.upper !== "none").map((f) => (
            <div
              key={f.name}
              style={{
                ...rowBase,
                background: f.upper === "whiteout" ? C.surface : C.popTint,
                border: `${HAIR} solid ${f.upper === "whiteout" ? C.border : C.pop}`,
                color: C.ink,
              }}
            >
              {f.name}
              {f.upper === "whiteout" && (
                <span style={{ color: C.popInk }}> <strong>c 0, 0</strong></span>
              )}
              {f.upper === "copy" && <span style={{ color: C.popInk }}> ({formatSize(f.bytes)})</span>}
            </div>
          ))}
        </div>

        <div style={colStyle}>
          <p style={colTitle}>merged</p>
          <p style={colHint}>컨테이너가 보는 화면</p>
          {files.filter(isVisible).length === 0 && (
            <div style={{ ...rowBase, color: C.ink3 }}>(비어 있음)</div>
          )}
          {files.filter(isVisible).map((f) => (
            <div key={f.name} style={{ ...rowBase, background: C.surface, border: `${HAIR} solid ${C.border}`, color: C.ink }}>
              {f.name}
            </div>
          ))}
        </div>
      </div>

      {/* 사용량 */}
      <p role="status" style={{ margin: "var(--space-14) 0 0", fontSize: 13.5, color: C.ink }}>
        컨테이너 레이어 사용량:{" "}
        <strong style={{ fontFamily: MONO, color: usedBytes > 0 ? C.popInk : C.teal }}>
          {formatSize(usedBytes)}
        </strong>
      </p>

      {/* 로그 */}
      <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: C.surface, border: `${HAIR} solid ${C.border}`, minHeight: 52 }}>
        {log.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12.5, color: C.ink3 }}>
            파일을 고르고 <strong>읽기 → 쓰기 → 삭제</strong> 순으로 눌러 보세요.
          </p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.6, color: C.ink }}>
            {log.map((line, i) => (
              <li key={`${i}-${line}`} style={{ fontFamily: MONO }}>{line}</li>
            ))}
          </ul>
        )}
      </div>

      <figcaption style={{ fontSize: 13, color: C.ink3, marginTop: 10, lineHeight: 1.6 }}>
        <code>app.log</code>에 <strong>쓰기</strong>를 누르면 1.0GB가 통째로 upperdir로 올라오며 사용량이 뜁니다(copy_up).
        한 번 더 누르면 사용량은 그대로입니다. <code>secret.key</code>를 <strong>삭제</strong>하면 merged에서는 사라지지만
        lowerdir에는 원본이 남고, upperdir에는 <code>c 0, 0</code> 캐릭터 디바이스가 생깁니다.
      </figcaption>
    </figure>
  );
}

function btn(bg: string): React.CSSProperties {
  return {
    fontSize: 13, padding: "var(--space-6) var(--space-14)", borderRadius: 999, cursor: "pointer",
    border: `${HAIR} solid ${C.border}`, background: bg, color: C.ink, fontWeight: 600,
  };
}
