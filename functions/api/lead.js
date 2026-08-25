/* Recebe o formulário do site e entrega o contato no WhatsApp do Robson.
 *
 * GRAVA PRIMEIRO, ENTREGA DEPOIS. A ORDEM É A REGRA.
 * O desenho anterior não tinha banco: assumia que a entrega no WhatsApp ERA o
 * armazenamento. Isso vale enquanto a entrega funciona. Em 25/08 a API oficial
 * ficou instável e o custo da aposta apareceu: mensagem que não chega é lead
 * que nunca existiu, sem rastro nenhum para recuperar depois.
 * Agora o contato vai para o D1 antes de qualquer tentativa de envio. Se o
 * WhatsApp cair, o lead está salvo e aparece no painel; se o banco cair, ainda
 * assim tentamos entregar. As duas pernas quebram separado.
 *
 * O caso de falha continua tendo saída para o visitante: a resposta traz um
 * link wa.me com a mensagem já escrita. O que não pode acontecer é a tela
 * dizer "recebido" e não existir registro em lugar nenhum.
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

/** Hash do IP: contar repetição sem guardar o endereço de ninguém. */
async function hashLeve(ip) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('lead|' + ip));
  return btoa(String.fromCharCode(...new Uint8Array(buf))).slice(0, 22);
}

/** Anota como a entrega terminou. Nunca lança: o lead já está salvo, e uma
 *  falha ao anotar o status não pode virar erro para o visitante. */
async function marcar(env, id, entregue, erro) {
  if (!id) return;
  try {
    await env.DB.prepare('update leads set entregue = ?, erro = ? where id = ?')
      .bind(entregue, erro, id).run();
  } catch (e) {
    console.error('status do lead nao anotado:', e.message);
  }
}

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

  /* Teste que chega igual a lead de verdade custa caro: em 21/08 o Robson
     olhou o celular e nao soube dizer se "Marcos Ferreira" era cliente ou
     coisa nossa. Marcado assim, a duvida nao existe. */
  const eTeste = corpo.teste === true;

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

  /* O REGISTRO VEM ANTES DE TUDO. Se esta gravação falhar, seguimos para a
     entrega assim mesmo: perder o registro é ruim, perder o lead é pior. */
  let idLead = null;
  try {
    const r = await env.DB.prepare(
      `insert into leads (criado_em, nome, telefone, contexto, pagina, origem, ip_hash, teste)
       values (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      new Date().toISOString(), nome, telefone, contexto || null, pagina,
      (request.headers.get('referer') || '').replace(/^https?:\/\//, '').split('/')[0] || null,
      await hashLeve(ip), eTeste ? 1 : 0,
    ).run();
    idLead = r.meta?.last_row_id ?? null;
  } catch (e) {
    console.error('lead nao gravado:', e.message);
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
    agoraEmBrasilia() + (eTeste ? ' [TESTE, pode ignorar]' : ''),
    (eTeste ? '[TESTE] ' : '') + nome,
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
      await marcar(env, idLead, 0, `${r.status}: ${detalhe.slice(0, 180)}`);
      // O lead ESTÁ salvo, então a pessoa não precisa saber que o aviso falhou:
      // ela fez a parte dela. O WhatsApp segue oferecido como atalho.
      return json({ ok: true, whatsapp: fallback });
    }
    await marcar(env, idLead, 1, null);
  } catch (e) {
    console.error('lead falhou:', e.message);
    await marcar(env, idLead, 0, String(e.message).slice(0, 180));
    return json({ ok: true, whatsapp: fallback });
  }

  return json({ ok: true, whatsapp: fallback });
}

// GET no endpoint é engano ou varredura: responde curto, sem revelar nada.
export const onRequestGet = () => json({ ok: false, erro: 'use POST' }, 405);
