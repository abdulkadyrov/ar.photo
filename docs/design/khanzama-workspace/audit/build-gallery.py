"""Build a local, reviewable comparison of all approved panes and real captures.

Run from the repository root after the three capture suites and access capture.
Pillow is only needed by this optional review tool, never by the application.
"""
import hashlib
import json
import re
import shutil
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[4]
design = root / "docs/design/khanzama-workspace"
output = root / "artifacts/design-fidelity"
evidence = Path("/tmp/khanzama-fidelity")
output.mkdir(parents=True, exist_ok=True)
pages = json.loads((design / "pages.json").read_text())
bounds = {}
for name in ["account", "access"]:
    for sheet in json.loads((design / f"audit/{name}.bounds.json").read_text())["sheets"]:
        bounds[sheet["id"]] = {mode: sheet[mode] for mode in ["desktop", "mobile"]}
for sheet in json.loads((design / "fidelity-media-matrix.json").read_text())["screens"]:
    bounds[sheet["id"]] = {
        mode: {"x": item["x"], "y": item["y"], "w": item["width"], "h": item["height"]}
        for mode, item in [("desktop", sheet["crop"]["pc"]), ("mobile", sheet["crop"]["mobile"])]
    }
for line in (design / "fidelity-admin.md").read_text().splitlines():
    match = re.match(r"\|\s*(admin-[a-z-]+)\s*\|.*?\|\s*([\d, ]+)\s*\|\s*([\d, ]+)\s*\|", line)
    if match:
        bounds[match[1]] = {mode: dict(zip(["x", "y", "w", "h"], map(int, match[index].split(",")))) for mode, index in [("desktop", 2), ("mobile", 3)]}

