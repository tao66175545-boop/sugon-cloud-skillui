# 曙光云品牌识别规范（sugon-brand-core）

数值以仓库 `tokens/sugon.brand.json` 为准；本文件由维护者与生成器共同维护。UI 令牌仍在 `tokens/sugon.tokens.json`。

## 两层红（不要合并）

| 角色 | HEX | 用途 |
|------|-----|------|
| **识别红 brand.red** | `#AF1F24` | logo、VI、PPT、印刷、新媒体、名片 |
| **UI 交互红 primary** | `#C8161D` | 网页按钮、链接、焦点（`sugon-brand-kit`） |
| Logo 灰 brand.gray | `#727272` | **仅** logo / 标准字，不作正文灰 |

同一画面只选一种红作主色。logo 用原稿，不跟随 UI 主题重新着色。两者 ΔE≈13.8，混用会肉眼可见。

印刷 CMYK / Pantone：**待确认**（见 `references/colors.md`），勿用 HEX 粗算值送印。

## 字体

- **默认**：思源黑体 / Source Han Sans SC（Linux 常作 Noto Sans CJK SC）— SIL OFL 1.1，可商用。
- **可选标题**：阿里巴巴普惠体（保存授权页截图）。
- **禁止**：导出的图片 / PDF / 网页出现微软雅黑；PPT **默认不嵌入字体**（国产 WPS / 信创可能崩溃）。
- 仓库**不附带**字体文件，只给名称与下载链接（`references/fonts.md`）。

## Logo 资产

- 原稿：`assets/logo/sugon-cloud-logo.svg`（横式）
- 白底参考：`assets/logo/sugon-cloud-logo_on-white.png`
- 反白 / 单色 / 竖式 / 字标版：**待品牌方提供**（见 `brand-assets/logo/README.md`）

最小尺寸与安全空间草案标为「待确认」，细则在 `sugon-logo-usage`。
