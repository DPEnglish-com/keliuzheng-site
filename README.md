# 课蒸馏 · 官网

课蒸馏（把一门 B 站网课蒸馏成讲义与师承）的对外站点。
静态单页，**手写源码、零构建**——推 `main` 即上线（GitHub Pages，legacy build，source = main / 根目录）。

线上地址：<https://dpenglish-com.github.io/keliuzheng-site/>
在「从头到脚」母站里，这个产品占**眼睛**这个部位。

## 文件

| 文件 | 作用 |
|---|---|
| `index.html` | 唯一的页面。SEO / OG / JSON-LD，五块：首屏、宣传片、流程演示、下载、页脚 |
| `styles.css` | 全部样式。色板取自 PaperEcho 的 INK：纸面、焦墨、单一朱红；直角、细线、零投影 |
| `main.js` | 交互：主题、阅读进度、四步演示、六栏切换、复制校验值。零依赖，无外部请求 |
| `assets/film/promo-56s.mp4` | 56 秒产品宣传片（1080P、无旁白），首屏下方的 `<video>` 直接引用 |
| `assets/film/poster.jpg` | 宣传片的封面图，`preload="metadata"` 时不下载正片 |
| `assets/og.png` | 1200×630 分享卡，由 `tools/og.html` 生成 |
| `assets/apple-touch-icon.png` | 180×180，由 `tools/icon.html` 生成 |
| `assets/fonts/keliuzheng-serif.woff2` | 自托管思源宋体子集（OFL），由 `tools/fonts/subset_serif.py` 生成 |
| `assets/fonts/LICENSE-SourceHanSerif.txt` | 上面那份字体的授权文本，不要删 |
| `downloads/` | 站上下发的 APK，见该目录的 `README.md` |
| `favicon.svg` | 一枚朱印。纯几何、不含文字，不依赖系统字体 |
| `_headers` | APK 的 MIME + `assets/*` 长缓存。GitHub Pages 忽略，Cloudflare/Netlify 会读 |
| `.nojekyll` | 关 Jekyll，别让下划线开头的文件被吞 |

## 视觉与文案的规矩

视觉以 **PaperEcho 的 INK** 为参照，不另起一套：纸面 `#F4F1EA`、抬升纸面 `#E7E1D4`、
焦墨 `#0A0A0A`、单一朱红 `#C0432A`。标题用自托管思源宋体子集，正文系统无衬线、数字与标签等宽；
全部直角、零投影、零图标（朱印与 CSS 圆点是排版记号，不是图标库），没有 `backdrop-filter`。
暗色模式把纸变墨、墨变纸，朱红提亮；所有颜色只从 `styles.css` 的 `:root` 取值。改标题或新增文案后重跑
`python3 tools/fonts/subset_serif.py`，否则新字会回退到系统字体；重子集化后把 CSS 与预载里的 `?v=` 加一。

页面只保留五块：首屏、宣传片、流程演示、下载、页脚。**流程演示**是唯一的解释性内容，
也是产品的第一体验：贴链接 → 选讲次 → 蒸馏 → 读讲义。它完全在本地跑，
明确标注「示例」「不联网」，不调用后端、不承诺真实结果。除这一段外，
不堆功能清单、截图、FAQ 或免责声明。

**分寸**：主操作走焦墨填充，朱红只做「当前 / 时间锚点 / 悬停」这类标点；
正文不加大于 `0.05em` 的字距；承载信息的文字不小于 11px。
文案沿用 App 的固定用词（课蒸馏 · 收进书架 · 解析 · 选讲次 · 开始蒸馏 · 讲次 · 讲义 ·
词条 · 师承 · 批注 · 尾注 · 用量 · 继续听 · 问老师 · 交付自检），并遵守它的替代表：
不出现 `token` / `stage` / `ASR` / `USD` 这类工程词，不出现 emoji、圆角卡片、红黄绿。

**合规红线**（改文案时最容易踩）：

- 不说「可下载视频 / 音频 / 离线保存」——站内播放只取公开内容，不落盘、不转发；
- 不暗示开源，不给源码仓库链接（本项目闭源商用）；
- 不引导用户填任何服务商凭据；
- 没实现的功能（账号、会员、云同步）不写成已有；
- 不把演示里的示例课程说成真实解析结果；演示不联网，也不收集链接。

## 换包 / 改版

换 APK 用 `tools/publish-apk.sh`，别手工改：

```bash
cd /Users/ywlukiya/Projects/Video\ to\ skill/androidApp && ./gradlew :app:assembleDebug --no-daemon
cd /Users/ywlukiya/Projects/keliuzheng-site && sh tools/publish-apk.sh
```

它会拷包、从 `build.gradle.kts` 读版本号、算体积与 SHA-256，改写 `index.html`、
`downloads/README.md`、`tools/og.html` 里所有该改的数字，最后重出分享卡与图标。

**它会在包比源码旧时拒绝发布** —— 这正是当初放过旧包的那一步：包在、哈希也对，
只是包是旧的，于是站点安静地散发了四天没修复的版本。手工换包一定会再犯，所以做成硬检查。

替换都带命中次数断言，页面结构一变就报错退出，而不是安静地少改一处
（少改一处 = 站上哈希与实际包对不上，用户校验会失败）。脚本是幂等的，重复跑不会改坏。

只改文案、不换包时：

```bash
cd /Users/ywlukiya/Projects/keliuzheng-site
python3 tools/fonts/subset_serif.py   # 文案里可能出现新字，重子集化
sh tools/make-assets.sh               # 重出分享卡与图标
```

## 部署

```bash
cd /Users/ywlukiya/Projects/keliuzheng-site && git add -A && git commit -m "…" && git push
```

推 `main` 即上线，无需 workflow。仓库公开、Pages 走 legacy build。
