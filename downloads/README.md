# 下载包

这里放站上下发的 Android 安装包。文件名固定包含版本号，换包时同步改
`index.html` 里的三处（href、版本与体积、SHA-256）。

## 当前

| 项 | 值 |
|---|---|
| 文件 | `Keliuzheng-0.1.0-debug.apk` |
| 版本 | 0.1.0（versionCode 1）|
| applicationId | `com.coursedistiller.app` |
| 构建类型 | debug（内测）|
| 体积 | 15.8 MB（16,523,042 字节）|
| 系统要求 | Android 8.0 及以上（minSdk 26）|
| SHA-256 | `9dc04d441c0e0908f7063466fb691d039f5a1efeced571fd7e5e6a2312112b6a` |

## 须知

- **只有 debug 包**。项目当前没有任何 release 签名配置，所以站上如实标注「debug 内测」。
  等有了 release 包（`*-release.apk`）再换，别把 debug 包说成正式版。
- 后端地址是**编译期内置**的线上地址，用户可在 App 的「设置」里改。站上已写明这一点。
- 包从 App 仓库拷：`Video to skill/androidApp/app/build/outputs/apk/debug/app-debug.apk`。

## 发布清单

自动化了，跑 `sh tools/publish-apk.sh` 即可（从 App 仓库的 `build.gradle.kts` 读版本号，
拷包、算体积与 SHA-256、改写站上所有该改的数字、重出分享卡）。下面是它替你做掉的事，
留着是为了出问题时知道该核对什么：

- [ ] 新包拷进本目录，文件名带上版本号
- [ ] `shasum -a 256 <包名>`，更新到站点规格表与上表
- [ ] 同步 `index.html` 里三处：下载 href、版本与体积、SHA-256
- [ ] 站点上写明构建类型：debug 包会如实标注「内测调试构建」
- [ ] 提交：`git add -A && git commit -m "换包：v0.1.x"`

**别手工换包。** 换包最危险的失败不是改错数字（那会被断言拦住），
而是**包是旧的**：包在、哈希也对、页面自洽，只是它比源码旧 ——
站点会安静地散发一个没有最新修复的版本，而且没有任何地方会报错。
脚本拿 `src/main` 下 `.kt` 的 mtime 跟包比，比包新就拒绝发布。
