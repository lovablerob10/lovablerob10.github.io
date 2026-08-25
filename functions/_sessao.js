/* Sessão do painel: um cookie assinado, sem banco de sessão.
 *
 * POR QUE ASSINADO E NÃO UM ID GUARDADO NA TABELA
 * Só existe um usuário: o Robson. Uma tabela de sessão aqui seria uma consulta
 * a mais em toda requisição para responder algo que a própria assinatura já
 * responde. O cookie carrega a validade e um HMAC; se o conteúdo for adulterado
 * a assinatura não bate, e não há como forjar sem o segredo do servidor.
 *
 * O QUE ESTE DESENHO NÃO FAZ
 * Não dá para revogar uma sessão específica antes de ela expirar. Se isso for
 * preciso um dia (celular perdido, por exemplo), a saída é trocar o
 * PAINEL_SEGREDO nas variáveis do projeto, o que derruba todas de uma vez.
 */

const COOKIE = 'rn_painel';
const VALIDADE_H = 24 * 14;          // duas semanas

const enc = new TextEncoder();

const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function chave(segredo) {
  return crypto.subtle.importKey(
    'raw', enc.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
}

async function assinar(texto, segredo) {
  return b64url(await crypto.subtle.sign('HMAC', await chave(segredo), enc.encode(texto)));
}

/** Comparação em tempo constante. Comparar com === vaza, pelo tempo de
 *  resposta, quantos caracteres iniciais estavam certos. */
function iguais(a, b) {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}

export async function criarCookie(segredo) {
  const expira = Date.now() + VALIDADE_H * 3600_000;
  const corpo = String(expira);
  const valor = `${corpo}.${await assinar(corpo, segredo)}`;
  return `${COOKIE}=${valor}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${VALIDADE_H * 3600}`;
}

export const cookieVazio = () =>
  `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

export async function temSessao(request, segredo) {
  if (!segredo) return false;
  const bruto = request.headers.get('cookie') || '';
  const achado = bruto.split(';')
    .map((p) => p.trim())
    .find((p) => p.startsWith(COOKIE + '='));
  if (!achado) return false;

  const valor = achado.slice(COOKIE.length + 1);
  const corte = valor.lastIndexOf('.');
  if (corte < 1) return false;

  const corpo = valor.slice(0, corte);
  const dado = valor.slice(corte + 1);
  if (!iguais(dado, await assinar(corpo, segredo))) return false;

  const expira = Number(corpo);
  return Number.isFinite(expira) && expira > Date.now();
}

export const json = (dados, status = 200, extra = {}) =>
  new Response(JSON.stringify(dados), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extra,
    },
  });

/** Guarda de rota: devolve null quando a sessão vale, ou já a resposta de
 *  recusa. Cada endpoint do painel começa por isto. */
export async function exigirSessao(request, env) {
  if (await temSessao(request, env.PAINEL_SEGREDO)) return null;
  return json({ ok: false, erro: 'não autenticado' }, 401);
}

/** O IP nunca é guardado cru: só o hash serve para contar tentativas. */
export async function hashIp(ip, segredo) {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(String(ip) + '|' + segredo));
  return b64url(buf).slice(0, 22);
}
