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
TODAS = []   # preenchido no main; a busca precisa do catalogo inteiro
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
# --------------------------------------------------------------------------
# TEMA DA NOTA
# A cor do selo e o que da ritmo a uma lista longa: o leitor aprende a
# varrer a pagina sem ler tudo. Notas novas trazem `tema` no front matter;
# as antigas nasceram so com a capa, entao o tema sai do nome do arquivo.
# --------------------------------------------------------------------------
TEMAS_ROTULO = {
    'modelos': 'Modelos', 'regulacao': 'Regulação', 'negocios': 'Mercado',
    'infra': 'Infraestrutura', 'pesquisa': 'Pesquisa', 'web': 'Web',
}


def tema_de(meta):
    # `rotulo` no front matter fura a regra: nem toda nota longa e "Como eu
    # construi", e nem toda noticia e so noticia. Analise, entrevista e perfil
    # sao o mesmo objeto com outro nome na capa.
    forcado = meta.get('rotulo')
    if meta.get('tipo') != 'noticia':
        return 'artigo', forcado or 'Como eu construí'
    t = meta.get('tema') or ''
    if not t:
        capa = meta.get('capa', '')
        m = re.search(r'capa-([a-z]+)\.webp', capa)
        t = m.group(1) if m else 'modelos'
    return t, forcado or TEMAS_ROTULO.get(t, 'Notícia')


CABECA = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{titulo_tag}</title>
<meta name="description" content="{desc}">
<meta name="author" content="{autor}">
<meta name="theme-color" content="#faf8f4">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="{url}">
<link rel="alternate" type="application/rss+xml" title="IA em movimento" href="{site}/feed.xml">
<meta property="og:type" content="{og_type}">
<meta property="og:title" content="{titulo}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="IA em movimento">
<meta name="twitter:card" content="summary_large_image">{og_img}
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%2317151c'/%3E%3Ctext x='50' y='52' dy='.35em' text-anchor='middle' font-family='Georgia,serif' font-size='54' fill='%23faf8f4'%3EM%3C/text%3E%3C/svg%3E">
<style>{css}</style>"""

TOPO = """<header class="topo">
  <div class="topo-inner faixa">
    <a class="marca" href="/artigos/">IA <em>em movimento</em></a>
    <nav><ul class="topo-links">
      <li><a href="/#work">Projetos</a></li>
      <li><a href="/" class="topo-cta">Ver o portfólio</a></li>
    </ul></nav>
  </div>
</header>"""

PE = """<footer class="pe"><div class="pe-inner faixa">
  <span>Escrito e mantido por <a href="/">Robson Nobre</a></span>
  <span><a href="/feed.xml">RSS</a> &middot; Campinas, SP</span>
  <span>&copy; 2026</span>
</div></footer>"""


def pagina(meta, corpo_html, css_inline, vizinhos=()):
    slug = meta['slug']
    url = '%s/artigos/%s/' % (SITE, slug)
    titulo = meta['titulo']
    desc = meta.get('descricao', '')
    data = meta.get('data', '')
    tema, rotulo = tema_de(meta)

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

    corpo_final = CABECA + """
<script type="application/ld+json">{ld}</script>
</head>
<body class="pub">
<div class="progresso" id="progresso" aria-hidden="true"><i></i></div>
""" + TOPO + r"""

