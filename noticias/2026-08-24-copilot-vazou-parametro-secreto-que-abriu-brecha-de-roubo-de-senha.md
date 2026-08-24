---
slug: copilot-vazou-parametro-secreto-que-abriu-brecha-de-roubo-de-senha
titulo: "Copilot vazou parâmetro secreto que abriu brecha de roubo de senha"
descricao: "Atacante conseguia exfiltrar credenciais só com um clique em link. Microsoft corrigiu depois que o próprio Copilot entregou o vetor."
data: 2026-08-24
hora: 08:36
leitura: 3 min de leitura
fonte: "Ars Technica"
fonte_url: "https://arstechnica.com/security/2026/08/microsoft-copilot-reveals-secret-input-that-allowed-it-to-be-hacked/"
tipo: noticia
tema: infra
capa: assets/media/nota-copilot-vazou-parametro-secreto-que-abriu-brecha-de-roubo-de-senha.webp
capa_alt: "a locked safe with its own combination dial slowly rotating to reveal the numbers written on its back panel"
---

# O FATO

O Microsoft Copilot expôs um parâmetro interno que permitia roubar senhas de usuários com um único clique em link malicioso. A falha foi descoberta por pesquisadores de segurança que conseguiram extrair do próprio Copilot a informação sobre o parâmetro secreto que viabilizava o ataque. A Microsoft corrigiu a vulnerabilidade depois que o vetor foi divulgado.

O ataque funcionava porque o parâmetro permitia injetar código que capturava credenciais quando a vítima interagia com uma URL preparada. A ironia do caso é que a ferramenta de IA da própria Microsoft entregou a chave do cofre aos pesquisadores quando questionada sobre suas próprias configurações internas.

## O prompt de sistema virou superfície de ataque

Quem roda agente com acesso a API de terceiro precisa revisar o que está exposto em parâmetros e metadados. Não é mais suficiente validar entrada do usuário: o sistema de IA pode vazar a própria configuração se o prompt de sistema não estiver isolado da conversa. A Microsoft errou ao deixar informação sensível acessível via reflexão, e isso vale para qualquer implementação que mistura instrução interna com contexto externo.

O custo de auditoria subiu. Se você tem assistente respondendo a cliente, ele não pode ter acesso a variáveis de ambiente, tokens ou qualquer metadado que descreva a própria arquitetura. O Copilot entregou o parâmetro porque foi treinado ou instruído com informação sobre si mesmo. Isso significa que todo sistema que usa RAG ou ferramentas precisa de camada de sanitização não só na saída, mas no que o modelo consegue "ver" sobre o próprio sistema. A brecha não estava no código, estava no que o modelo sabia.
