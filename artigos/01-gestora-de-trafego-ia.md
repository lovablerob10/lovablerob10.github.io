---
slug: gestora-de-trafego-por-ia-mercado-imobiliario
titulo: "Como construí uma gestora de tráfego que roda campanhas sozinha"
descricao: "Uma IA que cria, publica e otimiza campanhas de Meta Ads para o mercado imobiliário — sem gestor humano no meio. A arquitetura, os limites que precisei impor e o que aprendi deixando uma IA gastar dinheiro de verdade."
data: 2026-08-20
leitura: 9 min de leitura
---

Existe uma diferença enorme entre uma IA que **sugere** uma campanha e uma que **roda** a campanha. A primeira é um assistente de texto com nome bonito. A segunda gasta dinheiro de verdade, todo dia, sem pedir licença.

Eu construí a segunda. Chama-se Bella, opera dentro do Corretor 2.0, e é — até onde consegui verificar — a única gestora de tráfego autônoma para o mercado imobiliário brasileiro. Este artigo é sobre como ela funciona por dentro, e principalmente sobre os freios que precisei inventar depois de descobrir o que acontece quando você não os coloca.

## O problema que ninguém resolve para o corretor

Um corretor de imóveis médio no Brasil vive um dilema que não tem boa saída.

Se ele contrata uma agência, paga entre R$ 1.500 e R$ 3.000 por mês para alguém que gerencia outras trinta contas e olha a dele por vinte minutos na terça-feira. Se ele mesmo cuida do tráfego, vira gestor amador: sobe uma campanha, esquece, descobre trinta dias depois que queimou R$ 800 num público errado.

E existe um terceiro caminho, o mais comum: ele simplesmente não anuncia. Espera indicação, posta no Instagram, e reclama que o mercado está difícil.

O que todos os três têm em comum é o gargalo: **tráfego pago exige atenção diária, e ninguém tem atenção diária sobrando.**

## Por que "IA que sugere" não resolve

A primeira versão que construí fazia o que quase todo produto de IA para marketing faz hoje: gerava o texto do anúncio, sugeria o público, recomendava o orçamento. Bonito de demonstrar.

Inútil na prática.

Porque a sugestão morre no momento em que precisa virar ação. O corretor recebia um texto excelente, olhava para o Gerenciador de Anúncios da Meta — aquela interface com dezoito abas — e fechava. A IA tinha feito a parte fácil e devolvido a parte difícil.

> Uma IA que devolve o trabalho difícil para o humano não automatizou nada. Ela só terceirizou a parte agradável de volta para si mesma.

A decisão que mudou o produto foi aceitar que a IA precisava ter **as chaves**. Acesso à API da Meta, permissão de publicar, permissão de pausar, permissão de gastar. Sem isso, é brinquedo.

## A arquitetura

O sistema tem quatro peças, e a ordem entre elas importa mais que cada uma isolada.

### 1. O briefing que não parece um formulário

A Bella não abre um formulário de trinta campos. Ela conversa no WhatsApp e extrai o que precisa: qual imóvel, qual faixa de preço, qual bairro, quem é o comprador provável.

Isso parece um detalhe de interface, mas é estrutural. Corretor não preenche formulário — ele responde mensagem. O mesmo dado que morreria num formulário abandonado chega inteiro numa conversa de seis mensagens.

### 2. A construção da campanha

Com o briefing na mão, ela monta a estrutura completa:

- **Público**: raio geográfico calculado a partir do endereço do imóvel, faixa etária inferida pela faixa de preço, interesses cruzados com o perfil do comprador
- **Criativo**: título, texto e chamada, escritos a partir das características reais do imóvel — não de um template com lacunas
- **Orçamento**: distribuído ao longo dos dias, com teto rígido
- **Destino**: uma landing page gerada para aquele imóvel específico, com o WhatsApp da IA como contato

Tudo isso vira chamadas à **Meta Marketing API**. A campanha nasce publicada.

### 3. O ciclo de otimização

É aqui que ela deixa de ser um gerador e vira gestora.

A cada 24 horas, a Bella lê as métricas da campanha e decide. Se um conjunto de anúncios tem custo por lead muito acima dos outros, ela pausa. Se um criativo está performando, ela realoca orçamento para ele. Se o custo por resultado sobe consistentemente por três dias, ela sinaliza fadiga de criativo e escreve variações novas.

Nenhuma dessas decisões passa por um humano.

### 4. O fechamento do ciclo

O lead que clica no anúncio cai no WhatsApp — e é a **mesma IA** que atende. Ela sabe qual anúncio trouxe aquela pessoa, qual imóvel ela viu, quanto custou aquele clique.

Isso fecha um circuito que normalmente fica aberto: a informação de qualidade do lead volta para quem decide o orçamento. Se um público gera muitos cliques e nenhuma conversa boa, ela sabe — porque foi ela quem conversou.

## Os freios que precisei inventar

Aqui está a parte que ninguém conta nas demonstrações.

Dar autonomia de gasto a uma IA revela problemas que não existem quando ela só sugere. Foram três, e cada um custou dinheiro real antes de virar código.

### Teto que a IA não pode ultrapassar

Óbvio em retrospecto. Mas a primeira versão tinha o teto **no prompt** — uma instrução em linguagem natural dizendo para não passar de X por dia.

Instrução em prompt é sugestão. O modelo respeitou por semanas e um dia interpretou "posso realocar orçamento entre conjuntos" de um jeito que somou mais que o teto.

O limite passou a ser código, verificado antes de cada chamada à API. **Regra que importa dinheiro não mora em prompt.**

### Toda mudança precisa de motivo registrado

Quando a IA pausa um anúncio, ela grava por quê: qual métrica, qual valor, qual limiar cruzado.

Isso nasceu de uma necessidade prática — o corretor perguntava "por que pausou minha campanha?" e a resposta honesta era "não sei". Hoje ele abre o painel e lê: *"pausado porque o custo por lead ficou 2,4× acima da média dos outros conjuntos por 2 dias seguidos"*.

Autonomia sem rastro não é autonomia, é caixa-preta. E caixa-preta ninguém confia com o próprio dinheiro.

### O freio de mão humano

Existe um botão que para tudo. Não é um detalhe de interface — é a condição para que o corretor durma tranquilo.

O paradoxo é que quase ninguém usa. Mas a existência do botão é o que faz a pessoa aceitar ligar o sistema.

## O que aprendi

**Autonomia é uma escada, não um interruptor.** A Bella não nasceu gastando. Ela começou sugerindo, depois publicando com aprovação, depois publicando sozinha com teto baixo, depois otimizando. Cada degrau só veio quando o anterior provou não fazer besteira.

**O gargalo nunca é o modelo.** É a integração, o tratamento de erro, o que fazer quando a API da Meta responde com um erro obscuro às três da manhã. A parte "inteligência artificial" é talvez 20% do código.

**Confiança se constrói com transparência, não com resultado.** Um corretor que vê a IA acertar sem entender por quê continua desconfiado. Um que vê a IA errar, explicar o erro e corrigir, confia mais.

---

Se você tem um negócio onde alguém gasta o dia repetindo decisões que seguem um critério — e tráfego pago é exatamente isso — provavelmente dá para automatizar de verdade. Não com uma IA que sugere. Com uma que faz.
