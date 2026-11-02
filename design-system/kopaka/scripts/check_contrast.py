"""Check actual CSS token pairs, standard library only. Writes CONTRAST.md."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
css = (ROOT / 'tokens.css').read_text(encoding='utf-8')
blocks = re.findall(r'([^{}]+)\{([^{}]*)\}', css)

def declarations(body):
    return dict(re.findall(r'(--[\w-]+)\s*:\s*([^;]+);', body))

base = {}
dark = {}
for selector, body in blocks:
    if selector.strip().endswith(':root'):
        base.update(declarations(body))
    elif selector.strip() == "[data-theme='dark']":
        dark.update(declarations(body))

def resolve(tokens, key):
    value = tokens[key].strip()
    for _ in range(10):
        match = re.fullmatch(r'var\((--[\w-]+)\)', value)
        if not match:
            return value
        value = tokens[match[1]].strip()
    raise ValueError(f'Circular token: {key}')

def luminance(color):
    if not re.fullmatch(r'#[0-9a-fA-F]{6}', color):
        raise ValueError(f'Expected opaque RGB hex: {color}')
    channels = [int(color[i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in channels]
    return sum(x * w for x, w in zip(linear, (.2126, .7152, .0722)))

def ratio(a, b):
    hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
    return (hi + .05) / (lo + .05)

pairs = []
def add(fg, bg, threshold=4.5):
    pairs.append(('color-' + fg, 'color-' + bg, threshold))

for bg in ('background', 'surface', 'surface-soft'):
    for fg in ('text', 'text-muted', 'primary', 'secondary'):
        add(fg, bg)
    add('control', bg, 3)
    add('focus', bg, 3)
for role in ('primary', 'secondary', 'accent', 'danger'):
    for suffix in ('', '-hover', '-pressed'):
        add('on-' + role, role + suffix)
for role in ('success', 'error', 'warning', 'info'):
    add(role, role + '-bg')
add('on-disabled', 'disabled')
add('on-board', 'board')
add('board-muted', 'board')
add('board-focus', 'board', 3)
add('pip', 'tile')
add('tile-divider', 'tile', 3)
add('tile-focus', 'tile', 3)
add('tile-selected', 'tile', 3)
add('secondary', 'surface-soft', 3)  # XP fill against its track
add('on-hero', 'hero')
add('on-hero', 'decoration')
add('on-hero', 'coral')
for player in ('mint', 'mango', 'coral', 'lilac'):
    add('on-hero', 'player-' + player)

lines = ['# Contrastes Kopaka', '', 'Mesurés depuis tokens.css avec luminance relative sRGB.',
         'Texte 4,5:1 ; limites et focus 3:1. Les anneaux des boutons sont séparés du fond du bouton par un offset de 3px.',
         'Contrôle de paires opaques ; ceci ne certifie pas une interface complète, les compositions, scrims et placements doivent être vérifiés visuellement.', '',
         '| Thème | Premier plan | Fond | Rapport | Cible | Résultat |', '|---|---|---|---:|---:|---|']
failed = []
for theme, tokens in [('clair', base), ('sombre', base | dark)]:
    for fg, bg, minimum in pairs:
        a, b = resolve(tokens, '--' + fg), resolve(tokens, '--' + bg)
        measured = ratio(a, b)
        ok = measured >= minimum
        lines.append(f'| {theme} | {fg} `{a}` | {bg} `{b}` | {measured:.2f} | {minimum:.1f} | {"OK" if ok else "ÉCHEC"} |')
        if not ok:
            failed.append(f'{theme}: {fg}/{bg} = {measured:.2f} < {minimum}')
(ROOT / 'CONTRAST.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'{len(pairs) * 2} paires vérifiées ; {len(failed)} échec(s).')
for failure in failed:
    print(failure)
raise SystemExit(bool(failed))
