# 变更记录 / Changelog

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。
一个版本号贯穿所有渠道：git tag `vX.Y.Z` = `package.json` `version` = `SKILL.md` `metadata.version` = `export/manifest.json` `version`。
1.0 之前：删除 / 重命名 CSS 变量、改技能目录或 `name` 视为破坏性变更，升 minor。

## [0.4.1] - 2026-10-10

### 新增

- 技能 **`sugon-ppt-template`**：通用 16:9 政企汇报版式（封面 / 目录 / 章节 / 正文 / 双栏 / 图表占位 / 结束）；`scripts/build-deck.mjs`（pptxgenjs）生成样例 deck；`scripts/check-deck.mjs` 检查色值白名单、logo、16:9、无 Wingdings / 微软雅黑、无占位符、不用 UI 红。
- 样例 `skills/sugon-ppt-template/examples/sample-deck.pptx`（封面 + 目录 + 2 页正文 + 结束），强调色为识别红 `#AF1F24`，带横式 logo。
- 默认**不嵌入字体**（思源黑体 / Source Han Sans SC 仅写字体名）；仓库不附带字体文件。

### 说明

- 无官方 `.potx` 时的通用草稿母版；拿到官方母版后应优先填母版。
- **未在 WPS（Windows / 统信 UOS / 麒麟）实机打开验收**，需你方人工确认。

## [0.4.0] - 2026-10-10

### 新增

- **品牌识别层**：`tokens/sugon.brand.json`（识别红 `#AF1F24`、logo 灰 `#727272`、字体栈、logo 几何草案）+ `brand-assets/logo/`（官方横式 SVG + 白底 PNG）。UI 红 `#C8161D` **不变**，两层红不要混用。
- 技能 **`sugon-brand-core`**：SKILL / BRAND、生成的 colors/fonts、`brand-params.md`（给 Kimi/AiPPT）、`brand-tokens.css`（`--color-brand-red` / `--color-brand-gray`，不覆盖 `--color-primary`）。
- 技能 **`sugon-logo-usage`**：做/不做、`place-logo.mjs`、`check-logo.mjs`（拦截把 logo 红改成 UI 红等）。
- `npm run check:brand`（并入 `check:tokens`）：SVG 色值白名单、logo sha256、技能目录资产副本漂移。
- shadcn 注册表条目 `sugon-brand-core`、`sugon-logo-usage`；Playground 展示 logo 与两层红对照。
- `TRADEMARKS.md`：用户确认横式 logo 可随本 kit 公开使用；仍不授权 npm/目录推广与改色。

### 待品牌方材料

- 反白 / 单色 / 竖式 / 字标版 logo；最小尺寸与安全空间官方值；CMYK/Pantone；VI 手册与 PPT 母版。

## [0.3.1] - 2026-10-10

### 修复

- **`sugon-theme` 改用 shadcn/ui 标准变量名**。0.3.0 写的是我们自己的 `--bg`、`--text`、`--surface` 等，shadcn 组件不认，只有 `--primary`、`--border` 等少数几个生效。现在写入 `background`、`foreground`、`card`、`popover`、`primary`、`secondary`、`muted`、`accent`、`destructive`、`border`、`input`、`ring`、`radius` 及 `sidebar-*`（各带 `-foreground`），只覆盖亮色。
- **`accent` 不再是曙光红**。shadcn 用 `accent` 做幽灵按钮、菜单项的悬停底，0.3.0 会整块变红；现在是中性灰 `#f4f4f5`。`primary` / `ring` 仍是曙光红 `#C8161D`。
- **去掉自引用的圆角变量**（`--radius-sm: var(--radius-sm)` 这类）。改为 `--radius: 0.75rem`，`radius-sm` … `radius-4xl` 按 shadcn 默认比例由 `--radius` 推导。
- 映射写在 `tokens/sugon.tokens.json` 的 `shadcn` 段，由 `npm run build:kit` 生成进 `registry.json`；`check:tokens` 会在两者不一致、`accent` 等于主色或出现自引用时报错。安装命令里的版本号也改由 `meta.version` 生成。

### 文档

- 写明 `sugon-theme` 的前提：项目已 `shadcn init`（有 `components.json` 与 `tsconfig.json` / `jsconfig.json`），且入口 CSS 不为空。入口 CSS 是空文件时 shadcn CLI 报 `Cannot read properties of undefined (reading 'proxyOf')`（CLI 自身问题，`sugon-brand-kit` 不受影响），先写一行 `@import "tailwindcss";` 再装。
- 安装命令与 CDN 锁到 `v0.3.1`。

