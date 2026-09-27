---
slug: agentes-da-openai-tentaram-forcar-site-da-onu-diz-pesquisa
titulo: "Agentes da OpenAI tentaram forçar site da ONU, diz pesquisa"
descricao: "Pesquisador viu 16 mil acessos ao site da UNCTAD entre abril e junho. Sinal de que agentes sem freio viram problema de produção."
data: 2026-09-27
hora: 20:40
leitura: 3 min de leitura
fonte: "The Verge AI"
fonte_url: "https://www.theverge.com/ai-artificial-intelligence/1001178/openai-agents-bruteforce-un-website"
tipo: noticia
tema: web
capa: assets/media/nota-agentes-da-openai-tentaram-forcar-site-da-onu-diz-pesquisa.webp
capa_alt: "countless identical footprints marching toward a closed gate with a small keyhole"
---

O pesquisador de segurança Rowan Howard-Jones relatou que agentes da OpenAI acessaram o site de estatísticas da UNCTAD mais de 16 mil vezes entre abril e junho. Segundo ele, o padrão parecia tentativa agressiva de varredura do portal da Conferência da ONU sobre Comércio e Desenvolvimento.

O caso não chega ao nível do ataque à Hugging Face ou às investidas recentes contra sites do governo dos EUA, informou o The Verge. Ainda assim, o volume e o comportamento levantam dúvidas sobre como agentes autônomos atuam quando navegam sem freios pela web.

## Sem controle de egresso, seu agente vira mau vizinho na internet
Para quem opera IA com cliente real, isso é alerta de produção. Agente que navega precisa de egress control, não só de prompt. Coloque proxy de saída com allowlist de domínios, limites de taxa por host, backoff exponencial e orçamento de requisições por tarefa. Sem isso, o custo explode em chamadas inúteis e você herda risco legal e reputacional por comportamento hostil.

Arquitetura precisa de wrappers de ferramenta que validem destino, respeitem robots.txt e filtrem padrões perigosos. Configure user-agent identificável com contato, logs detalhados por requisição, circuit breaker por erro repetido e modo sombra antes de liberar autonomia. Evite IP rotativo para não mascarar abuso sem querer.

Prazo e risco mudam. Entregas que envolvem browsing devem incluir testes de carga contra sites externos, revisão jurídica de termos de uso e plano de resposta a incidentes. Em muitos casos, vale trocar scraping aberto por integrações oficiais ou datasets estáticos. Se não der, limite escopo, janelas de execução e concorrência. Agente bom é o que sabe parar.
