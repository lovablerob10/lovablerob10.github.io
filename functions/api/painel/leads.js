/* A lista de contatos, para o painel.
 *
 * Só responde com sessão válida. Sem essa guarda o endpoint seria uma porta
 * aberta para o telefone de todo mundo que preencheu o formulário, que é
 * exatamente o dado que não pode vazar.
 */
import { exigirSessao, json } from '../../_sessao.js';

const POR_PAGINA = 50;

export async function onRequestGet({ request, env }) {
  const recusa = await exigirSessao(request, env);
  if (recusa) return recusa;

  const u = new URL(request.url);
  const pagina = Math.max(1, Number(u.searchParams.get('p') || 1));
  const busca = (u.searchParams.get('q') || '').trim().slice(0, 60);
  const soNaoLidos = u.searchParams.get('novos') === '1';
  const comTeste = u.searchParams.get('teste') === '1';

  const onde = [];
  const args = [];
  if (!comTeste) onde.push('teste = 0');
  if (soNaoLidos) onde.push('lido = 0');
  if (busca) {
    onde.push('(nome like ? or telefone like ? or contexto like ? or pagina like ?)');
    const p = '%' + busca + '%';
    args.push(p, p, p, p);
  }
  const filtro = onde.length ? 'where ' + onde.join(' and ') : '';

  const totais = await env.DB.prepare(
    `select count(*) as total,
            sum(case when lido = 0 then 1 else 0 end) as novos,
            sum(case when entregue = 0 then 1 else 0 end) as falhos
       from leads where teste = 0`,
  ).all();

  const { results } = await env.DB.prepare(
    `select id, criado_em, nome, telefone, contexto, pagina, origem,
            entregue, erro, lido, teste
       from leads ${filtro}
      order by criado_em desc
      limit ? offset ?`,
  ).bind(...args, POR_PAGINA, (pagina - 1) * POR_PAGINA).all();

  const t = totais.results?.[0] ?? {};
  return json({
    ok: true,
    leads: results ?? [],
    pagina,
    porPagina: POR_PAGINA,
    resumo: { total: t.total ?? 0, novos: t.novos ?? 0, falhos: t.falhos ?? 0 },
  });
}

/** Marca lido/não lido. O painel só serve se der para saber o que já foi
 *  respondido; sem isso, toda visita recomeça do zero. */
export async function onRequestPost({ request, env }) {
  const recusa = await exigirSessao(request, env);
  if (recusa) return recusa;

  let corpo;
  try { corpo = await request.json(); } catch { return json({ ok: false }, 400); }

  const id = Number(corpo.id);
  if (!Number.isInteger(id) || id < 1) return json({ ok: false, erro: 'id inválido' }, 422);

  await env.DB.prepare('update leads set lido = ? where id = ?')
    .bind(corpo.lido ? 1 : 0, id).run();

  return json({ ok: true });
}
