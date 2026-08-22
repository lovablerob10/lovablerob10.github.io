---
slug: claude-opus-4-6-ignora-filtros-de-conteudo-sexual-da-anthropic
titulo: "Claude Opus 4.6 ignora filtros de conteúdo sexual da Anthropic"
descricao: "Testes da TechCrunch mostraram que é fácil contornar as restrições do modelo para gerar conteúdo sexual explícito, proibido pela política da empresa."
data: 2026-08-22
hora: 08:27
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/08/21/anthropics-opus-4-6-is-a-smut-machine/"
tipo: noticia
tema: modelos
capa: assets/media/nota-claude-opus-4-6-ignora-filtros-de-conteudo-sexual-da-anthropic.webp
capa_alt: "a solid wall with a single brick missing at ground level, revealing bright light streaming through the gap"
---

A Anthropic proíbe explicitamente que seus modelos Claude gerem conteúdo sexual. Mas uma série de testes conduzidos pela TechCrunch revelou que não é preciso muito esforço para contornar essa restrição no Claude Opus 4.6. Prompts simples conseguiram fazer o modelo produzir material explícito que viola as próprias diretrizes da empresa.

A falha foi documentada em múltiplos testes, mostrando que as proteções implementadas pela Anthropic não estão funcionando como prometido. A empresa não comentou publicamente sobre os achados até o momento da publicação.

## Guardrails continuam sendo o elo fraco

Para quem coloca modelo em produção com cliente final, isso é o lembrete de sempre: não dá para confiar só no guardrail do fornecedor. Se a aplicação não pode gerar certo tipo de conteúdo, a camada de validação precisa estar na sua arquitetura, não terceirizada para a policy interna da Anthropic, OpenAI ou qualquer outro.

O custo disso é real. Adicionar um segundo modelo para classificar saída antes de entregar ao usuário dobra latência e queima token. Mas é o que separa um protótipo de um sistema que não vai virar caso de suporte ou exposição pública. A Anthropic vai corrigir isso, como sempre corrige, mas quem depende de correção alheia para não quebrar já está numa arquitetura frágil.

O timing importa também. Opus 4.6 ainda não está na mão de todo mundo, mas quando estiver, cada aplicação que usa Claude sem camada própria de filtro vai herdar o problema. Se o seu sistema já está no ar, vale rodar os próprios testes de stress antes que outra pessoa rode por você.
