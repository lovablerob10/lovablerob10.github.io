---
slug: claude-codex-e-hermes-instalaram-codigo-sem-dono-em-redes-corporativ
titulo: "Claude, Codex e Hermes instalaram código sem dono em redes corporativas"
descricao: "227 comandos de instalação em documentos corporativos apontavam para repositórios abandonados ou sem proprietário verificado"
data: 2026-09-07
hora: 20:17
leitura: 3 min de leitura
fonte: "Ars Technica"
fonte_url: "https://arstechnica.com/security/2026/08/claude-codex-and-hermes-installed-unowned-code-inside-corporate-networks/"
tipo: noticia
tema: infra
capa: assets/media/nota-claude-codex-e-hermes-instalaram-codigo-sem-dono-em-redes-corporativ.webp
capa_alt: "a conveyor belt carrying identical sealed boxes into a building, one box split open and empty mid-transport"
---

# Claude, Codex e Hermes instalaram código sem dono em redes corporativas

Três modelos de linguagem geraram comandos de instalação que apontavam para pacotes sem proprietário verificado ou repositórios abandonados. A Ars Technica identificou 227 casos em documentação corporativa onde desenvolvedores seguiram instruções geradas por IA que instalavam dependências de origem duvidosa. Os comandos apareciam em scripts de setup, guias de deploy e documentação interna.

Os casos incluem pacotes npm sem mantenedor ativo há mais de dois anos, bibliotecas Python com ownership transferido para contas inativas e repositórios Git que não respondem a issues de segurança. Empresas de fintech, healthtech e infraestrutura de nuvem aparecem entre as afetadas. Nenhuma exploração ativa foi confirmada, mas o vetor está aberto.

## Quem valida o que a IA manda instalar

Para quem usa LLM para gerar código de infraestrutura ou scripts de setup, isso é risco de supply chain direto. Modelos não verificam se um pacote ainda tem dono, se o repositório está ativo ou se a versão é a correta. Eles repetem padrões que viram no treinamento, e muitos desses padrões apontam para código que era legítimo em 2022 mas hoje é terra de ninguém.

Na prática, qualquer pipeline que aceita comandos de instalação gerados por IA sem revisão humana ou verificação automatizada de origem está vulnerável. Isso inclui agentes que criam ambientes, assistentes que geram Dockerfiles e sistemas que escrevem CI/CD. A solução não é parar de usar IA para isso, é adicionar uma camada de validação: checar se o pacote existe, se tem atividade recente, se o hash bate. Não é complexo, mas precisa estar no fluxo antes de rodar o comando.

O timing importa porque cada vez mais empresas estão deixando agentes escreverem infraestrutura sozinhos. Se o agente gera e executa sem gate de segurança, você está instalando o que um modelo achou que era uma boa ideia com base em dados de anos atrás. E alguém pode registrar aquele pacote abandonado amanhã.
