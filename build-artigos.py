# -*- coding: utf-8 -*-
"""Transforma os .md de artigos/ em paginas HTML, no artefato _site.

POR QUE UM GERADOR DE 200 LINHAS E NAO UM CMS
O site inteiro e HTML/CSS/JS puro, sem build, e e por isso que ele carrega
rapido e nunca quebra. Trazer Astro/Next/WordPress pra publicar texto seria
trocar essa simplicidade por um ecossistema de dependencias — e a primeira
atualizacao de seguranca vira problema. Aqui o Markdown vira HTML no deploy
e some: o que vai pro ar continua sendo arquivo estatico.

CADA ARTIGO CARREGA SEU PROPRIO SEO
Titulo, descricao, canonical, Open Graph e JSON-LD do tipo Article — e o
JSON-LD que faz o Google (e os assistentes) entenderem que aquilo e um texto
tecnico assinado, com data e autor, e nao uma pagina qualquer.
"""
import io
import os
import re
import html
import json

RAIZ = os.path.dirname(os.path.abspath(__file__))
DIR_MD = os.path.join(RAIZ, 'artigos')
DIR_NEWS = os.path.join(RAIZ, 'noticias')
SITE = 'https://robsonobre.com.br'
AUTOR = 'Robson Nobre'


# --------------------------------------------------------------------------
# Front matter: os metadados no topo do .md, entre --- e ---
# --------------------------------------------------------------------------
def ler_frontmatter(texto):
    if not texto.startswith('---'):
        return {}, texto
    fim = texto.index('---', 3)
    bruto = texto[3:fim]
    corpo = texto[fim + 3:].lstrip('\n')
    meta = {}
    for linha in bruto.strip().split('\n'):
        if ':' not in linha:
            continue
        k, v = linha.split(':', 1)
        meta[k.strip()] = v.strip().strip('"').strip("'")
    return meta, corpo


# --------------------------------------------------------------------------
# Markdown -> HTML. Suporta o que um artigo tecnico precisa e nada alem:
# titulos, paragrafos, listas, codigo, citacao, tabela, negrito, italico,
# link e imagem. Sem biblioteca: 60 linhas resolvem, e uma dependencia a
# menos e uma atualizacao a menos pra vigiar.
# --------------------------------------------------------------------------
def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<em>\1</em>', t)
    t = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', r'<img src="\2" alt="\1" loading="lazy">', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)',
               lambda m: '<a href="%s"%s>%s</a>' % (
                   m.group(2),
                   ' target="_blank" rel="noopener"' if m.group(2).startswith('http') else '',
                   m.group(1)), t)
    return t


