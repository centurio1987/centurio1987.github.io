/**
 * 액자 프레임 카탈로그(/design/viz-frames)용 샘플 — ProcessSteps.
 *
 * 데이터 출처는 `src/components/posts/vpn-anatomy-1/VizProcessSteps3.tsx`.
 * 근거는 `SampleComparison.tsx` 머리글 참고.
 *
 * 이 kind 를 넣는 이유: `Comparison`·`ProcessSteps` 는 레포 로컬 구현이라 **viewBox
 * 높이를 콘텐츠에서 되뽑는다**(`src/lib/viz/schema.ts` 의 LOCAL_VIZ_KINDS 주석).
 * 액자가 letterbox 를 만드는지는 비율이 고정된 그림만 봐서는 모른다.
 */
import VizFigure, { type VizFrame } from "../VizFigure";
import type { VizMarkName } from "../VizMark";
import ProcessSteps from "../../../lib/viz/ProcessSteps";
import type { SampleProps } from "./SampleComparison";

const CAPTION = "캡슐화 — 원본 패킷은 payload가 되고, 겉에 새 헤더가 붙는다 (개념 레벨)";

export default function SampleProcessSteps({ frame = "none", mark, caption = true }: SampleProps) {
  return (
    <VizFigure frame={frame} mark={mark} caption={caption ? CAPTION : undefined} label={CAPTION}>
      <ProcessSteps
        accessible="img"
        title={"원본 패킷이 암호화되어 새 외부 헤더로 감싸이고 게이트웨이에서 복원되는 네 단계"}
        desc={CAPTION}
        viewBox="0 0 600 240"
        orientation="vertical"
        data={{
          steps: [
            { title: "원본 패킷", description: "목적지는 내가 쓰려는 서비스" },
            { title: "잠그고 감싸기", description: "패킷 전체가 암호화된 payload가 된다" },
            { title: "새 외부 헤더", description: "목적지는 VPN 게이트웨이" },
            { title: "게이트웨이에서 복원", description: "겉포장을 벗겨 원본을 내보낸다" },
          ],
        }}
      />
    </VizFigure>
  );
}
