#!/usr/bin/env python3
"""
Optimize and validate artwork images.

Usage:
  python assets/scripts/optimize_images.py [--src assets/img] [--out assets/img/optimized] [--sizes 1600,800,400] [--max-size 2000000]

What it does:
- Scans `assets/img/` (recursively) for raster images (jpg,jpeg,png,webp,gif) and SVGs.
- Validates dimensions and file size, printing warnings.
- Produces resized variants (large/medium/small) and WebP copies under the output folder.
- Leaves originals untouched by default (use --overwrite to replace originals).

This script requires the Python packages in `requirements.txt` (Pillow, tqdm).
"""

import argparse
import json
import os
from pathlib import Path
from PIL import Image, ImageOps
from tqdm import tqdm

SUPPORTED_RASTERS = ('.jpg', '.jpeg', '.png', '.webp', '.gif')
SUPPORTED_VECTORS = ('.svg',)


def human(n):
    for unit in ['B','KB','MB','GB']:
        if n < 1024.0:
            return f"{n:.1f}{unit}"
        n /= 1024.0
    return f"{n:.1f}TB"


def process_raster(path: Path, out_dir: Path, sizes, max_size_bytes, src_base: Path, overwrite=False):
    info = {'path': str(path), 'warnings': []}
    try:
        with Image.open(path) as im:
            im.load()
            width, height = im.size
            mode = im.mode
        size_bytes = path.stat().st_size

        if width > max(sizes) * 1.5:
            info['warnings'].append(f'Large width ({width}px) > recommended max')
        if size_bytes > max_size_bytes:
            info['warnings'].append(f'Large file size ({human(size_bytes)}) > {human(max_size_bytes)}')

        # Prepare output dirs: preserve relative path from source base
        try:
            rel_parent = path.parent.relative_to(src_base)
        except Exception:
            rel_parent = Path('.')

        for w in sizes:
            # compute target path
            target_dir = out_dir / f'{w}' / rel_parent
            target_dir.mkdir(parents=True, exist_ok=True)
            target_path = target_dir / path.name

            # Resize if wider than target
            with Image.open(path) as im:
                im = ImageOps.exif_transpose(im)
                if im.width > w:
                    ratio = w / im.width
                    new_h = max(1, int(im.height * ratio))
                    im_resized = im.resize((w, new_h), Image.LANCZOS)
                else:
                    im_resized = im.copy()

                # Decide format: preserve alpha for png/gif, otherwise save jpeg
                ext = path.suffix.lower()
                if ext in ('.png',) and ('A' in im_resized.getbands() or im_resized.mode in ('RGBA','LA')):
                    im_resized.save(target_path, optimize=True)
                else:
                    # convert to RGB for JPEG
                    if im_resized.mode in ('RGBA','LA','P'):
                        bg = Image.new('RGB', im_resized.size, (255,255,255))
                        bg.paste(im_resized, mask=im_resized.split()[-1])
                        im_out = bg
                    else:
                        im_out = im_resized.convert('RGB')
                    im_out.save(target_path.with_suffix('.jpg'), format='JPEG', quality=85, optimize=True)

                # also write webp
                webp_dir = out_dir / 'webp' / rel_parent
                webp_dir.mkdir(parents=True, exist_ok=True)
                webp_path = webp_dir / (path.stem + f'-{w}.webp')
                im_resized.save(webp_path, format='WEBP', quality=80, method=6)

        # Also create a copy of the original as full-size webp
        full_webp_dir = out_dir / 'webp' / rel_parent
        full_webp_dir.mkdir(parents=True, exist_ok=True)
        with Image.open(path) as im:
            im = ImageOps.exif_transpose(im)
            im.save(full_webp_dir / (path.stem + '-full.webp'), format='WEBP', quality=85, method=6)

    except Exception as e:
        info['warnings'].append(f'Error processing: {e}')

    return info


def process_vector(path: Path, out_dir: Path, src_base: Path):
    # For SVGs just copy to optimized folder (can be further optimized with SVGO externally)
    info = {'path': str(path), 'warnings': []}
    try:
        try:
            rel_parent = path.parent.relative_to(src_base)
        except Exception:
            rel_parent = Path('.')
        target_dir = out_dir / 'svg' / rel_parent
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / path.name
        with open(path, 'rb') as src, open(target_path, 'wb') as dst:
            dst.write(src.read())
    except Exception as e:
        info['warnings'].append(f'Error copying SVG: {e}')
    return info


