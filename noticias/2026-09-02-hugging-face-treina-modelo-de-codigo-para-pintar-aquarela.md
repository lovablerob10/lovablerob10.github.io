---
slug: hugging-face-treina-modelo-de-codigo-para-pintar-aquarela
titulo: "Hugging Face treina modelo de código para pintar aquarela"
descricao: "Tutorial mostra RL com TRL e OpenEnv para ensinar LLM a escrever código que pinta, modelo aprende com recompensa automática no próprio ambiente."
data: 2026-09-02
hora: 08:11
leitura: 3 min de leitura
fonte: "Hugging Face"
fonte_url: "https://huggingface.co/blog/train-to-paint-with-code"
tipo: noticia
tema: pesquisa
capa: assets/media/nota-hugging-face-treina-modelo-de-codigo-para-pintar-aquarela.webp
capa_alt: "a single paintbrush painting a delicate circuit board pattern as watercolor on blank paper"
---

Hugging Face publicou um passo a passo que treina um modelo de código para gerar pinturas em estilo aquarela usando reforço. O experimento combina TRL, a biblioteca de RL em transformadores, com OpenEnv, um ambiente onde o código roda e a imagem resultante é avaliada automaticamente.

O guia mostra o ciclo completo: o modelo escreve código, o ambiente executa e mede a qualidade da imagem, e o treinamento ajusta o modelo pela recompensa. É um exemplo didático, com código aberto, que usa só feedback do próprio ambiente, sem anotação humana.

## Reforço barato quando dá para medir certo
Para quem opera IA em produção, a tese aqui é simples: se a sua tarefa tem verificador automático, dá para treinar com RL sem pagar por rótulo humano. Isso vale para agentes de código que interagem com ambientes determinísticos, como SQL, planilhas, ETL, automação de navegador, geração de gráficos ou layout.

Arquitetura muda um pouco. Precisa de sandbox de execução, limite de tempo e memória, métrica de recompensa clara e estável, e logging fino do loop ação, observação, recompensa. O custo desloca do humano para GPU e engenharia do ambiente. Em geral sai mais barato que RLHF, e o ciclo de iteração fica rápido.

Risco real: o modelo otimiza a métrica, não o objetivo de negócio. Se a recompensa não cobre os casos de borda, ele aprende atalhos e quebra fora do ambiente. Mitigue com testes fora da distribuição, múltiplas métricas, penalidade por passos e currículos que aumentam a dificuldade. Se você já tem um executor confiável da sua tarefa, dá para prototipar em dias. Se não tem, o gargalo é construir o ambiente antes de treinar o modelo.
