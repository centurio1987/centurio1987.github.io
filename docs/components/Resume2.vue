<template>
  <div class="resume-wrapper">
    <div class="resume-container">
      <!-- Header -->
      <header class="resume-header">
        <div class="header-info">
          <h1 class="name">{{ resumeData.name }}</h1>
          <p class="job-title">{{ resumeData.jobTitle }}</p>
        </div>
        <div class="profile-image-wrapper">
          <img
            :src="resumeData.profileImage"
            alt="Profile Picture"
            class="profile-image"
          />
        </div>
      </header>

      <!-- Main Content Grid -->
      <main class="resume-main">
        <!-- Left Column (Sidebar - Narrower for long content) -->
        <aside class="resume-sidebar">
          <!-- Contact -->
          <section class="resume-section">
            <div class="section-decorator"></div>
            <h2 class="section-title">Contact</h2>
            <ul class="contact-list">
              <li
                v-for="contact in resumeData.contacts"
                :key="contact.value"
                class="contact-item"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="contact-icon"
                >
                  <path v-if="contact.iconPath" :d="contact.iconPath" />
                  <circle
                    v-if="contact.iconType === 'map-pin'"
                    cx="12"
                    cy="10"
                    r="3"
                  />
                  <rect
                    v-if="contact.iconType === 'mail'"
                    width="20"
                    height="16"
                    x="2"
                    y="4"
                    rx="2"
                  />
                  <!-- LinkedIn 아이콘 -->
                  <template v-if="contact.iconType === 'linkedin'">
                    <path
                      d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                    ></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </template>
                </svg>
                <!-- URL이 있으면 링크로 처리, 없으면 텍스트로 처리 -->
                <a
                  v-if="contact.url"
                  :href="contact.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="contact-link"
                >
                  {{ contact.value }}
                </a>
                <span v-else>{{ contact.value }}</span>
              </li>
            </ul>
          </section>

          <!-- Skills -->
          <section class="resume-section">
            <div class="section-decorator"></div>
            <h2 class="section-title">Skills</h2>
            <div
              v-for="skillGroup in resumeData.skills"
              :key="skillGroup.category"
              class="skill-group"
            >
              <h3 class="skill-category">{{ skillGroup.category }}</h3>
              <ul class="skill-list">
                <li
                  v-for="skill in skillGroup.items"
                  :key="skill"
                  class="skill-item"
                >
                  <div class="skill-dot"></div>
                  {{ skill }}
                </li>
              </ul>
            </div>
          </section>

          <!-- Education -->
          <section class="resume-section">
            <div class="section-decorator"></div>
            <h2 class="section-title">Education</h2>
            <div class="timeline">
              <div
                v-for="(edu, index) in resumeData.education"
                :key="index"
                class="timeline-item page-break-inside-avoid"
              >
                <div class="timeline-marker"></div>
                <h3 class="item-title">{{ edu.degree }}</h3>
                <div class="item-meta">{{ edu.school }} | {{ edu.period }}</div>
                <p v-if="edu.description" class="item-desc">
                  {{ edu.description }}
                </p>
              </div>
            </div>
          </section>

          <!-- Certificates -->
          <section class="resume-section page-break-inside-avoid">
            <div class="section-decorator"></div>
            <h2 class="section-title">Certificates</h2>
            <ul class="certificate-list">
              <li
                v-for="cert in resumeData.certificates"
                :key="cert.name"
                class="certificate-item"
              >
                <h3 class="item-title flex items-center">
                  {{ cert.name }}
                  <a
                    v-if="cert.link"
                    :href="cert.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="doc-link"
                    title="자료 보기"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                      ></path>
                      <path
                        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                      ></path>
                    </svg>
                  </a>
                </h3>
                <p class="item-meta mt-half">
                  {{ cert.issuer }} | {{ cert.year }}
                </p>
              </li>
            </ul>
          </section>
        </aside>

        <!-- Right Column (Main Content - Wider for long experience) -->
        <div class="resume-content">
          <!-- Profile -->
          <section class="resume-section">
            <div class="section-decorator"></div>
            <h2 class="section-title">Profile</h2>
            <div class="profile-desc">
              <p
                v-for="(paragraph, index) in resumeData.profile.split('\n')"
                :key="index"
                class="mb-2"
              >
                {{ paragraph }}
              </p>
            </div>
          </section>

          <!-- Experience -->
          <section class="resume-section">
            <div class="section-decorator"></div>
            <h2 class="section-title">Experience</h2>
            <div class="timeline">
              <!-- 각각의 경력 아이템에 page-break-inside-avoid를 주어 중간에 잘리지 않게 함 -->
              <div
                v-for="(exp, index) in resumeData.experience"
                :key="index"
                class="timeline-item page-break-inside-avoid"
              >
                <div class="timeline-marker"></div>
                <div class="exp-header">
                  <h3 class="item-title uppercase">{{ exp.role }}</h3>
                  <span class="exp-period">{{ exp.period }}</span>
                </div>
                <div class="exp-company">{{ exp.company }}</div>
                <p v-if="exp.description" class="item-desc mb-2">
                  {{ exp.description }}
                </p>
                <ul class="task-list">
                  <li v-for="task in exp.tasks" :key="task">{{ task }}</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Awards -->
          <section class="resume-section page-break-inside-avoid">
            <div class="section-decorator"></div>
            <h2 class="section-title">Awards</h2>
            <div class="awards-grid">
              <div
                v-for="award in resumeData.awards"
                :key="award.title"
                class="award-item"
              >
                <h3 class="item-title flex items-center">
                  {{ award.title }}
                  <a
                    v-if="award.link"
                    :href="award.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="doc-link"
                    title="자료 보기"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                      ></path>
                      <path
                        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                      ></path>
                    </svg>
                  </a>
                </h3>
                <p class="award-category">{{ award.category }}</p>
                <p v-if="award.description" class="item-desc">
                  {{ award.description }}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";

