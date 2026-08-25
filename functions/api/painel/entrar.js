/* Login do painel.
 *
 * Uma senha só, guardada nas variáveis do projeto, nunca no código. O que
 * protege isto de força bruta não é a senha ser longa: é a tabela de
 * tentativas. Sem ela, uma senha única fica exposta a quem tiver paciência,
 * e ninguém fica sabendo que tentaram.
 */
import { criarCookie, cookieVazio, json, hashIp, temSessao } from '../../_sessao.js';

const MAX_TENTATIVAS = 6;      // por janela, por IP
const JANELA_MIN = 15;

function iguais(a, b) {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}

export async function onRequestPost({ request, env }) {
  const senhaCerta = env.PAINEL_SENHA;
  const segredo = env.PAINEL_SEGREDO;
  if (!senhaCerta || !segredo) {
    return json({ ok: false, erro: 'painel não configurado' }, 503);
  }

  let corpo;
  try { corpo = await request.json(); } catch { corpo = {}; }
  const senha = String(corpo.senha ?? '');

  const ip = request.headers.get('cf-connecting-ip') ?? 'sem-ip';
  const chaveIp = await hashIp(ip, segredo);
  const corte = new Date(Date.now() - JANELA_MIN * 60_000).toISOString();

  const { results } = await env.DB.prepare(
    'select count(*) as n from tentativas where ip_hash = ? and ok = 0 and quando > ?',
  ).bind(chaveIp, corte).all();

  if ((results?.[0]?.n ?? 0) >= MAX_TENTATIVAS) {
    return json({ ok: false, erro: `Muitas tentativas. Tenta de novo em ${JANELA_MIN} minutos.` }, 429);
  }

  const acertou = senha.length > 0 && iguais(senha, senhaCerta);

  await env.DB.prepare(
    'insert into tentativas (quando, ip_hash, ok) values (?, ?, ?)',
  ).bind(new Date().toISOString(), chaveIp, acertou ? 1 : 0).run();

  if (!acertou) {
    // Mensagem genérica de propósito: não confirma nem nega nada além do erro.
    return json({ ok: false, erro: 'Senha incorreta.' }, 401);
  }

  return json({ ok: true }, 200, { 'set-cookie': await criarCookie(segredo) });
}

/** GET serve para a página saber, no carregamento, se já há sessão viva. */
export async function onRequestGet({ request, env }) {
  return json({ ok: await temSessao(request, env.PAINEL_SEGREDO) });
}

/** DELETE é o "sair". */
export const onRequestDelete = () =>
  json({ ok: true }, 200, { 'set-cookie': cookieVazio() });
