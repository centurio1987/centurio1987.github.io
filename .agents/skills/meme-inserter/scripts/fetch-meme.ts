#!/usr/bin/env bun
/**
 * fetch-meme.ts — 힌트 쿼리로 인터넷 밈/움짤을 검색해 로컬 파일로 저장한다.
 *
 * 사용법:
 *   bun run fetch-meme.ts "<검색 쿼리>" "<확장자 없는 출력 경로>"
 *   예) bun run fetch-meme.ts "this is fine dog fire" "public/images/my-slug/memes/1"
 *
 * 소스 우선순위: TENOR_API_KEY → GIPHY_API_KEY.
 * 성공 시 stdout에 JSON 한 줄을 출력하고 exit 0:
 *   {"ok":true,"path":"public/images/my-slug/memes/1.gif","source":"tenor","url":"https://...","ext":"gif"}
 * 둘 다 키가 없으면 exit 3 + stderr "NO_API_KEY" (호출자가 WebSearch 폴백으로 전환).
 * 검색 결과 없음/네트워크 실패는 exit 4 + stderr 사유.
 */

const [, , queryArg, outBaseArg] = process.argv;

if (!queryArg || !outBaseArg) {
  console.error("usage: fetch-meme.ts \"<query>\" \"<output-path-without-ext>\"");
  process.exit(2);
}

const query = queryArg.trim();
const outBase = outBaseArg.replace(/\.(gif|webp|png|jpe?g)$/i, ""); // 확장자 실수로 붙었으면 제거

const TENOR_KEY = process.env.TENOR_API_KEY?.trim();
const GIPHY_KEY = process.env.GIPHY_API_KEY?.trim();

if (!TENOR_KEY && !GIPHY_KEY) {
  console.error("NO_API_KEY");
  process.exit(3);
}

type Hit = { url: string; source: string };

async function searchTenor(): Promise<Hit | null> {
  if (!TENOR_KEY) return null;
  const u = new URL("https://tenor.googleapis.com/v2/search");
  u.searchParams.set("q", query);
  u.searchParams.set("key", TENOR_KEY);
  u.searchParams.set("limit", "12");
  u.searchParams.set("media_filter", "gif");
  u.searchParams.set("contentfilter", "medium");
  // 한국 밈 가중치: 한국 로케일·국가로 검색 결과를 국내 콘텐츠 쪽으로 편향.
  u.searchParams.set("locale", "ko_KR");
  u.searchParams.set("country", "KR");
  const res = await fetch(u);
  if (!res.ok) return null;
  const data: any = await res.json();
  const results: any[] = data?.results ?? [];
  for (const r of results) {
    const url = r?.media_formats?.gif?.url ?? r?.media_formats?.mediumgif?.url;
    if (url) return { url, source: "tenor" };
  }
  return null;
}

async function searchGiphy(): Promise<Hit | null> {
  if (!GIPHY_KEY) return null;
  const u = new URL("https://api.giphy.com/v1/gifs/search");
  u.searchParams.set("api_key", GIPHY_KEY);
  u.searchParams.set("q", query);
  u.searchParams.set("limit", "12");
  u.searchParams.set("rating", "pg-13");
  // 한국 밈 가중치: 한국어 결과 우선.
  u.searchParams.set("lang", "ko");
  const res = await fetch(u);
  if (!res.ok) return null;
  const data: any = await res.json();
  const results: any[] = data?.data ?? [];
  for (const r of results) {
    const url = r?.images?.original?.url ?? r?.images?.downsized_medium?.url;
    if (url) return { url, source: "giphy" };
  }
  return null;
}

function extFromUrlOrType(url: string, contentType: string | null): string {
  const ct = (contentType ?? "").toLowerCase();
  if (ct.includes("gif")) return "gif";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("png")) return "png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  const m = url.split("?")[0].match(/\.(gif|webp|png|jpe?g)$/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "gif";
}

async function download(hit: Hit): Promise<{ path: string; ext: string }> {
  const res = await fetch(hit.url);
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const ext = extFromUrlOrType(hit.url, res.headers.get("content-type"));
  const path = `${outBase}.${ext}`;
  const buf = new Uint8Array(await res.arrayBuffer());
  // Bun.write는 상위 디렉터리를 자동 생성한다.
  await Bun.write(path, buf);
  return { path, ext };
}

try {
  const hit = (await searchTenor()) ?? (await searchGiphy());
  if (!hit) {
    console.error(`NO_RESULT: "${query}"`);
    process.exit(4);
  }
  const { path, ext } = await download(hit);
  console.log(JSON.stringify({ ok: true, path, source: hit.source, url: hit.url, ext }));
  process.exit(0);
} catch (e: any) {
  console.error(`FETCH_FAILED: ${e?.message ?? e}`);
  process.exit(4);
}
