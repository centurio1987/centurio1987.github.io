import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  assetsDir: "assets",
  appearance: "force-dark",

  title: "하얀마음흑구",
  description: "표현할 수 있어야 지식이다",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Resume", link: "/resume" },
      { text: "Portfolio", link: "/portfolio" },
      { text: "Post", link: "/posts" },
    ],

    sidebar: {
      "/posts/": [
        {
          text: "기획",
          collapsed: false,
          base: "/posts/planning",
          items: [
            {
              text: "기획 실전 노하우 시리즈",
              link: "/practical-know-how/",
            },
          ],
        },
        {
          text: "아키텍쳐",
          collapsed: false,
          base: "posts/architecture",
          items: [
            { text: "인프라스트럭쳐", link: "/infrastructure/" },
            { text: "타입스크립트 백엔드", link: "/typescript-backends" },
            { text: "뷰 프론트엔드", link: "/vue-frontends" },
            { text: "버전 관리", link: "/version-control" },
          ],
        },
        {
          text: "전략",
          collapsed: false,
          base: "/posts/strategy",
          items: [
            {
              text: "제품 전략",
              link: "/product-strategy/",
            },
            {
              text: "IT 전략",
              link: "/it-strategy/",
            },
          ],
        },
        {
          text: "기술",
          collapsed: false,
          base: "/posts/skills",
          items: [
            {
              text: "TS/JS native",
              link: "/ts-js-native/",
            },
            {
              text: "TS/JS 런타임",
              link: "/ts-js-runtime/",
            },
            {
              text: "인프라스트럭쳐",
            },
          ],
        },
        {
          text: "설계",
          collapsed: false,
          base: "/posts/design",
          items: [
            {
              text: "도메인 모델링",
            },
            {
              text: "경험 디자인",
            },
            {
              text: "프로세스 설계",
            },
          ],
        },
        {
          text: "리서치",
          collapsed: false,
          base: "/posts/research",
          items: [],
        },
        {
          text: "품질",
          collapsed: false,
          base: "/posts/quality",
          items: [
            {
              text: "전략 품질 관리",
            },
            {
              text: "기획 품질 관리",
            },
            {
              text: "프로세스 품질 관리",
            },
            {
              text: "프로세스 품질 개선",
            },
            {
              text: "제품 운영 품질 관리",
            },
            {
              text: "제품 개발 품질 관리",
            },
            {
              text: "코드 품질 관리",
            },
          ],
        },
        {
          text: "리더십",
          collapsed: false,
          base: "/posts/leadership",
          items: [],
        },
      ],
      // "/portfolio/": [
      //   {
      //     text: "백엔드",
      //     link: "/portfolio/backends",
      //   },
      //   {
      //     text: "프론트엔드",
      //     link: "/portfolio/frontends",
      //   },
      //   {
      //     text: "아키텍트",
      //     link: "/portfolio/architect",
      //   },
      //   {
      //     text: "CTO",
      //     link: "/portfolio/cto",
      //   },
      //   {
      //     text: "PO",
      //     link: "/portfolio/product-owner",
      //   },
      //   {
      //     text: "기획",
      //     link: "/portfolio/planning",
      //   },
      // ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/centurio1987" },
      {
        icon: "linkedin",
        link: "https://www.linkedin.com/in/yoondeok-kim-319bb8145",
      },
    ],
  },
});
