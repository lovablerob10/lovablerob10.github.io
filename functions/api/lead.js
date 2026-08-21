/* Recebe o formulário do site e entrega o contato no WhatsApp do Robson.
 *
 * POR QUE NÃO TEM BANCO
 * O token da Cloudflare disponível só alcança Pages, não KV nem D1. Em vez de
 * fingir persistência, o desenho assume que a entrega É o armazenamento e
 * cuida do caso em que ela falha: se o WhatsApp não aceitar, a resposta traz
 * um link wa.me com a mensagem já escrita e o formulário empurra a pessoa
 * para lá. O lead vira conversa de um jeito ou de outro; o que não pode
 * acontecer é a tela dizer "recebido" e nada ter chegado.
 *
 * ONDE ISTO RODA
 * Cloudflare Pages Function, no mesmo deploy do site (POST /api/lead). Não há
 * servidor para manter, e o segredo da Meta fica nas variáveis do projeto,
 * nunca no HTML.
 */

const DESTINO = '5519996597169';           // para quem o lead é entregue
const TEMPLATE = 'lead_do_site';
const LIMITE_POR_IP = 5;                   // por janela, abaixo
const JANELA_MIN = 10;

/* Sem KV, o controle de repetição vive na memória do isolate. Não é rigoroso
 * (a Cloudflare cria e destrói isolates a qualquer momento), mas resolve o
 * caso real: alguém clicando "enviar" várias vezes ou um bot simples num
 * loop. Abuso coordenado é outro problema, e exigiria estado compartilhado. */
const recentes = new Map();

function limitado(ip) {
  const agora = Date.now();
  const corte = agora - JANELA_MIN * 60_000;
  const anteriores = (recentes.get(ip) ?? []).filter((t) => t > corte);
  if (anteriores.length >= LIMITE_POR_IP) return true;
  anteriores.push(agora);
  recentes.set(ip, anteriores);
  if (recentes.size > 500) recentes.clear();   // teto de memória
  return false;
}

const limpar = (v, max) =>
  String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/* Um telefone brasileiro válido tem 10 ou 11 dígitos depois do DDI, e o DDD
 * começa em 11. Aceitar qualquer coisa aqui significa receber um lead que não
 * dá para responder, que é pior do que não receber. */
function normalizarTelefone(bruto) {
  let d = String(bruto ?? '').replace(/\D/g, '');
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
  if (d.length < 10 || d.length > 11) return null;
  if (Number(d.slice(0, 2)) < 11) return null;
  return '55' + d;
}

function agoraEmBrasilia() {
  const f = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const p = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month} às ${p.hour}h${p.minute}`;
}

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export async function onRequestPost({ request, env }) {
  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return json({ ok: false, erro: 'formato inválido' }, 400);
  }

  // Campo invisível que só robô preenche. Responde 200 de propósito: robô que
  // recebe erro tenta de novo, robô que recebe sucesso vai embora.
  if (limpar(corpo.site, 80)) return json({ ok: true });

  const nome = limpar(corpo.nome, 80);
  const telefone = normalizarTelefone(corpo.whatsapp);
  const contexto = limpar(corpo.mensagem, 600);
  const pagina = limpar(corpo.pagina, 120) || 'site';

  if (nome.length < 2) return json({ ok: false, erro: 'Escreve seu nome, por favor.' }, 422);
  if (!telefone) {
    return json({ ok: false, erro: 'Esse WhatsApp não parece completo. Confere o DDD?' }, 422);
  }

  const ip = request.headers.get('cf-connecting-ip') ?? 'desconhecido';
  if (limitado(ip)) {
    return json({ ok: false, erro: 'Você já mandou faz pouco. Já estou com sua mensagem.' }, 429);
  }

  // O plano B fica pronto ANTES da tentativa: se a entrega falhar, a pessoa
  // não pode ficar sem caminho.
  const texto =
    `Oi Robson, sou ${nome}.` +
    (contexto ? ` ${contexto}` : '') +
    (pagina !== 'site' ? ` (cheguei pelo texto "${pagina}")` : '');
  const fallback = `https://wa.me/${DESTINO}?text=${encodeURIComponent(texto)}`;

  const token = env.META_ACCESS_TOKEN;
  const phoneId = env.META_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    return json({ ok: false, erro: 'entrega indisponível', whatsapp: fallback }, 503);
  }

  const partes = [
    agoraEmBrasilia(),
    nome,
    `+${telefone}`,
    pagina,
    contexto || 'não escreveu contexto',
  ];

  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: DESTINO,
        type: 'template',
        template: {
          name: TEMPLATE,
          language: { code: 'pt_BR' },
          components: [{
            type: 'body',
            parameters: partes.map((text) => ({ type: 'text', text })),
          }],
        },
      }),
    });

    if (!r.ok) {
      const detalhe = await r.text();
      console.error('lead nao entregue:', r.status, detalhe.slice(0, 300));
      return json({ ok: false, erro: 'não consegui registrar', whatsapp: fallback }, 502);
    }
  } catch (e) {
    console.error('lead falhou:', e.message);
    return json({ ok: false, erro: 'não consegui registrar', whatsapp: fallback }, 502);
  }

  return json({ ok: true, whatsapp: fallback });
}

// GET no endpoint é engano ou varredura: responde curto, sem revelar nada.
export const onRequestGet = () => json({ ok: false, erro: 'use POST' }, 405);
