---
name: convert-images-webp
description: Convert local blog/site image assets (PNG/JPG/JPEG) to WebP and safely update Markdown, MDX, Astro, CSS, TS/TSX, and JSON references. Use when the user wants to optimize image assets, convert public images to WebP, reduce image weight, update asset paths, or perform a preview-first image migration without immediately deleting originals.
---

# Convert Images WebP

Use this skill for preview-first image optimization in this Astro blog.

## Workflow

1. Run a dry-run first:

```bash
python3 .claude/skills/convert-images-webp/scripts/convert_images_webp.py
```

2. Review the summary:
   - number of convertible images
   - estimated original/WebP bytes
   - reference replacements
   - skipped files and reasons

3. Apply conversion and reference updates:

```bash
python3 .claude/skills/convert-images-webp/scripts/convert_images_webp.py --apply
```

4. Build and verify:

```bash
bun run build
```

5. Delete originals only after the build passes and references have been checked:

```bash
python3 .claude/skills/convert-images-webp/scripts/convert_images_webp.py --apply --delete-originals
```

## Script Behavior

The bundled script:

- scans `public/images` by default
- converts `.png`, `.jpg`, `.jpeg` to sibling `.webp`
- skips existing `.webp` outputs unless `--overwrite` is provided
- updates text references in common source/content files
- handles Korean filenames and spaces
- excludes `.git`, `node_modules`, `dist`, `.astro`, and similar generated folders
- uses `cwebp` first; falls back to local `node_modules/sharp` if available
- defaults to dry-run and writes nothing unless `--apply` is present

## Common Options

```bash
python3 .claude/skills/convert-images-webp/scripts/convert_images_webp.py \
  --assets-dir public/images \
  --quality 82 \
  --apply
```

- `--assets-dir <path>`: image root to scan. Default: `public/images`.
- `--quality <1-100>`: WebP quality. Default: `82`.
- `--apply`: write WebP files and update references.
- `--delete-originals`: remove converted PNG/JPG/JPEG originals after references are updated. Requires `--apply`.
- `--overwrite`: regenerate existing `.webp` files.
- `--no-update-refs`: convert assets but do not edit references.
- `--ref-root <path>`: root used for reference scanning. Default: repo root.

## Safety Rules

- Never run with `--delete-originals` first.
- If `--apply` changes references, run `bun run build`.
- If the site has user-facing images with exact pixel expectations, inspect at least the affected post/page after build.
- If a WebP is larger than its source, report it; do not invent quality changes silently. Re-run with a lower `--quality` if needed.
