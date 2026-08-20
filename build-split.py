# -*- coding: utf-8 -*-
"""Divide o CSS em critico (inline) e resto (assincrono), no artefato _site.

O critico e tudo que pinta a dobra — tokens, base, nav, hero, marquee — mais
os @font-face. Vai inline no HTML: zero requisicao bloqueante antes do
primeiro paint. O resto chega por preload+onload sem segurar nada.

Diferente do inline TOTAL (ja tentado, piorou: HTML 3x maior baixa mais
devagar no 4G do que a requisicao que economiza), aqui o HTML cresce so o
essencial (~15KB).
"""
import io
import os
import re

v = os.environ['V']

css = io.open('_site/style.css', encoding='utf-8').read()
fontes = io.open('assets/fonts/fonts.css', encoding='utf-8').read()

MARCA = '/* ===CRITICO-FIM==='
i = css.index(MARCA)
critico = fontes + '\n' + css[:i]
resto = css[i:]

io.open('_site/style-rest.css', 'w', encoding='utf-8').write(resto)
os.remove('_site/style.css')

html = io.open('_site/index.html', encoding='utf-8').read()
inline = (
    '<style>' + critico + '</style>\n'
    '    <link rel="preload" as="style" href="style-rest.css?v=' + v + '" '
    'onload="this.onload=null;this.rel=\'stylesheet\'">\n'
    '    <noscript><link rel="stylesheet" href="style-rest.css?v=' + v + '"></noscript>'
)
html = re.sub(r'<link rel="stylesheet" href="style\.css[^"]*">',
              lambda m: inline, html, count=1)
io.open('_site/index.html', 'w', encoding='utf-8').write(html)
print('critico inline:', len(critico) // 1024, 'KB | resto async:', len(resto) // 1024, 'KB')
