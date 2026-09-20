---
slug: newsom-quer-kill-switch-para-modelos-de-ia-na-california
titulo: "Newsom quer kill switch para modelos de IA na Califórnia"
descricao: "Decreto de Newsom abre caminho para exigir kill switch em modelos e aciona grupo com prazo de 60 dias."
data: 2026-09-18
hora: 07:54
leitura: 3 min de leitura
fonte: "The Verge AI"
fonte_url: "https://www.theverge.com/policy/997516/california-governor-newsom-ai-kill-switch"
tipo: noticia
tema: regulacao
capa: assets/media/nota-newsom-quer-kill-switch-para-modelos-de-ia-na-california.webp
capa_alt: "a large power switch hovering over a complex circuit, about to be flipped"
---

O governador da Califórnia, Gavin Newsom, assinou um decreto que mira o controle de sistemas de IA de ponta. O texto pede estudos para, entre outras medidas, avaliar a exigência de um kill switch em modelos de fronteira. A ordem coloca o estado na dianteira do debate regulatório sobre IA.

O decreto cria um grupo de especialistas com a missão de entregar recomendações em até dois meses. A partir desse relatório, o governo pode propor regras estaduais. O foco é segurança operacional de modelos avançados, com ênfase em capacidade de interromper o funcionamento quando houver risco.

## Se virar regra, todo deploy precisa de botão de desligar
Para quem opera IA com cliente real, o recado é claro. Prepare um plano de desligamento controlado do modelo, com gatilhos, papéis definidos e trilha de auditoria. Isso implica colocar a inferência atrás de um control plane capaz de cortar tráfego, revogar chaves e congelar versões sem derrubar o resto do sistema.

O custo não é proibitivo se você já usa feature flags, roteamento por versão e rate limit centralizado. O ajuste é formalizar critérios de acionamento, registrar eventos e garantir rollback limpo. O risco está no escopo da regra. Se a exigência alcançar fornecedores de modelo e integradores, pode entrar obrigação de telemetria e testes de desligamento periódicos, que afetam SLA e exigem janelas de manutenção.

Por enquanto, nada muda no curto prazo. São recomendações em 60 dias, depois possível proposta. Vale usar o tempo para fechar lacunas: isolamento por tenant, limites por conta, circuito de emergência no orquestrador e um runbook de incidente que inclua desligamento seletivo. Se a sua operação depende de um provedor que não oferece esses controles, o prazo para trocar de arquitetura pode encurtar de repente.
