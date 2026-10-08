# 供给层说明（COMPARE）

**状态：** 产品已从「营销落地页 Demo」转为 **曙光云 SkillUI 库**（对话唯一入口 · Agent 管理 Skill）。  
本文件保留供给层边界说明；**不再**填充 Pricing/FAQ 营销对比。

---

## 边界

| 问题 | 答案 |
|------|------|
| 本仓是什么？ | 风格供给层技能库（#C8161D 红灰白 + 中文） |
| 本仓不是什么？ | SaaS Pricing/FAQ 页；质量层（Taste / Impeccable / Hallmark）仓库 |
| TypeUI CLI | 可选对比基线，非第二套仓内 kit，当前不强制执行 |
| 管理入口 | 仅对话 `#agent`；由 Agent 分流链接学习 / 看图 / 归库确认 / 看库选用 |

---

## 与旧 Demo 的差异

| 旧（营销 Demo） | 现（技能库） |
|-----------------|--------------|
| Features / Pricing / FAQ | 对话唯一入口（Agent 理解意图） |
| indigo `#4f46e5` | 曙光红 `#C8161D` |
| 英文营销文案 | 全中文「曙光云 SkillUI 库」 |
| 仅展示 tokens | 对话管理技能 + localStorage + 确认后归库 / 导出 |

---

## 供给 vs 质量

| 关注点 | SkillUI 供给层 | 质量层 |
|--------|----------------|--------|
| 时机 | 生成前 / 中 | 生成后 |
| 在本仓？ | 是 | **否** — 勿 vendor |
| 本文职责 | 标明边界与品牌令牌 | 范围外 |

---

## 结论

1. 主色锁定 `#C8161D`，与 `tokens.css` / DESIGN 同步。  
2. IA：顶栏仅「对话」；不堆并列录入 / 浏览 / 选用一级入口；无质量层依赖。  
3. 他项目通过 `npx skills add` / `npx shadcn add` 安装，或复制 `skills/<skill>/` 消费；本仓 `src/index.css` 为最小引用示例。
