#!/bin/sh
# 换包：把 App 仓库构建出来的 APK 拷进站里，并把站上所有该改的数字改掉。
#   sh tools/publish-apk.sh                # 默认发 release 签名包
#   sh tools/publish-apk.sh --release      # 发 release 签名包
#   sh tools/publish-apk.sh --apk <路径>    # 指定 APK
#   sh tools/publish-apk.sh --no-assets     # 跳过重出分享卡/图标
#
# 为什么要有这个脚本：换包此前是手工四步（拷、算哈希、改三处、重出分享卡），
# 漏一步站点就会安静地散发旧包 —— 实际发生过：站上是 10-09 的包，
# 而 10-13 修了 18 个缺陷，四天里下载到的全是没修复的版本。
# 所以这里把「APK 比源码旧就拒绝发布」做成硬检查，而不是靠人记得。
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_REPO="${APP_REPO:-$ROOT/../Video to skill}"
APP_GRADLE="$APP_REPO/androidApp/app/build.gradle.kts"
BUILD_TYPE=release
DEFAULT_APK="$APP_REPO/androidApp/app/build/outputs/apk/release/app-release.apk"

APK="$DEFAULT_APK"
DO_ASSETS=1
while [ $# -gt 0 ]; do
  case "$1" in
    --release) BUILD_TYPE=release; APK="$APP_REPO/androidApp/app/build/outputs/apk/release/app-release.apk"; shift ;;
    --debug) BUILD_TYPE=debug; APK="$APP_REPO/androidApp/app/build/outputs/apk/debug/app-debug.apk"; shift ;;
    --apk) APK="$2"; shift 2 ;;
    --no-assets) DO_ASSETS=0; shift ;;
    *) echo "未知参数：$1" >&2; exit 2 ;;
  esac
done

[ -f "$APK" ] || { echo "找不到 APK：$APK" >&2; echo "先在 $APP_REPO/androidApp 里跑 ./gradlew :app:assemble${BUILD_TYPE^}" >&2; exit 1; }
[ -f "$APP_GRADLE" ] || { echo "找不到 $APP_GRADLE（用 APP_REPO=… 指定 App 仓库位置）" >&2; exit 1; }

# ---- 版本号从 build.gradle.kts 读，不写死 ----
VER="$(sed -n 's/.*versionName *= *"\([^"]*\)".*/\1/p' "$APP_GRADLE" | head -1)"
[ -n "$VER" ] || { echo "从 $APP_GRADLE 读不到 versionName" >&2; exit 1; }
CODE="$(sed -n 's/.*versionCode *= *\([0-9]*\).*/\1/p' "$APP_GRADLE" | head -1)"
[ -n "$CODE" ] || CODE=0

# ---- 硬检查：APK 必须比 App 源码新 ----
# 这正是当初放过旧包的那一步：包在、哈希也对，只是包是旧的。
# 只看 src/main：测试改了不需要重新打包。
NEWER="$(find "$APP_REPO/androidApp/app/src/main" -name '*.kt' -newer "$APK" 2>/dev/null | head -5)"
if [ -n "$NEWER" ]; then
  echo "拒绝发布：APK 比这些源文件旧，先重新构建。" >&2
  echo "$NEWER" | sed "s|$APP_REPO/androidApp/app/src/main/java/com/coursedistiller/app/|  |" >&2
  echo "  cd \"$APP_REPO/androidApp\" && ./gradlew :app:assemble${BUILD_TYPE^} --no-daemon" >&2
  exit 1
fi

NAME="Keliuzheng-$VER-$BUILD_TYPE.apk"
DEST="$ROOT/downloads/$NAME"
SZ="$(stat -f %z "$APK")"
HASH="$(shasum -a 256 "$APK" | cut -d' ' -f1)"
SIZE_TXT="$(python3 -c "print(f'{$SZ/1048576:.1f} MB')")"

echo "包    $NAME"
echo "版本  $VER"
echo "体积  $SIZE_TXT（$SZ 字节）"
echo "哈希  $HASH"
echo

cp "$APK" "$DEST"

# ---- 改站上的数字。用 python 而不是 sed：文案里有中文与斜杠 ----
python3 "$ROOT/tools/publish-apk.py" "$NAME" "$SIZE_TXT" "$SZ" "$HASH" "$VER" "$BUILD_TYPE" "$CODE"

if [ "$DO_ASSETS" = 1 ]; then
  sh "$ROOT/tools/make-assets.sh"
fi

echo
echo "改完这些文件："
cd "$ROOT" && git status --short
echo
echo "核对无误后：git add -A && git commit -m \"换包：v$VER\" && git push"
