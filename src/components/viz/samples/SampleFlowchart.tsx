/**
 * 액자 프레임 카탈로그(/design/viz-frames)용 샘플 — Flowchart.
 *
 * 데이터 출처는 `src/components/posts/vpn-anatomy-1/VizFlowchart4.tsx`.
 * 근거는 `SampleComparison.tsx` 머리글 참고.
 *
 * 이 kind 를 넣는 이유: 셋 중 유일하게 **패키지 구현**이고(로컬 구현이 아니다) 노드
 * 좌표가 저작 viewBox 에 고정이라, 높이를 되뽑는 둘과 액자가 다르게 앉을 수 있다.
 */
import VizFigure, { type VizFrame } from "../VizFigure";
import type { VizMarkName } from "../VizMark";
import { Flowchart } from "@centurio1987/bbangto-ui-visualization";
import type { SampleProps } from "./SampleComparison";

const CAPTION = "세 계열과, 각 계열을 해부할 편 — 이 시리즈의 구성";

export default function SampleFlowchart({ frame = "none", mark, caption = true }: SampleProps) {
  return (
    <VizFigure frame={frame} mark={mark} caption={caption ? CAPTION : undefined} label={CAPTION}>
      <Flowchart
        accessible="img"
        title={"IPsec 계열·WireGuard·TLS-VPN 계열 셋과 각각을 다루는 에피소드 번호"}
        desc={CAPTION}
        viewBox="0 0 600 290"
        data={{
          nodes: [
            { id: "f1", x: 14, y: 14, width: 178, height: 56, label: "IPsec 계열" },
            { id: "f2", x: 211, y: 14, width: 178, height: 56, label: "WireGuard" },
            { id: "f3", x: 408, y: 14, width: 178, height: 56, label: "TLS-VPN 계열" },
            {
              id: "m1",
              x: 14,
              y: 110,
              width: 178,
              height: 72,
              label: "IKEv2로 협상 · ESP로 캡슐화 — 표준의 조합",
            },
            {
              id: "m2",
              x: 211,
              y: 110,
              width: 178,
              height: 72,
              label: "고정 암호군 · UDP 단일 설계 — 선택지를 없앤 쪽",
            },
            {
              id: "m3",
              x: 408,
              y: 110,
              width: 178,
              height: 72,
              label: "TLS 위 제어·데이터 채널 — 방화벽 통과",
            },
            { id: "e1", x: 14, y: 222, width: 178, height: 52, label: "3편 · 4편에서 해부" },
            { id: "e2", x: 211, y: 222, width: 178, height: 52, label: "5편에서 해부" },
            { id: "e3", x: 408, y: 222, width: 178, height: 52, label: "6편에서 해부" },
          ],
          edges: [
            { id: "a1", from: "f1", to: "m1", routing: "straight" },
            { id: "a2", from: "m1", to: "e1", routing: "straight" },
            { id: "b1", from: "f2", to: "m2", routing: "straight" },
            { id: "b2", from: "m2", to: "e2", routing: "straight" },
            { id: "c1", from: "f3", to: "m3", routing: "straight" },
            { id: "c2", from: "m3", to: "e3", routing: "straight" },
          ],
        }}
      />
    </VizFigure>
  );
}