def md_para_html(md):
    out = []
    linhas = md.split('\n')
    i = 0
    while i < len(linhas):
        l = linhas[i]

        # bloco de codigo
        if l.startswith('```'):
            lang = l[3:].strip()
            i += 1
            buf = []
            while i < len(linhas) and not linhas[i].startswith('```'):
                buf.append(html.escape(linhas[i]))
                i += 1
            i += 1
            cls = ' class="lang-%s"' % lang if lang else ''
            out.append('<pre><code%s>%s</code></pre>' % (cls, '\n'.join(buf)))
            continue

        # tabela
        if '|' in l and i + 1 < len(linhas) and re.match(r'^\s*\|?[\s:|-]+\|', linhas[i + 1]):
            cab = [c.strip() for c in l.strip().strip('|').split('|')]
            i += 2
            corpo = []
            while i < len(linhas) and '|' in linhas[i]:
                corpo.append([c.strip() for c in linhas[i].strip().strip('|').split('|')])
                i += 1
            th = ''.join('<th>%s</th>' % inline(c) for c in cab)
            trs = ''.join('<tr>%s</tr>' % ''.join('<td>%s</td>' % inline(c) for c in r) for r in corpo)
            out.append('<div class="tabela"><table><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (th, trs))
            continue

        # titulos
        m = re.match(r'^(#{2,4})\s+(.*)', l)
        if m:
            n = len(m.group(1))
            texto = m.group(2)
            slug = re.sub(r'[^a-z0-9]+', '-', texto.lower().strip()).strip('-')
            out.append('<h%d id="%s">%s</h%d>' % (n, slug, inline(texto), n))
            i += 1
            continue

        # citacao
        if l.startswith('> '):
            buf = []
            while i < len(linhas) and linhas[i].startswith('> '):
                buf.append(linhas[i][2:])
                i += 1
            out.append('<blockquote><p>%s</p></blockquote>' % inline(' '.join(buf)))
            continue

        # lista
        if re.match(r'^\s*[-*]\s+', l) or re.match(r'^\s*\d+\.\s+', l):
            ordenada = bool(re.match(r'^\s*\d+\.\s+', l))
            tag = 'ol' if ordenada else 'ul'
            itens = []
            while i < len(linhas) and (re.match(r'^\s*[-*]\s+', linhas[i]) or re.match(r'^\s*\d+\.\s+', linhas[i])):
                itens.append(re.sub(r'^\s*(?:[-*]|\d+\.)\s+', '', linhas[i]))
                i += 1
            out.append('<%s>%s</%s>' % (tag, ''.join('<li>%s</li>' % inline(x) for x in itens), tag))
            continue

        # separador
        if l.strip() in ('---', '***'):
            out.append('<hr>')
            i += 1
            continue

        # paragrafo
        if l.strip():
            buf = []
            while i < len(linhas) and linhas[i].strip() and not re.match(r'^(#{2,4}\s|```|>\s|\s*[-*]\s|\s*\d+\.\s)', linhas[i]):
                buf.append(linhas[i])
                i += 1
            out.append('<p>%s</p>' % inline(' '.join(buf)))
            continue

        i += 1
    return '\n'.join(out)


# --------------------------------------------------------------------------
def pagina(meta, corpo_html, css_inline):
    slug = meta['slug']
    url = '%s/artigos/%s/' % (SITE, slug)
    titulo = meta['titulo']
    desc = meta.get('descricao', '')
    data = meta.get('data', '')
    leitura = meta.get('leitura', '')

    ld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": titulo,
        "description": desc,
        "datePublished": data,
        "dateModified": meta.get('atualizado', data),
        "inLanguage": "pt-BR",
        "author": {"@type": "Person", "name": AUTOR, "url": SITE + '/'},
        "publisher": {"@type": "Person", "name": AUTOR, "url": SITE + '/'},
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
    }
    if meta.get('capa'):
        ld["image"] = SITE + '/' + meta['capa']
    if meta.get('tipo') == 'noticia':
        # NewsArticle diz ao Google que e conteudo noticioso datado; `citation`
        # aponta pra quem apurou, que e o que separa curadoria de copia.
        ld["@type"] = "NewsArticle"
        if meta.get('fonte_url'):
            ld["citation"] = {"@type": "CreativeWork", "url": meta['fonte_url'],
                              "publisher": {"@type": "Organization", "name": meta.get('fonte', '')}}

    return """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{titulo} — Robson Nobre</title>
<meta name="description" content="{desc}">
<meta name="author" content="{autor}">
<meta name="theme-color" content="#08080c">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:title" content="{titulo}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">{og_img}
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%2308080c'/%3E%3Ctext x='50' y='50' dy='.35em' text-anchor='middle' font-family='monospace' font-size='46' font-weight='700' fill='%237c5cff'%3ERN%3C/text%3E%3C/svg%3E">
<style>{css}</style>
<script type="application/ld+json">{ld}</script>
</head>
<body class="artigo-body">
<header class="nav stuck" id="nav">
  <div class="nav-inner">
    <a href="/" class="brand"><i>&lt;</i>RN<i>/&gt;</i></a>
    <nav><ul class="nav-links">
      <li><a href="/artigos/">Artigos</a></li>
      <li><a href="/#work">Projetos</a></li>
      <li><a href="/#contact" class="nav-cta">Fale comigo</a></li>
    </ul></nav>
  </div>
</header>

<main class="artigo wrap">
  <a class="voltar" href="/artigos/">&larr; todos os artigos</a>
  <p class="artigo-meta">{data_br}{sep}{leitura}{fonte}</p>
  <h1 class="artigo-titulo">{titulo}</h1>
  <p class="artigo-linha">{desc}</p>
  {capa}
  <article class="artigo-corpo">
{corpo}
  </article>

  <aside class="artigo-cta">
    <p><strong>Construo sistemas assim para empresas.</strong> Se algo aqui parece com um problema seu, me chama.</p>
    <a class="btn" href="https://wa.me/5519996597169" target="_blank" rel="noopener">Falar comigo no WhatsApp</a>
  </aside>
</main>

<footer class="foot"><div class="foot-inner">
  <a href="/" class="brand"><i>&lt;</i>RN<i>/&gt;</i></a>
  <span>Escrito por Robson Nobre</span>
  <span>&copy; 2026</span>
</div></footer>
</body>
</html>""".format(
        titulo=html.escape(titulo), desc=html.escape(desc), url=url, autor=AUTOR,
        css=css_inline, ld=json.dumps(ld, ensure_ascii=False),
        og_img=('\n<meta property="og:image" content="%s/%s">' % (SITE, meta['capa'])) if meta.get('capa') else '',
        corpo=corpo_html, data_br=meta.get('data_br', ''),
        sep=' · ' if data and leitura else '', leitura=leitura,
        fonte=(' · fonte: <a href="%s" target="_blank" rel="noopener nofollow">%s</a>'
               % (meta['fonte_url'], html.escape(meta.get('fonte', 'origem')))) if meta.get('fonte_url') else '',
        capa=('<figure class="artigo-capa"><img src="/%s" alt="%s" width="1280" height="720" fetchpriority="high"></figure>'
              % (meta['capa'], html.escape(meta.get('capa_alt', ''))) if meta.get('capa') else ''))


