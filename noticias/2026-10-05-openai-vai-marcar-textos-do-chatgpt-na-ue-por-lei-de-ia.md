---
slug: openai-vai-marcar-textos-do-chatgpt-na-ue-por-lei-de-ia
titulo: "OpenAI vai marcar textos do ChatGPT na UE por lei de IA"
descricao: "OpenAI passa a inserir marca d’água invisível em textos na UE para cumprir o AI Act. Edição enfraquece a detecção."
data: 2026-10-05
hora: 22:40
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/10/05/openai-will-start-watermarking-chatgpts-text-in-the-eu/"
tipo: noticia
tema: regulacao
capa: assets/media/nota-openai-vai-marcar-textos-do-chatgpt-na-ue-por-lei-de-ia.webp
capa_alt: "a sheet of paper at a border checkpoint bearing a faint invisible stamp revealed only by angled light"
---

A OpenAI informou em 5 de outubro de 2026 que vai inserir marca d’água invisível em textos gerados pelo ChatGPT e pelo Codex dentro da União Europeia. A medida busca atender exigências do AI Act, que pede mecanismos de identificação de conteúdo criado por IA.

Segundo a empresa, a marca é embutida no texto e pode ser detectada por ferramentas próprias. A OpenAI reconhece que edições posteriores reduzem a eficácia da verificação. A mudança vale para usuários na UE, não há indicação de expansão imediata para outras regiões.

## Watermark muda compliance, não produto: prepare o roteamento e os rótulos
Para quem roda IA com cliente na UE, isso é questão de conformidade e trilha de auditoria. O custo técnico é baixo, mas muda o contrato e o fluxo. Você precisa geolocalizar chamadas para a API da OpenAI, rotular saídas como geradas por IA e guardar logs de prompt e resposta. Se seu time edita ou paraphraseia o texto antes de publicar, a detecção pode falhar. Não confie só na marca d’água para cumprir o AI Act, inclua declaração explícita de origem.

Se você reusa saídas como dados de treinamento, seu dataset na UE passa a carregar marcas. Isso pode confundir detectores internos e de terceiros. Separe dados gerados por IA de conteúdo humano, com metadados de origem. Em campanhas, criativos de texto para anúncios podem ser verificados por plataformas na UE. Tenha plano B se o detector oscilar com edições.

Arquitetura prática: roteie tráfego por região, adicione cabeçalho de proveniência no payload, persista versões antes e depois de pós-processamento, e exponha um campo "gerado por IA" no CMS. Prazo curto para ajuste, risco regulatório médio se você depende só da marca. Latência e custo de inferência não devem mudar de forma relevante.
