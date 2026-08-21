---
slug: gestora-de-trafego-por-ia-mercado-imobiliario
titulo: "Como construí uma gestora de tráfego que roda campanhas sozinha"
descricao: "Uma IA que cria, publica e otimiza campanhas de Meta Ads para o mercado imobiliário. A arquitetura por dentro, onde eu deixei ela decidir sozinha, onde exigi aprovação humana, e por que essa linha foi a decisão mais difícil do projeto."
data: 2026-08-20
leitura: 8 min de leitura
capa: assets/media/artigo-trafego.webp
capa_alt: "Painel de métricas de campanha em tons de violeta e ciano sobre fundo escuro"
---

Existe uma diferença enorme entre uma IA que **sugere** uma campanha e uma que **roda** a campanha. A primeira é um assistente de texto com nome bonito. A segunda gasta dinheiro de verdade, todo dia, sem pedir licença.

Eu construí a segunda. Ela se chama Bella, opera dentro do Corretor 2.0 e é, até onde consegui verificar, a única gestora de tráfego autônoma voltada ao mercado imobiliário brasileiro. Este texto explica como ela funciona por dentro. Principalmente, explica onde eu decidi que ela age sozinha, onde exigi que um humano aprovasse, e por que essa fronteira deu mais trabalho do que todo o resto.

## O problema que ninguém resolve para o corretor

Um corretor de imóveis médio no Brasil vive um dilema sem boa saída.

Se contrata uma agência, paga entre R$ 1.500 e R$ 3.000 por mês a alguém que gerencia outras trinta contas e olha a dele por vinte minutos na terça-feira. Se cuida do próprio tráfego, vira gestor amador: sobe uma campanha, esquece dela, descobre trinta dias depois que queimou R$ 800 num público errado.

Há ainda um terceiro caminho, o mais comum de todos. Ele simplesmente não anuncia. Espera indicação, posta no Instagram e reclama que o mercado está difícil.

Os três cenários têm o mesmo gargalo. Tráfego pago exige atenção diária, e ninguém tem atenção diária sobrando.

## Por que "IA que sugere" não resolve

A primeira versão que construí fazia o que quase todo produto de IA para marketing faz hoje. Gerava o texto do anúncio, sugeria o público, recomendava o orçamento. Bonito de demonstrar.

Inútil na prática.

A sugestão morre no instante em que precisa virar ação. O corretor recebia um texto excelente, abria o Gerenciador de Anúncios da Meta, aquela interface com dezoito abas, e fechava a janela. A IA tinha feito a parte fácil e devolvido a difícil.

> Uma IA que devolve o trabalho difícil para o humano não automatizou nada. Ela apenas terceirizou de volta para si mesma a parte agradável.

A decisão que mudou o produto foi aceitar que a IA precisava ter as chaves. Acesso à API da Meta, permissão de publicar, permissão de pausar, permissão de gastar. Sem isso, é brinquedo.

## A arquitetura

O sistema tem quatro peças, e a ordem entre elas importa mais do que cada uma isolada.

### 1. O briefing que não parece formulário

A Bella não abre um formulário de trinta campos. Ela conversa pelo WhatsApp e extrai o que precisa: qual imóvel, qual faixa de preço, qual bairro, quem é o comprador provável.

Parece detalhe de interface, mas é estrutural. Corretor não preenche formulário. Corretor responde mensagem. O mesmo dado que morreria num formulário abandonado chega inteiro numa conversa de seis mensagens.

### 2. A construção da campanha

Com o briefing em mãos, ela monta a estrutura completa:

- **Público:** raio geográfico a partir do endereço do imóvel, faixa etária inferida pelo valor, interesses cruzados com o perfil provável do comprador. Aqui mora uma pegadinha que só aparece em produção: anúncio de imóvel cai numa categoria especial da Meta, criada para impedir discriminação em moradia, e nela **é proibido segmentar por idade ou gênero**. O sistema precisa saber quando essa regra vale e montar dois públicos diferentes, porque pedir 28 a 55 anos na categoria errada faz a campanha ser rejeitada
- **Criativo:** título, texto e chamada, escritos a partir das características reais daquele imóvel, não de um modelo com lacunas
- **Orçamento:** distribuído ao longo dos dias, com teto rígido
- **Destino:** uma página gerada para aquele imóvel específico, com o WhatsApp da própria IA como contato

Tudo isso vira chamadas à Meta Marketing API. A campanha nasce publicada.

### 3. O ciclo de otimização

Aqui ela deixa de ser geradora e vira gestora.

Duas vezes por dia, às 8h e às 14h, a Bella lê as métricas e decide. As regras são explícitas, e o que separa uma da outra não é dificuldade técnica: é o tamanho do estrago se ela errar.

**Orçamento ela mexe sozinha.** Custo por lead 30% acima da meta, corta 20% daquele conjunto. Custo por lead dentro da meta e com cliques saudáveis, escala 20%. São passos pequenos e reversíveis, e errar neles custa algumas dezenas de reais.

**Criativo cansado ela troca sozinha.** Esse ciclo roda em outro horário, 8h30 e 16h30, porque olha outra coisa. O gatilho é a frequência: quando o mesmo público já viu aquela peça mais de três vezes, ela parou de trabalhar. A Bella pausa e escreve variações novas.

