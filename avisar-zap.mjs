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
const TEMPLATE = 'maquina_noticias_publicou';

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

  const quantas = notas.length === 1 ? '1 nota' : `${notas.length} notas`;
  // parâmetro de template não aceita quebra de linha nem espaço duplicado
  const manchetes = notas
    .map((n) => n.titulo)
    .join(' · ')
    .replace(/\s+/g, ' ')
    .slice(0, 900);

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
          parameters: [
            { type: 'text', text: quantas },
            { type: 'text', text: manchetes },
          ],
        }],
      },
    }),
    signal: AbortSignal.timeout(30000),
  });

  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = j.error || {};
    // 132001 = template inexistente ou ainda em análise. Não é falha da rodada.
    console.warn(`aviso nao enviado (${e.code || r.status}): ${e.message || 'erro desconhecido'}`);
    if (e.error_data?.details) console.warn('  detalhe:', e.error_data.details);
    return;
  }
  console.log(`aviso enviado: ${quantas} -> ${DESTINO} (id ${j.messages?.[0]?.id || '?'})`);
}

// erro aqui nunca pode derrubar a rodada
main().catch((e) => console.warn('aviso falhou:', e.message));
