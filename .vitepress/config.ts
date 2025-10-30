import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  
  title: "하얀마음흑구",
  description: "표현할 수 있어야 지식이다",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Resume', link: '/resume'},
      { text: 'Portfolio', link: '/portfolio' },
      { text: 'Post', link: '/posts'}
    ],

    sidebar: [
      {
        text: '포스트',
        target: '/posts',
        collapsed: true,
        items: [
          { text: '포스트', link: '/posts/' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/centurio1987' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/yoondeok-kim-319bb8145'}
    ]
  }
})
