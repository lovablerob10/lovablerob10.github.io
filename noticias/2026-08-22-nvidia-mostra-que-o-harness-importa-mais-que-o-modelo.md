---
slug: nvidia-mostra-que-o-harness-importa-mais-que-o-modelo
titulo: "Nvidia mostra que o harness importa mais que o modelo"
descricao: "Pesquisa da Nvidia comprova que agentes funcionam bem com fine-tuning do sistema de controle, mesmo quando o modelo base é fraco na tarefa."
data: 2026-08-22
hora: 08:27
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/08/21/nvidia-just-showed-that-the-harness-not-the-ai-model-is-now-the-real-hero/"
tipo: noticia
tema: pesquisa
capa: assets/media/nota-nvidia-mostra-que-o-harness-importa-mais-que-o-modelo.webp
capa_alt: "a sturdy frame holding a wild, chaotic force perfectly in place, the container more solid than what it contains"
---

A Nvidia publicou uma pesquisa mostrando que agentes de IA podem executar tarefas complexas de forma confiável quando o sistema de controle (o harness) é bem ajustado, mesmo que o modelo de linguagem subjacente não seja especialmente capaz naquela tarefa específica. O estudo demonstra que fine-tuning da camada de orquestração, aquela que decide quando chamar ferramentas, como interpretar resultados e quando parar, compensa limitações do modelo base.

O trabalho da Nvidia testou agentes em cenários práticos e mediu tanto a taxa de conclusão quanto a frequência de comportamentos instáveis, aqueles loops infinitos ou chamadas absurdas de API que quem coloca agente em produção conhece bem. Os resultados indicam que investir na arquitetura de controle entrega mais previsibilidade do que simplesmente trocar para um modelo maior ou mais caro.

## A margem de manobra de quem não quer depender do modelo mais caro acabou de aumentar

Para quem constrói agentes que atendem cliente real, essa pesquisa muda a conversa sobre onde gastar token e onde gastar engenharia. Se o harness bem treinado segura um modelo mediano, o custo de inferência cai e a latência também, porque modelos menores respondem mais rápido. Isso abre espaço para rodar mais agentes em paralelo ou atender mais sessões simultâneas com o mesmo budget de API.

O risco é que fine-tuning de harness exige dados rotulados de qualidade, aqueles exemplos de quando o agente deveria ter parado, qual ferramenta deveria ter chamado, como deveria ter interpretado um JSON mal formado. Não é trabalho trivial, mas é trabalho que você faz uma vez e replica. A Nvidia basicamente validou o que alguns times já faziam no escuro: que a inteligência do sistema não mora só no modelo, mora na camada que decide o que fazer com a resposta dele.
