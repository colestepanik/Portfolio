"""Copy section fragments from sections/<name>/section.html into index.html.

Usage: python tools/reintegrate.py hero ownerhound work
Each section in index.html sits between a marker comment
  <!-- ================= LABEL (sections/<name>) ================= -->
and the next section's marker (or the roles ticker / </main>). Running it again is safe.
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LABELS = {
    'hero': 'HERO',
    'ownerhound': 'FLAGSHIP: OWNERHOUND',
    'work': 'SKILLS AND SIDE PROJECTS',
    'about': 'ABOUT',
    'umass': 'UMASS LOWELL',
    'star': 'CHROME STAR',
}
# Older markers that may still be in index.html before the first run
LEGACY = {'hero': '  <!-- Hero:'}
# What follows each section on the page, in order of preference
ENDS = ['  <div class="roles"', '  <!-- ================= ', '</main>']


def marker(name):
    return f'  <!-- ================= {LABELS[name]} (sections/{name}) ================= -->'


def fragment(name):
    with open(os.path.join(ROOT, 'sections', name, 'section.html'), encoding='utf-8') as f:
        lines = f.read().replace('\r\n', '\n').strip('\n').split('\n')
    # drop the fragment's own leading comment (one line or several); the marker replaces it
    while lines and lines[0].lstrip().startswith('<!--'):
        while lines and '-->' not in lines[0]:
            lines.pop(0)
        lines.pop(0)
    return '\n'.join(('  ' + l) if l.strip() else '' for l in lines)


def main(names):
    path = os.path.join(ROOT, 'index.html')
    with open(path, encoding='utf-8', newline='') as f:
        raw = f.read()
    nl = '\r\n' if '\r\n' in raw else '\n'
    t = raw.replace('\r\n', '\n')
    for name in names:
        starts = [s for s in (f'  <!-- ================= {LABELS[name]} (sections/{name})', LEGACY.get(name)) if s]
        i = next((t.find(s) for s in starts if s and t.find(s) >= 0), -1)
        if i < 0:
            sys.exit(f'{name}: no marker found in index.html')
        after = i + 1
        j = min(k for k in (t.find(e, after) for e in ENDS) if k >= 0)
        t = t[:i] + marker(name) + '\n' + fragment(name) + '\n\n' + t[j:]
        print(f'{name}: replaced')
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(t.replace('\n', nl))


if __name__ == '__main__':
    main(sys.argv[1:] or list(LABELS))
