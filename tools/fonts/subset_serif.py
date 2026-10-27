#!/usr/bin/env python3
"""把思源宋体子集化，供本站标题与引文使用。

为什么不用系统衬线：中文衬线在 Windows / Android 上未必存在，
标题气质会掉；自托管一份子集最稳。
字符集 = 站点 HTML/CSS/JS 里出现的全部非 ASCII 字符 + ASCII + 常用标点。
授权：SIL OFL 1.1（可嵌入、可子集化、可随站点分发）。

用法：
    python3 tools/fonts/subset_serif.py
输出：
    assets/fonts/keliuzheng-serif.woff2
"""
from __future__ import annotations

import glob
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE_FILES = ["index.html", "styles.css", "main.js"]
SOURCE = os.path.expanduser("~/Library/Fonts/SourceHanSerifSC-Medium.otf")
OUTPUT = "assets/fonts/keliuzheng-serif.woff2"
PUNCT = ("　、。〃〈〉《》「」『』【】〔〕！＂＃％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝～"
         "·—–…‘’“”′″※→←↑↓↔•‣◦✓✗▸▾▴■□▲▼★☆§¶†‡±×÷≈≠≤≥∞−")


def site_characters() -> set[str]:
    chars: set[str] = set()
    for rel in SITE_FILES:
        path = os.path.join(ROOT, rel)
        try:
            text = open(path, encoding="utf-8").read()
        except (OSError, UnicodeDecodeError):
            continue
        chars |= {c for c in text if ord(c) > 0x7F}
    return chars


def main() -> int:
    if not os.path.exists(SOURCE):
        print(f"找不到源字体：{SOURCE}", file=sys.stderr)
        return 2
    charset = {chr(c) for c in range(0x20, 0x7F)} | site_characters() | set(PUNCT)
    codes = sorted({ord(c) for c in charset})
    print(f"站点字符集：{len(codes)} 个码位")
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as fh:
        fh.write(",".join(f"U+{code:04X}" for code in codes))
        codes_file = fh.name
    out = os.path.join(ROOT, OUTPUT)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    cmd = [
        sys.executable, "-m", "fontTools.subset", SOURCE,
        f"--unicodes-file={codes_file}",
        f"--output-file={out}",
        "--flavor=woff2",
        "--layout-features=*",
        "--name-IDs=*",
        "--recalc-bounds",
        "--drop-tables+=DSIG",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    os.unlink(codes_file)
    if result.returncode:
        print(result.stderr or result.stdout, file=sys.stderr)
        return result.returncode
    print(f"输出 {OUTPUT}  {os.path.getsize(out) / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