def indice(artigos, css_inline):
    cards = []
    for a in artigos:
        cards.append("""      <a class="card-artigo{comCapa}" href="/artigos/{slug}/">
        {capa}
        <span class="card-tipo card-tipo--{tipo}">{rotulo}</span>
        <span class="card-meta">{data_br}{sep}{leitura}</span>
        <h2>{titulo}</h2>
        <p>{desc}</p>
        <span class="card-ler">{ler} &rarr;</span>
      </a>""".format(slug=a['slug'], titulo=html.escape(a['titulo']),
                     desc=html.escape(a.get('descricao', '')),
                     data_br=a.get('data_br', ''), leitura=a.get('leitura', ''),
                     sep=' · ' if a.get('data_br') and a.get('leitura') else '',
                     tipo=a.get('tipo', 'artigo'),
                     rotulo='Notícia' if a.get('tipo') == 'noticia' else 'Como eu construí',
                     ler='Ler a nota' if a.get('tipo') == 'noticia' else 'Ler o artigo',
                     comCapa=' card-artigo--capa' if a.get('capa') else '',
                     capa=('<span class="card-capa"><img src="/%s" alt="%s" loading="lazy" width="1280" height="560"></span>'
                           % (a['capa'], html.escape(a.get('capa_alt', ''))) if a.get('capa') else '')))

    return """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>IA em movimento — notícias e bastidores por Robson Nobre</title>
<meta name="description" content="O que aconteceu na inteligência artificial hoje, com a leitura de quem opera esses sistemas em produção. Notícias, regulação, mercado e relatos técnicos por Robson Nobre.">
<link rel="canonical" href="{site}/artigos/">
<link rel="alternate" type="application/rss+xml" title="IA em movimento" href="{site}/feed.xml">
<meta name="theme-color" content="#08080c">
<meta property="og:type" content="website">
<meta property="og:title" content="IA em movimento — notícias e bastidores por Robson Nobre">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%2308080c'/%3E%3Ctext x='50' y='50' dy='.35em' text-anchor='middle' font-family='monospace' font-size='46' font-weight='700' fill='%237c5cff'%3ERN%3C/text%3E%3C/svg%3E">
<style>{css}</style>
</head>
<body class="artigo-body">
<header class="nav stuck">
  <div class="nav-inner">
    <a href="/" class="brand"><i>&lt;</i>RN<i>/&gt;</i></a>
    <nav><ul class="nav-links">
      <li><a href="/#work">Projetos</a></li>
      <li><a href="/#contact" class="nav-cta">Fale comigo</a></li>
    </ul></nav>
  </div>
</header>
<main class="artigo artigo--indice wrap">
  <p class="artigo-meta">Atualizado automaticamente</p>
  <h1 class="artigo-titulo">IA em movimento</h1>
  <p class="artigo-linha">O que aconteceu no mundo da inteligência artificial, com a leitura de quem constrói esses sistemas em produção. Mais os relatos técnicos dos que eu mesmo coloquei de pé.</p>
  <div class="lista-artigos">
{cards}
  </div>
</main>
<footer class="foot"><div class="foot-inner">
  <a href="/" class="brand"><i>&lt;</i>RN<i>/&gt;</i></a>
  <span>Escrito por Robson Nobre</span><span>&copy; 2026</span>
</div></footer>
</body>
</html>""".format(site=SITE, css=css_inline, cards='\n'.join(cards))


