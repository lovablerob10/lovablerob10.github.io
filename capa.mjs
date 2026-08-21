/* Desenha a capa de uma nota.
 *
 * POR QUE UMA CAPA POR NOTA
 * Antes eram seis artes em rodízio. Com 12 notas a mesma imagem aparecia três
 * vezes na mesma página, e isso não lê como publicação, lê como banco de
 * imagens. A capa própria é o que separa uma editoria de um agregador.
 *
 * POR QUE PELO OPENROUTER E NÃO PELO HIGGSFIELD
 * A CLI do Higgsfield autentica por OAuth e vive na máquina do Robson. A
 * rodada roda no GitHub Actions, onde ela não existe. O OpenRouter já tem
 * chave lá para escrever as notas, então a imagem sai pela mesma porta, sem
 * credencial nova.
 *
 * O ESTILO É FIXO E O CONCEITO É VARIÁVEL
 * O guia de estilo abaixo não muda: fundo creme, formas chapadas, muito ar.
 * É ele que faz doze capas diferentes parecerem da mesma revista. O que muda
 * é o conceito, que a própria LLM escreve ao redigir a nota, porque ela é
 * quem sabe do que o texto trata.
 */
import fs from 'node:fs/promises';

const MODELO = process.env.CAPA_MODEL || 'google/gemini-3.1-flash-image';

/* Papel creme igual ao --papel da folha: a página vira continuação da
 * ilustração em vez de moldura dela. E "no text" repetido de várias formas
 * porque modelo de imagem adora escrever palavra torta na arte. */
const ESTILO = [
  'Editorial cover illustration for a technology news story, in the style of a',
  'modern print magazine. Flat vector-like shapes with subtle depth, bold',
  'geometric composition, generous negative space, warm cream paper background',
  '(#faf8f4), a restrained palette of deep violet (#5a34d6), teal (#0c7a72) and',
  'near-black, fine paper grain. Confident and calm, never busy.',
  'ABSOLUTELY NO TEXT, no letters, no words, no numbers, no logos, no signage,',
  'no UI, no watermarks. Wide 16:9 landscape composition.',
].join(' ');

export function promptDaCapa(conceito) {
  return `${ESTILO}\n\nConcept to illustrate: ${conceito}`;
}

/** Gera e grava a capa. Devolve o caminho relativo, ou null se não deu.
 *  Nunca lança: nota sem capa é uma nota feia, nota que não publicou é pior. */
export async function gerarCapa({ conceito, destino, chave }) {
  if (!conceito || !chave) return null;
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${chave}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODELO,
        modalities: ['image', 'text'],
        messages: [{ role: 'user', content: promptDaCapa(conceito) }],
      }),
      signal: AbortSignal.timeout(180000),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(`${r.status}: ${JSON.stringify(j).slice(0, 160)}`);

    const uri = j.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!uri) throw new Error('resposta sem imagem');

    const bruto = Buffer.from(uri.split(',')[1], 'base64');

    // O modelo devolve PNG de ~1,5 MB. Sem converter, uma página de notícia
    // carregaria mais imagem do que texto. O sharp é instalado na hora pelo
    // workflow: o repositorio segue sem dependencia declarada.
    const sharp = (await import('sharp')).default;
    await sharp(bruto)
      .resize({ width: 1280, height: 720, fit: 'cover', position: 'centre' })
      .webp({ quality: 82, effort: 6 })
      .toFile(destino);

    const { size } = await fs.stat(destino);
    console.log(`    capa: ${(size / 1024).toFixed(0)} KB  (US$ ${(j.usage?.cost ?? 0).toFixed(3)})`);
    return true;
  } catch (e) {
    console.warn(`    capa falhou: ${String(e.message).slice(0, 110)}`);
    return null;
  }
}
