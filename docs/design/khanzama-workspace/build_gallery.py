"""Build a self-contained local index for the generated page concept sheets."""
import html
import json
import os
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parent
pages = json.loads((root / 'pages.json').read_text())
labels = {'admin': 'Администрация платформы', 'account': 'Обычный кабинет и CRM', 'access': 'Вход, безопасность и AR-просмотр'}
sections = []
for group, label in labels.items():
    cards = []
    for page in pages:
        if page['group'] != group:
            continue
        title, brief = html.escape(page['title']), html.escape(page['brief'])
        href = html.escape(page['image'], quote=True)
        ready = (root / page['image']).is_file()
        art = f'<a href="{href}" target="_blank" rel="noopener"><img src="{href}" loading="lazy" alt="{title}: ПК слева, телефон справа"></a>' if ready else '<div class="pending">Макет готовится</div>'
        cards.append(f'<article data-search="{title.lower()} {brief.lower()}"><div class="sheet">{art}</div><div class="copy"><span class="badge">{"ПК + телефон" if ready else "В плане"}</span><h3>{title}</h3><p>{brief}</p>{f"<a href=\"{href}\" target=\"_blank\" rel=\"noopener\">Открыть лист целиком ↗</a>" if ready else ""}</div></article>')
    sections.append(f'<section data-group="{group}" aria-labelledby="{group}"><h2 id="{group}">{label}</h2><div class="grid">{"".join(cards)}</div></section>')
ready_count = sum((root / page['image']).is_file() for page in pages)
page = '''<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KHANZAMA — каталог страниц</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f6f5f1;color:#202027;font:16px/1.5 system-ui,sans-serif}header,main{max-width:1560px;margin:auto;padding:24px}header{border-bottom:1px solid #dedbd4}h1{font-size:clamp(25px,4vw,40px);line-height:1.15;margin:8px 0 16px}h2{font-size:24px;margin:30px 0 14px}h3{font-size:18px;margin:10px 0 6px}p{margin:6px 0 12px;color:#55565f}.notice{border-left:3px solid #7357ff;padding:10px 16px;background:#efebfc}.toolbar{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}button,input{font:inherit;min-height:44px;border-radius:10px;border:1px solid #ccc8c0;padding:9px 14px;background:white;color:#272731}button{cursor:pointer}button[aria-pressed=true]{background:#5942cf;color:white;border-color:#5942cf}input{flex:1;min-width:200px}a{color:#5134c2;text-underline-offset:3px}a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid #7357ff;outline-offset:3px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:18px}article{overflow:hidden;background:white;border:1px solid #dedbd4;border-radius:14px}.sheet{aspect-ratio:1.5;background:#eeeaf5;display:grid;place-items:center}.sheet img{display:block;width:100%;height:100%;object-fit:contain}.sheet a{display:block;width:100%;height:100%}.copy{padding:18px}.copy>a{display:inline-flex;align-items:center;min-height:44px}.badge{font-size:12px;background:#eee8ff;color:#5134c2;border-radius:6px;padding:4px 8px}.pending{color:#62616b}.count{font-size:14px;color:#55565f}[hidden]{display:none!important}@media(max-width:600px){header,main{padding:16px}.toolbar button{flex:1}.toolbar input{flex-basis:100%}}footer{max-width:1560px;margin:auto;padding:24px;color:#55565f}</style>
<header><div class="count">Постраничная концепция · ПК и телефон</div><h1>KHANZAMA — все страницы</h1><p>Сначала администрация платформы, затем обычный кабинет, CRM и публичные сценарии.</p><details class="notice"><summary><strong>CRM — свой кабинет, полный пакет, без админки.</strong></summary><p>Безлимит и внутренние разрешения не дают доступ к администрированию. Все числа на листах демонстрационные; макеты не являются опубликованным интерфейсом.</p></details><p class="count">__COUNT__</p><nav class="toolbar" aria-label="Фильтр макетов"><button data-filter="all" aria-pressed="true">Все</button><button data-filter="admin" aria-pressed="false">Админка</button><button data-filter="account" aria-pressed="false">Кабинет / CRM</button><button data-filter="access" aria-pressed="false">Вход и AR</button><input type="search" aria-label="Поиск страницы" placeholder="Найти страницу…"></nav></header><main>__SECTIONS__<p id="empty" hidden>По этому запросу страниц нет.</p></main><footer>Каждый лист открывается целиком. Названия разделов и роли сверяются с ROLES.md; функциональные требования — SPEC.md. Длительность работы требует отдельного сбора активных интервалов и не выводится из одного факта входа.</footer>
<script>const requested=new URLSearchParams(location.search).get('role');let filter=['admin','account','access'].includes(requested)?requested:'all';const input=document.querySelector('input');function apply(){let visible=0;const query=input.value.toLocaleLowerCase('ru');document.querySelectorAll('section[data-group]').forEach(section=>{let count=0;section.querySelectorAll('article').forEach(card=>{card.hidden=(filter!=='all'&&section.dataset.group!==filter)||!card.dataset.search.includes(query);if(!card.hidden){count++;visible++}});section.hidden=!count});document.querySelector('#empty').hidden=!!visible}document.querySelectorAll('button[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;history.replaceState(null,'',filter==='all'?location.pathname:location.pathname+'?role='+filter);document.querySelectorAll('button[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));apply()}));input.addEventListener('input',apply);document.querySelectorAll('button[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===filter)));apply();</script></html>'''
page = page.replace('__COUNT__', f'Готово листов: {ready_count} / {len(pages)} · каждый лист содержит ПК и телефон').replace('__SECTIONS__', ''.join(sections))
with tempfile.NamedTemporaryFile('w', dir=root, prefix='.index-', suffix='.tmp', delete=False) as output:
    output.write(page)
    temporary = output.name
os.replace(temporary, root / 'index.html')
print(f'Gallery: {ready_count}/{len(pages)}')
