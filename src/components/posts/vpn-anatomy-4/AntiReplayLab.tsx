import { useState } from "react";

/**
 * ESP anti-replay 슬라이딩 윈도우 실습.
 * RFC 4303 §3.4.3의 전통 방식(윈도우 우측 가장자리 + 수신 비트맵 + 시프트)을 그대로 모사한다.
 * 누적 시프트 횟수를 세어 RFC 6479가 지적한 "정상 순서 패킷마다 시프트"의 비용을 눈으로 보게 한다.
 */

const INK = "#20264A";
const PAPER = "#F3EEE4";
const CORE = "#4E6CA8";
const ACCENT = "#D8A33F";
const DANGER = "#A84B4B";
const OK = "#3E6B4F";
const MUTED = "#6b6357";

type Verdict = {
  tone: "accept" | "reject";
  color: string;
  text: string;
};

/**
 * 초기 상태는 "이미 한참 돌아가고 있는 터널"로 잡는다.
 * 윈도우를 시퀀스 1에서 시작하면 왼쪽 밖이 존재하지 않아
 * "너무 오래된 패킷" 거부를 아예 재현할 수 없다.
 */
function initialState(size: number) {
  const right = size * 2;
  const left = right - size + 1;
  const seen: number[] = [];
  // 순서가 뒤바뀌어 아직 안 온 두 칸(빈칸)을 남겨 둔다.
  const holes = new Set([right - 3, right - 7]);
  for (let s = left; s <= right; s += 1) if (!holes.has(s)) seen.push(s);
  return { right, left, seen };
}

