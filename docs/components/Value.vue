<script setup lang="ts">
interface Subsection {
  head: string;
  text: string;
}

interface CoreValue {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  content?: string[];
  highlight?: string;
  subsections?: Subsection[];
}

const coreValues: CoreValue[] = [
  {
    id: "01",
    label: "프로",
    title: "프로의 자세",
    subtitle: "의미 있는 일에 집중하다.",
    content: [
      "근로자는 일 하는 조건으로 대가를 받습니다. 계약 조건을 위배하지 않는 선에서 일하는 것이 근로자의 소양입니다. 프로는 목표를 적극적으로 달성하려는 사람입니다. 목표를 달성하지 어려운 환경에 지배당한 상황에서도 주어진 일의 관성에 머무르려는 사람이 아니라, 미미하더라도, 목표 달성을 위해 내가 주어진 역할과 책임 안에서 할 수 있는 일이 무엇인지 전략을 세우고 수행하여, 그 안에서의 최선을 다하는 사람이 프로입니다. 저는 의미 없이 해야 하니까 하고 시키니까 하는 것을 선호하지 않습니다. 내가 상황을 바꾸지 못하더라도, 그 안에서 최선을 능동적으로 취하려는 자세와, 계약 조건에 맞게 그냥 하던거나 하자의 자세는 장기적으로는 큰 차이를 낼 수 있다고 믿습니다.",
      "프로가 되는 순간부터, 나는, 내가 좋아해서 하고 싫어해서 하지 않을 수 없는 사람이 됩니다. 목표 주체의 목표를 최우선으로 고려해야 합니다. 단순한 수사에 그치는 것이 아니라, 수행에 반영할 수 있어야 합니다. 불필요한 감정과 자존심, 정치 같은 알력을 배제하고 오로지 문제에만 집중해서 생각하고 말합니다. 문제를 파악했으면 해결을 위한 적극적 액션을 도모해야 합니다. 주어진 모든 환경을 고려해서 최적의 액션 플랜을 세웁니다. 플랜의 결과가 주어진 최선이라면, 망설이지 않고 수행해야 합니다. 누군가는 더 많은 업무를 소화해야 하고, 전문성이 떨어지는 일을 해야 하고, 현재 업무 관성에 배치되고, 선호하지 않는 업무를 해야 할 수 있습니다. 그럼에도 해야 하면 해야 합니다. 최적의 플랜은 인스피레이션까지 고려해야 하지만, 모든 것을 만족시킬 수는 없기 때문에, 결정했으면 앞으로 가야 합니다. 결과는 있는 그대로 받아들이고, 끊임없이 가설을 조정하고 행동을 개선합니다. 업무는 그 과정의 연속이기 때문에 멈추기 전까진 완전한 성패가 없지만, 목표 주체가 내가 아닌 경우, 조직이 결정하는 성패의 잣대는 겸허히 받아들이고 책임집니다. 그것이 제가 프로로서, 사회인으로서 살아가는 자세입니다.",
    ],
    highlight: "일에서 즐거움을 찾아가는 여정, 내 안의 위버멘쉬를 찾아나간다.",
  },
  {
    id: "02",
    label: "전략",
    title: "전략가의 자세",
    subtitle: "성공은 도박이 아니다.",
    content: [
      "좋은 전략은 유효한 목표와 실행 가능한 수단을 포함합니다. 이를 충족하기 위해서, 환경, 문제, 기술을 이해해야 합니다. 환경은 나와 우리 조직, 경쟁자, 고객, 시장을 포함합니다. 환경의 이해는 전략 기획에서 전제와 가정, 원칙을 만들어 내고, 테마를 설정하는데 기여합니다. 문제는 본질을 꿰뚫는 것이 핵심입니다. 현상 이면을 바라봐야 합니다. 스스로와 현장에 끊임없이 질문하여, 머리와 마음으로 공감해야 합니다. 그리고, 우리 역량과 포지션, 회사의 비전 등 환경과 결합하여, 어떤 관점으로 바라볼 것인지, 세분화 할것인지 일반화 할 것인지를 조율해서 문제를 정의 합니다. 우리 조직이 가치 창출을 위해 가지고 있는 기술 자산과 역량을 이해합니다. 이를 기반으로 비용 추정을 포함한 실행 계획을 세웁니다.",
      "그 외에도, 가정, 원칙, 한계 설정, 포트폴리오 전략, 역할 별 전략 등 여러 중요한 요소들이 존재하고, 깊이 들어가면 전략 수립을 위해 수행 해야할 여러 태스크와 품질을 높이는 노하우와 전문성이 존재합니다. 그 하나하나를 차근차근 깨닫고 연구하여 역량으로 쌓아나가고 있습니다. 무엇하나 사소하다 생각하지 않고 연구하다 보면, 그 디테일들이 나의 퀄러티를 만들어 낸다는 마음가짐으로 임하고 있습니다.",
      "전략을 이해하고 수행하는 주체는 사람이기 때문에, 공감과 설득 또한, 전략가의 주요 소양입니다. 전략이 정확하게 기술되는 것도 중요하지만, 결국 전략의 퀄러티는 이해관계자들이 얼마나 이해하느냐에 달려 있습니다. 그래서 테마 정의에서, 배경, 목적, 목표를 이해하기 쉽게 풀어내는 것이 중요합니다. 또한, 전략에 따라 조직이 움직이게 하려면 우리 조직 인스피레이션의 원천은 무엇인지 파악하고, 확신과 에너지로써 메시지를 전달할 수 있어야 합니다. 수행은 전문성이 중요하기 때문에, 비단 직관적 설득력에 그치지 않고, 거버넌스를 통한 팀 빌드업을 해두어야 할 것입니다.",
    ],
  },
  {
    id: "03",
    label: "장인",
    title: "장인의 자세",
    subtitle: "한 땀에 의미를 담다.",
    content: [
      "모루에 망치를 내리치며 묵묵히 단조하는 모습은 마이스터를 대표하는 심상입니다. 언뜻 단조로워 보이는 행위를 지극히 반복한다는 것은, 시간을 들여 진심을 쌓지 않으면, 지속할 수 없는 것입니다. 장인은 단순 반복적으로 보이는 행위 하나 하나에 의미를 담습니다. 어떻게 최적의 힘을 효율적으로 전달 할 수 있을까, 지금 철의 온도와 상태는 어떻고, 그럴 땐 어떻게 대처해야 할까. 장인의 눈에는 보이는 것이 훨씬 많고, 여러 변수의 상호작용을 고려하여 최적의 답을 계속해서 갈구하는 것에 몰입하면, 그 세계에 온전히 빠져들 수 있습니다.",
      "저 또한, 어떤 일을 하든, 어떻게 해야 조금이라도 더 잘 할 수 있을지 고민하고 실행합니다. 관습과 패턴에 매몰되기 보다, 어떻게 해야 최적의 코드 한 줄을 작성할 수 있을지 고민합니다. 기획 컨셉과 가정, 고객의 니즈, 원츠, 디맨즈, 감정, 인지, 행동, 맥락에 따라 데이터를 어떻게 정의 해야 하는지, 프로젝트 목적, 목표, 가정, 자원에 따라, 최적화와 재사용성과 같은 구조를 얼마나 고려해야 하는지, 인터페이스와 코드가 동료 개발자가 보기에 가독성이 좋고 이해가 쉬우며, 활용성이 뛰어난지, 이런 것들을 도메인 모델과 DB 스키마 뿐 아니라, 변수 하나, 코드 한 줄을 작성 할 때도 고려하고자 합니다.",
      "높은 곳을 바라 볼 수록 그 과정이 어렵고 지난하지만, 고수가 되면, 그 많은 고려사항과 매커니즘은 하나의 정수로 응축 되고 직관화 됩니다. 저는 처음부터 빛 날 수 없지만, 최고에서 다시 최고를 바라보자 하는 끊임 없는 향상 욕구 때문에, 이 길을 걷기를 자처 했고, 이제는 조금씩 보답받고 있다고 생각합니다.",
    ],
  },
  {
    id: "04",
    label: "리더",
    title: "리더의 자세",
    subtitle: "마음의 이정표를 던지다.",
    content: [
      "리더는 뭐든 잘 하면 도움이 됩니다. 훌륭한 전술가, 전략가, 기획자, 장인이라면 더할나위 없습니다. 하지만, 리더의 본질은 나아가게 하는데 있습니다. 나를 나아가게 하고 조직을 나아가게 만드는 것이 리더입니다. 손자병법의 오사(도천지장법)에서 도가 머리에 나오는 이유 역시, 고대부터 길을 제시하는 것이 리더의 가장 중요한 소양이라 생각 했기 때문입니다.",
      "아무리 역량이 뛰어난 리더라고 해도, 항상 최선의 답을 내리기는 어렵습니다. 하지만, 어떤 결론을 내리든, 나 스스로나 조직이 망설임 없이 나아가게 만드는 것이 더 중요합니다. 단순해 보이지만 쉽지 않습니다. 이성만 앞서도, 감정만 앞서도, 명성만 앞서도 카리스마를 형성할 수 없습니다. 파토스, 에토스, 로고스를 적절히 버무려 삼위일체를 이뤄내야만, 카리스마로써 승화시킬 수 있습니다.",
      "내가 가지고 있는 것들을 그저 최대로 피력하는 것 만으로는 진정한 카리스마는 생기지 않습니다. 카리스마는 가만히 별들을 무리 짓게 하는 북극성과도 같아서, 무위의 묘리 또한 적절히 이용해야만 합니다. 과함도 덜함도 없는 것, 지극히 이성적이지만 지극히 감성적인 것, 그것이 카리스마를 구성하는 궁극의 레시피로 향하는 길입니다.",
    ],
  },
  {
    id: "05",
    label: "성장",
    title: "성장의 자세",
    subtitle: "오늘도 딱 한 걸음 나아간다.",
    subsections: [
      {
        head: "급류를 건널 때, 기초는 나의 무게 추가되어 준다.",
        text: "세상이 변하는 속도가 빨라지고, 보편적 가치로 여겨졌던 상식과 질서는 변하고 있습니다. 이러한 상황 속에서 지침을 기다리고 안전함을 선택하는 자세는 나를 궁지로 몰아 넣습니다. 스스로 판단할 수 있는 역량이 있어야만, 위기와 혼란 속에서 나의 길을 찾을 수 있습니다. 또한, 그래야만 과감한 선택을 할 수 있습니다. 그리고, 그러한 판단의 잣대는 기초에서 나옵니다. 기초는 개념을 명확히 아는 것입니다. 그 개념의 언어적 범위, 정확한 정의, 시도를 통해 선명해지는 경계와 해상도가 기초를 형성합니다. 이러한 기초는 하루 아침에 형성되지 않습니다. 이론에 대한 고찰과, 명확한 목적과 가정을 토대로 수많은 반복 수행을 거쳐서 담금질 됩니다. 지금은 번뜩이는 재치와 천재성만을 가지고 자신의 진가를 드러낼 수 있는 시대가 아닙니다. 분야는 세분화 되고, 고밀도화 되고 있습니다. 인류는 이미 인식의 한계점에 가깝게 외연을 넓혀 왔습니다. 따라서, 완전히 새로운 패러다임보다는, 기존의 패러다임을 재해석하고 버무려 내야 하는 시대입니다. 지식 또한 그렇습니다. 여러 지식의 융합과 분해, 재해석이 중요합니다. 그리고 그러한 역량은, 각 개념을 정확하게 이해하고 있는 사람만이 가질 수 있는 것입니다. 저 또한, 시대의 속도에 현혹되지 않고, ",
      },
      {
        head: "더 깊게, 그리고, 더 넓게",
        text: "빨라지는 시대의 속도는, 인재들에게 적응성을 요구했습니다. 제너럴리스트의 시대가 도래했고, 조직은 목적 위주로 개편되기 시작했습니다. 하지만 보편적으로, 시대의 요구는 어떤 방향으로의 발산을 촉발하고, 다시 본질을 회복하는 방향으로 결국 수렴하곤 합니다. 이 경우에도 마찬가지라고 생각합니다. 알맹이가 없는 결과물은, 가치를 제공하지 않습니다. 그래서, 시대의 요구를 빠르게 반영하면서도, 제대로 된 일을 하며 제대로 된 무언가를 만들어 내는 것, “초영역인재”가 되는 것이 저의 지향점입니다. ",
      },
      {
        head: "한계 그 이상으로",
        text: '목표를 달성하기 위한 만큼만 적당히 힘을 쓰게 되면, 모처럼 찾아온 성장 모멘텀을 충분히 활용할 수 없습니다. 내가 할 수 있는 최선을 다 해야, 다음 성장을 위한 자극을 전부 흡수 할 수 있고, 그 때 받는 고강도 한계 스트레스에 적응 해야, 그 이상의 스트레스를 점차 이겨낼 수 있는 견고함을 획득할 수 있습니다. 목표를 넘어서는 노력은, 품질 향상에 있어서도 좋은 자세입니다. 클라이언트는 당연한 결과를 원하지 않습니다. 그 이후 단계까지 생각하고, 하나를 내놓더라도 입체적 감각을 제공했을 때, 비로소 감동으로 이어질 수 있습니다. 마케팅 관점에서 감동은 수요를 이끌어 내는 역치값이 됩니다. 제갈 공명의 국궁진췌 사이후이(鞠躬盡瘁 사기후이), 사카모토 료마의 "나는 도랑물에 쓰러져 죽더라도, 내 시체는 내가 가고자 했던 방향으로 쓰러져 있기를 원한다." 라는 구절은 저의 그런 태도를 갈고 닦는데 좋은 지침이 되어 줍니다. 남들과 같은 목표를 달성하고도 다름을 만들어내고, 선택을 이끌어내기 위해, 최선이라 생각한 그 지점에서 다시 한번 최선을 다하고자 합니다.',
      },
    ],
  },
];
</script>

