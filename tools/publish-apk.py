#!/usr/bin/env python3
"""换包时改站上所有该改的数字。由 publish-apk.sh 调用。

每个替换都断言命中次数：页面结构一变就报错退出，而不是安静地少改一处
（少改一处 = 站上哈希与实际包对不上，用户校验会失败）。
"""
import pathlib
import re
import sys

name, size_txt, sz, h, ver, build_type, ver_code = sys.argv[1:8]
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
# index.html：三处下载链接、版本（JSON-LD / 首屏 / 下载区）、体积（按钮 / 下载区）、哈希
sub("index.html", r'href="(?:\./)?downloads/Keliuzheng-[^"]+\.apk"', f'href="downloads/{name}"', expect=3)
sub("index.html", r'("softwareVersion": ")[^"]+(")', rf"\g<1>{ver}\g<2>")
sub("index.html", r'(<span class="btn-note">)[^<]+(</span>)', rf"\g<1>{size_txt}\g<2>")
sub("index.html", r'(<p class="hero-meta mono">Android 8\.0\+<span>·</span>)[^<]+(</p>)', rf"\g<1>{ver}\g<2>")
# size_txt 自带单位（"13.2 MB"），所以这里连 "MB" 一起换掉；否则会写出 "13.2 MB MB"。
sub("index.html", r'(<p class="download-sub mono">release )[\d.]+( · Android 8\.0\+ · )[\d.]+\s*MB(</p>)',
    rf"\g<1>{ver}\g<2>{size_txt}\g<3>")
sub("index.html", r'(<dt>版本</dt><dd>)[^<]+(</dd>)', rf"\g<1>{ver}\g<2>")
sub("index.html", r'(<dt>体积</dt><dd>)[^<]+(</dd>)', rf"\g<1>{size_txt}\g<2>")
sub("index.html", r'(<code id="sha">)[0-9a-f]+(</code>)', rf"\g<1>{h}\g<2>")

# downloads/README.md：文件、版本、体积、哈希
# 表格里的空格不统一（有的 `| 值 |`、有的 `| 值|`），所以模式不锚定空格。
sub("downloads/README.md", r"(\| 文件 \| )`[^`]+`", rf"\g<1>`{name}`")
sub("downloads/README.md", r"(\| 版本 \| ).+?(\s*\|)",
    rf"\g<1>{ver}（versionCode {ver_code}）\g<2>")
sub("downloads/README.md", r"(\| 体积 \| ).+?(\s*\|)", rf"\g<1>{size_txt}（{sz:,} 字节）\g<2>")
sub("downloads/README.md", r"(\| SHA-256 \| )`[0-9a-f]+`", rf"\g<1>`{h}`")
if build_type == "release":
    sub("downloads/README.md", r"(\| 构建类型 \| ).+?(\s*\|)",
        r"\g<1>release（专用 keystore 签名）\g<2>")
    # 首次从 debug 切 release 时替换说明；之后再发布时这段已是 release，跳过。
    p = root / "downloads/README.md"
    if "只有 debug 包" in p.read_text():
        sub("downloads/README.md",
            r"(?s)- \*\*只有 debug 包\*\*。.*?别把 debug 包说成正式版。",
            "- **这是 release 签名包**。签名材料不进仓库，备份在 `~/.coursedistiller/release/`；\n"
            "  换包只换 APK，不改签名证书。")
    if "apk/debug/app-debug.apk" in p.read_text():
        sub("downloads/README.md", r"app/build/outputs/apk/debug/app-debug\.apk",
            "app/build/outputs/apk/release/app-release.apk")

# 分享卡：版本与体积
sub("tools/og.html", r"ANDROID · [\d.]+ · [\d.]+ MB", f"ANDROID · {ver} · {size_txt}")


# 体积单位重复过一次（"13.2 MB MB"）：页面自洽、脚本也不报错，只有人眼能看出来。
# 换包是手工活，加一道断言。
for path in ("index.html", "downloads/README.md", "tools/og.html"):
    body = (root / path).read_text()
    if "MB MB" in body or "MB MB" in body.replace(" ", ""):
        raise SystemExit(f"{path} 里体积单位重复了：{path}")
