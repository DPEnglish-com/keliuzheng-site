# 下载包

这里放站上下发的 Android 安装包。文件名固定包含版本号，换包时同步改
`index.html` 里的三处下载链接、版本与体积、SHA-256（已由脚本处理）。

## 当前

| 项 | 值 |
|---|---|
| 文件 | `Keliuzheng-0.3.0-release.apk` |
| 版本 | 0.3.0（versionCode 3）|
| applicationId | `com.coursedistiller.app` |
| 构建类型 | release（专用 keystore 签名）|
| 体积 | 13.2 MB（13,818,815 字节）|
| 系统要求 | Android 8.0 及以上（minSdk 26）|
| SHA-256 | `c7a06d718fb30bafcba0e6e6f67def2c9f37c192f16b41f948a894933602aa70` |

## 须知

- **这是 release 签名包**。签名材料不进仓库，备份在 `~/.coursedistiller/release/`；
  换包只换 APK，不改签名证书。
- 从 0.1.0 debug 包升级：debug 与 release 签名不同，Android 不允许覆盖安装，**必须先卸载旧版**；
  课程数据在后端，重装后用同一后端地址仍能读回。
- 后端地址是**编译期内置**的线上地址，用户可在 App 的「设置」里改。站上已写明这一点。
- 包从 App 仓库拷：`Video to skill/androidApp/app/build/outputs/apk/release/app-release.apk`。

## 发布清单

自动化了，跑 `sh tools/publish-apk.sh` 即可（从 App 仓库的 `build.gradle.kts` 读版本号，
拷包、算体积与 SHA-256、改写站上所有该改的数字、重出分享卡）。下面是它替你做掉的事，
留着是为了出问题时知道该核对什么：

- [ ] 新包拷进本目录，文件名带上版本号
- [ ] `shasum -a 256 <包名>`，更新到站点规格表与上表
- [ ] 同步 `index.html` 里三处：下载 href、版本与体积、SHA-256
- [ ] 站点上写明构建类型：debug 标「内测调试构建」，release 标「专用 keystore 签名」
- [ ] 提交：`git add -A && git commit -m "换包：v0.1.x"`

**别手工换包。** 换包最危险的失败不是改错数字（那会被断言拦住），
而是**包是旧的**：包在、哈希也对、页面自洽，只是它比源码旧 ——
站点会安静地散发一个没有最新修复的版本，而且没有任何地方会报错。
脚本拿 `src/main` 下 `.kt` 的 mtime 跟包比，比包新就拒绝发布。
