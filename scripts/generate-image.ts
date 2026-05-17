#!/usr/bin/env bun
// Usage: bun run scripts/generate-image.ts "<prompt>" "<output-path>"
// Requires: OPENAI_API_KEY environment variable
// Output: webp image saved to <output-path> (parent dirs created as needed)

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const [, , prompt, outputPath] = process.argv;

if (!prompt || !outputPath) {
  console.error('Usage: bun run scripts/generate-image.ts "<prompt>" "<output-path>"');
  process.exit(1);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is not set");
  process.exit(1);
}

const res = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "gpt-image-1",
    prompt,
    size: "1536x1024",
    output_format: "webp",
    n: 1,
  }),
});

if (!res.ok) {
  const body = await res.text();
  console.error(`OpenAI API error ${res.status}: ${body}`);
  process.exit(1);
}

const json = (await res.json()) as { data?: Array<{ b64_json?: string }> };
const b64 = json.data?.[0]?.b64_json;
if (!b64) {
  console.error("OpenAI response missing b64_json");
  console.error(JSON.stringify(json, null, 2));
  process.exit(1);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, Buffer.from(b64, "base64"));
console.log(outputPath);