### 升级说明

- 只影响装过 0.3.0 `sugon-theme` 的项目。重新 `add sugon-theme#v0.3.1` 会写入标准变量，但 0.3.0 留下的 `--bg`、`--text`、`--primary-hover` 等变量和 `@theme inline` 里对应的 `--color-*`、`--radius-*: var(--radius-*)` 行不会被自动删除，请手动删掉。
- `sugon-brand-kit` / `sugon-tokens` 的 `--color-*` 令牌、`components.css` 与 Playground 都没有变化。

## [0.3.0] - 2026-10-10

### 破坏性变更

- **演示站默认首页改为 Playground**（色板 + `sugon-*` 实时预览 + 底部复制安装命令），**不需要 API Key**。原 Agent 对话归库降为次级页签「实验：AI 起草 Skill」。
- 删除 `design-skills/brand-kit/` 转发 stub（0.2.x 已迁移到 `skills/sugon-brand-kit/`）。浏览器 localStorage 里的旧路径记录仍会自动迁移。

### 新增

- **令牌单源** `tokens/sugon.tokens.json` + `npm run build:kit`：生成 `skills/sugon-brand-kit/tokens.css`、Google DESIGN.md alpha frontmatter、`registry/generated/theme.cssVars.json`、`src/playground/tokens.generated.json`。`npm run check:tokens` 含生成物漂移检查。
- shadcn 条目 **`sugon-theme`**（`registry:theme` + `cssVars.light`），给已有 shadcn 的项目注入品牌色与圆角。
- **`npm run check:fresh-vite`**：自动走「空 Vite → 装 kit → 文档两行 `@import` → 断言主按钮 `rgb(200, 22, 29)`」。

### 文档

- 安装命令与 CDN 锁到 `v0.3.0`；README / `llms.txt` / `export/` 说明 Playground 为默认首页。

## [0.2.2] - 2026-10-08

### 新增

- `sugon-brand-kit` 与 `sugon-tokens` 使用 shadcn registry 的 `css` 字段。项目已有 `components.json` 且 `tailwind.css` 指向入口 CSS（Vite 为 `src/index.css`）时，安装会把 `@import "./styles/sugon-tokens.css"`（品牌包再加 `@import "./styles/sugon-components.css"`）写到该文件顶部，不必再手改。
- 没有 `components.json` 时（例如刚 `npm create vite`）行为与之前相同：文件照常写入，入口 CSS 不改。安装结束时的说明给出要手写的那一两行。`@import` 路径相对于入口 CSS 所在目录，入口不在 `src/` 时需要改相对路径。

### 文档

- 当前安装命令从 `v0.2.0` 改为 `v0.2.2`（README、`export/`、`public/llms.txt`、技能里的 CDN 链接）。
- 更正 0.2.1 条目：tag `v0.2.1`（`bd8ce6a`）已经发布；当时文档仍锁在 `v0.2.0`。

## [0.2.1] - 2026-10-08

### 新增

- `skills/sugon-brand-kit/components.css`：纯 CSS 片段，不是组件库。类名以 `sugon-` 开头，只用 `tokens.css` 已有变量。
  - 按钮：`sugon-btn` + `sugon-btn-primary` / `sugon-btn-secondary`（状态与 0.2.0 的配方一致）/ `sugon-btn-ghost`，含 hover、active、focus-visible、disabled。
  - 卡片：`sugon-card`、`sugon-card-title`、`sugon-card-body`。
  - 表单：`sugon-field`、`sugon-label`、`sugon-input`、`sugon-select`、`sugon-check`、`sugon-help`、`sugon-error`（错误态用 `aria-invalid="true"`）。
- `sugon-brand-kit` 安装时把该文件写入 `.agents/skills/`、`.claude/skills/` 和 `src/styles/sugon-components.css`。`sugon-tokens` 仍然只有令牌。
- `npm run check:tokens` 同时检查 `components.css` 没有硬编码色值、引用的变量都在 `tokens.css` 里。

已发布为 tag `v0.2.1`（`bd8ce6a`）。该版本文档里的安装命令仍指向 `v0.2.0`；从 0.2.2 起当前命令改为 `v0.2.2`。

## [0.2.0] - 2026-10-08

可一键安装：技能符合 Agent Skills 规范，仓库同时是 shadcn GitHub registry。

### 破坏性变更