<main class="leitura faixa">
  <a class="volta" href="/artigos/">&larr; todas as notas</a>

  <p class="chapeu">
    <span class="selo selo--{tema}">{rotulo}</span>
    <span class="datinha">{data_br}{sep}{leitura}</span>
  </p>

  <h1>{titulo}</h1>
  <p class="abertura">{desc}</p>

  <div class="autoria">
    <img src="/assets/opt/avatar.webp" alt="" width="40" height="40" loading="lazy">
    <div>
      <strong>Robson Nobre</strong>
      <span>Constrói sistemas de IA que rodam em produção</span>
    </div>
  </div>
  {capa}
  <article class="texto">
{corpo}
  </article>
{credito}
  <aside class="captura" id="captura" data-rev>
    <div class="captura-texto">
      <p class="captura-olho">Trabalhe comigo</p>
      <h2>Isso aqui parece com um problema seu?</h2>
      <p>Construo esses sistemas para empresas: agentes que atendem, prospectam e
      operam sozinhos. Deixa seu contato que eu chamo no WhatsApp, e a conversa
      começa comigo, não com um robô.</p>
      <ul class="captura-provas">
        <li>Resposta no mesmo dia útil</li>
        <li>Primeira conversa sem custo e sem script de vendas</li>
        <li>Se não for pra você, eu digo na hora</li>
      </ul>
    </div>

    <form class="captura-form" id="form-lead" novalidate>
      <label>
        <span>Seu nome</span>
        <input name="nome" type="text" autocomplete="name" required maxlength="80" placeholder="Como te chamo">
      </label>
      <label>
        <span>WhatsApp</span>
        <input name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" required
               maxlength="20" placeholder="(19) 99999-9999">
      </label>
      <label>
        <span>O que você quer resolver <i>(opcional)</i></span>
        <textarea name="mensagem" rows="3" maxlength="600" placeholder="Duas linhas já bastam"></textarea>
      </label>
      <input class="nada" type="text" name="site" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button type="submit">Quero conversar</button>
      <p class="captura-aviso" id="aviso-lead" role="status" aria-live="polite"></p>
      <p class="captura-rodape">Seu número serve só para eu te responder. Não entra em lista nenhuma.</p>
    </form>
  </aside>
{vizinhos}
</main>

""" + PE + r"""

