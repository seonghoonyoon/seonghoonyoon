#!/usr/bin/env python3
"""Watch `assets/img/` and run the optimizer on save.

Usage:
  python assets/scripts/watch_optimize.py
Options:
  --src PATH        Source images directory (default: assets/img)
  --debounce FLOAT  Debounce seconds to wait before running (default: 1.0)
  --cmd             Custom command to run (optional; defaults to running optimize_images.py with recommended args)
"""

import argparse
import subprocess
import threading
import sys
import time
from pathlib import Path

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

IMAGE_EXTS = {'.jpg','.jpeg','.png','.webp','.gif','.svg'}


class OptimizeHandler(FileSystemEventHandler):
    def __init__(self, cmd, debounce=1.0):
        self.cmd = cmd
        self.debounce = debounce
        self.timer = None

    def _schedule(self):
        if self.timer:
            self.timer.cancel()
        self.timer = threading.Timer(self.debounce, self._run)
        self.timer.daemon = True
        self.timer.start()

    def _run(self):
        print(f"[{time.strftime('%H:%M:%S')}] Running optimizer: {' '.join(self.cmd)}")
        try:
            subprocess.run(self.cmd, check=False)
        except Exception as e:
            print('Optimizer failed:', e)

    def on_created(self, event):
        if event.is_directory: return
        if Path(event.src_path).suffix.lower() in IMAGE_EXTS:
            self._schedule()

    def on_modified(self, event):
        if event.is_directory: return
        if Path(event.src_path).suffix.lower() in IMAGE_EXTS:
            self._schedule()


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--src', default='assets/img')
    p.add_argument('--debounce', type=float, default=1.0)
    p.add_argument('--cmd', nargs=argparse.REMAINDER, help='Custom command to run; if omitted a sensible default is used')
    args = p.parse_args()

    src = Path(args.src)
    if not src.exists():
        print('Source directory does not exist:', src)
        return 2

    if args.cmd and len(args.cmd) > 0:
        cmd = args.cmd
    else:
        # default: run the optimize script using the same python interpreter
        cmd = [sys.executable, 'assets/scripts/optimize_images.py', '--src', str(src), '--out', str(src / 'optimized'), '--sizes', '1600,800,400', '--update-manifest']

    event_handler = OptimizeHandler(cmd, debounce=args.debounce)
    observer = Observer()
    observer.schedule(event_handler, str(src), recursive=True)
    observer.start()

    print(f'Watching {src.resolve()} for image changes. Running: {" ".join(cmd)}')
    print('Press Ctrl+C to stop.')

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print('Stopping watcher...')
        observer.stop()
    observer.join()


if __name__ == '__main__':
    sys.exit(main())