<template>
  <div class="value-page">
    <div class="editorial-container">
      <!-- Editorial Top Section -->
      <div class="top-section">
        <h1 class="main-title">VALUES</h1>
        <div class="top-meta">
          <div class="top-meta-left">
            <span class="meta-label">Identity Manifesto / 2026</span>
            <h2 class="sub-title">가치관을 말하다</h2>
          </div>
          <span class="archive-label">Archive No. 001</span>
        </div>
      </div>

      <!-- Content Flow -->
      <div class="content-flow">
        <section v-for="val in coreValues" :key="val.id" class="value-section">
          <!-- Left Index (Desktop) -->
          <div class="left-index">
            <span class="index-number">{{ val.id }}</span>
            <div class="index-label-group">
              <span class="identity-label">Identity</span>
              <span class="value-label">{{ val.label }}</span>
            </div>
          </div>

          <!-- Right Content Area -->
          <div class="right-content">
            <header class="section-header">
              <h2 class="section-title">{{ val.title }}</h2>
              <p class="section-subtitle">"{{ val.subtitle }}"</p>
            </header>

            <!-- Main Content Paragraphs -->
            <div class="paragraphs">
              <p v-for="(para, i) in val.content" :key="i" class="paragraph">
                {{ para }}
              </p>
            </div>

            <!-- Growth Subsections Layout (Section 05) -->
            <div v-if="val.subsections" class="subsections">
              <div
                v-for="(sub, i) in val.subsections"
                :key="i"
                class="subsection"
              >
                <div class="subsection-head-wrap">
                  <h3 class="subsection-head">{{ sub.head }}</h3>
                </div>
                <p class="subsection-text">{{ sub.text }}</p>
              </div>
            </div>

            <!-- Manifesto Highlight (Section 01) -->
            <div v-if="val.highlight" class="highlight-block">
              <p class="highlight-text">{{ val.highlight }}</p>
            </div>

            <!-- Minimal Footer Ref -->
            <div class="ref-footer">
              <span>Ref ID: {{ val.id }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Bottom Finish Line -->
      <div class="bottom-line">
        <span class="bottom-text">End of Manifesto</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.value-page {
  background: #fff;
  min-height: 100vh;
  font-family: sans-serif;
  color: #000;
  padding-bottom: 5rem;
}

.value-page ::selection {
  background: #000;
  color: #fff;
}

.editorial-container {
  max-width: 56rem;
  margin: 0 auto;
  border-left: 1px solid #000;
  border-right: 1px solid #000;
  min-height: 100vh;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  background: #fff;
}

.top-section {
  padding: 5rem 2rem 4rem;
  border-bottom: 2px solid #000;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.main-title {
  font-size: 6rem;
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 1;
  text-transform: uppercase;
  margin: 0;
}

.top-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 1.5rem;
}