def main():
    p = argparse.ArgumentParser(description='Validate and optimize images in assets/img')
    p.add_argument('--src', default='assets/img', help='Source images directory')
    p.add_argument('--out', default='assets/img/optimized', help='Output base directory for optimized images')
    p.add_argument('--sizes', default='1600,800,400', help='Comma-separated target widths')
    p.add_argument('--max-size', type=int, default=2_000_000, help='Warn if file size exceeds this many bytes')
    p.add_argument('--overwrite', action='store_true', help='Overwrite originals (use with caution)')
    p.add_argument('--update-manifest', action='store_true', help='Update assets/data/manifest.json to point to optimized WebP files when available')
    args = p.parse_args()

    src = Path(args.src)
    out = Path(args.out)
    sizes = [int(x) for x in args.sizes.split(',') if x.strip().isdigit()]

    if not src.exists():
        print(f'Source directory not found: {src}')
        return 2

    paths = [p for p in src.rglob('*') if p.is_file() and p.suffix.lower() in SUPPORTED_RASTERS + SUPPORTED_VECTORS]
    if not paths:
        print('No supported images found in', src)
        return 0

    print(f'Found {len(paths)} images — processing into {out} (sizes: {sizes})')

    results = []
    for path in tqdm(paths, desc='Images'):
        if path.suffix.lower() in SUPPORTED_RASTERS:
            info = process_raster(path, out, sizes, args.max_size, src, overwrite=args.overwrite)
        else:
            info = process_vector(path, out, src)
        results.append(info)

    # Summary
    warns = sum(1 for r in results if r.get('warnings'))
    print('\nSummary:')
    print('Processed:', len(results))
    print('With warnings:', warns)

    if warns:
        print('\nWarnings detail:')
        for r in results:
            if r.get('warnings'):
                print('-', r['path'])
                for w in r['warnings']:
                    print('   •', w)

    print('\nFinished. Optimized images are in', out)
    # Optionally update manifest.json to reference optimized webp paths
    if args.update_manifest:
        manifest_path = Path('assets/data/manifest.json')
        if manifest_path.exists():
            try:
                with open(manifest_path, 'r', encoding='utf-8') as f:
                    manifest = json.load(f)
            except Exception as e:
                print('Could not read manifest.json:', e)
                return 0

            updated = 0
            def find_local_optimized(original_src, widths=[400,800,1600]):
                if not original_src or not isinstance(original_src, str):
                    return None
                s = original_src.lstrip('/')
                if s.startswith('assets/img/'):
                    rel = s[len('assets/img/'):]
                else:
                    rel = s
                rel_no_ext = os.path.splitext(rel)[0]
                for w in widths:
                    candidate = out / 'webp' / (rel_no_ext + f'-{w}.webp')
                    if candidate.exists():
                        return f'/{out.as_posix()}/webp/{rel_no_ext}-{w}.webp'
                # try full
                candidate = out / 'webp' / (rel_no_ext + '-full.webp')
                if candidate.exists():
                    return f'/{out.as_posix()}/webp/{rel_no_ext}-full.webp'
                return None

            for proj in manifest.get('projects', []):
                thumb = proj.get('thumbnail')
                new_thumb = find_local_optimized(thumb)
                if new_thumb:
                    proj['thumbnail'] = new_thumb
                    updated += 1
                for img in proj.get('images', []):
                    src = img.get('src')
                    new_src = find_local_optimized(src)
                    if new_src:
                        img['src'] = new_src
                        updated += 1

            # backup and write
            try:
                backup = manifest_path.with_suffix('.json.bak')
                manifest_path.replace(backup)
                with open(manifest_path, 'w', encoding='utf-8') as f:
                    json.dump(manifest, f, ensure_ascii=False, indent=2)
                print(f'Updated manifest.json — {updated} entries changed (backup saved to {backup.name})')
            except Exception as e:
                print('Failed to update manifest.json:', e)

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
