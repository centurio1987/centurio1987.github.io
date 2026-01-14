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
</style>
