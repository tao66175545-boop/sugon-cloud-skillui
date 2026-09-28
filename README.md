# 曙光云 SkillUI 库

**风格供给层（style supply）** — 在 AI 生成 UI **之前 / 之中** 提供可复用的设计 Skill（`SKILL.md` + `DESIGN.md` + `tokens.css`）。本仓库前端是单页库壳：**对话（Agent）为唯一管理入口**，上方可扫一眼本机 Skill 一览；数据本地持久化；**无需 npm 发布**即可被其他项目按路径引用。

> 产品自称：**曙光云 SkillUI 库**。主色 `#C8161D`，辅以灰 / 白。顶栏与浏览器标签使用曙光 SVG logo（`public/logo.svg`）。

---


---

## 对外统一出口

其他项目消费**风格供给层**请走 [`export/`](./export/)：

| 入口 | 说明 |
|------|------|
| [`export/README.md`](./export/README.md) | 中文接入说明（`@import` / 复制 `design-skills`；非 CDN） |
| [`export/manifest.json`](./export/manifest.json) | 机器可读：包名、版本、主色 `#C8161D`、各资源 relative / raw / blob URL |
| [`export/sugon-skillui.css`](./export/sugon-skillui.css) | 仅 `@import` `design-skills/brand-kit/tokens.css` |

最小示例：

```css
@import "../path-to/sugon-skillui/export/sugon-skillui.css";
/* 或 */
@import "../path-to/sugon-skillui/design-skills/brand-kit/tokens.css";
```

对照 [`examples/minimal-reference/`](./examples/minimal-reference/)。**Agent / 对话不是对外出口**；勿引入质量层。

## 分层：供给层 vs 质量层

| 层级 | 职责 | 本仓库 |
|------|------|--------|
| **供给层** | 生成前/中提供品牌令牌与规则 | ✅ 本库拥有（`design-skills/`） |
| **质量层** | 生成后的品味审计 / 打磨 | ❌ 不引入（Taste / Impeccable / Hallmark 等） |

---

## 如何运行

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
npm run preview
```

---

## 单页信息架构（无额外路由）

1. **顶栏** — 品牌 logo「曙光云 SkillUI 库」；一级导航仅 **对话** → `#agent`。
2. **本机库一览** — 对话上方轻量只读卡片列表（非一级导航），方便扫一眼。
3. **对话（Agent）** — **唯一管理入口**：单输入框 + 可选附图 + 发送。粘贴链接 / 描述 Skill / 附图片 / 说「看库」「选用某某」「归库」「导出」，Agent 理解意图并路由。用你自己的 OpenAI 兼容 API；**归库须确认闸**后才写入 localStorage（键：`sugon-skillui-skills`）。无独立「录入」表单。
4. **选用说明** — 已收进对话欢迎文案与「选用」能力；不再设独立一级分区。

---

## 对话 Agent：配置 API Key

密钥**仅存本机** `localStorage`（键：`sugon-skillui-llm-settings`），**不会**写入仓库或 `.env`。

1. 打开顶栏「对话」或滚到 `#agent`。
2. 点击「去配置 API」/「设置」。
3. 填写：
   - **Base URL**：默认 `https://t.mysugoncloud.com:8765`（任意 OpenAI 兼容端点）
   - **模型名**：默认 `deepseek-flash`（本网关亦支持 `glm-5.3-flash`；看图请选用支持 vision 的模型）
   - **API Key**：你的密钥
4. 保存。未配置 Key 时发送会被拦截，并提示去配置（不假连通）。

也可在项目根目录使用 `.env.local`（已 gitignore）预填，开发/构建时由 Vite 注入：

```bash
VITE_LLM_BASE_URL=https://t.mysugoncloud.com:8765
VITE_SUGON_LLM_API_KEY=你的密钥
VITE_LLM_MODEL=deepseek-flash
```

应用会读取上述变量作为默认值；UI 中保存的 localStorage 优先。勿将 `.env.local` 提交到 git。

### 对话能力

| 能力 | 说明 |
|------|------|
| 链接学习 | 消息中粘贴 `http(s)://` URL → 自动识别并抓取正文摘要/起草；CORS 失败时红字错误，可重试或粘贴正文 |
| 图片理解 | 📎 附加本地图片，或在消息中粘贴图片 URL（扩展名启发）；需 vision 模型 |
| 看库 / 选用 | 说「看库」列出本机 Skill；说「选用 <名称>」复制供给层 path（无 Key 也可用） |
| 归库 | 助手给出草稿卡（名称/用途/path）→ **确认归库** 才写入 `sugon-skillui-skills`；取消不落库；无静默归库 |
| 对外输出 | 仅在有待确认草稿时，于确认卡上提供复制；或对话中说「导出」 |

所有增改均经对话完成，刷新后仍在。

---

## Logo / Favicon

- `public/logo.svg` — 站点 favicon（`index.html` `rel=icon`）与静态资源
- `src/assets/logo.svg` — TopBar 品牌标

---

## 其他项目如何复用（路径导入）

无需发布 npm。在目标项目 CSS 中按相对路径引入令牌：

```css
@import "../path-to/test02/design-skills/brand-kit/tokens.css";
```

本仓库自身接线（`src/index.css`）：

```css
@import "../design-skills/brand-kit/tokens.css";
@import "tailwindcss";
```

| 资源 | 路径 |
|------|------|
| Skill 入口 | `design-skills/brand-kit/SKILL.md` |
| 设计规范 | `design-skills/brand-kit/DESIGN.md` |
| CSS 令牌 | `design-skills/brand-kit/tokens.css` |
| 最小参考示例 | `examples/minimal-reference/` |

详见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。

---

## 设计技能包

```
design-skills/brand-kit/
├── SKILL.md      # AI 入口：何时/如何使用供给层
├── DESIGN.md     # 规范：颜色、字体、圆角、间距、按钮三态
└── tokens.css    # CSS 变量（主色 #C8161D）
```

---

## 非目标

- 云端 / Figma / 登录 / 远程市场
- 引入质量层依赖（Taste / Impeccable / Hallmark 等）
- npm 发布（可选，非必需）
- 将 API Key 提交到仓库

---

## 技术栈

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- 品牌令牌为纯 CSS 变量；Skill 列表与 LLM 配置持久化于 `localStorage`

---

## 验收要点

| ID | 准则 |
|----|------|
| **A** | 对话入口；无 Key 时明确配置提示，发送拦截 |
| **B** | URL → 摘要/草稿；失败红字可重试 |
| **C** | 归库确认闸后再写 localStorage；取消不落库 |
| **D** | 本地上传或图 URL 至少一种可预览 |
| **E** | 曙光 SVG logo + favicon |
| **F** | 无质量层；对话唯一管理入口；examples / logo 保留 |
