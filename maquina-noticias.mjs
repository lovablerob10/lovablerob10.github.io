/**
 * A MÁQUINA DE NOTÍCIAS
 *
 * Lê feeds RSS de IA, escolhe o que importa, escreve cada nota com o ângulo
 * de quem constrói IA em produção, e publica. Roda sozinha.
 *
 * ---------------------------------------------------------------------------
 * POR QUE ELA NÃO COPIA NOTÍCIA
 *
 * Reproduzir o texto alheio é duas coisas ruins ao mesmo tempo: violação de
 * direito autoral e suicídio de SEO (o Google trata como conteúdo duplicado e
 * você perde para a fonte original, que publicou antes e tem mais autoridade).
 *
 * Então cada nota tem duas partes: o FATO, resumido em poucas linhas com link
 * e crédito para quem apurou, e a ANÁLISE, que é o que ninguém mais escreve —
 * o que aquilo muda para quem tem agente de IA rodando com cliente real. A
 * primeira parte informa. A segunda é a que rankeia e diferencia.
 *
 * ---------------------------------------------------------------------------
 * TRAVAS, porque isto publica sem revisão humana
 *
 * 1. Fontes fixas em allowlist. A máquina nunca lê um domínio que não está aqui.
 * 2. Nada de política partidária. Regulação de IA sim; briga eleitoral não.
 *    O portfólio existe para atrair cliente, e opinião partidária afasta metade.
 * 3. Um item por vez, com teto diário. Se o feed enlouquecer, ela não despeja.
 * 4. Se o modelo devolver algo fora do formato, a nota é descartada em silêncio.
 *    Publicar errado é pior que não publicar.
 * 5. Nada é reescrito por cima: cada nota é um arquivo novo com data no nome.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(RAIZ, 'noticias');
const HIST = path.join(RAIZ, '.noticias-vistas.json');

/** Fontes. Só sai daqui o que estiver nesta lista. */
const FONTES = [
  { nome: 'TechCrunch AI',     url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { nome: 'The Verge AI',      url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
  { nome: 'Ars Technica',      url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
  { nome: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
  { nome: 'Google AI Blog',    url: 'https://blog.google/technology/ai/rss/' },
  { nome: 'OpenAI',            url: 'https://openai.com/news/rss.xml' },
  { nome: 'Hugging Face',      url: 'https://huggingface.co/blog/feed.xml' },
];

/** O que interessa e o que não interessa. */
const RELEVANTE = /\b(ai|a\.i\.|artificial intelligence|llm|gpt|claude|gemini|openai|anthropic|agent|agentic|automation|machine learning|model|chatbot|copilot|regulation|regula|intelig[êe]ncia artificial)\b/i;
const VETADO = /\b(election|eleic|eleiç|candidat|partido|partisan|trump|biden|lula|bolsonaro|crypto|bitcoin|nft|celebrity|gossip)\b/i;

const MAX_POR_RODADA = 3;   // teto por execução
const MAX_POR_DIA = 5;      // teto diário, somando as rodadas

/* ------------------------------------------------------------------ */
/* RSS: um parser pequeno. Feed é XML previsível; uma dependência a
   menos é uma atualização a menos para vigiar.                        */
/* ------------------------------------------------------------------ */
function tag(bloco, nome) {
  const m = bloco.match(new RegExp(`<${nome}[^>]*>([\\s\\S]*?)</${nome}>`, 'i'));
  if (!m) return '';
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function linkDe(bloco) {
  const href = bloco.match(/<link[^>]*href="([^"]+)"/i);
  if (href) return href[1];
  return tag(bloco, 'link');
}

async function lerFeed(fonte) {
  try {
    const r = await fetch(fonte.url, {
      headers: { 'user-agent': 'RobsonNobreBot/1.0 (+https://robsonobre.com.br)' },
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) return [];
    const xml = await r.text();
    const blocos = xml.split(/<(?:item|entry)[\s>]/i).slice(1);
    return blocos.slice(0, 12).map((b) => ({
      fonte: fonte.nome,
      titulo: tag(b, 'title'),
      link: linkDe(b),
      resumo: (tag(b, 'description') || tag(b, 'summary') || tag(b, 'content')).slice(0, 900),
      data: tag(b, 'pubDate') || tag(b, 'updated') || tag(b, 'published'),
    })).filter((i) => i.titulo && i.link);
  } catch (e) {
    console.warn(`[feed] ${fonte.nome} falhou: ${String(e.message).slice(0, 60)}`);
    return [];
  }
}

// as seis artes de capa, geradas no FLUX.2 na mesma linguagem visual do site
const TEMAS = new Set(['modelos', 'regulacao', 'negocios', 'infra', 'pesquisa', 'web']);
const CAPA_ALT = {
  modelos: 'Malha neural luminosa emergindo do escuro',
  regulacao: 'Arco de pedra institucional se dissolvendo em particulas de dados',
  negocios: 'Torres de vidro luminosas formando um grafico ascendente',
  infra: 'Corredor de servidores iluminado em violeta e ciano',
  pesquisa: 'Estrutura cristalina microscopica se abrindo',
  web: 'Rede de paineis de vidro flutuando no escuro',
};

/* ------------------------------------------------------------------ */
/* O cérebro                                                           */
/* ------------------------------------------------------------------ */
const PROMPT = `Você escreve para o site de Robson Nobre, desenvolvedor brasileiro que constrói sistemas de IA em produção: agentes autônomos que prospectam empresas, uma IA que gerencia campanhas de tráfego sozinha, assistentes que atendem no WhatsApp. Ele fala de IA como quem opera, não como quem observa.

Escreva uma nota curta sobre a notícia abaixo, em português do Brasil, com DUAS partes:

1. O FATO: dois parágrafos curtos contando o que aconteceu. Comece direto, SEM subtítulo nenhum, como abertura de matéria de jornal. Escreva com suas palavras, jamais copie frases do original. Seja concreto: números, nomes, datas.

2. A LEITURA: dois ou três parágrafos com a análise de quem constrói. O que isso significa para quem tem IA rodando com cliente real? Muda custo, arquitetura, risco, prazo? Se a notícia for irrelevante para quem constrói, diga isso com franqueza em vez de inventar importância.

Esta segunda parte leva UM subtítulo com ## que você escreve para esta notícia específica. Ele não é um rótulo genérico: é uma frase curta que já entrega a sua tese, do jeito que um editor titula a análise. Em caixa normal, nunca em caixa alta. Jamais reutilize "O que muda na prática", "O fato", "Análise" ou qualquer fórmula do tipo. Exemplos do espírito certo: "Roteamento virou commodity", "O prazo de quem depende da API da Meta acabou de encurtar", "Ninguém vai migrar por causa disso".

REGRAS DE ESTILO, siga à risca:
- Jamais use travessão (—) ou hífen como pausa. Use vírgula, ponto, dois-pontos ou parênteses.
- Nada de "revolucionário", "game changer", "transformador", "impressionante", "o futuro chegou".
- Sem superlativo vazio. Se um número explica melhor, use o número.
- Frases curtas. Voz ativa. Como jornalista de tecnologia que entende do assunto.
- Não invente dado que não está na notícia. Se não souber, não afirme.
- Não use emoji.

Responda APENAS com JSON válido, sem cercas de código:
{
  "publicar": true,
  "titulo": "título em português, direto, no máximo 70 caracteres",
  "resumo": "uma frase de até 150 caracteres resumindo por que importa",
  "tema": "um destes, exatamente: modelos | regulacao | negocios | infra | pesquisa | web",
  "corpo": "o texto completo em markdown, usando ## para as duas seções"
}

O campo tema classifica o assunto e define a arte de capa:
- modelos: lançamento ou capacidade nova de um modelo de IA
- regulacao: governo, lei, processo judicial, política pública
- negocios: empresa, receita, contrato, disputa de mercado, investimento
- infra: chip, data center, energia, custo de computação
- pesquisa: estudo, paper, descoberta científica
- web: busca, conteúdo, publishers, o que a IA faz com a internet

Se a notícia não tiver relevância real para quem constrói IA, responda {"publicar": false}.`;

async function escrever(item, env) {
  const body = {
    model: env.modelo,
    messages: [
      { role: 'system', content: PROMPT },
      { role: 'user', content: `TÍTULO: ${item.titulo}\nFONTE: ${item.fonte}\nLINK: ${item.link}\nRESUMO ORIGINAL: ${item.resumo}` },
    ],
    temperature: 0.6,
    max_tokens: 1400,
  };

  const r = await fetch(env.endpoint, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.chave}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
  if (!r.ok) throw new Error(`LLM ${r.status}: ${(await r.text()).slice(0, 160)}`);

  const j = await r.json();
  const txt = (j.choices?.[0]?.message?.content || '').trim()
    .replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

  let nota;
  try {
    nota = JSON.parse(txt);
  } catch {
    throw new Error('resposta fora do formato JSON');
  }
  if (!nota.publicar) return null;
  if (!TEMAS.has(nota.tema)) nota.tema = 'modelos';
  if (!nota.titulo || !nota.corpo || nota.corpo.length < 400) {
    throw new Error('nota curta demais ou incompleta');
  }
  // trava de estilo: o travessão é o vício que o Robson não quer ver
  nota.titulo = nota.titulo.replace(/\s*—\s*/g, ', ');
  nota.corpo = nota.corpo.replace(/\s+—\s+/g, ', ').replace(/—/g, ',');
  nota.resumo = (nota.resumo || '').replace(/\s*—\s*/g, ', ');
  // subtitulo gritado denuncia o template; jornal nenhum escreve assim
  nota.corpo = nota.corpo.replace(/^##\s+(.+)$/gm, (_, t) =>
    t === t.toUpperCase() && /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(t)
      ? '## ' + t.charAt(0) + t.slice(1).toLowerCase()
      : '## ' + t);
  return nota;
}

/* ------------------------------------------------------------------ */
function slugify(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 68);
}

async function main() {
  const chaveOR = process.env.OPENROUTER_API_KEY;
  const chaveOA = process.env.OPENAI_API_KEY;
  const env = chaveOR
    ? { chave: chaveOR, endpoint: 'https://openrouter.ai/api/v1/chat/completions', modelo: process.env.NEWS_MODEL || 'anthropic/claude-sonnet-4.5' }
    : { chave: chaveOA, endpoint: 'https://api.openai.com/v1/chat/completions', modelo: process.env.NEWS_MODEL || 'gpt-5.6-terra' };
  if (!env.chave) { console.error('sem chave de LLM (OPENROUTER_API_KEY ou OPENAI_API_KEY)'); process.exit(1); }

  await fs.mkdir(DIR, { recursive: true });
  let vistas = [];
  try { vistas = JSON.parse(await fs.readFile(HIST, 'utf8')); } catch { /* primeira vez */ }
  const jaVi = new Set(vistas.map((v) => v.link));

  // quantas já saíram hoje
  const hoje = new Date().toISOString().slice(0, 10);
  const publicadasHoje = vistas.filter((v) => v.publicadoEm === hoje).length;
  if (publicadasHoje >= MAX_POR_DIA) {
    console.log(`teto diario atingido (${publicadasHoje}/${MAX_POR_DIA})`);
    return;
  }

  const todos = (await Promise.all(FONTES.map(lerFeed))).flat();
  console.log(`feeds: ${todos.length} itens lidos`);

  const candidatos = todos.filter((i) =>
    !jaVi.has(i.link) &&
    RELEVANTE.test(i.titulo + ' ' + i.resumo) &&
    !VETADO.test(i.titulo + ' ' + i.resumo));
  console.log(`candidatos apos filtro: ${candidatos.length}`);

  const teto = Math.min(MAX_POR_RODADA, MAX_POR_DIA - publicadasHoje);
  let escritas = 0;

  for (const item of candidatos) {
    if (escritas >= teto) break;
    try {
      const nota = await escrever(item, env);
      jaVi.add(item.link);
      if (!nota) {
        vistas.push({ link: item.link, visto: hoje, publicado: false });
        console.log(`  descartada (sem relevancia): ${item.titulo.slice(0, 58)}`);
        continue;
      }
      const slug = slugify(nota.titulo);
      const arquivo = path.join(DIR, `${hoje}-${slug}.md`);
      const md = `---
slug: ${slug}
titulo: "${nota.titulo.replace(/"/g, "'")}"
descricao: "${(nota.resumo || '').replace(/"/g, "'")}"
data: ${hoje}
leitura: 3 min de leitura
fonte: "${item.fonte}"
fonte_url: "${item.link}"
tipo: noticia
capa: assets/media/capa-${nota.tema}.webp
capa_alt: "${CAPA_ALT[nota.tema]}"
---

${nota.corpo}

---

*Apurado originalmente por [${item.fonte}](${item.link}).*
`;
      await fs.writeFile(arquivo, md, 'utf8');
      vistas.push({ link: item.link, visto: hoje, publicadoEm: hoje, slug });
      escritas++;
      console.log(`  ✓ ${nota.titulo}`);
    } catch (e) {
      // falha de uma nota nao derruba a rodada
      console.warn(`  x ${item.titulo.slice(0, 46)}: ${String(e.message).slice(0, 70)}`);
      jaVi.add(item.link);
      vistas.push({ link: item.link, visto: hoje, erro: true });
    }
  }

  // a memoria guarda 400 links: o suficiente para nao repetir, sem crescer para sempre
  await fs.writeFile(HIST, JSON.stringify(vistas.slice(-400), null, 1), 'utf8');
  console.log(`\n${escritas} nota(s) escrita(s) em noticias/`);
}

main().catch((e) => { console.error('maquina falhou:', e.message); process.exit(1); });
