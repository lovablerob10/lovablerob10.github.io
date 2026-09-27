---
slug: matthew-prince-fala-a-the-verge-sobre-ia-e-a-web
titulo: "Matthew Prince fala à The Verge sobre IA e a web"
descricao: "CEO da Cloudflare debate IA, scraping e publicidade online, tema direto para quem serve conteúdo e precisa lidar com bots."
data: 2026-09-25
hora: 12:37
leitura: 3 min de leitura
fonte: "The Verge AI"
fonte_url: "https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising"
tipo: noticia
tema: web
capa: assets/media/nota-matthew-prince-fala-a-the-verge-sobre-ia-e-a-web.webp
capa_alt: "a sturdy gate blocking a tangled web of cables while countless small metallic insects press against it"
---

The Verge publicou uma entrevista em podcast com Matthew Prince, CEO da Cloudflare. O episódio integra uma série sobre o futuro dos negócios e trata do impacto da IA na web, do crescimento do scraping por modelos e da pressão sobre o modelo de publicidade.

Prince discute o papel de empresas de infraestrutura como a Cloudflare no controle de bots, as tensões com grandes plataformas e buscadores, e caminhos técnicos e comerciais para lidar com acesso automatizado a conteúdo.

## Cobrar e filtrar IA é engenharia de borda, contrato e métrica
Para quem opera site com tráfego real, o recado é prático. O custo de servir conteúdo para crawlers de IA tende a subir e precisa virar linha de receita ou ser bloqueado. Isso pede três movimentos: medição confiável de bots, filtragem ativa na borda e canais formais de acesso autenticado para quem paga. Sem isso, a fatura de CDN e origin cresce, e a equipe briga com falso positivo afetando SEO.

Na arquitetura, vale colocar políticas na borda: rules flexíveis por caminho, fingerprinting de comportamento, desafios invisíveis para diferenciar humano de script e rate limit por ASN e reputação. Separar tráfego humano e automatizado em rotas distintas ajuda a observar custo e latência. Se a Cloudflare for seu CDN, dá para orquestrar isso com Workers, Bot Management, Turnstile e logs em tempo quase real.

Risco operacional: scrapers rotacionam IP, usam residenciais e imitam navegadores. A defesa vira iteração contínua, não regra estática. Priorize sinal próprio, como token de acesso, mTLS, allowlist de crawlers declarados e contratos de uso de dados. Prazos são curtos se você já está em CDN, dias para bloquear e medir melhor, semanas para abrir um endpoint pago com chaves e limite. Sem acordo comercial, só o bloqueio reduz custo. Com acordo, vira produto com margem e SLO.
