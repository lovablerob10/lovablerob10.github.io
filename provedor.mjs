/* Quem escreve e quem desenha, com o segundo entrando quando o primeiro cai.
 *
 * POR QUE ISTO EXISTE
 * Em 14/09/2026 o saldo do OpenRouter acabou. A máquina tinha fallback para a
 * OpenAI, mas ele escolhia o provedor pela EXISTÊNCIA da chave, não por ela
 * funcionar: a chave do OpenRouter continuava configurada, então o fallback
 * nunca disparou. Doze dias de rodadas tomando 402 e terminando em verde.
 *
 * A lição virou regra aqui: chave configurada não é chave que funciona. A
 * troca de provedor acontece quando a resposta diz que não dá (401 sem
 * autorização, 402 sem saldo, 429 sem cota), não quando a variável está vazia.
 */

/** Respostas que significam "este provedor não vai me atender hoje". Erro de
 *  conteúdo (400) ou instabilidade (500) não são disso: aí o problema é a
 *  requisição ou o momento, e trocar de provedor não resolveria. */
const TROCAR = new Set([401, 402, 403, 429]);

class ProvedorIndisponivel extends Error {
  constructor(nome, status, detalhe) {
    super(`${nome} indisponível (${status}): ${String(detalhe).slice(0, 140)}`);
    this.status = status;
    this.trocar = TROCAR.has(status);
  }
}

/* ------------------------------------------------------------------ */
/* Texto                                                               */
/* ------------------------------------------------------------------ */

function provedoresDeTexto() {
  const lista = [];
  if (process.env.OPENAI_API_KEY) {
    lista.push({
      nome: 'openai',
      url: 'https://api.openai.com/v1/chat/completions',
      chave: process.env.OPENAI_API_KEY,
      modelo: process.env.NEWS_MODEL_OPENAI || 'gpt-5',
    });
  }
  if (process.env.OPENROUTER_API_KEY) {
    lista.push({
      nome: 'openrouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      chave: process.env.OPENROUTER_API_KEY,
      modelo: process.env.NEWS_MODEL || 'anthropic/claude-sonnet-4.5',
    });
  }
  return lista;
}

/** Conversa com o primeiro provedor que atender. Devolve o texto da resposta.
 *  Lança se nenhum atendeu, e a mensagem diz o que cada um respondeu. */
export async function conversar(mensagens, { temperatura = 0.6, maxTokens = 1400 } = {}) {
  const provedores = provedoresDeTexto();
  if (!provedores.length) throw new Error('nenhuma chave de LLM configurada');

  const recusas = [];
  for (const p of provedores) {
    try {
      /* Modelo de raciocinio (familia gpt-5, o3, o4) pede duas concessoes, e
         as duas custaram uma rodada inteira para aparecer.

         1. TEMPERATURE. Ele recusa qualquer valor fora do padrao:
            "Unsupported value: 'temperature' does not support 0.6". Nao e
            falta de saldo nem chave errada, entao trocar de provedor nao
            resolveria: o certo e nao mandar o parametro para quem nao aceita.

         2. ORCAMENTO DE TOKENS. O raciocinio sai do MESMO max_completion_tokens
            da resposta. Com 1400, o modelo gastou os 1400 pensando e devolveu
            content vazio com finish_reason "length" — parecia provedor quebrado
            e era so orcamento curto. Por isso duas coisas aqui: esforco baixo,
            que e o certo para redigir nota a partir de material que ja veio
            pronto, e teto folgado, porque o que sobra nao e cobrado. */
      const raciocina = /^(gpt-5|o[34])/.test(p.modelo);
      const corpo = {
        model: p.modelo,
        messages: mensagens,
        max_completion_tokens: raciocina ? maxTokens + 6000 : maxTokens,
      };
      if (raciocina) {
        corpo.reasoning_effort = process.env.OPENAI_REASONING || 'low';
      } else {
        corpo.temperature = temperatura;
      }

      const r = await fetch(p.url, {
        method: 'POST',
        headers: { authorization: `Bearer ${p.chave}`, 'content-type': 'application/json' },
        body: JSON.stringify(corpo),
        signal: AbortSignal.timeout(180000),
      });

      if (!r.ok) {
        const detalhe = await r.text();
        const erro = new ProvedorIndisponivel(p.nome, r.status, detalhe);
        if (!erro.trocar) throw erro;          // problema da requisição, não do provedor
        recusas.push(erro.message);
        console.warn(`    ${p.nome} recusou (${r.status}), tentando o próximo`);
        continue;
      }

      const j = await r.json();
      const escolha = j.choices?.[0];
      const txt = escolha?.message?.content;
      if (!txt) {
        /* "resposta vazia" sozinho nao diz nada. Na pratica o motivo e sempre
           finish_reason: quase sempre "length" (orcamento acabou antes de
           escrever) e as vezes "content_filter". Dizer qual poupa a proxima
           investigacao. */
        const motivo = escolha?.finish_reason ?? 'sem finish_reason';
        const raciocinio = j.usage?.completion_tokens_details?.reasoning_tokens;
        const extra = raciocinio ? `, ${raciocinio} tokens gastos em raciocinio` : '';
        throw new Error(`${p.nome} devolveu resposta vazia (${motivo}${extra})`);
      }
      return { texto: txt, provedor: p.nome, custo: j.usage?.cost ?? null };
    } catch (e) {
      if (e instanceof ProvedorIndisponivel && !e.trocar) throw e;
      if (!(e instanceof ProvedorIndisponivel)) {
        recusas.push(`${p.nome}: ${e.message}`);
        console.warn(`    ${p.nome} falhou: ${String(e.message).slice(0, 80)}`);
      }
    }
  }
  const err = new Error(`nenhum provedor de texto atendeu. ${recusas.join(' | ')}`);
  err.semProvedor = true;
  throw err;
}

