# 课蒸馏 · 官网

课蒸馏（把一门 B 站网课蒸馏成讲义与师承）的对外站点。
静态单页，**手写源码、零构建**——推 `main` 即上线（GitHub Pages，legacy build，source = main / 根目录）。

线上地址：<https://dpenglish-com.github.io/keliuzheng-site/>
在「从头到脚」母站里，这个产品占**眼睛**这个部位。

## 文件

| 文件 | 作用 |
|---|---|
| `index.html` | 唯一的页面。SEO / OG / JSON-LD，四块：页头、首屏、下载、页脚 |
| `styles.css` | 全部样式。色板抄自 App 的 INK 卷，字阶/间距/动效令牌与母站、PaperEcho 同值 |
| `main.js` | 交互：阅读进度、页头结构线、入场淡入。零依赖，删了页面仍可读 |
| `assets/og.png` | 1200×630 分享卡，由 `tools/og.html` 生成 |
| `assets/apple-touch-icon.png` | 180×180，由 `tools/og.html` 一并生成 |
| `downloads/` | 站上下发的 APK，见该目录的 `README.md` |
| `favicon.svg` | 一枚朱印。纯几何、不含文字，不依赖系统字体 |
| `_headers` | APK 的 MIME + `assets/*` 长缓存。GitHub Pages 忽略，Cloudflare/Netlify 会读 |
| `.nojekyll` | 关 Jekyll，别让下划线开头的文件被吞 |

## 视觉与文案的规矩

视觉**不另起一套**，直接用 App 的 INK 卷（`Video to skill/.stitch/DESIGN.md`）：
宣纸底 `#F5F2EB`、焦墨字 `#0B0B0A`、单色朱砂 `#B23A26` 作强调；标题宋、正文 IBM Plex Sans、
数字与标签等宽 JetBrains Mono（带 `tabular-nums`）；圆角统一 4px（`--radius-ctl`）、零阴影、**零图标**。

**与母站、PaperEcho 共用一套骨架**：6 档字阶（`--t-display/title/lead/body/small/micro`）、
同一组间距与动效令牌（`--gutter/--maxw/--step`、`--dur-micro/ui/reveal`、`--ease/--ease-out-expo`）、
同一组组件名（`.site-header` / `.btn` / `.site-footer`）。差异只在色板 ——
这里是宣纸焦墨朱砂，母站是中性深色。改字号、间距、时长一律走令牌，不写死 px。

保留的签名：**朱印**（页头与页脚的方形印）、**等宽尾注**（首屏三项事实）。
双线报头、左侧批注已随「界面」「怎么做」区块一并撤下，若将来重新加回，照 `.stitch/DESIGN.md` 复现。

**删减原则**：官网只回答「这是什么、去哪下」。功能、流程、截图这类解释性内容
放在 App 内或别处，不放在下载站首页。页面越少，越不需要替产品辩解。

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
- 没实现的功能（账号、会员、云同步）不写成已有；
- 「只做个人学习的文字化」这类边界说明**不放在站上**（已于 2026-10-09 撤下，
  理由是页面要简洁，不靠免责声明撑场面）。它的实质仍由 App 内的设置页与产品本身承担。

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
