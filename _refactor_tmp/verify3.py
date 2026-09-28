from pathlib import Path
comps = Path(r"F:\GrokBot\test02\src\components")
print("components:", [p.name for p in comps.iterdir()])
# A-D checklist
print("--- A: primary entry chat only ---")
app = Path(r"F:\GrokBot\test02\src\App.tsx").read_text(encoding="utf-8")
print("peer sections mounted:", [x for x in ["SkillList","SkillEntry","SelectGuide"] if x in app])
tb = Path(r"F:\GrokBot\test02\src\components\TopBar.tsx").read_text(encoding="utf-8")
nav = [l.strip() for l in tb.splitlines() if "btn-secondary" in l or (">" in l and any(k in l for k in ["对话","浏览","录入","选用"]))]
print("topbar buttons content lines:")
for l in tb.splitlines():
    s=l.strip()
    if s in ("对话","浏览","录入","选用说明") or s.startswith("{ href"):
        print(" ", s)
