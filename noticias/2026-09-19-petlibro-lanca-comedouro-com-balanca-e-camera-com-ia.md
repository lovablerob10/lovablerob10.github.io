---
slug: petlibro-lanca-comedouro-com-balanca-e-camera-com-ia
titulo: "Petlibro lança comedouro com balança e câmera com IA"
descricao: "Granary 2 mede quanto e quando o gato come. Câmera com IA fica nos modelos caros e os recursos de saúde pedem assinatura."
data: 2026-09-19
hora: 07:48
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/09/19/petlibros-new-ai-powered-feeder-is-a-game-changer-for-multi-cat-homes/"
tipo: noticia
tema: negocios
capa: assets/media/nota-petlibro-lanca-comedouro-com-balanca-e-camera-com-ia.webp
capa_alt: "a single kibble resting on a small kitchen scale, a thin price tag tied to the scale"
---

Petlibro apresentou em 19 de setembro de 2026 a linha Granary 2, comedouros inteligentes com balança integrada. Os modelos mais caros adicionam câmera com IA para registrar quanto e quando o gato se alimenta.

As funções avançadas de monitoramento de saúde ficam atrás de uma assinatura. A empresa promete relatórios mais detalhados para quem paga, mas não divulgou no anúncio dados técnicos completos nem preços no resumo original.

## Assinatura em hardware só se sustenta com IA que não vacila na cozinha
Para quem opera IA em produção, o recado é claro: recurso de câmera com IA tem de rodar no edge para segurar custo de nuvem. Isso reduz tráfego de vídeo e inferência no servidor, mas aumenta complexidade de firmware, OTA, watchdog e telemetria. A arquitetura tende a ser evento primeiro, com sincronização periódica e upload de amostras para re-treino.

O ambiente é hostil para visão: luz variável, tigela suja, pelos, múltiplos gatos fora de quadro. Planeje fallback: se a câmera falhar ou a confiança cair, a balança mantém o básico e os alertas degradam com clareza. Coloque limites de alerta para evitar notificações falsas, e registre causas de erro no dispositivo para depurar depois.

O modelo de receita por assinatura pressiona o produto a entregar valor mensurável mês a mês. Isso pede métricas operacionais no app, relatório que o tutor entende e suporte que fecha o ciclo. Erro recorrente vira cancelamento e devolução de hardware. Se você vende IA embarcada, trate MLOps de campo como parte do custo fixo, não como extra do roadmap.