// --- Type Definitions ---
interface Contact {
  iconType: "map-pin" | "phone" | "mail" | "link" | "github" | "linkedin";
  iconPath?: string;
  value: string;
  url?: string;
}

interface SkillGroup {
  category: string;
  items: string[];
}

interface Education {
  degree: string;
  school: string;
  period: string;
  description?: string;
}

interface Certificate {
  name: string;
  issuer: string;
  year: string;
  link?: string;
}

interface Experience {
  role: string;
  period: string;
  company: string;
  description?: string;
  tasks: string[];
}

interface Award {
  title: string;
  category: string;
  description?: string;
  link?: string;
}

interface ResumeData {
  name: string;
  jobTitle: string;
  profileImage: string;
  contacts: Contact[];
  skills: SkillGroup[];
  education: Education[];
  certificates: Certificate[];
  profile: string;
  experience: Experience[];
  awards: Award[];
}

// --- Data ---
const PATHS = {
  mapPin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",
  phone:
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  mail: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  github:
    "M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
};

const resumeData = reactive<ResumeData>({
  name: "김윤덕", // 필요시 본명으로 수정해주세요
  jobTitle: "CTO / Product Owner",
  profileImage: "/assets/images/profile.webp",
  contacts: [
    // { iconType: "map-pin", iconPath: PATHS.mapPin, value: "서울특별시 강남구" },
    // { iconType: "phone", iconPath: PATHS.phone, value: "010-" },
    {
      iconType: "mail",
      iconPath: PATHS.mail,
      value: "centurio87@naver.com",
      url: "mailto:centurio87@naver.com",
    },
    {
      iconType: "github",
      iconPath: PATHS.github,
      value: "github.com/centurio1987",
      url: "https://github.com/centurio1987",
    },
    {
      iconType: "linkedin",
      value: "linkedin.com/in/yoondeok-kim-319bb8145",
      url: "https://www.linkedin.com/in/yoondeok-kim-319bb8145",
    },
  ],
  skills: [
    {
      category: "Engineering & Architecture",
      items: [
        "Software Architecture",
        "Product Engineering",
        "DevOps & Platform Engineering",
        "Cloud Infrastructure (AWS, k8s) Management",
      ],
    },
    {
      category: "Management & Strategy",
      items: [
        "Technical Governance, Development Standard",
        "Product Management, Planning, Process Management (PO)",
        "Team Leading & Building & Growth",
      ],
    },
  ],
  education: [
    {
      degree: "소프트웨어 학과 (석사)",
      school: "숭실대학교 SW 특성화 대학원",
      period: "2015.03 - 2017.02",
      description: "학점: 4.15",
    },
    {
      degree: "컴퓨터공학과 (학사)",
      school: "한국공학대학교(한국산업기술대학교)",
      period: "2006.03 - 2014.02",
      description: "학점: 4.35",
    },
  ],
  certificates: [
    {
      name: "Big Data on AWS 수료",
      issuer: "Amazon",
      year: "2020.09.04",
      link: "/assets/images/resume/big-data-on-aws-certificate.png",
    },
    {
      name: "Deep Learning on AWS 수료",
      issuer: "Amazon",
      year: "2020.09.01",
      link: "/assets/images/resume/deep-learning-on-aws.png",
    },
    {
      name: "AWS Technical Essentials 수료",
      issuer: "Amazon",
      year: "2020.08.31",
      link: "/assets/images/resume/technical-essentials-on-aws-certificate.png",
    },
    { name: "한자자격시험 2급", issuer: "한자교육진흥회", year: "2014.06.01" },
    { name: "TOEIC 915점(만료)", issuer: "ETS", year: "2013.11.01" },
    { name: "JLPT N1급", issuer: "일본국제교육협회", year: "2010. 08. 01." },
    { name: "정보처리기사", issuer: "한국산업인력공단", year: "2012. 11. 01." },
  ],
  profile:
    "저는 세상의 근간을 이해하고, 앞서 나가, 세상에 기여하고자 합니다. 그런 저에게 소프트웨어는 사명을 실현하기 위한 핵심 도구입니다. 저는 소프트웨어의 모든 것을 탐구하고, 실현하고자 합니다.\n제품의 관점에서 소프트웨어는 제품 그 이상입니다. 저는 소프트웨어를 그 자체로 이해하기 위한 노력 역시 지속하고 있습니다. 소프트웨어는 개념의 재구성입니다. 개념은 사람이 표상할 수 있는 모든 것입니다. 소프트웨어를 이해하고, 구현한다는 것은, 지각 경험과 기존 지식을 통해 반복적으로 개념을 구성하는 과정 그 자체입니다. 저는 소프트웨어가 제품을 넘어서, 인식의 경계에서 다뤄져야 하는 개념이라 생각합니다. 이를 통해, 제품으로 소프트웨어를 바라 볼 때도, 근시안에 갖히지 않고, 다양한 관점에서 이해하고, 기획하고, 설계할 수 있다고 믿습니다.",
  experience: [
    {
      role: "CTO, PO",
      period: "2023.05 - 2025.12",
      company: "탄소중립연구원",
      tasks: [
        "Technical Governance, Architecture 설계, 개발 표준 정의",
        "사내 ProdOps,",
        "LynC 개발 및 운영",
        "제품 전략, 정의, 기획",
        "Leading, Product Engineering, DevOps",
        "팀원 성장 책임",
      ],
    },
    {
      role: "CTO",
      period: "2022.05 - 2023.05",
      company: "크로노스",
      tasks: ["제품 기획, 구현"],
    },
    {
      role: "백엔드 개발자, 엔지니어",
      period: "2021.10 - 2022.05",
      company: "쓰리랩스",
      tasks: ["Plingo 백엔드 업데이트", "인프라 및 Plingo 서비스 관리"],
    },
    {
      role: "리드 개발자",
      period: "2021.03 - 2021.09",
      company: "세컨프라이스",
      tasks: ["제품 구현 총괄", "풀스택 개발, 인프라관리 & DevOps"],
    },
    {
      role: "CTO",
      period: "2019.09 - 2020.11",
      company: "키온비트",
      tasks: ["온프레미스 k8s 환경 구축", "On-Premise Cloud Solution 개발"],
    },
  ],
  awards: [
    {
      title: "TOPCIT(소프트웨어역량평가) 육군참모총장 특별상",
      category: "정보통신산업진흥원, 한국생산성본부 | 2016.12.01",
      description:
        "한 회에 3500명 정도 응시하는 IT역량평가 시험으로써, TOP 15위 안에 입상함",
      link: "/assets/images/resume/topcit-award.png",
    },
    {
      title: "TOPCIT(소프트웨어역량평가) 숭실대학교 총장상",
      category: "정보통신산업진흥원, 한국생산성본부 | 2015.12.01",
      description: "교내 1위상",
    },
    {
      title: "u300 유망창업팀 300에 선발 및 입상",
      category: "교육부, 한국연구재단, 한국청년기업가정신재단 | 2016.05.01",
      description: "",
    },
  ],
});
</script>

