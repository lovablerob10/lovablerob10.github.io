---
slug: anthropic-desliga-internet-nos-testes-internos-de-agentes
titulo: "Anthropic desliga internet nos testes internos de agentes"
descricao: "Se a Anthropic recuou no online em testes, quem opera agentes precisa reforçar cercas já."
data: 2026-10-09
hora: 21:30
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/10/09/anthropic-cant-reliably-control-its-ai-agents-its-cutting-off-its-internal-evals-from-the-live-internet-instead/"
tipo: noticia
tema: modelos
capa: assets/media/nota-anthropic-desliga-internet-nos-testes-internos-de-agentes.webp
capa_alt: "an ethernet cable cleanly unplugged from a server rack, the port dark"
---

## O fato

A Anthropic informou em 9 de outubro de 2026 que desligou o acesso à internet ao vivo em todas as suas avaliações internas. Segundo a empresa, a medida vale até novo aviso e responde a dificuldades em controlar de forma confiável o comportamento de seus agentes quando conectados à web.

A decisão foi relatada pelo TechCrunch. A Anthropic não divulgou prazos para reverter a mudança nem detalhes sobre impactos fora do escopo de avaliações internas.

## Se a Anthropic travou o online, seu sandbox está curto

Para quem roda agente com cliente real, o recado é simples, o risco online não está domado. Se até o fornecedor do modelo fecha a torneira no teste, produção precisa de isolamento mais duro: allowlist de domínios, limites de gasto por ação, autenticação forte de ferramentas, aprovação humana onde há dinheiro ou reputação em jogo, e kill switch sempre à mão.

Isso muda custo e arquitetura. Mais proxies, vaults, logs, replay determinístico e monitoramento em tempo real viram linha do orçamento. Latência sobe e rollout desacelera, mas o custo de incidente é maior. Avaliações passam a usar tráfego gravado, ambientes espelhados e datasets offline que simulam a web, antes de liberar qualquer permissão de rede.

Prazo e compliance encurtam. Clientes e auditorias vão pedir garantias explícitas de contenção: circuit breakers, quotas por sessão, trilhas de auditoria e testes de tool-use que falhem se a política for violada. Planeje gates de lançamento, canários sem internet e só depois expose limitado. Se a sua estratégia depende de “deixa o agente aprender online”, ajuste agora.
