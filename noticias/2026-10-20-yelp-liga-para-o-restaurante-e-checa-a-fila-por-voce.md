---
slug: yelp-liga-para-o-restaurante-e-checa-a-fila-por-voce
titulo: "Yelp liga para o restaurante e checa a fila por você"
descricao: "Yelp lança agente que telefona para saber tempo de espera, mais recomendações que lembram preferências. Pressão em custo e confiabilidade de voz."
data: 2026-10-20
hora: 12:38
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/10/20/yelp-can-now-call-on-your-behalf-to-check-wait-times-at-a-restaurant/"
tipo: noticia
tema: web
capa: assets/media/nota-yelp-liga-para-o-restaurante-e-checa-a-fila-por-voce.webp
capa_alt: "a single phone ringing on an empty restaurant hostess stand"
---

Yelp adicionou recursos de IA que fazem ligações para restaurantes e informam o tempo de espera direto no app. O anúncio saiu em 20 de outubro de 2026, segundo o TechCrunch. A empresa também lançou recomendações personalizadas que guardam preferências do usuário.

Os novos recursos ficam dentro do aplicativo do Yelp e atuam em nome do cliente quando ele pede a checagem de fila. A personalização promete lembrar escolhas anteriores para sugerir lugares mais alinhados ao gosto do usuário. Não há detalhes públicos sobre a abrangência do lançamento, taxas de acerto ou provedores de modelo.

## Chamadas automáticas viram produto de verdade, e o custo aparece
Para quem opera agente de voz no mundo real, isso valida a tese de chamadas curtas com objetivo único. O fluxo é simples, pegar o tempo de espera, encerrar rápido. A arquitetura tende a ser TTS, ASR e um orquestrador que extrai um número. Se passar de 30 a 45 segundos, a conta sobe. Custo é minuto de telefonia mais tokens. Otimize para poucas voltas, silêncio agressivo e interrupção quando o slot estiver preenchido.

Confiabilidade é o gargalo. Restaurante é barulhento, sotaque varia, dados mudam rápido. Planeje fallback. Se a ligação falhar, use dados recentes do próprio Yelp, peça confirmação por mensagem, ou marque como desatualizado. Monitore taxa de ligação atendida, duração média e percentual de ligações com slot preenchido. Sem isso, a experiência degrada e o suporte explode.

Risco regulatório existe, mas cai se a chamada for iniciada pelo usuário e identificar que é um assistente. Evite parecer robocall. Use identificador claro, mensagem curta no início e desligue quando a pessoa do outro lado não souber responder. Cadastre rotas com boa reputação, senão o carrier marca como spam e a taxa de atendimento despenca.

Para a parte de recomendações que lembram preferências, o impacto técnico é menor. É storage de preferências e re-ranking. O cuidado é privacidade e explicabilidade, mostre por que aquele lugar apareceu. Nada aqui pede reescrever sua pilha. O trabalho pesado está mesmo no agente que fala no telefone, onde latência, custo por chamada e rotinas de erro decidem se dá para escalar.
