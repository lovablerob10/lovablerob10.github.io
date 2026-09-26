---
slug: vazamentos-em-apps-no-supabase-expoem-dados-de-usuarios
titulo: "Vazamentos em apps no Supabase expõem dados de usuários"
descricao: "TechCrunch aponta apps no Supabase com dados pessoais abertos por má configuração. Quem constrói com LLM precisa travas e revisão."
data: 2026-09-25
hora: 20:23
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/09/25/some-supabase-customers-are-publicly-exposing-reams-of-peoples-data-to-the-web/"
tipo: noticia
tema: web
capa: assets/media/nota-vazamentos-em-apps-no-supabase-expoem-dados-de-usuarios.webp
capa_alt: "an open filing cabinet on a busy sidewalk, papers fluttering out"
---

O FATO

A TechCrunch AI publicou em 25 de setembro de 2026 que parte dos clientes do Supabase deixou grandes volumes de dados de pessoas acessíveis na web por configuração incorreta. Os exemplos citados envolvem aplicações que expuseram bancos ou armazenamento sem proteção adequada.

O site destaca que apps gerados por IA ou montados no improviso pioram o risco quando políticas de acesso e segurança não são definidas. O alerta mira a combinação de velocidade de entrega com defaults permissivos em produção.

## Pare de expor o banco ao navegador, ponha um BFF e políticas mínimas

Para quem opera com cliente real, isso é um lembrete básico: não trate o navegador como cliente do banco. Interponha um backend for frontend, use chaves de serviço só no servidor, gere tokens de curta duração e aplique políticas por linha e por objeto. Dados pessoais no frontend sem mediação é convite a raspagem.

Custo e arquitetura: adicionar BFF, políticas de linha, e testes de acesso custa milissegundos e alguns dólares, mas evita incidente que para a operação e consome semanas. Coloque checagens automáticas no CI que neguem deploy se uma tabela sensível estiver sem política ou se um bucket ficar público. Rode scanners externos para endpoints e storage a cada release.

Se você usa scaffolds de LLM, trate como código suspeito: checklist mínimo para auth, RLS e storage, revisão humana obrigatória e teste e2e que prova que um usuário não lê dados de outro. Quem atende em WhatsApp ou processa PII precisa inventário de dados e trilha de auditoria. Velocidade sem guarda-corpo vira custo, e rápido.