<script>
(function () {{
  var calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Progresso: le o fim do TEXTO, nao o da pagina. Contar o formulario
     faria a barra marcar 70% com o artigo ja terminado. */
  var barra = document.querySelector('#progresso i');
  var corpo = document.querySelector('.texto');
  if (barra && corpo) {{
    var pendente = false;
    var pintar = function () {{
      var r = corpo.getBoundingClientRect();
      var total = r.height - innerHeight;
      var lido = total > 0 ? (-r.top) / total : (r.top < 0 ? 1 : 0);
      barra.style.transform = 'scaleX(' + Math.min(1, Math.max(0, lido)) + ')';
      pendente = false;
    }};
    addEventListener('scroll', function () {{
      if (!pendente) {{ pendente = true; requestAnimationFrame(pintar); }}
    }}, {{ passive: true }});
    pintar();
  }}

  if (!calmo && 'IntersectionObserver' in window) {{
    var obs = new IntersectionObserver(function (ent) {{
      ent.forEach(function (e) {{
        if (e.isIntersecting) {{ e.target.classList.add('vis'); obs.unobserve(e.target); }}
      }});
    }}, {{ rootMargin: '0px 0px -12% 0px' }});
    document.querySelectorAll('[data-rev]').forEach(function (el) {{
      el.classList.add('rev'); obs.observe(el);
    }});
  }}

  var form = document.getElementById('form-lead');
  if (!form) return;
  var aviso = document.getElementById('aviso-lead');
  var botao = form.querySelector('button');
  var rotulo = botao.textContent;
  var dizer = function (txt, tipo) {{
    aviso.textContent = txt;
    aviso.className = 'captura-aviso' + (tipo ? ' e-' + tipo : '');
  }};

  form.addEventListener('submit', function (ev) {{
    ev.preventDefault();
    var d = new FormData(form);
    var dados = {{
      nome: d.get('nome'), whatsapp: d.get('whatsapp'), mensagem: d.get('mensagem'),
      site: d.get('site'), pagina: {titulo_js}
    }};
    if (!String(dados.nome || '').trim()) return dizer('Escreve seu nome, por favor.', 'ruim');
    if (String(dados.whatsapp || '').replace(/[^0-9]/g, '').length < 10) {{
      return dizer('Falta o DDD ou algum dígito no WhatsApp.', 'ruim');
    }}
    botao.disabled = true; botao.textContent = 'Enviando...'; dizer('');

    fetch('/api/lead', {{
      method: 'POST', headers: {{ 'content-type': 'application/json' }},
      body: JSON.stringify(dados)
    }}).then(function (r) {{ return r.json().then(function (j) {{ return {{ r: r, j: j }}; }}); }})
      .then(function (res) {{
        if (res.j && res.j.ok) {{
          form.innerHTML = '<div class="captura-ok"><strong>Recebido.</strong>' +
            '<span>Te chamo no WhatsApp em breve. Se preferir adiantar, ' +
            '<a href="' + (res.j.whatsapp || 'https://wa.me/5519996597169') +
            '" target="_blank" rel="noopener">me manda mensagem agora</a>.</span></div>';
          return;
        }}
        botao.disabled = false; botao.textContent = rotulo;
        if (res.j && res.j.whatsapp) {{
          dizer('Não consegui registrar aqui. Abrindo o WhatsApp para você.', 'ruim');
          setTimeout(function () {{ open(res.j.whatsapp, '_blank', 'noopener'); }}, 900);
          return;
        }}
        dizer((res.j && res.j.erro) || 'Não deu certo. Tenta de novo?', 'ruim');
      }})
      .catch(function () {{
        botao.disabled = false; botao.textContent = rotulo;
        dizer('Sem conexão com o servidor. Me chama no WhatsApp: (19) 99659-7169', 'ruim');
      }});
  }});
}})();
</script>
</body>
</html>"""

    return corpo_final.format(
        titulo=html.escape(titulo),
        titulo_tag=html.escape(titulo) + ' — IA em movimento',
        desc=html.escape(desc), url=url, autor=AUTOR, site=SITE,
        og_type='article', css=css_inline, ld=json.dumps(ld, ensure_ascii=False),
        og_img=('\n<meta property="og:image" content="%s/%s">' % (SITE, meta['capa'])) if meta.get('capa') else '',
        corpo=corpo_html, data_br=meta.get('data_br', ''),
        sep=' · ' if data and meta.get('leitura') else '', leitura=meta.get('leitura', ''),
        tema=tema, rotulo=rotulo,
        credito=('\n  <p class="credito">Apurado originalmente por '
                 '<a href="%s" target="_blank" rel="noopener nofollow">%s</a>.</p>\n'
                 % (meta['fonte_url'], html.escape(meta.get('fonte', 'origem')))) if meta.get('fonte_url') else '',
        capa=('<figure class="arte"><img src="/%s" alt="%s" width="1280" height="720" fetchpriority="high"></figure>'
              % (meta['capa'], html.escape(meta.get('capa_alt', ''))) if meta.get('capa') else ''),
        titulo_js=json.dumps(titulo, ensure_ascii=False),
        vizinhos=bloco_vizinhos(vizinhos))



def bloco_vizinhos(vizinhos):
    """A nota e a unica pagina que recebe visita de busca. Sem um caminho para
    a proxima, a sessao morre ali e o visitante nunca ve o resto do trabalho."""
    if not vizinhos:
        return ''
    cartoes = []
    for v in vizinhos:
        capa = ('<span class="prox-capa"><img src="/%s" alt="" loading="lazy" '
                'width="640" height="360"></span>' % v['capa']) if v.get('capa') else ''
        cartoes.append(
            '      <a class="prox-item" href="/artigos/%s/">%s'
            '<span class="prox-tipo">%s</span>'
            '<span class="prox-titulo">%s</span></a>'
            % (v['slug'], capa,
               'Notícia' if v.get('tipo') == 'noticia' else 'Como eu construí',
               html.escape(v['titulo'])))
    return ('\n  <nav class="proximas" aria-label="Continue lendo" data-rev>\n'
            '    <h2 class="proximas-titulo">Continue lendo</h2>\n'
            '    <div class="proximas-lista">\n%s\n    </div>\n  </nav>'
            % '\n'.join(cartoes))


POR_PAGINA = 12


def url_pagina(tema, n):
    """/artigos/ na primeira; /artigos/2/ nas outras; /artigos/tema/infra/ nos filtros."""
    base = '/artigos/' if not tema else '/artigos/tema/%s/' % tema
    return base if n <= 1 else '%s%d/' % (base, n)


def cartao(a, destaque=False):
    tema, rotulo = tema_de(a)
    meta = ('<span class="selo selo--%s">%s</span><span class="datinha">%s</span>'
            % (tema, rotulo, a.get('data_br', '')))
    if destaque:
        arte = ('<span class="manchete-arte"><img src="/%s" alt="%s" width="1280" height="800" '
                'fetchpriority="high"></span>' % (a['capa'], html.escape(a.get('capa_alt', '')))
                ) if a.get('capa') else ''
        return ("""  <a class="manchete" href="/artigos/{slug}/">
    {arte}
    <span class="manchete-texto">
      <span class="manchete-linha">{meta}</span>
      <h2>{titulo}</h2>
      <p>{desc}</p>
    </span>
  </a>""").format(slug=a['slug'], arte=arte, meta=meta,
                  titulo=html.escape(a['titulo']),
                  desc=html.escape(a.get('descricao', '')))

    arte = ('<span class="nota-arte"><img src="/%s" alt="%s" width="640" height="427" '
            'loading="lazy"></span>' % (a['capa'], html.escape(a.get('capa_alt', '')))
            ) if a.get('capa') else ''
    return ("""    <a class="nota" href="/artigos/{slug}/">
      {arte}
      <span class="nota-linha">{meta}</span>
      <h3>{titulo}</h3>
      <p>{desc}</p>
    </a>""").format(slug=a['slug'], arte=arte, meta=meta,
                    titulo=html.escape(a['titulo']),
                    desc=html.escape(a.get('descricao', '')))


def barra_filtros(tema_atual, contagem):
    """Os temas viram link de verdade, nao botao de JS: cada um e uma pagina
    que o Google indexa como um assunto proprio."""
    chips = ['<a class="chip%s" href="/artigos/">Tudo <b>%d</b></a>'
             % ('' if tema_atual else ' on', sum(contagem.values()))]
    for t, rot in TEMAS_ROTULO.items():
        n = contagem.get(t, 0)
        if not n:
            continue
        chips.append('<a class="chip%s" href="/artigos/tema/%s/">%s <b>%d</b></a>'
                     % (' on' if tema_atual == t else '', t, rot, n))
    return """  <div class="filtros">
    <div class="busca">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input type="search" id="q" placeholder="Buscar por assunto, empresa, tecnologia..."
             autocomplete="off" aria-label="Buscar nas notas">
      <button type="button" id="qLimpar" aria-label="Limpar busca" hidden>&times;</button>
    </div>
    <nav class="chips" aria-label="Filtrar por assunto">