# --------------------------------------------------------------------------
def main():
    destino = os.path.join(RAIZ, '_site', 'artigos')
    if not os.path.isdir(DIR_MD):
        print('sem pasta artigos/ — nada a gerar')
        return []

    css_base = io.open(os.path.join(RAIZ, 'style.css'), encoding='utf-8').read()
    css_art = io.open(os.path.join(RAIZ, 'artigos.css'), encoding='utf-8').read()
    fontes = io.open(os.path.join(RAIZ, 'assets', 'fonts', 'fonts.css'), encoding='utf-8').read()
    # o artigo usa o mesmo desenho do site: tokens, nav e rodape vem de la
    css = fontes + '\n' + css_base + '\n' + css_art

    os.makedirs(destino, exist_ok=True)
    artigos = []

    fontes_md = [(DIR_MD, f) for f in sorted(os.listdir(DIR_MD)) if f.endswith('.md')]
    if os.path.isdir(DIR_NEWS):
        fontes_md += [(DIR_NEWS, f) for f in sorted(os.listdir(DIR_NEWS)) if f.endswith('.md')]

    for pasta_md, arq in fontes_md:
        bruto = io.open(os.path.join(pasta_md, arq), encoding='utf-8').read()
        meta, corpo = ler_frontmatter(bruto)
        if not meta.get('slug') or meta.get('rascunho') == 'true':
            continue
        meta['data_br'] = formata_data(meta.get('data', ''))
        pasta = os.path.join(destino, meta['slug'])
        os.makedirs(pasta, exist_ok=True)
        io.open(os.path.join(pasta, 'index.html'), 'w', encoding='utf-8').write(
            pagina(meta, md_para_html(corpo), css))
        artigos.append(meta)

    # ORDEM DO INDICE. A publicacao se chama "IA em movimento": o topo tem
    # que ser o que acabou de sair, senao o destaque congela e a promessa de
    # "atualizado automaticamente" vira mentira. Como varias notas nascem no
    # mesmo dia, a data sozinha nao desempata; entao no empate a noticia vem
    # antes do relato tecnico, que e evergreen e pode esperar. `destaque: true`
    # no front matter fura a fila quando eu quiser fixar alguma coisa. A hora
    # vem da propria maquina, no fuso de Brasilia, e e o que desempata o dia.
    artigos.sort(key=lambda a: (
        str(a.get('destaque', '')).lower() == 'true',
        a.get('data', ''),
        a.get('hora', '00:00'),
        a.get('tipo', '') == 'noticia',
        a.get('slug', '')), reverse=True)
    io.open(os.path.join(destino, 'index.html'), 'w', encoding='utf-8').write(
        indice(artigos, css))

    sitemap(artigos, destino)
    feed(artigos, destino)

    print('artigos gerados:', len(artigos), '->', ', '.join(a['slug'] for a in artigos))
    return artigos


