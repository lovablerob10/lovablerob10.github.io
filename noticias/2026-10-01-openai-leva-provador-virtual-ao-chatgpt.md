---
slug: openai-leva-provador-virtual-ao-chatgpt
titulo: "OpenAI leva provador virtual ao ChatGPT"
descricao: "ChatGPT ganha provador virtual e favoritos. Sobe a barra de UX no varejo conversacional, sem clareza de API para devs."
data: 2026-10-01
hora: 21:31
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/10/01/chatgpt-can-now-virtually-try-on-clothes-for-you/"
tipo: noticia
tema: negocios
capa: assets/media/nota-openai-leva-provador-virtual-ao-chatgpt.webp
capa_alt: "a fitting room mirror showing clothes neatly aligning onto a faceless silhouette"
---

OpenAI começou a liberar no ChatGPT um provador virtual para roupas e acessórios. O usuário envia fotos próprias, o sistema aplica as peças na imagem e permite salvar itens em uma biblioteca de Favoritos. A informação é do TechCrunch AI, em 1º de outubro de 2026.

O recurso foca compra assistida dentro do ChatGPT. Não há detalhes públicos sobre alcance, parceiros de varejo ou abertura via API. A função entra na mesma área que já sugere produtos e preços.

## Sem API, isso sobe a barra de UX, não muda sua stack
Para quem opera assistentes de compra, isso mexe na expectativa do usuário. Gente vai pedir provador visual no WhatsApp e no site. Sem API oficial, a pressão cai no seu time: integrar catálogo rico em imagens, montar pipeline de segmentação corporal, ajuste de roupa e composição, além de latência abaixo de 3 a 5 segundos. Isso custa GPU e engenharia.

A arquitetura precisa isolar fotos pessoais, com consentimento explícito, retenção curta e auditoria. Imagens de corpo ampliam risco de moderação. Classifique conteúdo, bloqueie nudidade e descarte metadados sensíveis. Se rodar modelo de try on próprio, avalie execução sob demanda e cache de resultados por SKU e pose para reduzir custo.

Se a OpenAI expuser isso via API, muda o cálculo de prazo. Até lá, é estrada própria ou uso de modelos abertos de try on com tuning no seu domínio. Quem não vende moda pode ignorar. Quem vende, precisa decidir agora entre POC de 4 semanas para mobile plus web ou esperar o ecossistema amadurecer. Enquanto isso, o mínimo viável é favoritos persistentes e visualização rápida com variações de cor e caimento estático.