<style scoped>
/* Google Fonts Import */
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap");

/* --- Base Variables & Resets --- */
.resume-wrapper {
  background-color: #f3f4f6;
  padding: 2.5rem 1rem;
  font-family: "Noto Sans KR", "Montserrat", sans-serif;
  color: #1f2937;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  word-break: keep-all; /* 한글 단어 끊김 방지 (가독성 향상) */
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

h1,
h2,
h3,
h4,
h5,
h6,
p {
  margin: 0;
}

.uppercase {
  text-transform: uppercase;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

/* --- Container --- */
.resume-container {
  max-width: 1000px; /* 긴 내용을 위해 최대 너비 약간 증가 */
  margin: 0 auto;
  background-color: #ffffff;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

@media (min-width: 768px) {
  .resume-container {
    padding: 4rem;
  }
}

/* --- Header --- */
.resume-header {
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4rem;
  gap: 2rem;
}

@media (min-width: 768px) {
  .resume-header {
    flex-direction: row;
    align-items: center;
  }
}

.header-info {
  flex: 1;
}

.name {
  font-family: "Montserrat", "Noto Sans KR", sans-serif;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #111827;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

@media (min-width: 768px) {
  .name {
    font-size: 3.75rem;
  }
}

.job-title {
  font-family: "Montserrat", "Noto Sans KR", sans-serif;
  margin-top: 1rem;
  font-size: 1.125rem;
  letter-spacing: 0.3em;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
}

.profile-image-wrapper {
  width: 8rem;
  height: 8rem;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #f3f4f6;
}

@media (min-width: 768px) {
  .profile-image-wrapper {
    width: 10rem;
    height: 10rem;
  }
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  transition: filter 0.5s ease;
}

.profile-image:hover {
  filter: grayscale(0%);
}

/* --- Main Layout Grid (Adjusted for Long Experience) --- */
.resume-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
}

@media (min-width: 860px) {
  .resume-main {
    /* 좌측 단을 260px로 고정/최소화하고, 
      우측 단(경력 등)에 최대한 많은 가로 공간을 할당하여 세로 길이를 줄임 
    */
    grid-template-columns: 260px 1fr;
    gap: 4rem;
  }
}

/* --- Section Shared --- */
.resume-section {
  margin-bottom: 3rem;
}

.resume-section:last-child {
  margin-bottom: 0;
}

.section-decorator {
  width: 1px;
  height: 1rem;
  background-color: #f94920; /* 포인트 컬러 */
  margin-bottom: 0.5rem;
}

.section-title {
  font-family: "Montserrat", "Noto Sans KR", sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #111827;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

/* --- Contact Section --- */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 300;
}

.contact-icon {
  width: 1rem;
  height: 1rem;
  color: #f94920;
}

.contact-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: #f94920;
  text-decoration: underline;
}

/* --- Skills Section --- */
.skill-group {
  margin-bottom: 1.5rem;
}

.skill-category {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 300;
}

.skill-dot {
  width: 0.375rem;
  height: 0.375rem;
  border: 1px solid #f94920;
  background-color: #f94920;
  border-radius: 50%;
  flex-shrink: 0;
}

/* --- Timeline Component (Education, Experience) --- */
.timeline {
  position: relative;
  border-left: 1px solid #d1d5db;
  margin-left: 0.35rem;
}

.timeline-item {
  position: relative;
  padding-left: 1.5rem;
  padding-bottom: 2.5rem; /* 항목 간 간격 약간 넓힘 */
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: absolute;
  width: 0.75rem;
  height: 0.75rem;
  background-color: #ffffff;
  border: 2px solid #f94920;
  border-radius: 50%;
  left: -0.42rem;
  top: 0.35rem;
}

.item-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.025em;
}

.item-meta {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

.item-desc {
  font-size: 0.8125rem; /* 본문 폰트 사이즈 미세조정 */
  color: #4b5563;
  font-weight: 300;
  line-height: 1.6;
}

/* --- Certificates & Links --- */
.certificate-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mt-half {
  margin-top: 0.125rem;
}

.doc-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.375rem;
  color: #f94920;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.doc-link:hover {
  opacity: 1;
}

.doc-link svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* --- Profile Section --- */
.profile-desc {
  font-size: 0.875rem;
  color: #4b5563;
  font-weight: 300;
  line-height: 1.7;
  text-align: left; /* Justify 대신 좌측 정렬로 가독성 개선 */
}

/* --- Experience Specific --- */
.exp-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.25rem;
}

