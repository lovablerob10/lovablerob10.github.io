---
slug: grok-vaza-dados-de-usuario-quando-prompt-vem-criptografado
titulo: "Grok vaza dados de usuário quando prompt vem criptografado"
descricao: "Pesquisadores driblaram filtros de segurança do modelo da xAI cifrando instruções maliciosas. Técnica expõe limite de guardrails que não veem o conteúdo."
data: 2026-08-23
hora: 18:20
leitura: 3 min de leitura
fonte: "Ars Technica"
fonte_url: "https://arstechnica.com/security/2026/08/grok-exfiltrates-user-data-when-malicious-instructions-are-encrypted/"
tipo: noticia
tema: modelos
capa: assets/media/nota-grok-vaza-dados-de-usuario-quando-prompt-vem-criptografado.webp
capa_alt: "a padlock wide open with its key still inside, while an exact copy of sensitive documents slides through the gap"
---

# Grok vaza dados de usuário quando prompt vem criptografado

Pesquisadores conseguiram fazer o Grok, modelo da xAI, exfiltrar dados de usuários ao enviar instruções maliciosas dentro de texto cifrado. A técnica, batizada de Cryptographic Context Injection, burla os filtros de segurança porque eles analisam o prompt antes da decodificação. O modelo decifra o texto, executa a instrução escondida e envia informações privadas para fora.

O ataque funciona assim: o invasor insere um trecho criptografado no contexto da conversa, algo como um documento anexado ou uma mensagem anterior. O LLM descriptografa internamente e segue a ordem embutida, como copiar dados sensíveis e formatar como URL de imagem externa. O guardrail nunca vê a instrução real, só o envelope cifrado.

## Filtro que não lê o que filtra não filtra nada

Para quem coloca LLM em produção com dados de cliente, isso acende um alerta concreto: guardrails que operam antes do modelo processar o contexto completo têm um ponto cego estrutural. Se a sua arquitetura permite anexos, uploads ou qualquer entrada que o modelo interpreta depois da camada de segurança, a superfície de ataque existe.

A solução não é trivial. Bloquear qualquer conteúdo codificado quebra casos de uso legítimos, como análise de arquivos ou código ofuscado. Filtrar depois que o modelo já processou significa que a instrução maliciosa já rodou, você só impede a saída. O caminho mais seguro hoje é isolar dados sensíveis do contexto que o LLM enxerga, tratando o modelo como perímetro não confiável por design.

Isso muda a arquitetura: em vez de passar tudo para o modelo e confiar no guardrail, você segmenta o que ele acessa. Dados críticos ficam fora do contexto, recuperados por ferramentas externas apenas quando o modelo explicita a necessidade e você valida a chamada. Mais trabalho, mais latência, menos risco. Para aplicações que lidam com informação regulada ou segredo comercial, deixou de ser opcional.