%s
    </nav>
  </div>""" % '\n'.join('      ' + c for c in chips)


def barra_paginas(tema, pagina, total):
    if total <= 1:
        return ''
    partes = []
    if pagina > 1:
        partes.append('<a class="pg-seta" href="%s" rel="prev">&larr; anterior</a>'
                      % url_pagina(tema, pagina - 1))
    for n in range(1, total + 1):
        partes.append('<a class="pg-num%s" href="%s"%s>%d</a>'
                      % (' on' if n == pagina else '', url_pagina(tema, n),
                         ' aria-current="page"' if n == pagina else '', n))
    if pagina < total:
        partes.append('<a class="pg-seta" href="%s" rel="next">próxima &rarr;</a>'
                      % url_pagina(tema, pagina + 1))
    return ('\n  <nav class="paginacao" aria-label="Páginas">\n    %s\n  </nav>'
            % '\n    '.join(partes))


def indice(artigos, css_inline, tema=None, pagina=1, total=1, contagem=None):
    """A manchete manda, as outras acompanham.

    Sem essa diferenca de peso a pagina vira lista, e lista nao tem editoria:
    o leitor bate o olho e nao sabe por onde comecar. So a primeira pagina do
    indice geral tem manchete; nas seguintes todas as notas tem o mesmo peso,
    porque ali o leitor ja esta procurando, nao sendo apresentado.
    """
    contagem = contagem or {}
    tem_manchete = artigos and not tema and pagina == 1
    destaque, resto = (artigos[0], artigos[1:]) if tem_manchete else (None, artigos)

    manchete = cartao(destaque, destaque=True) if destaque else ''
    cartoes = [cartao(a) for a in resto]

    # O indice de busca carrega TODAS as notas, nao so as desta pagina: quem
    # digita espera achar o que existe no site, nao o que sobrou na tela.
    catalogo = json.dumps([
        {'t': a['titulo'], 'd': a.get('descricao', ''), 'u': '/artigos/%s/' % a['slug'],
         'c': '/' + a['capa'] if a.get('capa') else '', 'r': tema_de(a)[1],
         'm': tema_de(a)[0], 'q': a.get('data_br', '')}
        for a in TODAS[:300]
    ], ensure_ascii=False, separators=(',', ':'))

    canonical = SITE + url_pagina(tema, pagina)
    rel = ''
    if pagina > 1:
        rel += '\n<link rel="prev" href="%s">' % (SITE + url_pagina(tema, pagina - 1))
    if pagina < total:
        rel += '\n<link rel="next" href="%s">' % (SITE + url_pagina(tema, pagina + 1))

    rotulo_tema = TEMAS_ROTULO.get(tema, '')
    if tema:
        h1 = '%s <em>em movimento</em>' % rotulo_tema
        chamada = ('Tudo que saiu sobre %s, com a leitura de quem opera esses sistemas '
                   'com cliente real.' % rotulo_tema.lower())
        titulo_tag = '%s — IA em movimento' % rotulo_tema
    else:
        h1 = 'IA <em>em movimento</em>'
        chamada = ('O que aconteceu na inteligência artificial, com a leitura de quem opera '
                   'esses sistemas com cliente real. Mais os relatos técnicos dos que eu mesmo '
                   'coloquei de pé. Atualiza duas vezes por dia.')
        titulo_tag = 'IA em movimento — notícias e bastidores por Robson Nobre'
    if pagina > 1:
        titulo_tag += ' — página %d' % pagina

    return (CABECA + rel + r"""