rows = []
for page in pages:
    name = page["id"]
    owner = "admin" if page["group"] == "admin" else "account" if name in {x["id"] for x in json.loads((design / "audit/account.bounds.json").read_text())["sheets"]} else "access" if name in {x["id"] for x in json.loads((design / "audit/access.bounds.json").read_text())["sheets"]} else "media"
    folder = output / name
    folder.mkdir(exist_ok=True)
    source = design / page["image"]
    shutil.copy2(source, folder / "sheet.png")
    row = {"id": name, "title": page["title"], "group": page["group"], "owner": owner, "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(), "views": {}}
    for mode in ["desktop", "mobile"]:
        rect = bounds[name][mode]
        reference = Image.open(source).crop((rect["x"], rect["y"], rect["x"] + rect["w"], rect["y"] + rect["h"]))
        reference.save(folder / f"reference-{mode}.png")
        view = {"crop": rect}
        for phase in ["before", "after"]:
            alias = "pc" if owner == "media" and mode == "desktop" else mode
            capture = evidence / owner / phase / f"{name}-{alias}.png"
            if not capture.exists():
                raise SystemExit(f"Missing evidence: {capture}")
            if Image.open(capture).size != reference.size:
                raise SystemExit(f"Viewport mismatch: {capture}: {Image.open(capture).size}, reference {reference.size}")
            shutil.copy2(capture, folder / f"{phase}-{mode}.png")
            view[phase + "Sha256"] = hashlib.sha256(capture.read_bytes()).hexdigest()
        row["views"][mode] = view
    rows.append(row)

(output / "manifest.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2))
html = r'''<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KHANZAMA — сверка всех страниц</title><style>
*{box-sizing:border-box}body{margin:0;font:14px system-ui;color:#211d30;background:#f7f6f3}header{padding:16px 22px;border-bottom:1px solid #ddd;background:white;display:flex;align-items:center;gap:20px;flex-wrap:wrap}h1{font-size:20px;margin:0}header p{font-size:12px;color:#555;margin:0}.layout{display:grid;grid-template-columns:235px 1fr}nav{height:calc(100dvh - 84px);overflow:auto;padding:12px;position:sticky;top:0}nav button{display:block;width:100%;text-align:left;border:0;padding:9px;border-radius:6px;background:transparent;cursor:pointer;font:inherit}nav button[aria-current=true]{color:#5325d1;background:#ebe4ff}main{min-width:0;padding:18px}h2{font-size:19px;margin:0 0 12px}.tools{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px}button,select{font:inherit;min-height:38px}select,button.control{border:1px solid #ccc;background:white;border-radius:6px;padding:7px 10px}.panes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.pane{min-width:0}.image{background:white;border:1px solid #ddd;overflow:auto;position:relative;min-height:200px}.image img{display:block;width:100%;height:auto}.image.native img{width:auto;max-width:none}.image .overlay{position:absolute;inset:0;pointer-events:none}.caption{font-weight:600;margin:0 0 8px}.note{font-size:12px;color:#555;line-height:1.5}a{color:#5325d1}details{margin-top:18px}details img{max-width:100%}@media(max-width:760px){.layout{grid-template-columns:1fr}nav{height:auto;max-height:190px;position:static;display:flex;flex-wrap:wrap;gap:3px}nav button{width:auto;padding:6px}.panes{grid-template-columns:1fr}main{padding:12px}}
</style><header><h1>KHANZAMA · все 46 страниц</h1><p>92 вида: ПК и телефон. Реальные снимки локальной проверочной сборки.<br>Данные, фотографии и доступность функций могут отличаться от иллюстраций.</p></header><div class="layout"><nav aria-label="Страницы" id="nav"></nav><main><h2 id="title"></h2><div class="tools"><label>Устройство <select id="device"><option value="desktop">ПК</option><option value="mobile">Телефон</option></select></label><label>Сравнить <select id="phase"><option value="after">Стало</option><option value="before">Было</option></select></label><button class="control" id="zoom">Масштаб 100%</button><label>Наложение макета <input id="opacity" type="range" min="0" max="100" value="0"></label></div><div class="panes"><section class="pane"><p class="caption">Макет</p><div class="image" id="refbox"><img id="reference" alt="Утверждённый макет"></div></section><section class="pane"><p class="caption" id="actualLabel">Стало</p><div class="image" id="actualbox"><img id="actual" alt="Реальный экран приложения"><img class="overlay" id="overlay" alt=""></div></section></div><p class="note" id="meta"></p><p class="note">Границы панелей измерены по исходному растру, погрешность около 2 px. Наложение помогает оценить положение блоков; процент совпадения пикселей не заявляется. Это визуальная проверка, а не тест физической камеры телефона.</p><details><summary>Исходный лист целиком</summary><a id="sourceLink" target="_blank" rel="noreferrer"><img id="source" alt="Исходный лист с ПК и телефоном"></a></details></main></div><script>
const pages=__DATA__;let selected=location.hash.slice(1)||pages[0].id;let native=false;
const $=id=>document.getElementById(id);for(const page of pages){const b=document.createElement('button');b.textContent=page.title;b.dataset.id=page.id;b.onclick=()=>{selected=page.id;location.hash=selected;render()};$('nav').append(b)}
function render(){const page=pages.find(x=>x.id===selected)||pages[0];selected=page.id;const mode=$('device').value,phase=$('phase').value;const r=page.views[mode].crop;$('title').textContent=page.title;$('reference').src=`${selected}/reference-${mode}.png`;$('actual').src=`${selected}/${phase}-${mode}.png`;$('overlay').src=$('reference').src;$('overlay').style.opacity=$('opacity').value/100;$('source').src=`${selected}/sheet.png`;$('sourceLink').href=$('source').src;$('actualLabel').textContent=phase==='after'?'Стало':'Было';$('meta').textContent=`${selected} · ${r.w} × ${r.h} · ${phase==='after'?'После исправлений':'До исправлений'} · Демонстрационные данные`;for(const b of $('nav').children)b.setAttribute('aria-current',String(b.dataset.id===selected));for(const box of [$('refbox'),$('actualbox')])box.classList.toggle('native',native)}
for(const id of ['device','phase','opacity'])$(id).oninput=render;$('zoom').onclick=()=>{native=!native;$('zoom').textContent=native?'Вписать по ширине':'Масштаб 100%';render()};window.onhashchange=()=>{selected=location.hash.slice(1);render()};render();
</script></html>'''
(output / "index.html").write_text(html.replace("__DATA__", json.dumps(rows, ensure_ascii=False).replace("</", "<\\/")))

# Small two-screen sheets for the lead's complete visual review.
for group in ["admin", "account", "access"]:
    subset = [row for row in rows if row["group"] == group]
    for offset in range(0, len(subset), 2):
        contact = Image.new("RGB", (1920, 1530), "#ddd")
        draw = ImageDraw.Draw(contact)
        for index, row in enumerate(subset[offset:offset+2]):
            top = index * 765
            draw.text((10, top+4), row["id"]+" | reference / actual desktop / reference / actual phone", fill="black")
            x = 0
            for mode, phase, width in [("desktop","reference",650),("desktop","after",650),("mobile","reference",300),("mobile","after",300)]:
                shot = Image.open(output / row["id"] / f"{phase}-{mode}.png")
                shot.thumbnail((width,730))
                contact.paste(shot,(x,top+30))
                x += width + 5
        contact.save(output / f"review-{group}-{offset//2+1:02d}.png")
print(f"Built {len(rows)} pages / {sum(len(row['views']) for row in rows)} verified-size panes: {output}")
