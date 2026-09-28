---
slug: google-aposenta-os-gems-do-gemini-e-aposta-em-skills
titulo: "Google aposenta os Gems do Gemini e aposta em skills"
descricao: "Google troca os Gems por skills no Gemini. Sinal de mudança no modelo de agentes e alerta para quem depende da UI do provedor."
data: 2026-09-28
hora: 15:35
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/09/28/google-is-killing-off-geminis-gems-in-favor-of-skills/"
tipo: noticia
tema: modelos
---

Google vai encerrar os Gems do Gemini e substituir por skills. A mudança foi reportada pelo TechCrunch AI em 28 de setembro de 2026. Gems eram agentes focados em tarefas dentro do Gemini.

O movimento acontece enquanto agentes all-in-one de outras empresas ganham tração, como o Muse da Meta e o Instinct. O Google passa a priorizar um modelo de capacidades internas, batizadas de skills.

## Definição de agente precisa morar no seu repositório, não na conta do Google
Se você colocou lógica de agente em Gems, trate como migração obrigatória. Mova definições de persona, prompts e ferramentas para código versionado. Crie uma camada de orquestração que injeta essas definições no provedor em tempo de execução. Assim, trocar Gems por skills vira ajuste de adaptador, não reescrita do produto.

Para quem opera com cliente real, o risco aqui é de prazo e de instabilidade. Mudanças de superfície de produto tendem a quebrar automações, testes e governança de acesso. Planeje um período de dupla configuração, rode evals comparando respostas entre a configuração antiga e a nova e mantenha fallback multi-fornecedor para rotas críticas. Custo computacional não deve mudar de forma material, o custo operacional da migração sim.

Sem datas e detalhes públicos, trate como anúncio de descontinuação: monitore a documentação de API do Gemini, normalize dependências por meio de um provider layer e evite usar a UI do provedor como fonte única da verdade. Quem mantiver a definição do agente em casa vai absorver essa troca com menos atrito.
