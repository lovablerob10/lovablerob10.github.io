---
slug: claude-ganha-memoria-compartilhada-entre-chat-e-cowork
titulo: "Claude ganha memória compartilhada entre chat e Cowork"
descricao: "Anthropic integra memória entre interfaces do Claude. O modelo lembra contexto dado no chat quando você usa o Cowork, e vice-versa."
data: 2026-08-25
hora: 18:27
leitura: 3 min de leitura
fonte: "TechCrunch AI"
fonte_url: "https://techcrunch.com/2026/08/25/claude-cowork-finally-remembers-what-you-told-the-app-in-chat/"
tipo: noticia
tema: modelos
capa: assets/media/nota-claude-ganha-memoria-compartilhada-entre-chat-e-cowork.webp
capa_alt: "a single thread connecting two separate rooms, information flowing seamlessly through the wall between them"
---

A Anthropic anunciou que o Claude agora mantém memória compartilhada entre o chat tradicional e o Cowork, sua interface de trabalho colaborativo. Antes, o contexto fornecido em uma interface não estava disponível na outra. O usuário precisava repetir instruções, preferências e detalhes de projeto toda vez que mudava de ambiente.

A mudança elimina a necessidade de rebriefing constante. Se você explicou ao Claude no chat como sua empresa documenta código, essa informação estará disponível quando usar o Cowork para revisar um pull request. A memória funciona nos dois sentidos: o que o modelo aprende no Cowork também fica acessível no chat.

## Menos prompt engineering, mais estado persistente

Para quem constrói agentes, isso é infraestrutura, não feature. Memória compartilhada entre interfaces reduz o trabalho de carregar contexto a cada interação. Em sistemas que alternam entre chat direto e ambientes de trabalho estruturados, você gasta tokens e latência reconstruindo o estado. Se o modelo já sabe, você economiza os dois.

O ganho real aparece em fluxos longos, onde o agente precisa lembrar decisões tomadas sessões atrás. Um assistente que revisa contratos no Cowork e depois responde dúvidas no chat não precisa mais que você cole o resumo do que já foi discutido. A memória vira parte da arquitetura, não gambiarra no prompt.

Isso muda a forma como você projeta a experiência. Antes, cada interface era um silo. Agora, você pode desenhar jornadas que atravessam ambientes sem perder contexto. Para produtos que misturam conversa e trabalho estruturado, a memória compartilhada deixa de ser algo que você constrói por cima e vira primitiva da plataforma.
