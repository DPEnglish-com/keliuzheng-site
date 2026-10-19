#!/usr/bin/env python3
"""换包时改站上所有该改的数字。由 publish-apk.sh 调用。

每个替换都断言命中次数：页面结构一变就报错退出，而不是安静地少改一处
（少改一处 = 站上哈希与实际包对不上，用户校验会失败）。
"""
import pathlib
import re
import sys

name, size_txt, sz, h, ver = sys.argv[1:6]
sz = int(sz)
root = pathlib.Path(__file__).resolve().parent.parent


def sub(path: str, pattern: str, repl: str, expect: int = 1) -> None:
    p = root / path
    text = p.read_text()
    new, n = re.subn(pattern, repl, text)
    if n != expect:
        raise SystemExit(
            f"{path}: 期望替换 {expect} 处，实际 {n} 处。\n"
            f"  模式: {pattern}\n"
            f"  页面结构可能变了 —— 先核对再改，别让站上的数字与包对不上。"
        )
    p.write_text(new)
    print(f"  {path}  {n} 处")


print("改写：")
# index.html：下载 href（首屏 + 下载区各一处）、体积（规格表 + 按钮文案）、哈希
sub("index.html", r'href="\./downloads/Keliuzheng-[^"]+\.apk"', f'href="./downloads/{name}"', expect=2)
sub("index.html", r'(<dt>体积</dt><dd>)[^<]+(</dd>)', rf"\g<1>{size_txt}\g<2>")
sub("index.html", r'(下载 APK（)[^）]+(）)', rf"\g<1>{size_txt}\g<2>")
sub("index.html", r'(<code class="hash">)[0-9a-f]+(</code>)', rf"\g<1>{h}\g<2>")

# downloads/README.md：文件、版本、体积、哈希
# 表格里的空格不统一（有的 `| 值 |`、有的 `| 值|`），所以模式不锚定空格。
sub("downloads/README.md", r"(\| 文件 \| )`[^`]+`", rf"\g<1>`{name}`")
sub("downloads/README.md", r"(\| 体积 \| ).+?(\s*\|)", rf"\g<1>{size_txt}（{sz:,} 字节）\g<2>")
sub("downloads/README.md", r"(\| SHA-256 \| )`[0-9a-f]+`", rf"\g<1>`{h}`")

# 分享卡：版本与体积
sub("tools/og.html", r"Android · [\d.]+ · [\d.]+ MB", f"Android · {ver} · {size_txt}")
