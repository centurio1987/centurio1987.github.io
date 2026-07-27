import { useState } from "react";

/**
 * OCI 이미지의 content-addressable 참조 사슬을 클릭으로 따라가는 시뮬레이션.
 *
 * 관찰 목표
 *  - index → manifest → config/layers 가 Descriptor(mediaType+digest+size)로 다음을 가리킨다.
 *  - blobs/ 안에서는 전부 해시 이름의 파일일 뿐이고, 정체는 mediaType 이 알려준다.
 *
 * 다이제스트·크기는 모두 OCI image-spec 문서의 예시 값(image-index.md / manifest.md)이다.
 */

type View = "index" | "manifest" | "config" | "layer0" | "layer1" | "layer2";
type Platform = "amd64" | "ppc64le";

const MT = {
  index: "application/vnd.oci.image.index.v1+json",
  manifest: "application/vnd.oci.image.manifest.v1+json",
  config: "application/vnd.oci.image.config.v1+json",
  layer: "application/vnd.oci.image.layer.v1.tar+gzip",
} as const;

const PLATFORM_MANIFEST: Record<Platform, { digest: string; size: number; label: string }> = {
  amd64: {
    digest: "sha256:5b0bcabd1ed22e9fb1310cf6c2dec7cdef19f0ad69efa1f392e94a4333501270",
    size: 7682,
    label: "linux/amd64",
  },
  ppc64le: {
    digest: "sha256:e692418e4cbaf90ca69d05a66403747baa33ee08806650b51fab815ad7fc331f",
    size: 7143,
    label: "linux/ppc64le",
  },
};

const CONFIG = {
  digest: "sha256:b5b2b2c507a0944348e0303114d8d93aaaa081732b86451d9bce1f432a537bc7",
  size: 7023,
};

const LAYERS = [
  { digest: "sha256:9834876dcfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0", size: 32654 },
  { digest: "sha256:3c3a4604a545cdc127456d94e421cd355bca5b528f4a9c1905b15da2eb4a4c6b", size: 16724 },
  { digest: "sha256:ec4b8955958665577945c89419d1af06b5f7636b4ac3da7f12184802ad867736", size: 73109 },
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
};

function short(d: string): string {
  return d.replace("sha256:", "").slice(0, 12);
}

