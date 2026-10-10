---
slug: agentes-de-ia-chegam-ao-sms-e-mensageiros-do-dia-a-dia
titulo: "Agentes de IA chegam ao SMS e mensageiros do dia a dia"
descricao: "Listão do TechCrunch mapeia a corrida por agentes via texto. Para quem opera, canal muda custo, risco e SLO."
data: 2026-10-10
hora: 13:10
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/10/10/all-the-ai-agents-that-can-live-in-your-text-messages/"
tipo: noticia
tema: web
capa: assets/media/nota-agentes-de-ia-chegam-ao-sms-e-mensageiros-do-dia-a-dia.webp
capa_alt: "a single phone text bubble multiplying into many identical bubbles"
---

## O fato
O TechCrunch publicou em 10 de outubro de 2026 um levantamento dos agentes de IA que funcionam dentro de mensagens de texto. A lista cobre assistentes gerais e serviços focados em família, viagem e trabalho, todos acessíveis por SMS ou apps de mensagem.

A reportagem organiza quem já está entregando agente por texto, com foco na experiência dentro da conversa. O recorte é distribuição: o usuário não instala nada, conversa pelo número ou contato que já usa no dia a dia.

## Distribuir por mensagem muda seu P&L e seu SRE
Para quem roda agente com cliente real, isso é sobre canal. Mensagem cobra por erro de design. SMS e WhatsApp cobram por envio e sessão, então prompt prolixo e volta desnecessária viram linha de custo. Em WhatsApp há janela de 24 horas e templates pagos para reengajar. Sem opt-in e template aprovado, você perde entrega ou perde o número.

Arquitetura precisa tratar mensageria como sistema crítico. Fila, idempotência, deduplicação, controle de taxa e backoff são obrigatórios. Carrier filtra SMS, 10DLC nos EUA exige registro, reputação do número cai com bounce e reclamação. Em WhatsApp existe score de qualidade e banimento automático. Planeje fallback de provedor e monitore DLR de ponta a ponta.

SLO muda. Usuário de mensagem tolera poucos segundos. Orquestre o LLM para resposta curta, com tool use assíncrono e follow-up quando pronto. Contexto não cabe em token infinito por causa de custo e latência, então memória resumida e RAG enxuto. Segurança também muda: link e anexo viram vetor de prompt injection e phishing. Valide entrada, sanitize URL e limite execução de ferramentas.

Se você já atende no WhatsApp, a lista não muda a pilha, só mostra que o canal virou vitrine. Quem ainda está no site ou app deve testar mensagem como aquisição, mas entre com disciplina: medição por conversa, orçamento por sessão e governança de conteúdo para não queimar o número.