.top-meta-left {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.sub-title {
  font-size: 1.5rem;
  font-weight: 900;
  margin: 0.25rem 0 0;
}

.archive-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid #000;
}

.content-flow > .value-section + .value-section {
  border-top: 1px solid #000;
}

.value-section {
  display: grid;
  grid-template-columns: 1fr;
}

.left-index {
  display: none;
  padding: 2rem;
  border-right: 1px solid #000;
  flex-direction: column;
  align-items: center;
}

.index-number {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1;
}

.index-label-group {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
}

.identity-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
  font-style: italic;
  text-decoration: underline;
  text-decoration-color: #000;
  text-underline-offset: 4px;
}

.value-label {
  font-size: 0.875rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.right-content {
  padding: 2rem;
}

.section-header {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 900;
  margin: 0 0 1rem;
  letter-spacing: -0.05em;
  line-height: 1.1;
}

.section-subtitle {
  font-size: 1.25rem;
  font-weight: 700;
  color: #9ca3af;
  font-style: italic;
  margin: 0;
}

.paragraphs {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.paragraph {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #111827;
  text-align: justify;
  word-break: keep-all;
  margin: 0;
}

.subsections {
  margin-top: 4rem;
  border-top: 2px solid #000;
  padding-top: 4rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.subsection {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.subsection-head-wrap {
  display: inline-block;
}

.subsection-head {
  font-size: 1.25rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.025em;
  border-bottom: 4px solid #000;
  padding-bottom: 0.5rem;
  margin: 0;
}

.subsection-text {
  font-size: 1.125rem;
  color: #1f2937;
  line-height: 1.8;
  text-align: justify;
  word-break: keep-all;
  margin: 0;
}

.highlight-block {
  margin-top: 4rem;
  padding: 2.5rem;
  background: #000;
  color: #fff;
}

.highlight-text {
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.025em;
  font-style: italic;
  text-align: center;
  margin: 0;
}

.ref-footer {
  margin-top: 5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  padding-top: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.bottom-line {
  height: 8rem;
  border-top: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  overflow: hidden;
  position: relative;
}

.bottom-text {
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 1em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0.3;
}

@media (min-width: 768px) {
  .top-section {
    padding-left: 3rem;
    padding-right: 3rem;
  }

  .main-title {
    font-size: 8rem;
  }

  .value-section {
    grid-template-columns: 3fr 9fr;
  }

  .left-index {
    display: flex;
  }

  .right-content {
    padding: 4rem;
  }

  .section-title {
    font-size: 3rem;
  }

  .subsection-head {
    font-size: 1.5rem;
  }

  .highlight-text {
    font-size: 1.875rem;
  }
}
</style>
