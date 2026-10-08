# 架构说明 — 曙光云 SkillUI 库

一页纸。细节见根目录 `README.md` 与 `skills/sugon-brand-kit/SKILL.md`。

## 产品边界

- **供给层**：`skills/sugon-brand-kit/` 提供令牌与规则，是唯一事实来源（`tokens.css` 为准，`DESIGN.md` 抄其数值，`npm run check:tokens` 校验）。
- **分发**：仓库本身就是分发源，不运行任何服务：
  - Agent Skills 规范 → `npx skills add tao66175545-boop/sugon-cloud-skillui`
  - 根目录 `registry.json`（shadcn GitHub registry）→ `npx shadcn@latest add tao66175545-boop/sugon-cloud-skillui/<item>`
  - jsDelivr（按 git tag 版本化）→ `https://cdn.jsdelivr.net/gh/tao66175545-boop/sugon-cloud-skillui@<tag>/skills/sugon-brand-kit/tokens.css`
  - 本地路径 / `package.json` `exports`（npm 包尚未发布）
- **前端库壳（演示站）**：以 **对话为唯一管理入口**，由 Agent 理解意图分流。库壳里的「归库」只写**当前浏览器的 localStorage**，不会写回仓库、不会进入上面的分发渠道；库壳本身也不是对外出口。
- **质量层**：不在本仓库；禁止依赖 Taste / Impeccable / Hallmark。

## 前端信息架构（单页、无路由）

| 分区 | DOM | 行为 |
|------|-----|------|
| 对话（唯一一级入口） | `#agent` | 单输入框 + 可选附图；消息内识别 URL；看库 / 选用 / 学习 / 归库（确认闸后写 `localStorage`）均在对话内完成；模型请求从浏览器直连用户自配的 OpenAI 兼容端点 |
| 最小示例 | `#example-preview` | 演示 `examples/minimal-reference/` |

顶栏导航仅「对话」。不再保留并列的浏览 / 录入 / 选用说明一级入口。

## 路径与导入

```
其他项目
    ├─ npx skills add …            → .agents/skills/sugon-brand-kit/（+ .claude/skills/ 等）
    ├─ npx shadcn add …/<item>     → 技能目录 + src/styles/sugon-tokens.css（+ 可选规则）
    ├─ @import ".../skills/sugon-brand-kit/tokens.css"（本地 / jsDelivr）
    └─ 对照 examples/minimal-reference/TokenUsageExample.tsx
```

本仓库接线：`src/index.css` → `@import "../skills/sugon-brand-kit/tokens.css"`；库壳预览以 `?raw` 打包同一份 `tokens.css` / `DESIGN.md`。构建时 `skills/`、`design-skills/`（0.1.x 转发 stub，0.3.0 删除）、`export/` 复制进 `dist/`，`public/llms.txt` 随 Pages 发布（遵循 `BASE_PATH` 子路径）。

## 持久化（仅演示站，浏览器本地）

- 键名：`sugon-skillui-skills`
- 介质：浏览器 `localStorage`（跨会话；非仅 session；不同步到任何服务器）
- 空值时种子：`skills/sugon-brand-kit/`（id 仍为 `brand-kit`；0.1.x 旧记录 `design-skills/brand-kit/` 加载时自动迁移）
- LLM 配置：`sugon-skillui-llm-settings`（仅本机；无 Key 不发起模型请求；仓库与演示站不内置任何 Key / 网关）

## 非目标

托管服务（托管 MCP、云端市场、账号登录）、Figma 导入、质量层打包、同能力多入口面板。npm 包在计划中但非必需。