**Pausar um conjunto inteiro, não.** Isso ela sugere e o corretor aprova. Quando um conjunto passou de R$ 50 gastos sem chegar a cinco cliques, ela levanta a mão em vez de puxar o gatilho.

Essa divisão foi a decisão de produto mais difícil do sistema. Cortar 20% do orçamento é um ajuste. Desligar um conjunto no meio da fase de aprendizado é uma decisão que o algoritmo da Meta cobra caro para desfazer, e uma IA não deveria tomar sozinha uma decisão cujo custo de reverter ela não sente.

### 4. O fechamento do ciclo

O anúncio não manda a pessoa para um site genérico. Manda para uma página criada para aquele imóvel específico, e é de lá que ela cai no WhatsApp. Quem atende é a mesma IA.

Isso fecha um circuito que normalmente fica aberto. Na montagem comum, quem cuida do anúncio e quem atende o lead são duas pessoas, ou duas ferramentas, e a informação mais valiosa morre no meio: se o lead que chegou presta. O anúncio sabe quantos cliques trouxe. Só a conversa sabe se veio alguém com intenção real de comprar ou alguém que clicou por engano.

Aqui as duas pontas são o mesmo sistema. A campanha aprende com o que aconteceu depois do clique, não só com o clique.

## Os freios que precisei inventar

Aqui está a parte que ninguém mostra nas demonstrações.

Dar autonomia de gasto a uma IA revela problemas que simplesmente não existem enquanto ela apenas sugere. São três, e nenhum deles é sobre o modelo. Todos são sobre o que fica em volta dele.

### Teto que a IA não pode ultrapassar

Óbvio em retrospecto, e ainda assim é o erro mais fácil de cometer: escrever o limite dentro do prompt, em linguagem natural, pedindo educadamente que ela não passe de determinado valor por dia.

Instrução em prompt é sugestão. O modelo obedece na maioria das vezes, e "na maioria das vezes" não é um contrato quando o dinheiro é de outra pessoa.

Hoje o teto é um trecho de código que roda **depois** que a IA decide e **antes** de qualquer coisa sair para a API da Meta. Ela recomenda o valor que quiser. O que passa pelo cano é esse valor apertado entre o piso e o teto que o corretor configurou, com o motivo carregando a marca de que foi limitado. **Regra que envolve dinheiro não mora em prompt.**

### Toda mudança precisa de motivo registrado

Toda vez que a IA encosta em alguma coisa, ela grava a razão: qual métrica, qual valor, qual limiar foi cruzado.

Isso nasceu de uma necessidade prática. O corretor perguntava por que o orçamento dele tinha caído, e a resposta honesta era que ninguém sabia. Hoje ele abre o painel e lê a frase que a própria regra escreveu: *"orçamento reduzido em 20%: custo por lead em R$ 91, meta de R$ 70"*.

Autonomia sem rastro não é autonomia. É caixa-preta. E ninguém confia o próprio dinheiro a uma caixa-preta.

### O freio de mão humano

A autonomia é uma chave, e ela nasce desligada. Não é uma opção que vem marcada por padrão com um aviso em letra miúda: enquanto o corretor não autoriza, a Bella analisa tudo, escreve as recomendações e não encosta em nada. Ligada, ela passa a executar o que descrevi acima.

Isso significa que o sistema tem duas personalidades vivendo no mesmo código, e as duas precisam funcionar bem. A versão que só recomenda não pode ser uma versão capenga da outra, porque é ela que o corretor usa nas primeiras semanas, quando está decidindo se confia.

O paradoxo é que quase ninguém desliga depois de ligar. Mas a existência da chave é justamente o que faz a pessoa aceitar ligar na primeira vez.

## O que aprendi

**Autonomia é uma escada, não um interruptor.** A Bella não nasceu gastando. Começou sugerindo. Depois passou a publicar mediante aprovação. Depois a publicar sozinha, com teto baixo. Só então passou a otimizar. Cada degrau veio quando o anterior provou não fazer besteira.

**O gargalo nunca é o modelo.** Fui conferir a proporção antes de escrever esta frase, porque ela costuma ser dita no chute. No Corretor 2.0, o arquivo que conversa com a API da Meta tem 8.553 linhas. Tudo que é IA de verdade, os prompts da Bella somados às ferramentas que ela pode usar e ao código que chama o modelo, dá 1.305.

Uma integração com uma API é seis vezes maior do que todo o cérebro do sistema. E não é porque o cérebro é simples: é porque uma API real tem limite de requisição, campo obrigatório que a documentação não menciona, erro que volta com status 200, categoria especial que muda as regras no meio do caminho. O modelo é a parte barata.

**Confiança se constrói com transparência, não com resultado.** Um corretor que vê a IA acertar sem entender o motivo continua desconfiado. Outro que vê a IA errar, explicar o erro e corrigir passa a confiar mais.

---

Se você tem um negócio no qual alguém gasta o dia repetindo decisões que seguem um critério, e tráfego pago é exatamente isso, provavelmente dá para automatizar de verdade. Não com uma IA que sugere. Com uma que faz.
