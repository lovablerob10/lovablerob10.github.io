---
slug: replit-adota-openai-como-padrao-claude-segue-opcional
titulo: "Replit adota OpenAI como padrão, Claude segue opcional"
descricao: "CEO diz que OpenAI vira modelo padrão no Replit. Claude continua disponível, mas deixa de ser o default."
data: 2026-10-17
hora: 19:55
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/10/17/replit-is-no-longer-working-with-anthropic-ceo-says/"
tipo: noticia
tema: negocios
capa: assets/media/nota-replit-adota-openai-como-padrao-claude-segue-opcional.webp
capa_alt: "a large lever switched from one position to another, the previous setting dimmed while the new one glows"
---

Replit trocou o modelo padrão de IA. Amjad Masad, CEO da empresa, afirmou no fim de semana que OpenAI passa a ser o provedor default. A mudança foi comunicada em 17 de outubro de 2026.

Segundo Masad, Claude continua acessível na plataforma. Usuários ainda podem escolher o modelo da Anthropic, mas quem não configurar nada cairá no OpenAI por padrão.

## se você não fixa modelo, seu produto muda sem avisar
Para quem tem assistente ou agente rodando no Replit, o default novo muda resposta, custo e latência de uma hora para outra. Mesmo com Claude disponível, o tráfego que depende do padrão vai desviar para OpenAI. Isso pode alterar tom, taxa de recusa, compatibilidade de funções e uso de tokens.

Prática imediata: fixe o modelo por nome e versão, rode um canário e reavalie prompts. Refaça seus testes de regressão em tarefas críticas, como extração estruturada e chamadas de ferramenta. Monitore métricas de custo por sessão e tempo de resposta. Compare logs de segurança, já que filtros e políticas de cada provedor não são iguais.

Arquitetura e risco: prepare rota explícita por caso de uso, com fallback controlado. Evite depender de default de plataforma para produção. Se você coleta dados sensíveis, revise termos e armazenamento de ambos os provedores. A mudança não obriga migração, mas empurra quem estava no automático. Quem opera de verdade precisa travar o que é determinante e medir o resto.
