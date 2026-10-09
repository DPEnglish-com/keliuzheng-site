# 课蒸馏 · 官网

课蒸馏（把一门 B 站网课蒸馏成讲义与师承）的对外站点。
静态单页，**手写源码、零构建**——推 `main` 即上线（GitHub Pages，legacy build，source = main / 根目录）。

线上地址：<https://dpenglish-com.github.io/keliuzheng-site/>
在「从头到脚」母站里，这个产品占**眼睛**这个部位。

## 文件

| 文件 | 作用 |
|---|---|
| `index.html` | 唯一的页面。SEO / OG / JSON-LD、页头、六个 section、页脚 |
| `styles.css` | 全部样式。token 驱动，设计 token 抄自 App 的 INK 卷 |
| `main.js` | 交互：阅读进度、页头状态、导航当前项、入场淡入、页脚年份。零依赖，删了页面仍可读 |
| `assets/shots/*.webp` | 界面截图（由 App 仓库 `.stitch/shots/` 的渲染稿转出） |
| `assets/og.png` | 1200×630 分享卡，由 `tools/og.html` 生成 |
| `assets/apple-touch-icon.png` | 180×180，由 `tools/og.html` 一并生成 |
| `downloads/` | 站上下发的 APK，见该目录的 `README.md` |
| `favicon.svg` | 一枚朱印。纯几何、不含文字，不依赖系统字体 |
| `_headers` | APK 的 MIME + `assets/*` 长缓存。GitHub Pages 忽略，Cloudflare/Netlify 会读 |
| `.nojekyll` | 关 Jekyll，别让下划线开头的文件被吞 |

## 视觉与文案的规矩

视觉**不另起一套**，直接用 App 的 INK 卷（`Video to skill/.stitch/DESIGN.md`）：
宣纸底 `#F5F2EB`、焦墨字 `#0B0B0A`、单色朱砂 `#B23A26` 作强调；标题宋、正文 IBM Plex Sans、
数字与标签等宽 JetBrains Mono（带 `tabular-nums`）；圆角统一 2px、零阴影、**零图标**。

四个必须复现的签名：**双线报头**、**朱印**、**等宽尾注**、**左侧批注**。

两处与 App 的刻意差异：

- 主操作走**焦墨填充**（INK 组件表的规定），朱砂只留给印 / 当前 / 批注，
  保证每屏朱砂不超过三处；
- 入场**只有淡入、没有位移**——INK 明写「页面切换不做位移」。

文案沿用 App 的固定用词（课蒸馏 · 收进书架 · 解析 · 选讲次 · 开始蒸馏 · 讲次 · 讲义 ·
词条 · 师承 · 批注 · 尾注 · 用量 · 继续听 · 问老师 · 交付自检），并遵守它的替代表：
不出现 `token` / `stage` / `ASR` / `USD` 这类工程词，不出现 emoji、圆角卡片、红黄绿。

**合规红线**（改文案时最容易踩）：

- 不说「可下载视频 / 音频 / 离线保存」——站内播放只取公开内容，不落盘、不转发；
- 不暗示开源，不给源码仓库链接（本项目闭源商用）；
- 不引导用户填任何服务商凭据；
- 没实现的功能（账号、会员、云同步）不写成已有。

## 换包 / 改版

换 APK：照 `downloads/README.md` 的发布清单，改 `index.html` 里的三处（href、版本与体积、SHA-256）。

重出分享卡与图标：

```bash
cd /Users/ywlukiya/Projects/keliuzheng-site && sh tools/make-assets.sh
```

## 部署

```bash
cd /Users/ywlukiya/Projects/keliuzheng-site && git add -A && git commit -m "…" && git push
```

推 `main` 即上线，无需 workflow。仓库公开、Pages 走 legacy build。