</head>
<body class="pub">
""" + TOPO + r"""

<main class="faixa">
  <header class="cabecalho-pub">
    <h1>{h1}</h1>
    <p>{chamada}</p>
{filtros}
    <div class="regua"></div>
  </header>

  <p class="sem-nada" id="semNada" hidden>Nada encontrado por aqui. Tenta outra palavra?</p>

  <div id="resultados" hidden>
    <p class="quantos" id="quantos"></p>
    <div class="grade" id="gradeBusca"></div>
  </div>

  <div id="listagem">
{manchete}

  <div class="grade">
{cartoes}
  </div>
{paginas}
  </div>
</main>

""" + PE + r"""

<script id="catalogo" type="application/json">{catalogo}</script>
<script>
(function () {{
  /* BUSCA NO CLIENTE. A paginacao e o filtro por tema sao paginas de verdade
     (o Google segue os links); a busca nao precisa ser indexavel e precisa
     responder enquanto a pessoa digita, entao vive aqui. Ela procura em TODAS
     as notas, nao so nas desta pagina. */
  var dados;
  try {{ dados = JSON.parse(document.getElementById('catalogo').textContent); }}
  catch (e) {{ return; }}

  var campo = document.getElementById('q'),
      limpar = document.getElementById('qLimpar'),
      listagem = document.getElementById('listagem'),
      caixa = document.getElementById('resultados'),
      grade = document.getElementById('gradeBusca'),
      quantos = document.getElementById('quantos'),
      semNada = document.getElementById('semNada');
  if (!campo) return;

  // sem acento e sem caixa: quem procura "regulacao" tem que achar "Regulação"
  var pele = function (t) {{
    return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }};
  var indice = dados.map(function (n) {{
    return {{ n: n, chave: pele(n.t + ' ' + n.d + ' ' + n.r) }};
  }});

  var esc = function (t) {{
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }};

  var desenhar = function (achados) {{
    grade.innerHTML = achados.map(function (n) {{
      return '<a class="nota" href="' + n.u + '">' +
        (n.c ? '<span class="nota-arte"><img src="' + esc(n.c) + '" alt="" loading="lazy" width="640" height="427"></span>' : '') +
        '<span class="nota-linha"><span class="selo selo--' + esc(n.m) + '">' + esc(n.r) + '</span>' +
        '<span class="datinha">' + esc(n.q) + '</span></span>' +
        '<h3>' + esc(n.t) + '</h3><p>' + esc(n.d) + '</p></a>';
    }}).join('');
  }};

  var procurar = function () {{
    var termo = pele(campo.value.trim());
    limpar.hidden = !termo;

    if (termo.length < 2) {{
      caixa.hidden = true; semNada.hidden = true; listagem.hidden = false;
      return;
    }}
    // todas as palavras precisam aparecer, em qualquer ordem
    var palavras = termo.split(/\s+/);
    var achados = indice.filter(function (x) {{
      return palavras.every(function (p) {{ return x.chave.indexOf(p) !== -1; }});
    }}).map(function (x) {{ return x.n; }});

    listagem.hidden = true;
    if (!achados.length) {{
      caixa.hidden = true; semNada.hidden = false; return;
    }}
    semNada.hidden = true; caixa.hidden = false;
    quantos.textContent = achados.length === 1
      ? '1 nota encontrada' : achados.length + ' notas encontradas';
    desenhar(achados);
  }};

  var espera;
  campo.addEventListener('input', function () {{
    clearTimeout(espera); espera = setTimeout(procurar, 120);
  }});
  campo.addEventListener('search', procurar);
  limpar.addEventListener('click', function () {{
    campo.value = ''; campo.focus(); procurar();
  }});
  // Enter num campo solto recarrega a pagina em alguns navegadores
  campo.addEventListener('keydown', function (e) {{ if (e.key === 'Enter') e.preventDefault(); }});
}})();
</script>
</body>
</html>""").format(
        titulo=html.escape(rotulo_tema or 'IA em movimento'),
        titulo_tag=html.escape(titulo_tag),
        desc=html.escape(chamada),
        url=canonical, autor=AUTOR, site=SITE, og_type='website',
        css=css_inline, ld=json.dumps({
            "@context": "https://schema.org", "@type": "Blog",
            "name": "IA em movimento", "url": SITE + '/artigos/',
            "inLanguage": "pt-BR",
            "author": {"@type": "Person", "name": AUTOR, "url": SITE + '/'},
        }, ensure_ascii=False),
        og_img='\n<meta property="og:image" content="%s/%s">' % (
            SITE, (destaque or (artigos[0] if artigos else {})).get('capa', '')
        ) if (destaque or artigos) and (destaque or artigos[0]).get('capa') else '',
        h1=h1, chamada=html.escape(chamada),
        filtros=barra_filtros(tema, contagem),
        manchete=manchete, cartoes='\n'.join(cartoes),
        paginas=barra_paginas(tema, pagina, total),
        catalogo=catalogo)



def main():
    destino = os.path.join(RAIZ, '_site', 'artigos')
    if not os.path.isdir(DIR_MD):
        print('sem pasta artigos/ — nada a gerar')
        return []

    # A PUBLICACAO TEM FOLHA PROPRIA. Antes ela inlinava o style.css inteiro
    # do portfolio: 57 KB de hero, pilha de projetos e canvas que nenhuma nota
    # usa, numa paleta escura pensada para impressionar e nao para ler.
    fontes = io.open(os.path.join(RAIZ, 'assets', 'fonts', 'fonts.css'), encoding='utf-8').read()
    css = fontes + '\n' + io.open(os.path.join(RAIZ, 'publicacao.css'), encoding='utf-8').read()

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
        artigos.append((meta, corpo))

    # ORDEM DO INDICE. A publicacao se chama "IA em movimento": o topo tem
    # que ser o que acabou de sair, senao o destaque congela e a promessa de
    # "atualizado automaticamente" vira mentira. Como varias notas nascem no
    # mesmo dia, a data sozinha nao desempata; entao no empate a noticia vem
    # antes do relato tecnico, que e evergreen e pode esperar. `destaque: true`
    # no front matter fura a fila quando eu quiser fixar alguma coisa. A hora
    # vem da propria maquina, no fuso de Brasilia, e e o que desempata o dia.
    artigos.sort(key=lambda par: (
        str(par[0].get('destaque', '')).lower() == 'true',
        par[0].get('data', ''),
        par[0].get('hora', '00:00'),
        par[0].get('tipo', '') == 'noticia',
        par[0].get('slug', '')), reverse=True)

    # As paginas so podem ser escritas DEPOIS da ordenacao: o "continue lendo"
    # de cada nota mostra as vizinhas mais recentes, e antes de ordenar nao
    # existe "mais recente".
    metas = [m for m, _ in artigos]
    for i, (meta, corpo) in enumerate(artigos):
        # Capa repetida confunde: a arte e por tema, entao duas notas do mesmo
        # assunto dividem a imagem. Ver a capa da nota que voce esta lendo
        # anunciando uma "outra" logo abaixo parece erro. Quem tem capa
        # diferente entra primeiro; a ordem por recencia sobrevive dentro de
        # cada grupo porque sorted() e estavel.
        candidatas = [v for v in metas if v['slug'] != meta['slug']]
        candidatas.sort(key=lambda v: v.get('capa') == meta.get('capa'))
        vizinhas = candidatas[:3]
        io.open(os.path.join(destino, meta['slug'], 'index.html'), 'w',
                encoding='utf-8').write(pagina(meta, md_para_html(corpo), css, vizinhas))

    artigos = metas
    globals()['TODAS'] = artigos          # o catalogo da busca precisa de tudo

    contagem = {}
    for a in artigos:
        contagem[tema_de(a)[0]] = contagem.get(tema_de(a)[0], 0) + 1

    def escrever_listagem(lista, tema):
        """Cada pagina de listagem e um arquivo de verdade. Robo que nao roda
        JavaScript ve a lista inteira; quem tem JS ganha a busca por cima."""
        total = max(1, -(-len(lista) // POR_PAGINA))
        for n in range(1, total + 1):
            fatia = lista[(n - 1) * POR_PAGINA:n * POR_PAGINA]
            pasta = destino if (n == 1 and not tema) else os.path.join(
                destino, *( ['tema', tema] if tema else [] ), *([] if n == 1 else [str(n)]))
            os.makedirs(pasta, exist_ok=True)
            io.open(os.path.join(pasta, 'index.html'), 'w', encoding='utf-8').write(
                indice(fatia, css, tema=tema, pagina=n, total=total, contagem=contagem))
        return total

    paginas = escrever_listagem(artigos, None)
    temas_gerados = []
    for t in TEMAS_ROTULO:
        do_tema = [a for a in artigos if tema_de(a)[0] == t]
        if do_tema:
            temas_gerados.append((t, escrever_listagem(do_tema, t), len(do_tema)))

    print('listagem: %d pagina(s) no indice + %s'
          % (paginas, ', '.join('%s(%d)' % (t, n) for t, _, n in temas_gerados)))

    sitemap(artigos, destino, paginas, temas_gerados)
    feed(artigos, destino)

    print('artigos gerados:', len(artigos), '->', ', '.join(a['slug'] for a in artigos))
    return artigos


def sitemap(artigos, destino, paginas=1, temas=()):
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
    # As paginas 2, 3... e as de tema sao portas de entrada de busca tambem.
    # Fora do sitemap, o Google so as acha seguindo link, o que e mais lento.
    for n in range(2, paginas + 1):
        linhas.append('  <url><loc>%s/artigos/%d/</loc><lastmod>%s</lastmod>'
                      '<changefreq>daily</changefreq><priority>0.4</priority></url>'
                      % (SITE, n, hoje))
    for t, total_t, _ in temas:
        for n in range(1, total_t + 1):
            caminho = '/artigos/tema/%s/' % t if n == 1 else '/artigos/tema/%s/%d/' % (t, n)
            linhas.append('  <url><loc>%s%s</loc><lastmod>%s</lastmod>'
                          '<changefreq>daily</changefreq><priority>%s</priority></url>'
                          % (SITE, caminho, hoje, '0.7' if n == 1 else '0.4'))

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
    # conta o que foi escrito de fato, senao o log mente quando a paginacao
    # e as paginas de tema entram na conta
    print('sitemap:', sum(1 for l in linhas if '<url>' in l), 'urls')



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
