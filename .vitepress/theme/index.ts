import DefaultTheme from "vitepress/theme";
import PortfolioLayout from "./custom/PortfolioLayout.vue";
import "./main.css";

// export default DefaultTheme;

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    app.component("portfolio", PortfolioLayout);
  },
};
