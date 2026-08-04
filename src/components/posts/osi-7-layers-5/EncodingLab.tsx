import { useState } from "react";

// 같은 글자가 어떤 byte로 표현되는지(UTF-8), 그리고 그 byte를 엉뚱한 charset으로
// 읽으면 어떻게 깨지는지(mojibake)를 직접 본다. L6 '표현'의 핵심 데모.
// 브라우저 API(TextEncoder)에 의존하지 않도록 순수 JS로 인코딩한다(SSR 안전).

const TEAL = "#3e6b6b";

const PRESETS = ["café", "안녕 한글", "résumé", "I ♥ UTF-8", "😀 emoji"];

// 문자열 → UTF-8 byte 배열 (code point 기준 수동 인코딩)
function toUtf8Bytes(str: string): number[] {
  const out: number[] = [];
  for (const ch of str) {
    let cp = ch.codePointAt(0)!;
    if (cp < 0x80) {
      out.push(cp);
    } else if (cp < 0x800) {
      out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f)
      );
    }
  }
  return out;
}

// byte 배열을 Latin-1(ISO-8859-1)로 잘못 읽었을 때의 문자열 = mojibake
function asLatin1(bytes: number[]): string {
  return bytes.map((b) => String.fromCharCode(b)).join("");
}

const hex = (b: number) => b.toString(16).padStart(2, "0").toUpperCase();

export default function EncodingLab() {
  const [text, setText] = useState("café");

  const cps = [...text]; // code point 단위
  const bytes = toUtf8Bytes(text);
  const mojibake = asLatin1(bytes);

  return (
    <figure
      style={{
        margin: "2rem 0",
        padding: 18,
        border: "1px solid #d7d0c2",
        borderRadius: 12,
        background: "#fbf8f1",
      }}
    >
      <p style={{ margin: "0 0 12px", fontWeight: 600, color: "#302d28" }}>
        글자를 입력하면 UTF-8이 그것을 어떤 <strong>byte</strong>로 표현하는지, 그리고 그 byte를
        엉뚱한 charset으로 읽으면 어떻게 <strong>깨지는지</strong> 보여 줍니다.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => setText(p)}
            style={{
              padding: "4px 10px",
              fontSize: 13,
              border: "1px solid #c9c1b1",
              borderRadius: 14,
              background: text === p ? "#e5f0ed" : "#fffdf8",
              color: "#302d28",
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        aria-label="인코딩할 텍스트"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "8px 10px",
          fontSize: 15,
          border: "1px solid #c9c1b1",
          borderRadius: 8,
          marginBottom: 14,
        }}
      />

      <div style={{ display: "grid", gap: 10 }}>
        <Row label="글자 수 vs byte 수">
          <strong style={{ color: TEAL }}>{cps.length}</strong> 글자 →{" "}
          <strong style={{ color: "#9a5b2c" }}>{bytes.length}</strong> byte
          {bytes.length !== cps.length && (
            <span style={{ color: "#6b6357", fontSize: 12 }}>
              {" "}
              — 한 글자가 1byte가 아닐 수 있다
            </span>
          )}
        </Row>

        <Row label="UTF-8 byte (hex)">
          <code style={{ fontFamily: "monospace", fontSize: 13, wordBreak: "break-all" }}>
            {bytes.length ? bytes.map(hex).join(" ") : "—"}
          </code>
        </Row>

        <Row label="이 byte를 Latin-1로 잘못 읽으면">
          <code
            style={{
              fontFamily: "monospace",
              fontSize: 15,
              color: "#9a5b2c",
              wordBreak: "break-all",
            }}
          >
            {mojibake || "—"}
          </code>
          <span style={{ color: "#6b6357", fontSize: 12 }}> ← 글자 깨짐(mojibake)</span>
        </Row>
      </div>

      <figcaption style={{ fontSize: 13, color: "#6b6357", marginTop: 14 }}>
        <code>café</code>의 <code>é</code>는 UTF-8에서 2byte(<code>C3 A9</code>)인데, 이걸 Latin-1로
        읽으면 그 2byte가 각각 한 글자가 돼 <code>café</code>가 <code>cafÃ©</code>로 깨집니다. 바로 이
        “byte는 같은데 해석이 달라 뜻이 어긋나는” 문제를 막는 게 L6의 일이고, 그래서 HTML·HTTP는{" "}
        <code>charset=utf-8</code>을 명시합니다. (실무의 깨짐은 Latin-1보다 Windows-1252인 경우가 많지만
        원리는 같습니다.)
      </figcaption>
    </figure>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(120px, 200px) 1fr",
        gap: 10,
        alignItems: "baseline",
        padding: "8px 10px",
        border: "1px solid #c9c1b1",
        borderRadius: 8,
        background: "#fffdf8",
      }}
    >
      <span style={{ fontSize: 12.5, color: "#6b6357", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 14, color: "#302d28" }}>{children}</span>
    </div>
  );
}