@media (min-width: 640px) {
  .exp-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.exp-period {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: 0.1em;
  margin-top: 0.25rem;
}

@media (min-width: 640px) {
  .exp-period {
    margin-top: 0;
  }
}

.exp-company {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.mb-2 {
  margin-bottom: 0.75rem;
}

.task-list {
  list-style-type: disc;
  list-style-position: outside; /* 마커 바깥으로 빼서 다중 줄바꿈 시 정렬 깔끔하게 유지 */
  margin-left: 1rem;
  font-size: 0.8125rem;
  color: #4b5563;
  font-weight: 300;
  line-height: 1.6;
}

.task-list li {
  margin-bottom: 0.375rem;
}

/* --- Awards Section --- */
.awards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .awards-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.award-item {
  border-left: 2px solid #f94920;
  padding-left: 1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.award-category {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

/* --- Print & Pagination Optimization --- */
/* 내용이 길어져 다음 장으로 넘어갈 때 잘리지 않도록 보호하는 클래스 */
.page-break-inside-avoid {
  page-break-inside: avoid;
  break-inside: avoid;
}

@media print {
  @page {
    size: A4;
    margin: 1.5cm; /* 출력 시 여백 고정 */
  }

  .resume-wrapper {
    background-color: transparent;
    padding: 0;
  }

  .resume-container {
    box-shadow: none;
    padding: 0;
    max-width: 100%;
  }

  /* 프린트 시 백그라운드 컬러, 보더 강제 렌더링 */
  .timeline,
  .timeline-marker,
  .skill-dot,
  .section-decorator {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* 사이드바가 1페이지에서 끝나더라도 레이아웃이 붕괴되지 않도록 처리 */
  .resume-main {
    display: flex;
  }

  .resume-sidebar {
    width: 260px;
    flex-shrink: 0;
  }

  .resume-content {
    flex-grow: 1;
    min-width: 0; /* flex 버그 방지 */
  }
}
</style>
