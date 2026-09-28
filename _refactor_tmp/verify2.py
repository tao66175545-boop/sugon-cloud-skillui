from pathlib import Path
ac=Path(r"F:\GrokBot\test02\src\components\AgentChat.tsx").read_text(encoding="utf-8")
for i,l in enumerate(ac.splitlines(),1):
    if "链接学习 URL" in l or "链接学习" in l and "label" in l.lower():
        print(i, l)
print("--- occurrences of 链接学习 URL ---", ac.count("链接学习 URL"))
# list changed files via rough mtime compared to package.json? just list src components
for p in sorted(Path(r"F:\GrokBot\test02\src").rglob("*")):
    if p.is_file():
        print(p.relative_to(r"F:\GrokBot\test02"), p.stat().st_size)
