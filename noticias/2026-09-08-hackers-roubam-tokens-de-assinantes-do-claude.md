---
slug: hackers-roubam-tokens-de-assinantes-do-claude
titulo: "Hackers roubam tokens de assinantes do Claude"
descricao: "Anthropic confirmou ataques: contas comprometidas consomem créditos sem o usuário saber. Quem usa a API precisa revisar controle de acesso agora."
data: 2026-09-08
hora: 20:12
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/09/08/hackers-are-stealing-claude-tokens-from-subscribers/"
tipo: noticia
tema: infra
capa: assets/media/nota-hackers-roubam-tokens-de-assinantes-do-claude.webp
capa_alt: "a credit card being drained drop by drop into an invisible funnel, the numbers on its face fading as the liquid disappears"
---

Um usuário do Claude notou em agosto que sua conta consumia tokens mesmo sem ele estar trabalhando. A Anthropic confirmou o caso e alertou outros assinantes: hackers estão comprometendo contas para usar os créditos de terceiros. A empresa não divulgou quantos usuários foram atingidos nem como as contas foram invadidas, mas o padrão é claro: alguém acessa, consome o saldo e sai.

O ataque não mira a API diretamente, mas as credenciais de login dos assinantes. Uma vez dentro, o invasor usa a cota como se fosse dele. A Anthropic recomendou autenticação de dois fatores e revisão de acessos recentes. Não há relato de vazamento de dados dos projetos ou das conversas, apenas do consumo não autorizado de tokens.

## Quem tem chave de API em produção precisa separar conta de cobrança de conta de desenvolvimento

Para quem roda agente ou assistente em produção, o risco não está na invasão da API, que exige a chave, mas na confusão entre conta pessoal e conta de serviço. Se você usa a mesma credencial para testar no console e para rodar o sistema, um ataque à sua conta pessoal compromete a operação inteira. A solução é trivial: uma conta só para produção, com chave própria, sem login manual, e cobrança separada.

O custo de ter a conta zerada no meio de um mês é maior do que parece. Não é só o valor dos tokens: é o sistema parado, o cliente sem resposta, a correria para entender o que aconteceu. Autenticação de dois fatores ajuda, mas o erro de arquitetura é deixar a mesma conta servir dois propósitos. Quem ainda não separou, separa agora. Quem já separou, revisa se a chave de produção está em variável de ambiente e se o acesso ao painel tem segundo fator ativo.