def sitemap(artigos, destino):
    """O sitemap nasce do build. Nota nova entra sozinha; nao existe passo
    manual entre publicar e o Google saber que aquilo existe."""
    hoje = max((a.get('data', '') for a in artigos), default='')
    linhas = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url><loc>%s/</loc><changefreq>monthly</changefreq>'
        '<priority>1.0</priority></url>' % SITE,
        '  <url><loc>%s/artigos/</loc><lastmod>%s</lastmod>'
        '<changefreq>daily</changefreq><priority>0.9</priority></url>' % (SITE, hoje),
    ]
    for a in artigos:
        # noticia envelhece rapido; relato tecnico nao. o changefreq conta isso
        noticia = a.get('tipo') == 'noticia'
        linhas.append(
            '  <url><loc>%s/artigos/%s/</loc><lastmod>%s</lastmod>'
            '<changefreq>%s</changefreq><priority>%s</priority></url>'
            % (SITE, a['slug'], a.get('data', ''),
               'weekly' if noticia else 'yearly',
               '0.6' if noticia else '0.8'))
    linhas.append('</urlset>')
    texto = '\n'.join(linhas) + '\n'

    # o artefato publicado e a copia na raiz, para o repositorio nao mentir
    io.open(os.path.join(os.path.dirname(destino), 'sitemap.xml'), 'w',
            encoding='utf-8').write(texto)
    io.open('sitemap.xml', 'w', encoding='utf-8').write(texto)
    print('sitemap:', len(artigos) + 2, 'urls')



RFC822 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
MES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def data_rss(iso, hora='09:00'):
    """RSS exige RFC-822. Sem dependencia externa, so a stdlib."""
    m = re.match(r'(\d{4})-(\d{2})-(\d{2})', iso or '')
    if not m:
        return ''
    import datetime
    d = datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    hh, mm = (hora.split(':') + ['00'])[:2]
    return '%s, %02d %s %d %02d:%02d:00 -0300' % (
        RFC822[d.weekday()], d.day, MES_EN[d.month - 1], d.year,
        int(hh), int(mm))


def feed(artigos, destino):
    """O feed e o que faz agregador e crawler de IA descobrir nota nova
    sem depender de alguem avisar. Custa nada e trabalha sozinho."""
    itens = []
    for a in artigos[:30]:
        capa = ''
        if a.get('capa'):
            capa = ('<enclosure url="%s/%s" type="image/webp" length="0"/>'
                    % (SITE, a['capa']))
        itens.append(
            '  <item>'
            '<title>%s</title>'
            '<link>%s/artigos/%s/</link>'
            '<guid isPermaLink="true">%s/artigos/%s/</guid>'
            '<description>%s</description>'
            '<pubDate>%s</pubDate>'
            '<category>%s</category>'
            '%s'
            '</item>' % (
                html.escape(a['titulo']), SITE, a['slug'], SITE, a['slug'],
                html.escape(a.get('descricao', '')), data_rss(a.get('data', ''), a.get('hora', '09:00')),
                'Noticia' if a.get('tipo') == 'noticia' else 'Bastidores', capa))

    linhas = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '<channel>',
        '  <title>IA em movimento, por Robson Nobre</title>',
        '  <link>%s/artigos/</link>' % SITE,
        '  <atom:link href="%s/feed.xml" rel="self" type="application/rss+xml"/>' % SITE,
        '  <description>Noticias de inteligencia artificial com a leitura de quem '
        'opera esses sistemas em producao.</description>',
        '  <language>pt-BR</language>',
        '  <ttl>360</ttl>',
    ] + itens + ['</channel>', '</rss>']

    texto = '\n'.join(linhas) + '\n'
    io.open(os.path.join(os.path.dirname(destino), 'feed.xml'), 'w',
            encoding='utf-8').write(texto)
    print('feed:', len(itens), 'itens')

MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun',
         'jul', 'ago', 'set', 'out', 'nov', 'dez']


def formata_data(iso):
    m = re.match(r'(\d{4})-(\d{2})-(\d{2})', iso or '')
    if not m:
        return ''
    return '%s de %s de %s' % (m.group(3), MESES[int(m.group(2)) - 1], m.group(1))


if __name__ == '__main__':
    main()
