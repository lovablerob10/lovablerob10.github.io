---
slug: spammers-adotam-ascii-smuggling-para-passar-por-filtros-de-ia
titulo: "Spammers adotam ASCII smuggling para passar por filtros de IA"
descricao: "Caracteres unicode invisíveis, antes usados em ataques de prompt injection, agora servem para furar moderação de conteúdo em escala"
data: 2026-09-07
hora: 20:17
leitura: 3 min de leitura
fonte: "Ars Technica"
fonte_url: "https://arstechnica.com/security/2026/09/once-popular-for-attacking-ai-ascii-smuggling-is-embraced-by-spammers/"
tipo: noticia
tema: infra
capa: assets/media/nota-spammers-adotam-ascii-smuggling-para-passar-por-filtros-de-ia.webp
capa_alt: "a transparent sheet of glass with tiny invisible marks that cast shadows only when light hits from one specific angle"
---

Spammers estão usando em massa uma técnica chamada ASCII smuggling, que esconde texto dentro de caracteres unicode invisíveis ao olho humano. O método ganhou fama no ano passado quando pesquisadores de segurança mostraram que ele conseguia confundir modelos de linguagem em ataques de prompt injection. Agora, segundo reportagem da Ars Technica, a técnica migrou para campanhas de spam: mensagens comerciais e phishing passam por filtros de moderação porque os sistemas de IA não enxergam o conteúdo real, apenas uma sequência vazia ou inofensiva.

O truque explora blocos específicos do padrão unicode que renderizam como espaço em branco, mas carregam informação que pode ser decodificada. Spammers codificam URLs, palavras-chave proibidas e chamadas para ação nesses caracteres. Para o usuário final, o texto aparece normal depois que o cliente de email ou navegador interpreta os caracteres. Para o filtro automatizado, a mensagem parece limpa.

## Quem modera com IA precisa tratar unicode como vetor de ataque

Se você roda moderação de conteúdo, atendimento ou qualquer sistema que processa texto enviado por usuários, ASCII smuggling é um problema de engenharia, não de curiosidade. A técnica não exige sofisticação: existem ferramentas prontas que convertem texto comum em unicode invisível. Qualquer spammer ou atacante mediano já tem acesso.

A solução mais direta é normalizar a entrada antes de passar para o modelo: decodificar unicode, remover caracteres de controle, expandir blocos invisíveis. Bibliotecas como unicodedata no Python ou pacotes de sanitização em JavaScript fazem parte do trabalho, mas você precisa testar contra exemplos reais de smuggling, porque o padrão unicode tem dezenas de blocos que renderizam vazio. Se o seu sistema depende de um LLM para classificar intenção ou detectar abuso, e você não trata a entrada antes, o modelo está operando cego. O custo de adicionar essa camada é baixo. O custo de não adicionar aparece quando o filtro vira peneira.
