---
title: 포트폴리오
layout: portfolio
navbar: false
sidebar: false
prev: false
next: false
---

<Portfolio>
<template #cto>
<PortfolioCard :header="'cto1'" :subHeader="'거버넌스 구축'" :projectType="'governance'" :skillBadges="['vue', 'typescript']" :date="'2025/01 ~ 2025/06'" :tags="['기술', '혁신']">

# CTO Page1

</PortfolioCard>
<PortfolioCard :header="'cto2'" :subHeader="'거버넌스 구축2'" :projectType="'governance'" :skillBadges="['vue', 'typescript']" :date="'2025/01 ~ 2025/06'" :tags="['기술', '혁신']">

# CTO Page2

</PortfolioCard>
<PortfolioCard :header="'cto3'" :subHeader="'거버넌스 구축3'" :projectType="'governance'" :skillBadges="['vue', 'typescript']" :date="'2025/01 ~ 2025/06'" :tags="['기술', '혁신']">

# CTO Page3

</PortfolioCard> 
<PortfolioCard :header="'cto4'" :subHeader="'거버넌스 구축4'" :projectType="'governance'" :skillBadges="['vue', 'typescript']" :date="'2025/01 ~ 2025/06'" :tags="['기술', '혁신']">

# CTO Page4

</PortfolioCard> 
<PortfolioCard :header="'cto5'" :subHeader="'거버넌스 구축5'" :projectType="'governance'" :skillBadges="['vue', 'typescript']" :date="'2025/01 ~ 2025/06'" :tags="['기술', '혁신']">

# CTO Page5

</PortfolioCard> 
</template>
<template #po>
<PortfolioCard :header="'po1'" :subHeader="'제품 기획'" :projectType="'planning'" :skillBadges="['vue', 'typescript']" :date="'2025/01 ~ 2025/06'" :tags="['기술', '혁신']">

# PO Page1

</PortfolioCard>
</template>
<template #backend-engineer>
<PortfolioCard :header="'backend'" :subHeader="'구현'" :projectType="'implementation'" skillBadges="['vue', 'typescript']" :date="'2025/01 ~ 2025/06'" :tags="['기술', '혁신']">

# Backend Page1

</PortfolioCard>
</template>
</Portfolio>

<script setup>
import Portfolio from '/components/PortfolioV2/PortfolioV2.vue'
import PortfolioCard from '/components/PortfolioV2/PortfolioCard/PortfolioCard.vue';
import PortfolioCarouselContent from '/components/PortfolioCarousel/PortfolioCarouselContent.vue'
import ScrollAnimatedSection from '/components/ScrollAnimated/ScrollAnimatedSection.vue'
</script>
<style>
</style>

<!-- ---
title: 포트폴리오
layout: portfolio
navbar: false
sidebar: false
prev: false
next: false
---

<Portfolio>
<template #cto>
<PortfolioCarouselContent>

# CTO Page1

</PortfolioCarouselContent>
<PortfolioCarouselContent>

# CTO Page2

</PortfolioCarouselContent>
<PortfolioCarouselContent>

# CTO Page3

</PortfolioCarouselContent>
</template>
<template #po>
<PortfolioCarouselContent>

# PO

</PortfolioCarouselContent>
</template>
<template #backend-engineer>
<PortfolioCarouselContent>

# BE

</PortfolioCarouselContent>
</template>
</Portfolio>

<script setup>
import Portfolio from '/components/Portfolio/Portfolio.vue'
import PortfolioCarouselContent from '/components/PortfolioCarousel/PortfolioCarouselContent.vue'
import ScrollAnimatedSection from '/components/ScrollAnimated/ScrollAnimatedSection.vue'
</script>
<style>
</style> -->
