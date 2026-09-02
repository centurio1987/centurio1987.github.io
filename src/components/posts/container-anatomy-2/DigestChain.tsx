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
};

const HAIR = "var(--stroke-hair, 1px)";
const BOLD = "var(--stroke-bold, 2px)";
/**
 * 코드 글꼴만 fallback 을 안 적는다 — `tokens.css` 는 전 페이지에 있어 fallback 이 뜰 일이
 * 없고, 스택을 베껴 두면 폰트가 바뀔 때 조용히 어긋난다(`global.css:88` 과 같은 표기).
 */
const MONO = "var(--font-code)";

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
    border: `${HAIR} solid ${C.border}`, borderRadius: "var(--radius-sm)", background: C.surface,
    padding: "var(--space-12)", minWidth: 0,
  };
  const mono: React.CSSProperties = { fontFamily: MONO };

  function navBtn(label: string, to: View, sub: string) {
    return (
      <button
        key={to}
        type="button"
        onClick={() => setView(to)}
        style={{
          ...mono, display: "block", width: "100%", textAlign: "left",
          fontSize: "var(--text-label)", padding: "var(--space-6) var(--space-8)", marginBottom: "var(--space-6)", borderRadius: "var(--radius-sm)",
          border: `${HAIR} solid ${C.border}`, background: C.surface, color: C.ink, cursor: "pointer",
        }}
      >
        {label} <span style={{ color: C.ink3 }}>{sub}</span>
      </button>
    );
  }

  return (
    <figure style={{ margin: "2rem 0", padding: "var(--space-16)", border: `${HAIR} solid ${C.border}`, borderRadius: "var(--radius-md)", background: C.paper }}>
      {/* 플랫폼 탭 */}
      <div style={{ marginBottom: "var(--space-12)" }}>
        <span style={{ fontSize: "var(--text-meta)", fontWeight: "var(--font-weight-bold)", color: C.ink, marginRight: "var(--space-8)" }}>플랫폼</span>
        {(Object.keys(PLATFORM_MANIFEST) as Platform[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => { setPlatform(p); setView("index"); }}
            aria-pressed={platform === p}
            style={{
              ...mono, fontSize: "var(--text-label)", padding: "var(--space-4) var(--space-10)", marginRight: "var(--space-6)", borderRadius: "var(--btn-radius)",
              border: platform === p ? `${BOLD} solid ${C.accent}` : `${HAIR} solid ${C.border}`,
              background: platform === p ? C.accentTint : C.surface, color: C.ink, cursor: "pointer",
            }}
          >
            {PLATFORM_MANIFEST[p].label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "var(--space-10)" }}>
        {/* 좌: 현재 위치 */}
        <div style={panel}>
          <p style={{ ...mono, margin: "0 0 var(--space-10)", fontSize: "var(--text-label)", color: C.ink3 }}>
            {crumbs.map((c, i) => (
              <span key={c}>
                {i > 0 && <span style={{ color: C.border }}> › </span>}
                <span style={{ color: i === crumbs.length - 1 ? C.ink : C.ink3, fontWeight: i === crumbs.length - 1 ? "var(--font-weight-bold)" : "var(--font-weight-regular)" }}>{c}</span>
              </span>
            ))}
          </p>

          <div style={{ ...mono, fontSize: "var(--text-label)", background: C.cream, borderRadius: "var(--radius-sm)", padding: "var(--space-8)", lineHeight: "var(--font-leading-read)" }}>
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

          <p style={{ margin: "var(--space-12) 0 var(--space-6)", fontSize: "var(--text-label)", fontWeight: "var(--font-weight-bold)", color: C.ink }}>가리키는 곳</p>
          {view === "index" && navBtn(`→ manifest`, "manifest", `${pm.label}`)}
          {view === "manifest" && (
            <>
              {navBtn("→ config", "config", `${CONFIG.size}B`)}
              {LAYERS.map((l, i) => navBtn(`→ layer ${i + 1}`, `layer${i}` as View, `${l.size}B`))}
            </>
          )}
          {(view === "config" || view.startsWith("layer")) && (
            <p style={{ fontSize: "var(--text-label)", color: C.ink3, margin: 0 }}>
              여기가 사슬의 끝입니다. 실제 내용(blob)이에요.
            </p>
          )}
          {view !== "index" && (
            <button
              type="button"
              onClick={() => setView("index")}
              style={{ marginTop: "var(--space-10)", fontSize: "var(--text-label)", padding: "var(--space-4) var(--space-12)", borderRadius: "var(--btn-radius)", border: `${HAIR} solid ${C.border}`, background: C.cream, color: C.ink, cursor: "pointer" }}
            >
              처음으로
            </button>
          )}
        </div>

        {/* 우: blobs 디렉터리 */}
        <div style={panel}>
          <p style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-meta)", fontWeight: "var(--font-weight-bold)", color: C.ink }}>blobs/sha256/</p>
          <p style={{ margin: "0 0 var(--space-10)", fontSize: "var(--text-micro)", color: C.ink3, lineHeight: "var(--font-leading-sub)" }}>
            디스크에는 해시 이름만 있습니다
          </p>
          {blobs.map((b) => {
            const on = b.digest === activeDigest;
            return (
              <div
                key={b.digest}
                style={{
                  ...mono, fontSize: "var(--text-label)", padding: "var(--space-6) var(--space-8)", marginBottom: "var(--space-4)", borderRadius: "var(--radius-sm)",
                  background: on ? C.popTint : C.surface,
                  border: `${HAIR} solid ${on ? C.pop : C.border}`,
                  color: on ? C.ink : C.ink3,
                }}
              >
                {short(b.digest)}…
                {on && (
                  <div style={{ fontSize: "var(--text-nano)", color: C.popInk, marginTop: "var(--space-2)" }}>
                    {b.mt}
                    <br />= {b.what}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p role="status" style={{ margin: "var(--space-12) 0 0", fontSize: "var(--text-meta)", color: C.ink, lineHeight: "var(--font-leading-ui)" }}>
        {note}
      </p>

      <figcaption style={{ fontSize: "var(--text-meta)", color: C.ink3, marginTop: "var(--space-10)", lineHeight: "var(--font-leading-ui)" }}>
        플랫폼을 바꾸면 <strong>매니페스트 다이제스트가 달라지는 것</strong>을 보세요. 그리고 오른쪽 목록에서
        선택하지 않은 blob은 <strong>해시 이름밖에 안 보입니다</strong> — 정체를 알려주는 건 가리키는 쪽의 <code>mediaType</code>입니다.
        다이제스트·크기는 OCI image-spec 문서의 예시 값입니다.
      </figcaption>
    </figure>
  );
}