export default function DigestChain() {
  const [platform, setPlatform] = useState<Platform>("amd64");
  const [view, setView] = useState<View>("index");

  const pm = PLATFORM_MANIFEST[platform];

  /** 현재 보고 있는 blob 의 다이제스트. index.json 은 blobs/ 밖의 진입점이라 없다. */
  const activeDigest =
    view === "index" ? null
    : view === "manifest" ? pm.digest
    : view === "config" ? CONFIG.digest
    : LAYERS[Number(view.replace("layer", ""))].digest;

  const crumbs: string[] =
    view === "index" ? ["index.json"]
    : view === "manifest" ? ["index.json", "manifest"]
    : view === "config" ? ["index.json", "manifest", "config"]
    : ["index.json", "manifest", `layer ${Number(view.replace("layer", "")) + 1}`];

  const blobs = [
    { digest: pm.digest, mt: MT.manifest, what: `매니페스트 (${pm.label})` },
    { digest: CONFIG.digest, mt: MT.config, what: "이미지 설정" },
    ...LAYERS.map((l, i) => ({ digest: l.digest, mt: MT.layer, what: `레이어 ${i + 1}` })),
  ];

  const note =
    view === "index"
      ? "인덱스는 플랫폼별 매니페스트를 가리킵니다. 고르는 주체는 레지스트리가 아니라 받는 쪽입니다."
      : view === "manifest"
        ? "매니페스트는 설정 하나와 레이어 여럿을 Descriptor 로 가리킵니다. 아래에서 하나를 눌러 보세요."
        : view === "config"
          ? "이미지 설정입니다. 레이어 순서와 Env·Cmd 가 여기 있고, Conversion 때 config.json 의 process 로 옮겨집니다."
          : "레이어입니다. 실제로는 압축된 tar 이고, 이 다이제스트는 압축된 파일의 해시(DiffID 와 다름)입니다.";

  const panel: React.CSSProperties = {
    border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface,
    padding: 12, minWidth: 0,
  };
  const mono: React.CSSProperties = { fontFamily: "var(--font-code, monospace)" };

  function navBtn(label: string, to: View, sub: string) {
    return (
      <button
        key={to}
        type="button"
        onClick={() => setView(to)}
        style={{
          ...mono, display: "block", width: "100%", textAlign: "left",
          fontSize: 12.5, padding: "7px 9px", marginBottom: 6, borderRadius: 6,
          border: `1px solid ${C.border}`, background: "#fffdf8", color: C.ink, cursor: "pointer",
        }}
      >
        {label} <span style={{ color: C.ink3 }}>{sub}</span>
      </button>
    );
  }

  return (
    <figure style={{ margin: "2rem 0", padding: 18, border: `1px solid ${C.border}`, borderRadius: 12, background: C.paper }}>
      {/* 플랫폼 탭 */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginRight: 8 }}>플랫폼</span>
        {(Object.keys(PLATFORM_MANIFEST) as Platform[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => { setPlatform(p); setView("index"); }}
            aria-pressed={platform === p}
            style={{
              ...mono, fontSize: 12.5, padding: "5px 10px", marginRight: 6, borderRadius: 999,
              border: platform === p ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
              background: platform === p ? C.accentTint : "#fffdf8", color: C.ink, cursor: "pointer",
            }}
          >
            {PLATFORM_MANIFEST[p].label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
        {/* 좌: 현재 위치 */}
        <div style={panel}>
          <p style={{ ...mono, margin: "0 0 10px", fontSize: 12, color: C.ink3 }}>
            {crumbs.map((c, i) => (
              <span key={c}>
                {i > 0 && <span style={{ color: C.border }}> › </span>}
                <span style={{ color: i === crumbs.length - 1 ? C.ink : C.ink3, fontWeight: i === crumbs.length - 1 ? 700 : 400 }}>{c}</span>
              </span>
            ))}
          </p>

          <div style={{ ...mono, fontSize: 12, background: C.cream, borderRadius: 6, padding: 9, lineHeight: 1.7 }}>
            {activeDigest === null ? (
              <>
                <div><span style={{ color: C.ink3 }}>mediaType </span>…index.v1+json</div>
                <div style={{ color: C.ink3 }}>index.json 은 레이아웃 루트의 진입점이라</div>
                <div style={{ color: C.ink3 }}>blobs/ 안에 있지 않습니다</div>
              </>
            ) : (
              <>
                <div><span style={{ color: C.ink3 }}>mediaType </span>{blobs.find((b) => b.digest === activeDigest)?.mt.replace("application/vnd.oci.image.", "…")}</div>
                <div><span style={{ color: C.ink3 }}>digest </span>{short(activeDigest)}…</div>
                <div><span style={{ color: C.ink3 }}>size </span>
                  {view === "manifest" ? pm.size
                    : view === "config" ? CONFIG.size
                    : LAYERS[Number(view.replace("layer", ""))].size}
                </div>
              </>
            )}
          </div>

          <p style={{ margin: "12px 0 6px", fontSize: 12, fontWeight: 700, color: C.ink }}>가리키는 곳</p>
          {view === "index" && navBtn(`→ manifest`, "manifest", `${pm.label}`)}
          {view === "manifest" && (
            <>
              {navBtn("→ config", "config", `${CONFIG.size}B`)}
              {LAYERS.map((l, i) => navBtn(`→ layer ${i + 1}`, `layer${i}` as View, `${l.size}B`))}
            </>
          )}
          {(view === "config" || view.startsWith("layer")) && (
            <p style={{ fontSize: 12, color: C.ink3, margin: 0 }}>
              여기가 사슬의 끝입니다. 실제 내용(blob)이에요.
            </p>
          )}
          {view !== "index" && (
            <button
              type="button"
              onClick={() => setView("index")}
              style={{ marginTop: 10, fontSize: 12.5, padding: "5px 12px", borderRadius: 999, border: `1px solid ${C.border}`, background: C.cream, color: C.ink, cursor: "pointer" }}
            >
              처음으로
            </button>
          )}
        </div>

        {/* 우: blobs 디렉터리 */}
        <div style={panel}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.ink }}>blobs/sha256/</p>
          <p style={{ margin: "0 0 10px", fontSize: 11.5, color: C.ink3, lineHeight: 1.45 }}>
            디스크에는 해시 이름만 있습니다
          </p>
          {blobs.map((b) => {
            const on = b.digest === activeDigest;
            return (
              <div
                key={b.digest}
                style={{
                  ...mono, fontSize: 12, padding: "6px 8px", marginBottom: 5, borderRadius: 6,
                  background: on ? C.popTint : "#fff",
                  border: `1px solid ${on ? C.pop : C.border}`,
                  color: on ? C.ink : C.ink3,
                }}
              >
                {short(b.digest)}…
                {on && (
                  <div style={{ fontSize: 10.5, color: C.popInk, marginTop: 3 }}>
                    {b.mt}
                    <br />= {b.what}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: C.ink, lineHeight: 1.6 }}>
        {note}
      </p>

      <figcaption style={{ fontSize: 13, color: C.ink3, marginTop: 10, lineHeight: 1.6 }}>
        플랫폼을 바꾸면 <strong>매니페스트 다이제스트가 달라지는 것</strong>을 보세요. 그리고 오른쪽 목록에서
        선택하지 않은 blob은 <strong>해시 이름밖에 안 보입니다</strong> — 정체를 알려주는 건 가리키는 쪽의 <code>mediaType</code>입니다.
        다이제스트·크기는 OCI image-spec 문서의 예시 값입니다.
      </figcaption>
    </figure>
  );
}
