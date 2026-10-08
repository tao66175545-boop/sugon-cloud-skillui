# import-from-export — package exports 引用注释

本目录**不是**第二个产品 UI，只展示如何按 `package.json` `exports` 注释式引用本库出口。

前置：已 clone 本仓（公开：`git clone https://github.com/tao66175545-boop/sugon-cloud-skillui.git`），或 `npm i ../path-to/sugon-skillui`（`file:` / 相对 path）。`package.json` 为 `private: true`，即不发布到 npm registry（与 GitHub 仓库公开无关）。

## 对照表

| 写法 | 解析到 |
|------|--------|
| `sugon-skillui` / `sugon-skillui/css` | `export/sugon-skillui.css` |
| `sugon-skillui/tokens` | `design-skills/brand-kit/tokens.css` |
| `sugon-skillui/manifest` | `export/manifest.json` |

本地相对路径仍可用（不依赖 exports）：

```css
@import "../path-to/sugon-skillui/export/sugon-skillui.css";
```

详见 [`export/CONSUME.md`](../../export/CONSUME.md)。

## 文件

- [`consumer.css`](./consumer.css) — 可粘贴到 Vite/CSS 入口的注释 + 示例规则
