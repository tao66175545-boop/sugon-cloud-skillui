# 架构说明 — 曙光云 SkillUI 库

一页纸。细节见根目录 `README.md` 与 `design-skills/brand-kit/SKILL.md`。

## 产品边界

- **供给层**：`design-skills/**` 提供令牌与规则；前端库壳以 **对话为唯一管理入口**，由 Agent 理解意图分流。
- **质量层**：不在本仓库；禁止依赖 Taste / Impeccable / Hallmark。
- **复用**：路径 / `@import`，不要求 npm publish。

## 前端信息架构（单页、无路由）

| 分区 | DOM | 行为 |
|------|-----|------|
| 对话（唯一一级入口） | `#agent` | 单输入框 + 可选附图；消息内识别 URL；看库 / 选用 / 学习 / 归库（确认闸后写 `localStorage`）均在对话内完成 |
| 最小示例 | `#example-preview` | 演示 `examples/minimal-reference/` |

顶栏导航仅「对话」。不再保留并列的浏览 / 录入 / 选用说明一级入口。

## 路径与导入

```
其他项目 / 本仓库
    │
    ├─ @import ".../design-skills/brand-kit/tokens.css"
    ├─ 阅读 SKILL.md / DESIGN.md
    └─ 对照 examples/minimal-reference/TokenUsageExample.tsx
```

本仓库接线：`src/index.css` → `@import "../design-skills/brand-kit/tokens.css"`。

## 持久化

- 键名：`sugon-skillui-skills`
- 介质：浏览器 `localStorage`（跨会话；非仅 session）
- 空值时种子：`design-skills/brand-kit/` 默认 Skill
- LLM 配置：`sugon-skillui-llm-settings`（仅本机；无 Key 不发起模型请求）

## 非目标

云端市场、Figma、登录、质量层打包、强制 npm 发布、同能力多入口面板。
