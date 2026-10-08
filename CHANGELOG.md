# 变更记录 / Changelog

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。
一个版本号贯穿所有渠道：git tag `vX.Y.Z` = `package.json` `version` = `SKILL.md` `metadata.version` = `export/manifest.json` `version`。
1.0 之前：删除 / 重命名 CSS 变量、改技能目录或 `name` 视为破坏性变更，升 minor。

## [0.2.1] - 2026-10-08

### 新增

- `skills/sugon-brand-kit/components.css`：纯 CSS 片段，不是组件库。类名以 `sugon-` 开头，只用 `tokens.css` 已有变量。
  - 按钮：`sugon-btn` + `sugon-btn-primary` / `sugon-btn-secondary`（状态与 0.2.0 的配方一致）/ `sugon-btn-ghost`，含 hover、active、focus-visible、disabled。
  - 卡片：`sugon-card`、`sugon-card-title`、`sugon-card-body`。
  - 表单：`sugon-field`、`sugon-label`、`sugon-input`、`sugon-select`、`sugon-check`、`sugon-help`、`sugon-error`（错误态用 `aria-invalid="true"`）。
- `sugon-brand-kit` 安装时把该文件写入 `.agents/skills/`、`.claude/skills/` 和 `src/styles/sugon-components.css`。`sugon-tokens` 仍然只有令牌。
- `npm run check:tokens` 同时检查 `components.css` 没有硬编码色值、引用的变量都在 `tokens.css` 里。

尚未打 tag。文档里锁版本的命令仍指向已发布的 `v0.2.0`；合入 main 并打 `v0.2.1` 之后，把 `#v0.2.0` / `@v0.2.0` 换成 `v0.2.1` 才能装到本文件。

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

[0.2.1]: https://github.com/tao66175545-boop/sugon-cloud-skillui/releases/tag/v0.2.1
[0.2.0]: https://github.com/tao66175545-boop/sugon-cloud-skillui/releases/tag/v0.2.0
