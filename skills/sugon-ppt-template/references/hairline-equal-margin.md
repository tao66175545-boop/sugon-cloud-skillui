# Title hairline equal margin · OD-REDLINE / SG-HAIRLINE

> Skill: `sugon-ppt-openddesign` · `0.5.0-local-open-design-draft`  
> Standing gate companion to `RULES.md` §G / A8.

## Why it kept failing

The brand-red accent under titles was placed with a **freehand Y per slide**:

- Storyboard / template leftovers left each layout with its own line Y.
- Title block height and body start Y differed across recipes (especially **slide 3 vs slide 4**).
- Agents “aligned by eye” and re-picked a new gap every page.
- **Overlap / OOB validators do not catch equal-margin failures** — a line can be perfectly non-overlapping and still sit with 4mm above and 10mm below.

Result: red hairlines looked “almost right” but **title→line** and **line→body** air drifted, and page 3 vs page 4 used different recipes.

## Hard rule

When a **short brand-red** horizontal rule sits under a **page title** or **module title**:

1. **Thickness locked**: 2–3pt (or 1.5–2mm).
2. **Length locked**: ~2–4 CJK characters wide **OR** fixed **0.55–0.7"** — **not** full-bleed unless it is separate masthead chrome.
3. **Equal vertical air**:
   - `gap_above` = title text-frame bottom → stroke top  
   - `gap_below` = stroke bottom → next content top  
   - **`gap_above == gap_below`**  
   - Default both **6mm (0.24")**  
   - Tolerance **≤0.5mm**
4. **Same token** on every slide in the deck that uses title→hairline→body. Never invent a new Y per page.
5. **Preflight** (mandatory before claiming structure QA):
   - For every hairline, print `above_mm` / `below_mm`.
   - Fail build if unequal (delta >0.5mm).
   - Fail build if slide3 vs slide4 (or any two title-hairline pages) differ by **>0.5mm**.
6. **Do not confuse** with full-width **grey** masthead rules — those are separate chrome and are not this accent.

## Implementation recipe (agents)

```
token HAIRLINE_GAP = 6mm (0.24")
token HAIRLINE_THICK = 2.5pt
token HAIRLINE_LEN = 0.6"   # or ~3em CJK

title.bottom + HAIRLINE_GAP  →  stroke.top
stroke.bottom + HAIRLINE_GAP →  body.top
```

Prefer computing Y from the title frame + token, not from a per-page template coordinate.

## Checklist snippet

- [ ] Thickness 2–3pt  
- [ ] Length 2–4 CJK / 0.55–0.7" (not full-bleed red)  
- [ ] above_mm ≈ below_mm (≤0.5mm)  
- [ ] Same token as other title-hairline slides  
- [ ] Preflight log printed  
- [ ] Not mistaken for grey masthead rule  

## Related

- `RULES.md` — OD-REDLINE, SG-HAIRLINE, standing gate A8, §G  
- `DESIGN.md` — Title hairline subsection + V-hairline  
- `SKILL.md` — brand callout  
- Digest: `/workspace/test02-work/research/digests/2026-10-12-redline-margin-rootcause.md`
