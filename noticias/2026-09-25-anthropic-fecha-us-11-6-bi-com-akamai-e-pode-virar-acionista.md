---
slug: anthropic-fecha-us-11-6-bi-com-akamai-e-pode-virar-acionista
titulo: "Anthropic fecha US$ 11,6 bi com Akamai e pode virar acionista"
descricao: "Contrato de 7 anos aposta em CPUs e pode chegar a US$ 20 bi, com opção de até 5% em ações da Akamai."
data: 2026-09-25
hora: 20:51
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/09/25/anthropic-to-pay-akamai-11-6-billion-over-seven-years-in-cloud-deal/"
tipo: noticia
tema: infra
capa: assets/media/nota-anthropic-fecha-us-11-6-bi-com-akamai-e-pode-virar-acionista.webp
capa_alt: "a massive balance scale where a plain CPU chip outweighs a larger GPU chip"
---

Anthropic fechou um acordo de sete anos com a Akamai avaliado em US$ 11,6 bilhões, anunciado em 25 de setembro de 2026. O compromisso pode subir para cerca de US$ 20 bilhões conforme o consumo cresce. O foco do contrato é usar infraestrutura baseada em CPU para rodar cargas de IA.

Num acerto incomum, a Akamai oferecerá à Anthropic uma participação potencial de até 5% em suas ações, que aumenta conforme o gasto da Anthropic. As empresas não detalharam cronograma exato de desembolso nem quais produtos de IA vão rodar nesse ambiente.

## CPU virou opção econômica para servir modelo que cabe
Para quem opera IA com cliente na ponta, o recado é de custo: CPU entra no jogo para inferência de modelos menores ou quantizados, onde a conta por requisição fecha melhor que GPU. Se seu tráfego é previsível, compromissos longos derrubam o preço unitário. Se é sazonal, cuidado com a âncora de 7 anos.

Arquitetura precisa refletir essa elasticidade. Separe o plano de controle do plano de execução, padronize runtime e formato de modelo para portar entre CPU e GPU sem retrabalho. Monte métricas por cenário, não por hardware, e teste latência sob carga real antes de migrar. Treino pesado continua em GPU, mas servir e RAG leve podem ir para CPU se SLA permitir.

O componente acionário diz mais sobre negociação do que sobre tecnologia. Para a maioria, irrelevante. O que importa é a tendência: provedores trocam compromisso por preço. Use isso a seu favor, mas não troque desconto por lock-in sem saída técnica. Multicloud de inferência com fallback evita ficar preso se o custo ou a performance não vierem como prometido.