export default function AntiReplayLab() {
  const [size, setSize] = useState(16); // 윈도우 크기(비트)
  const init = initialState(16);
  const [right, setRight] = useState(init.right); // 윈도우 우측 가장자리 = 검증된 최고 시퀀스
  const [seen, setSeen] = useState<number[]>(init.seen);
  const [shifts, setShifts] = useState(0); // 누적 비트시프트 횟수
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [input, setInput] = useState(String(init.right + 1));

  const left = Math.max(1, right - size + 1);
  const cells: number[] = [];
  for (let s = left; s <= right; s += 1) cells.push(s);
  const firstHole = cells.find((s) => !seen.includes(s));

  function reset(nextSize = size) {
    const next = initialState(nextSize);
    setSize(nextSize);
    setRight(next.right);
    setSeen(next.seen);
    setShifts(0);
    setVerdict(null);
    setInput(String(next.right + 1));
  }

  function receive(seq: number) {
    if (!Number.isFinite(seq) || seq < 1) {
      setVerdict({ tone: "reject", color: DANGER, text: "시퀀스 번호는 1부터 셉니다(SA 수립 시 0으로 두고 첫 패킷이 1)." });
      return;
    }
    if (seq > right) {
      // 윈도우를 오른쪽으로 민다 — 여기서 비트시프트가 일어난다.
      const moved = seq - right;
      const nextLeft = Math.max(1, seq - size + 1);
      setSeen((prev) => [...prev.filter((s) => s >= nextLeft), seq]);
      setRight(seq);
      setShifts((n) => n + moved);
      setVerdict({
        tone: "accept",
        color: OK,
        text: `수락 — 윈도우를 ${moved}칸 밀었습니다(비트시프트 ${moved}회). 새 우측 가장자리 = ${seq}.`,
      });
      setInput(String(seq + 1));
      return;
    }
    if (seq < left) {
      setVerdict({
        tone: "reject",
        color: DANGER,
        text: `거부 — 윈도우 왼쪽(${left}) 밖입니다. 너무 오래된 패킷은 이력이 남아 있지 않아 무조건 버립니다.`,
      });
      return;
    }
    if (seen.includes(seq)) {
      setVerdict({
        tone: "reject",
        color: DANGER,
        text: `거부 — 이미 받은 번호입니다(재전송 또는 재생 공격). 윈도우는 움직이지 않습니다.`,
      });
      return;
    }
    setSeen((prev) => [...prev, seq]);
    setVerdict({
      tone: "accept",
      color: OK,
      text: `수락 — 윈도우 안의 빈칸을 채웠습니다(순서가 뒤바뀌어 늦게 온 패킷). 윈도우는 그대로.`,
    });
  }

  const btn: React.CSSProperties = {
    fontSize: 13,
    padding: "6px 10px",
    borderRadius: 6,
    border: `1px solid ${INK}33`,
    background: "#fff",
    color: INK,
    cursor: "pointer",
  };

  return (
    <figure style={{ margin: "1.75rem 0", padding: 16, background: PAPER, border: `1px solid ${INK}22`, borderRadius: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: INK, fontWeight: 600 }}>
          윈도우 크기{" "}
          <select
            value={size}
            onChange={(e) => reset(Number(e.target.value))}
            style={{ fontSize: 13, padding: "4px 6px", borderRadius: 6, border: `1px solid ${INK}33` }}
          >
            <option value={8}>8비트</option>
            <option value={16}>16비트</option>
            <option value={32}>32비트 (RFC 4303 최소)</option>
            <option value={64}>64비트 (권장)</option>
          </select>
        </label>
        <label style={{ fontSize: 13, color: INK, fontWeight: 600 }}>
          받을 시퀀스{" "}
          <input
            type="number"
            min={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: 84, fontSize: 13, padding: "4px 6px", borderRadius: 6, border: `1px solid ${INK}33` }}
          />
        </label>
        <button type="button" style={{ ...btn, background: CORE, color: "#fff", borderColor: CORE }} onClick={() => receive(Number(input))}>
          수신
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <button type="button" style={btn} onClick={() => receive(right + 1)}>
          다음 순번 ({right + 1})
        </button>
        <button type="button" style={btn} onClick={() => receive(right + 5)}>
          5칸 건너뛰기 ({right + 5})
        </button>
        <button type="button" style={btn} onClick={() => receive(right)}>
          직전 패킷 재전송 ({right})
        </button>
        <button
          type="button"
          style={{ ...btn, opacity: firstHole ? 1 : 0.45, cursor: firstHole ? "pointer" : "not-allowed" }}
          disabled={!firstHole}
          onClick={() => firstHole && receive(firstHole)}
          title={firstHole ? "윈도우 안의 빈칸을 채운다" : "지금은 윈도우에 빈칸이 없습니다"}
        >
          늦게 온 빈칸 채우기 {firstHole ? `(${firstHole})` : "(없음)"}
        </button>
        <button type="button" style={btn} onClick={() => receive(Math.max(1, left - 3))}>
          아주 오래된 패킷 ({Math.max(1, left - 3)})
        </button>
        <button type="button" style={btn} onClick={() => reset()}>
          초기화
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 10 }}>
        {cells.map((s) => {
          const got = seen.includes(s);
          const isRight = s === right;
          return (
            <div
              key={s}
              title={`시퀀스 ${s} — ${got ? "수신 기록 있음" : "빈칸"}`}
              style={{
                width: 26,
                height: 34,
                borderRadius: 4,
                border: `1px solid ${isRight ? ACCENT : INK + "44"}`,
                borderWidth: isRight ? 2 : 1,
                background: got ? CORE : "#fff",
                color: got ? "#fff" : MUTED,
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {s}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 13, color: INK, lineHeight: 1.8 }}>
        <span style={{ marginRight: 14 }}>
          윈도우: <strong>[{left} … {right}]</strong>
        </span>
        <span style={{ marginRight: 14 }}>
          우측 가장자리(검증된 최고 시퀀스): <strong>{right}</strong>
        </span>
        <span>
          누적 비트시프트: <strong style={{ color: shifts > 0 ? ACCENT : MUTED }}>{shifts}회</strong>
        </span>
      </div>

      {verdict && (
        <p
          style={{
            marginTop: 10,
            marginBottom: 0,
            padding: "8px 10px",
            borderRadius: 6,
            fontSize: 13,
            lineHeight: 1.7,
            color: verdict.color,
            background: `${verdict.color}12`,
            border: `1px solid ${verdict.color}44`,
          }}
        >
          {verdict.text}
        </p>
      )}

      <figcaption style={{ fontSize: 13, color: MUTED, marginTop: 12, lineHeight: 1.75 }}>
        파란 칸 = 이미 받은 시퀀스, 금색 테두리 = 윈도우 우측 가장자리. "다음 순번"을 계속 누르면 패킷 하나마다 시프트가 1회씩
        쌓입니다 — RFC 6479가 없애려 한 비용이 바로 이 숫자입니다. (여기 들어오는 패킷은 모두 무결성 검증을 통과했다고 가정합니다.
        실제 구현은 검증에 성공한 뒤에만 이 윈도우를 갱신합니다.)
      </figcaption>
    </figure>
  );
}