/* ------------------------------------------------------------------ */
/* Imagem                                                              */
/* ------------------------------------------------------------------ */

function provedoresDeImagem() {
  const lista = [];
  if (process.env.OPENAI_API_KEY) {
    lista.push({ nome: 'openai', chave: process.env.OPENAI_API_KEY,
                 modelo: process.env.CAPA_MODEL_OPENAI || 'gpt-image-1' });
  }
  if (process.env.OPENROUTER_API_KEY) {
    lista.push({ nome: 'openrouter', chave: process.env.OPENROUTER_API_KEY,
                 modelo: process.env.CAPA_MODEL || 'google/gemini-3.1-flash-image' });
  }
  return lista;
}

/** A OpenAI tem endpoint próprio de imagem e devolve base64 direto.
 *  O OpenRouter entrega imagem dentro do chat, como data URI. Os dois
 *  caminhos terminam num Buffer, que é o que o chamador espera. */
async function desenharNaOpenAI(p, prompt) {
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { authorization: `Bearer ${p.chave}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: p.modelo,
      prompt,
      n: 1,
      // 1536x1024 é o formato largo do gpt-image; o recorte para 16:9 vem depois
      size: '1536x1024',
      quality: 'medium',
    }),
    signal: AbortSignal.timeout(180000),
  });
  if (!r.ok) throw new ProvedorIndisponivel(p.nome, r.status, await r.text());
  const j = await r.json();
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) throw new Error('openai devolveu resposta sem imagem');
  return Buffer.from(b64, 'base64');
}

async function desenharNoOpenRouter(p, prompt) {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${p.chave}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: p.modelo,
      modalities: ['image', 'text'],
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(180000),
  });
  if (!r.ok) throw new ProvedorIndisponivel(p.nome, r.status, await r.text());
  const j = await r.json();
  const uri = j.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!uri) throw new Error('openrouter devolveu resposta sem imagem');
  return Buffer.from(uri.split(',')[1], 'base64');
}

/** Devolve o PNG bruto do primeiro provedor que atender. */
export async function desenhar(prompt) {
  const provedores = provedoresDeImagem();
  if (!provedores.length) throw new Error('nenhuma chave de imagem configurada');

  const recusas = [];
  for (const p of provedores) {
    try {
      const buf = p.nome === 'openai'
        ? await desenharNaOpenAI(p, prompt)
        : await desenharNoOpenRouter(p, prompt);
      return { buffer: buf, provedor: p.nome };
    } catch (e) {
      if (e instanceof ProvedorIndisponivel && !e.trocar) throw e;
      recusas.push(`${p.nome}: ${e.message}`);
      console.warn(`    imagem: ${p.nome} nao atendeu (${String(e.message).slice(0, 70)})`);
    }
  }
  throw new Error(`nenhum provedor de imagem atendeu. ${recusas.join(' | ')}`);
}
