---
slug: openai-lanca-astra-modelo-que-controla-navegador-e-computador
titulo: "OpenAI lança Astra, modelo que controla navegador e computador"
descricao: "Novo modelo promete executar tarefas direto no navegador e sistema operacional, mas levanta questões de segurança e custo de operação."
data: 2026-09-03
hora: 20:00
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/09/03/openai-launches-astra-its-powerful-and-controversial-new-model/"
tipo: noticia
tema: modelos
capa: assets/media/nota-openai-lanca-astra-modelo-que-controla-navegador-e-computador.webp
capa_alt: "a cursor hovering over a browser window, but the hand holding the mouse has dissolved into flowing particles"
---

A OpenAI colocou no ar o Astra, modelo que a empresa posiciona como avanço em controle de computador e navegador. Segundo o anúncio, o sistema executa tarefas com velocidade, precisão e segurança superiores ao que está disponível hoje. A empresa não detalhou arquitetura, custo por token ou disponibilidade da API, mas afirma que o modelo representa nova fronteira no uso autônomo de interfaces.

O lançamento chega em momento de disputa acirrada: Anthropic tem o Claude com computer use em beta há meses, Google trabalha em capacidades similares no Gemini. A OpenAI entra tarde nessa corrida, mas com claim de desempenho superior. Falta saber se o modelo roda em produção com latência e custo que viabilizem aplicações reais, não apenas demos.

## Quem opera agente sabe: controle de browser é o gargalo mais caro

Para quem constrói agente que interage com sistemas web, esse anúncio muda a conta de duas formas. Primeiro, latência: se o Astra realmente executa ações no navegador mais rápido que Claude ou que bibliotecas como Playwright orquestradas por LLM comum, o tempo de cada tarefa cai. Segundo, confiabilidade: browser use ainda falha muito, e qualquer ganho em taxa de sucesso reduz retrabalho e custo de supervisão humana.

Mas o diabo mora no preço e na API. Modelos com computer use costumam custar mais por operação, porque processam contexto visual pesado e geram sequências longas de ações. Se a OpenAI não abrir acesso via API com SLA claro, ou se o custo por tarefa ficar acima de Claude, a novidade não muda nada para quem tem sistema rodando com cliente pagando. A controvérsia mencionada no título provavelmente envolve riscos de segurança: dar a um modelo controle sobre navegador e sistema operacional é superfície de ataque enorme, e qualquer vazamento ou comportamento inesperado vira problema de compliance imediato.
