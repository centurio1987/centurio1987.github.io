#!/usr/bin/env python3
"""Convert local image assets to WebP and update text references.

Dry-run by default. Use --apply to write files.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path


IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg"}
REF_SUFFIXES = {
    ".md",
    ".mdx",
    ".astro",
    ".css",
    ".scss",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".yml",
    ".yaml",
    ".html",
}
EXCLUDED_DIRS = {
    ".git",
    ".astro",
    ".cache",
    ".obsidian",
    ".vite",
    "node_modules",
    "dist",
    "out",
    "coverage",
}


@dataclass
class Conversion:
    src: Path
    out: Path
    src_size: int
    webp_size: int | None
    status: str
    reason: str = ""


@dataclass
class RefChange:
    path: Path
    count: int


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert PNG/JPG/JPEG assets to WebP and update references."
    )
    parser.add_argument("--root", default=".", help="Repository root. Default: cwd")
    parser.add_argument(
        "--assets-dir",
        default="public/images",
        help="Directory of image assets to scan. Default: public/images",
    )
    parser.add_argument(
        "--ref-root",
        default=".",
        help="Root for text reference scanning. Default: repo root",
    )
    parser.add_argument("--quality", type=int, default=82, help="WebP quality 1-100")
    parser.add_argument("--apply", action="store_true", help="Write changes")
    parser.add_argument(
        "--delete-originals",
        action="store_true",
        help="Delete converted originals after updating references. Requires --apply",
    )
    parser.add_argument(
        "--overwrite", action="store_true", help="Overwrite existing WebP outputs"
    )
    parser.add_argument(
        "--no-update-refs",
        action="store_true",
        help="Do not update text references",
    )
    return parser.parse_args()


def is_relative_to(path: Path, base: Path) -> bool:
    try:
        path.relative_to(base)
        return True
    except ValueError:
        return False


def find_converter(root: Path) -> tuple[str, str | None]:
    cwebp = shutil.which("cwebp")
    if cwebp:
        return ("cwebp", cwebp)
    sharp_dir = root / "node_modules" / "sharp"
    node = shutil.which("node")
    if node and sharp_dir.exists():
        return ("sharp", node)
    return ("", None)


def run_convert(
    converter: tuple[str, str | None], src: Path, out: Path, quality: int, root: Path
) -> None:
    name, exe = converter
    if not exe:
        raise RuntimeError("No converter found. Install cwebp or npm package sharp.")
    out.parent.mkdir(parents=True, exist_ok=True)
    if name == "cwebp":
        subprocess.run(
            [exe, "-quiet", "-q", str(quality), str(src), "-o", str(out)],
            check=True,
        )
        return
    if name == "sharp":
        code = (
            "const sharp = require('sharp');"
            "const [src,out,q] = process.argv.slice(1);"
            "sharp(src).webp({quality:Number(q)}).toFile(out)"
            ".catch(e=>{console.error(e); process.exit(1);});"
        )
        subprocess.run([exe, "-e", code, str(src), str(out), str(quality)], cwd=root, check=True)
        return
    raise RuntimeError(f"Unsupported converter: {name}")


def iter_images(assets_dir: Path) -> list[Path]:
    images: list[Path] = []
    for path in assets_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES:
            images.append(path)
    return sorted(images)


def convert_images(args: argparse.Namespace, root: Path) -> list[Conversion]:
    assets_dir = (root / args.assets_dir).resolve()
    converter = find_converter(root)
    if not converter[1]:
        raise SystemExit("ERROR: no WebP converter found. Install cwebp or local sharp.")

    results: list[Conversion] = []
    for src in iter_images(assets_dir):
        out = src.with_suffix(".webp")
        src_size = src.stat().st_size

        if out.exists() and not args.overwrite:
            results.append(
                Conversion(src, out, src_size, out.stat().st_size, "skipped", "webp exists")
            )
            continue

        try:
            if args.apply:
                run_convert(converter, src, out, args.quality, root)
                webp_size = out.stat().st_size
            else:
                with tempfile.TemporaryDirectory() as tmp:
                    tmp_out = Path(tmp) / out.name
                    run_convert(converter, src, tmp_out, args.quality, root)
                    webp_size = tmp_out.stat().st_size
            results.append(Conversion(src, out, src_size, webp_size, "converted"))
        except Exception as exc:  # noqa: BLE001 - report and continue
            results.append(Conversion(src, out, src_size, None, "failed", str(exc)))
    return results


def replacement_pairs(root: Path, conversions: list[Conversion]) -> list[tuple[str, str]]:
    pairs: list[tuple[str, str]] = []
    for item in conversions:
        if item.status != "converted":
            continue
        src = item.src
        out = item.out
        try:
            src_root_rel = src.relative_to(root)
            out_root_rel = out.relative_to(root)
        except ValueError:
            continue

        # public/foo.png -> public/foo.webp
        pairs.append((src_root_rel.as_posix(), out_root_rel.as_posix()))

        # /foo.png -> /foo.webp for files under public.
        parts = src_root_rel.parts
        if len(parts) >= 2 and parts[0] == "public":
            url_src = "/" + Path(*parts[1:]).as_posix()
            url_out = "/" + Path(*out_root_rel.parts[1:]).as_posix()
            pairs.append((url_src, url_out))

        # images/foo.png -> images/foo.webp.
        if len(parts) >= 2 and parts[0] == "public":
            pairs.append((Path(*parts[1:]).as_posix(), Path(*out_root_rel.parts[1:]).as_posix()))
    # Longest first prevents partial path surprises.
    return sorted(set(pairs), key=lambda pair: len(pair[0]), reverse=True)


def should_scan_ref(path: Path) -> bool:
    if path.suffix.lower() not in REF_SUFFIXES:
        return False
    return not any(part in EXCLUDED_DIRS for part in path.parts)


def update_references(
    root: Path, ref_root: Path, pairs: list[tuple[str, str]], apply: bool
) -> list[RefChange]:
    changes: list[RefChange] = []
    if not pairs:
        return changes
    for path in sorted(ref_root.rglob("*")):
        if not path.is_file() or not should_scan_ref(path):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        new_text = text
        count = 0
        for old, new in pairs:
            occurrences = new_text.count(old)
            if occurrences:
                new_text = new_text.replace(old, new)
                count += occurrences
        if count:
            changes.append(RefChange(path, count))
            if apply:
                path.write_text(new_text, encoding="utf-8")
    return changes


def delete_originals(conversions: list[Conversion], apply: bool) -> list[Path]:
    deleted: list[Path] = []
    for item in conversions:
        if item.status != "converted" or not item.out.exists():
            continue
        deleted.append(item.src)
        if apply:
            item.src.unlink()
    return deleted


def fmt_bytes(n: int | None) -> str:
    if n is None:
        return "-"
    units = ["B", "KB", "MB", "GB"]
    value = float(n)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.1f}{unit}" if unit != "B" else f"{int(value)}B"
        value /= 1024
    return f"{n}B"


def print_summary(
    args: argparse.Namespace,
    conversions: list[Conversion],
    refs: list[RefChange],
    deleted: list[Path],
) -> None:
    mode = "APPLY" if args.apply else "DRY-RUN"
    print(f"mode: {mode}")
    converted = [c for c in conversions if c.status == "converted"]
    skipped = [c for c in conversions if c.status == "skipped"]
    failed = [c for c in conversions if c.status == "failed"]
    print(f"converted: {len(converted)}")
    print(f"skipped:   {len(skipped)}")
    print(f"failed:    {len(failed)}")

    src_total = sum(c.src_size for c in converted)
    webp_total = sum(c.webp_size or 0 for c in converted)
    if converted:
        diff = src_total - webp_total
        pct = (diff / src_total * 100) if src_total else 0
        print(f"bytes:     {fmt_bytes(src_total)} -> {fmt_bytes(webp_total)} ({pct:.1f}% saved)")

    if converted:
        print("\nconverted files:")
        for c in converted:
            diff = c.src_size - (c.webp_size or 0)
            pct = (diff / c.src_size * 100) if c.src_size else 0
            marker = "larger" if diff < 0 else "saved"
            print(
                f"  {c.src.as_posix()} -> {c.out.as_posix()} "
                f"({fmt_bytes(c.src_size)} -> {fmt_bytes(c.webp_size)}, {abs(pct):.1f}% {marker})"
            )
    if skipped:
        print("\nskipped:")
        for c in skipped:
            print(f"  {c.src.as_posix()} ({c.reason})")
    if failed:
        print("\nfailed:")
        for c in failed:
            print(f"  {c.src.as_posix()} ({c.reason})")
    if refs:
        print("\nreference updates:")
        for r in refs:
            print(f"  {r.path.as_posix()} ({r.count})")
    else:
        print("\nreference updates: 0")
    if deleted:
        action = "deleted" if args.apply else "would delete"
        print(f"\noriginals {action}:")
        for path in deleted:
            print(f"  {path.as_posix()}")


def main() -> int:
    args = parse_args()
    if not 1 <= args.quality <= 100:
        print("ERROR: --quality must be between 1 and 100", file=sys.stderr)
        return 2
    if args.delete_originals and not args.apply:
        print("ERROR: --delete-originals requires --apply", file=sys.stderr)
        return 2

    root = Path(args.root).resolve()
    ref_root = (root / args.ref_root).resolve()
    if not ref_root.exists():
        print(f"ERROR: ref root not found: {ref_root}", file=sys.stderr)
        return 2
    assets_dir = (root / args.assets_dir).resolve()
    if not assets_dir.exists():
        print(f"ERROR: assets dir not found: {assets_dir}", file=sys.stderr)
        return 2
    if not is_relative_to(assets_dir, root):
        print("ERROR: assets dir must be inside root", file=sys.stderr)
        return 2

    conversions = convert_images(args, root)
    pairs = replacement_pairs(root, conversions)
    refs: list[RefChange] = []
    if not args.no_update_refs:
        refs = update_references(root, ref_root, pairs, args.apply)
    deleted: list[Path] = []
    if args.delete_originals:
        deleted = delete_originals(conversions, args.apply)
    print_summary(args, conversions, refs, deleted)
    return 1 if any(c.status == "failed" for c in conversions) else 0


if __name__ == "__main__":
    raise SystemExit(main())
