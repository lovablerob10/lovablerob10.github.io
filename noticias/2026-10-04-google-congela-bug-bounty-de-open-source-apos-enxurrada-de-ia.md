---
slug: google-congela-bug-bounty-de-open-source-apos-enxurrada-de-ia
titulo: "Google congela bug bounty de open source após enxurrada de IA"
descricao: "Volume de submissões geradas por IA travou o programa e expõe custo de triagem para mantenedores e empresas."
data: 2026-10-04
hora: 20:50
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/10/04/google-froze-its-open-source-bug-bounty-program-due-to-a-significant-rise-in-ai-submissions/"
tipo: noticia
tema: negocios
capa: assets/media/nota-google-congela-bug-bounty-de-open-source-apos-enxurrada-de-ia.webp
capa_alt: "a mailbox overflowing with identical envelopes piling onto the floor"
---

O Google congelou seu programa de recompensa por vulnerabilidades em projetos open source após um aumento significativo de submissões geradas por IA. A decisão foi reportada neste domingo, 4 de outubro de 2026, pelo TechCrunch AI, que cita a própria empresa sobre o volume e o impacto na triagem.

Segundo a reportagem, a pausa mira conter o fluxo de relatórios de baixa qualidade produzidos por ferramentas automatizadas. O Google não detalhou quando retoma as operações nem quais mudanças de política virão no reabertura.

## Triagem vai ficar mais cara e com barreira de entrada
Para quem roda agente caçador de bug, o recado é claro. Os programas vão erguer filtros e apertar critérios de aceitação. Espere mais exigência de prova de exploração reproduzível, steps automatizados, logs, minimização de caso de teste e deduplicação. Submissão ruidosa vai bater no muro, e conta de CPU mais humana vai cair do seu lado.

Para times que dependem de bug bounty para reforçar segurança, a pausa aumenta janela de exposição e incerteza de prazo. Vale reforçar scanner interno, fuzzing e SAST antes do bounty, reduzir backlog com priorização baseada em risco e dar canal direto para projetos críticos que você usa em produção.

Se você opera IA para submeter vulnerabilidades, ajuste arquitetura agora. Coloque checagem de veracidade, autoavaliação de impacto, verificador simbólico ou harness de execução, e um filtro de similaridade contra CVEs existentes. Envolva humano antes de apertar enviar. Sem isso, o ROI cai a zero quando o programa ativa bloqueios e quotas.
