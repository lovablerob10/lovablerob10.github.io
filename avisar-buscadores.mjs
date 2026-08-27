/* Avisa os buscadores a cada publicação, em vez de esperar eles passarem.
 *
 * POR QUE ISTO IMPORTA MAIS DO QUE PARECE
 * Em 26/08 o Search Console mostrava UMA página indexada: a home, rastreada
 * em 20/08 e não revisitada desde então. Domínio novo recebe rastreamento
 * raro, e uma publicação que sai duas vezes por dia fica esperando dias por
 * uma visita que pode não vir.
 *
 * O IndexNow inverte isso: em vez de esperar, o site avisa. Bing e Yandex
 * suportam, e o Bing é a peça que quase todo mundo esquece — a busca do
 * ChatGPT usa o índice dele. Quem quer ser citado por assistente de IA
 * precisa estar no Bing tanto quanto no Google.
 *
 * O Google NÃO suporta IndexNow. Para ele o caminho continua sendo sitemap,
 * link interno e paciência; é por isso que as notas recentes passaram a
 * aparecer na home.
 */
import fs from 'node:fs/promises';

const SITE = 'https://robsonobre.com.br';
const CHAVE = '7c5cff22d3ee4a1b9f6e0d8c3a75b214';   // também servida em /<chave>.txt

async function urlsDoSitemap() {
  const xml = await fs.readFile('_site/sitemap.xml', 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const r = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: 'robsonobre.com.br',
    key: CHAVE,
    keyLocation: `${SITE}/${CHAVE}.txt`,
    // O protocolo aceita até 10 mil por chamada; o site inteiro cabe folgado.
    urlList: await urlsDoSitemap(),
  }),
  signal: AbortSignal.timeout(30000),
}).catch((e) => ({ ok: false, status: 0, erro: e.message }));

/* 200 e 202 são aceite. Qualquer outra coisa vira aviso e nada mais: falhar
 * em avisar buscador não pode derrubar um deploy que já deu certo. */
if (r.ok) {
  console.log(`IndexNow: ${(await urlsDoSitemap()).length} URLs enviadas (HTTP ${r.status})`);
} else {
  console.warn(`IndexNow nao aceitou (HTTP ${r.status ?? '?'}) ${r.erro ?? ''}`.trim());
}
