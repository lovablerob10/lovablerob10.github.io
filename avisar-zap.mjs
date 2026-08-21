/* Avisa o Robson, no WhatsApp, do que a máquina acabou de publicar.
 *
 * POR QUE ISTO EXISTE
 * A máquina publica sozinha, com o nome dele assinando cada nota. O filtro
 * pega assunto fora de escopo e a própria LLM descarta o que não presta, mas
 * nada disso confere se o que ela afirmou é verdade. Este aviso é o olho
 * humano: não trava a publicação, só garante que ele saiba o que saiu antes
 * do Google indexar.
 *
 * POR QUE TEMPLATE E NÃO TEXTO LIVRE
 * As rodadas são 8h e 18h, quase sempre fora da janela de 24h em que o
 * WhatsApp permite mensagem livre. Fora dela, só template aprovado passa.
 *
 * Roda depois do publicar.sh de propósito: o link precisa estar no ar quando
 * a mensagem chega. E nunca derruba a rodada: notícia publicada sem aviso é
 * um problema pequeno, rodada que falha por causa do aviso é um problema
 * grande.
 */
import fs from 'node:fs/promises';

const RESUMO = '.ultima-rodada.json';
const DESTINO = process.env.AVISO_WHATSAPP || '5519996597169';

/* Dois templates, tentados nesta ordem.
 *
 * O primeiro foi submetido como UTILITY e a revisao da Meta trocou para
 * MARKETING, que ela limita a entrega para preservar engajamento. Com o
 * numero em qualidade RED, isso vira mensagem aceita pela API e nunca
 * entregue (131049). O segundo e um relatorio de status seco, sem segunda
 * pessoa e sem botao, escrito para o classificador reconhecer como aviso
 * de sistema. Qual dos dois vai estar aprovado na hora eu nao controlo,
 * entao o codigo tenta o preferido e cai para o outro. */
const TEMPLATES = [
  { nome: 'status_publicacao_automatica', params: (r) => [r.quando, String(r.n), r.titulos.join('; ')] },
  { nome: 'maquina_noticias_publicou', params: (r) => [r.n === 1 ? '1 nota' : `${r.n} notas`, r.titulos.join(' · ')] },
];

const token = process.env.META_ACCESS_TOKEN;
const phoneId = process.env.META_PHONE_NUMBER_ID;

async function main() {
  let rodada;
  try {
    rodada = JSON.parse(await fs.readFile(RESUMO, 'utf8'));
  } catch {
    console.log('sem resumo de rodada: nada a avisar');
    return;
  }

  const notas = rodada.notas || [];
  if (!notas.length) {
    console.log('rodada sem notas: nada a avisar');
    return;
  }
  if (!token || !phoneId) {
    console.log('sem credencial da Meta: aviso pulado');
    return;
  }

  const resumo = {
    // parametro de template nao aceita quebra de linha nem espaco duplicado
    quando: (rodada.quando || '').replace(/\s+/g, ' ').trim() || 'agora',
    n: notas.length,
    titulos: notas.map((x) => x.titulo.replace(/\s+/g, ' ').trim()),
  };

  let ultimoErro = '';
  for (const t of TEMPLATES) {
    const r = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: DESTINO,
        type: 'template',
        template: {
          name: t.nome,
          language: { code: 'pt_BR' },
          components: [{
            type: 'body',
            parameters: t.params(resumo).map((text) => ({ type: 'text', text: text.slice(0, 900) })),
          }],
        },
      }),
      signal: AbortSignal.timeout(30000),
    });

    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      console.log(`aviso enviado via ${t.nome}: ${resumo.n} nota(s) -> ${DESTINO} (id ${j.messages?.[0]?.id || '?'})`);
      return;
    }
    const e = j.error || {};
    ultimoErro = `${e.code || r.status}: ${e.message || 'erro desconhecido'}`;
    // 132001 = template inexistente ou ainda em analise. Vale tentar o proximo.
    console.warn(`  ${t.nome} nao serviu (${ultimoErro})`);
  }
  console.warn(`aviso nao enviado, nenhum template disponivel. ultimo erro -> ${ultimoErro}`);
}

// erro aqui nunca pode derrubar a rodada
main().catch((e) => console.warn('aviso falhou:', e.message));