- 技能改名 `brand-kit` → **`sugon-brand-kit`**，规范位置迁移到 **`skills/sugon-brand-kit/`**（Agent Skills 规范要求目录名 = `name`；加前缀避免与其他 `brand-kit` 撞名）。
  - 旧路径 `design-skills/brand-kit/` 保留一个小版本：`tokens.css` 改为 `@import` 转发，`SKILL.md` / `DESIGN.md` 只剩迁移指引；**0.3.0 删除**。
  - `package.json` `exports` 的 `./tokens` 改指向新路径；旧子路径 `./design-skills/brand-kit/*` 暂留。
  - 演示站本地库里的旧种子记录（`design-skills/brand-kit/`）加载时自动迁移到新路径，id 仍为 `brand-kit`。

### 新增

- `SKILL.md` 加 Agent Skills frontmatter（`name`、面向触发的 `description`、`license`、`metadata`），正文改为相对技能目录的写法，复制到任何项目都成立；`npx skills add tao66175545-boop/sugon-cloud-skillui` 可发现并安装。
- 根目录 `registry.json`（shadcn GitHub registry），3 个条目：
  - `sugon-brand-kit`：技能写入 `.agents/skills/` 与 `.claude/skills/`，令牌写入 `src/styles/sugon-tokens.css`；
  - `sugon-tokens`：只写令牌；
  - `sugon-brand-rules`（可选）：Cursor `.cursor/rules/sugon-brand.mdc` + Copilot `.github/instructions/sugon-brand.instructions.md`，只对 UI 文件生效；**不会**写入或覆盖 `AGENTS.md` / `CLAUDE.md`，另附 `registry/rules/AGENTS.snippet.md` 供手动追加。
- `public/llms.txt`：演示站 `/sugon-cloud-skillui/llms.txt`，给 AI 读的索引。
- `TRADEMARKS.md`：MIT 只覆盖代码与文档，“曙光 / 曙光云 / Sugon” 名称、logo 与品牌标识不在授权范围内。
- 校验脚本：`npm run check:tokens`（`DESIGN.md` 与 `tokens.css` 漂移检查）、`npm run check:registry`（`shadcn registry validate`），均已加入 Pages CI。
- `skills/` 随构建复制进 `dist/`，演示站可直接访问技能文件。

### 修复

- `DESIGN.md` 与 `tokens.css` 对齐（以 `tokens.css` 为准，令牌数值本身未改）：`--color-bg-subtle` `#f5f5f5` → `#fafafa`，`--color-bg-muted` `#eeeeee` → `#f4f4f5`，字体顺序改为 Noto Sans SC / PingFang SC / Microsoft YaHei 在 Inter 之前；补齐全部 `--color-*`、字阶、圆角、间距与按钮配方。

### 文档

- README「30 秒安装」：`npx skills add`、`npx shadcn add`、jsDelivr `tokens.css`（锁 `v0.2.0`）。
- `export/`（CONSUME、README、manifest `install` 段）、`docs/ARCHITECTURE.md`、示例路径同步更新；非目标改为“不做托管服务 / Figma / 质量层”，删掉“无需 npm 发布”的说法；说明演示站「归库」只存在浏览器本地、不会进入分发渠道。

## [0.1.0] - 2026-10-08

首个公开版本（仓库公开、演示站上线）。

- 单页库壳：对话（Agent）为唯一管理入口；看库 / 选用 / 链接学习 / 确认闸归库（localStorage）。
- 风格供给层 `design-skills/brand-kit/`（SKILL.md + DESIGN.md + tokens.css），`export/` 统一出口与 manifest。
- 公开构建不内置任何 API Key 或模型网关（用户自带 OpenAI 兼容端点与 Key，仅存浏览器）；`npm run check:dist` 拦截密钥与内部地址。
- GitHub Pages 子路径构建与自动部署；MIT 许可证。

[0.4.1]: https://github.com/tao66175545-boop/sugon-cloud-skillui/releases/tag/v0.4.1
[0.4.0]: https://github.com/tao66175545-boop/sugon-cloud-skillui/releases/tag/v0.4.0
[0.3.1]: https://github.com/tao66175545-boop/sugon-cloud-skillui/releases/tag/v0.3.1
[0.3.0]: https://github.com/tao66175545-boop/sugon-cloud-skillui/releases/tag/v0.3.0
[0.2.2]: https://github.com/tao66175545-boop/sugon-cloud-skillui/releases/tag/v0.2.2
[0.2.1]: https://github.com/tao66175545-boop/sugon-cloud-skillui/releases/tag/v0.2.1
[0.2.0]: https://github.com/tao66175545-boop/sugon-cloud-skillui/releases/tag/v0.2.0
