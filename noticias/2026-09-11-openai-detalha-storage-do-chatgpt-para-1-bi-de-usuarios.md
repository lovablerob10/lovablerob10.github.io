---
slug: openai-detalha-storage-do-chatgpt-para-1-bi-de-usuarios
titulo: "OpenAI detalha storage do ChatGPT para 1 bi de usuários"
descricao: "OpenAI conta como levou um storage próprio a 22 milhões de req/s. Lições úteis para quem guarda estado em IA."
data: 2026-09-11
hora: 08:09
leitura: 3 min de leitura
fonte: "OpenAI"
fonte_url: "https://openai.com/index/scaling-storage-one-billion-users-part-one"
tipo: noticia
tema: infra
capa: assets/media/nota-openai-detalha-storage-do-chatgpt-para-1-bi-de-usuarios.webp
capa_alt: "a towering filing cabinet with drawers slightly open, papers streaming in from all directions like rivers"
---

## O fato
OpenAI publicou como transformou o Habitat, que nasceu como biblioteca Python, em uma plataforma global de armazenamento para o ChatGPT. O sistema hoje atende mais de 1 bilhão de usuários e sustenta 22 milhões de requisições por segundo.

O texto descreve a evolução do stack para lidar com escala planetária e baixa latência. É a primeira parte de uma série sobre como sustentam o armazenamento de dados do produto.

## Armazenar estado é o gargalo invisível do seu agente
Para quem opera assistente em produção, o recado é claro. O custo e o risco moram no estado. Sessão, memória de longo prazo, preferências, limites de uso. Se isso cai, o modelo pode estar perfeito e mesmo assim o produto quebra. A prática é separar camadas: hot path barato e replicado para estado volátil, cold path para histórico e auditoria. Evite escrita síncrona na rota crítica. Idempotência em toda chamada. Backpressure e timeouts antes do modelo.

Escala não precisa de reescrita heroica no dia um. Use serviços gerenciados até a dor aparecer. Mas desenhe como se fosse migrar: chaves bem definidas, TTL por tipo de dado, quotas por inquilino, versionamento de esquema, trilhas de auditoria. Planeje limites por request e por usuário, e trate picos de tráfego com filas e replays seguros.

Custo e risco crescem com distância. Replicação entre regiões e egress somam na fatura e na latência. Minimize round-trips entre modelo e storage. Agregue leituras, comprima payloads, evite fan-out. Tenha políticas de retenção claras, remoção sob solicitação e criptografia em repouso e em trânsito. Consistência parcial é aceitável em preferências, não em cobrança. Essa linha entre eventual e forte é uma decisão de produto, não só de banco.
