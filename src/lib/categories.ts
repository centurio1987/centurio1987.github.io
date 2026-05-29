export interface CategoryMeta {
  slug: string;
  label: string;
  color: string;
}

// 디자인 컨셉 v0.2 — 흙빛 다색 카테고리 팔레트
export const CATEGORIES: CategoryMeta[] = [
  { slug: "planning", label: "기획", color: "#3E6B4F" },
  { slug: "architecture", label: "아키텍처", color: "#4E6CA8" },
  { slug: "strategy", label: "전략", color: "#A84B4B" },
  { slug: "skills", label: "기술", color: "#3E6B6B" },
  { slug: "design", label: "설계", color: "#7A5C7E" },
  { slug: "research", label: "리서치", color: "#B07A2E" },
  { slug: "quality", label: "품질", color: "#6B6B3E" },
  { slug: "leadership", label: "리더십", color: "#B5602E" },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [
  string,
  ...string[]
];

const BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug: string): CategoryMeta {
  return (
    BY_SLUG.get(slug) ?? { slug, label: slug, color: "#6B665C" }
  );
}
