export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatYear(date: Date): string {
  return String(date.getFullYear());
}

// 한국어 기준 대략적 읽기 시간 (분), 분당 약 500자
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const chars = body.replace(/\s/g, "").length;
  return Math.max(1, Math.round(chars / 500));
}
