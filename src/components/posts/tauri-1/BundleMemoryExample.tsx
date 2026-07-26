// Tauri vs Electron 수치 대비 — 지표별 Comparison(magnitude) 2개.
// Statistics(평면 카드)는 시리즈(Tauri/Electron) 구분이 안 돼 지표별 좌우 대비로 교체.
// 면적이 값에 비례(magnitude). 예시 측정 1건이며 대표 절대치가 아님.
import VizFigure from "../../viz/VizFigure";
import { Comparison } from "@centurio1987/bbangto-ui-visualization";

export default function BundleMemoryExample() {
  return (
    <>
      <VizFigure caption={"번들 크기(MB) — Tauri 8.6 vs Electron 244. 면적이 값에 비례. 예시 측정 1건(gethopp.app 벤치, 2025-04, macOS, N=1) — 앱·환경에 따라 달라지는 예시치."}>
        <Comparison
          accessible="img"
          title={"번들 크기 대비: Tauri vs Electron (예시 측정, MB)"}
          desc={"Tauri 8.6MB vs Electron 244MB — 사각형 면적이 값에 비례."}
          viewBox="0 0 620 320"
          mode="magnitude"
          data={{
            left: { label: "Tauri (8.6 MB)", value: 8.6 },
            right: { label: "Electron (244 MB)", value: 244 },
          }}
        />
      </VizFigure>
      <VizFigure caption={"메모리 사용량(창 6개, MB) — Tauri 172 vs Electron 409. 면적이 값에 비례. 같은 벤치의 예시 측정."}>
        <Comparison
          accessible="img"
          title={"메모리 사용량 대비(창 6개): Tauri vs Electron (예시 측정, MB)"}
          desc={"Tauri 172MB vs Electron 409MB — 사각형 면적이 값에 비례."}
          viewBox="0 0 620 320"
          mode="magnitude"
          data={{
            left: { label: "Tauri (172 MB)", value: 172 },
            right: { label: "Electron (409 MB)", value: 409 },
          }}
        />
      </VizFigure>
    </>
  );
}
