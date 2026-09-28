from pathlib import Path
root = Path(r"F:\GrokBot\test02\src")

app = (root/"App.tsx").read_text(encoding="utf-8")
tb = (root/"components/TopBar.tsx").read_text(encoding="utf-8")
ac = (root/"components/AgentChat.tsx").read_text(encoding="utf-8")
ex = (root/"components/ExampleSection.tsx").read_text(encoding="utf-8")

print("APP imports SkillList", "SkillList" in app)
print("APP mounts AgentChat", "<AgentChat" in app)
print("APP mounts Example", "<ExampleSection" in app)
print("APP mounts SkillEntry", "SkillEntry" in app)
print("APP mounts SelectGuide", "SelectGuide" in app)

print("TOPBAR hrefs:", [l.strip() for l in tb.splitlines() if "href=" in l])
print("TOPBAR labels with 对话/浏览/录入/选用:", 
      "对话" in tb, "浏览" in tb, "录入" in tb, "选用说明" in tb)

checks = {
  "看库 local": "tryLocalLibraryIntent" in ac or "看库" in ac,
  "选用": "选用" in ac and ("copyPath" in ac or "clipboard" in ac),
  "URL learn": "runLinkLearn" in ac or "fetchLinkText" in ac,
  "image preview": "imageDataUrl" in ac,
  "confirm gate": "确认归库" in ac and "pendingDraft" in ac,
  "clarify": "CLARIFY_LINE" in ac and "isAmbiguousIntent" in ac,
  "no link URL field label": "链接学习 URL" not in ac,
  "no image URL field": "或贴图片 URL" not in ac and "预览图 URL" not in ac,
  "settings in chat": "对话设置" in ac or "去配置 API" in ac,
  "no key no fake": "不会假连通" in ac or "未配置前不会发起" in ac,
}
for k,v in checks.items():
    print(f"AC {k}: {v}")

print("Example collapsed footer:", "footer" in ex and "useState" in ex)
print("SkillEntryForm file exists:", (root/"components/SkillEntryForm.tsx").exists())
print("SkillList file exists:", (root/"components/SkillList.tsx").exists())
print("SelectGuide file exists:", (root/"components/SelectGuide.tsx").exists())

# quality layer refs in src (should not introduce)
src_all = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in root.rglob("*.{ts,tsx}") )
# pathlib doesn't expand braces
files = list(root.rglob("*.ts")) + list(root.rglob("*.tsx"))
joined = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in files)
for bad in ["impeccable", "hallmark", "ui-ux-pro-max"]:
    # allowed in blocklists/comments saying NOT to use
    print(f"mentions {bad}:", joined.lower().count(bad))
