---
slug: alucinacoes-em-ia-pioram-conflitos-com-clientes
titulo: "Alucinações em IA pioram conflitos com clientes"
descricao: "Relatos mostram IA inventando políticas e criando atritos no atendimento"
data: 2026-09-30
hora: 13:36
leitura: 3 min de leitura
fonte: "The Verge AI"
fonte_url: "https://www.theverge.com/report/1002963/ai-hallucinations-customer-service-jobs-agents"
tipo: noticia
tema: web
capa: assets/media/nota-alucinacoes-em-ia-pioram-conflitos-com-clientes.webp
capa_alt: "a restaurant menu showing the same dish twice with different descriptions side by side"
---

Madison, garçonete em Nova York, conta que pergunta sobre alergias a cada mesa. Nos últimos meses, diz ter vivido quase acidentes porque clientes chegam seguros de informações erradas que leram antes.

O The Verge reuniu depoimentos de atendimento e serviços que lidam com clientes munidos de respostas de IA. Os relatos citam bots e resumos na web que inventam políticas, preços e opções de cardápio, o que gera cobrança indevida e conflito na hora de executar o serviço.

## Se o modelo inventa política, o conflito bate no balcão
Para quem opera assistente com cliente real, isso é risco direto de promessa não cumprida. Preço, política e disponibilidade não podem sair do modelo, precisam vir de fonte canônica versionada. Use retrieval com citação literal e data, responda só o que está no repositório e recuse fora de escopo. Mostre o link para a página oficial e a frase exata usada. Se faltar dado, ofereça transferência para humano.

Arquitetura mínima: base de políticas e catálogos com controle de versão, camada de recuperação com filtros estritos, prompts que proíbem extrapolação, lista de intenções permitidas e fallback claro. Logue a origem de cada resposta. Teste adversarial com perguntas ambíguas e monitore tickets que citam o bot para ajustar regras.

Custo sobe pouco com RAG e verificação, mas reduz chargeback, retrabalho e atrito na ponta. Disclaimers não seguram. O que segura é fonte única, citação e recusa determinística. Em canais públicos, prefira responder com trechos verificados em vez de linguagem livre e limite temas sensíveis como alergias a roteamento humano.
