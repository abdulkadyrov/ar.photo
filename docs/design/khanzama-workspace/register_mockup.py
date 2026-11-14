"""Register generated artwork without changing original files. Local design tooling."""
import fcntl
import json
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parent
page_id, source_name = sys.argv[1:]
source = Path(source_name).resolve()
allowed = Path('/Users/abdulkadyrov2002/.codex/generated_images').resolve()
if not source.is_relative_to(allowed) or source.suffix != '.png':
    raise ValueError('Unexpected generated artwork path')
with (root / '.mockups.lock').open('w') as lock:
    fcntl.flock(lock, fcntl.LOCK_EX)
    manifest = root / 'pages.json'
    rows = json.loads(manifest.read_text())
    row = next(r for r in rows if r['id'] == page_id)
    target = root / row['image']
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    row['status'] = 'generated'
    row['sourceFile'] = source.name
    temporary = root / '.pages.tmp'
    temporary.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(manifest)
    subprocess.run([sys.executable, str(root / 'build_gallery.py')], check=True, capture_output=True)
print(page_id + ': saved')
