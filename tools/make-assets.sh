#!/bin/sh
# 重出分享卡与主屏图标。需要本机装了 Google Chrome。
#   sh tools/make-assets.sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -x "$CHROME" ]; then
  echo "找不到 Google Chrome：$CHROME" >&2
  exit 1
fi

shot() { # $1=源 html  $2=宽  $3=高  $4=输出
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size="$2,$3" \
    --screenshot="$4" "file://$1" >/dev/null 2>&1
  printf '%-46s %s\n' "${4#$ROOT/}" "$(sips -g pixelWidth -g pixelHeight "$4" 2>/dev/null | awk -F': ' '/pixelWidth/{w=$2}/pixelHeight/{h=$2}END{print w"x"h}')"
}

shot "$ROOT/tools/og.html"   1200 630 "$ROOT/assets/og.png"
shot "$ROOT/tools/icon.html"  180 180 "$ROOT/assets/apple-touch-icon.png"
