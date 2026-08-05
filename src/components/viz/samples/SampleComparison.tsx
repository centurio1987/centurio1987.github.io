/**
 * 액자 프레임 카탈로그(/design/viz-frames)용 샘플 — Comparison.
 *
 * 데이터는 **발행된 글에서 그대로 가져왔다**(`src/components/posts/vpn-anatomy-1/
 * VizComparison2.tsx`). 지어낸 짧은 라벨을 쓰면 안 되는 이유가 있다 — 한국어 라벨의
 * 길이가 액자 안 여백과 글씨 크기를 정하는 값이라, 더미로는 실제 지면에서 어떻게
 * 보일지 판단이 안 선다.
 *
 * 글의 자동 생성 컴포넌트는 자기 안에서 `VizFigure` 를 부르므로 프레임을 밖에서 못
 * 넘긴다. 그래서 카탈로그 전용으로 `frame` 을 받아 넘기는 껍데기를 따로 둔다.
 */
import VizFigure, { type VizFrame } from "../VizFigure";
import type { VizMarkName } from "../VizMark";
import Comparison from "../../../lib/viz/Comparison";

export interface SampleProps {
  frame?: VizFrame;
  /** 액자 귀퉁이에 얹는 두들 마크(스티커 자리). */
  mark?: VizMarkName;
  /** 캡션 없는 상태도 카탈로그에서 봐야 한다(폴라로이드는 캡션이 액자 구조의 일부다). */
  caption?: boolean;
}

const CAPTION = '같은 "IP가 바뀐다", 다른 적용 범위';

export default function SampleComparison({ frame = "none", mark, caption = true }: SampleProps) {
  return (
    <VizFigure frame={frame} mark={mark} caption={caption ? CAPTION : undefined} label={CAPTION}>
      <Comparison
        accessible="img"
        title={"프록시는 설정한 애플리케이션만, VPN은 인터페이스 전체를 덮는다"}
        desc={CAPTION}
        viewBox="0 0 600 210"
        mode="split"
        data={{
          left: {
            label: "프록시 (L7)",
            items: [
              "설정한 앱만 경유",
              "다른 앱은 그냥 직접 나감",
              "트래픽을 그대로 전달",
              "암호화는 TLS의 몫",
            ],
          },
          right: {
            label: "VPN (L3)",
            items: [
              "라우팅 테이블이 범위를 정함",
              "앱은 VPN을 몰라도 됨",
              "패킷을 통째로 감쌈",
              "암호화가 프로토콜에 내장",
            ],
          },
        }}
      />
    </VizFigure>
  );
}
