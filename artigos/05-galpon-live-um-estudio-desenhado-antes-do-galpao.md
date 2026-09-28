---
slug: galpon-live-um-estudio-desenhado-antes-do-galpao
titulo: "Desenhei um estúdio de live commerce inteiro antes de existir o galpão"
descricao: "Marca gerada por código, cabines em planta, tour virtual e um site que abre com a placa acendendo. Como mostrar um negócio que ainda não tem parede, sem enganar ninguém no caminho."
data: 2026-09-28
hora: 10:30
leitura: 7 min de leitura
capa: assets/media/nota-galpon-live-um-estudio-desenhado-antes-do-galpao.webp
capa_alt: "Imagem de projeto: corredor de um galpão com quatro cabines de live lado a lado, cada uma com a placa ON ao vivo acesa em vermelho"
---

A GalpON Live é um estúdio de live commerce em Santa Bárbara d'Oeste, no interior de São Paulo. A marca manda o produto, o estúdio faz a live e a venda cai na loja dela.

Quando comecei, não havia galpão. Não havia cabine, placa, uniforme nem site. Havia uma ideia boa e uma pergunta que todo lojista faz antes de assinar qualquer coisa: **"mas como isso vai ficar?"**

Este texto conta como respondi a essa pergunta antes do primeiro tijolo, e onde tracei a linha para que mostrar o futuro não virasse mentir sobre o presente.

## O problema de vender o que ainda não existe

Estúdio é negócio de confiança visual. Ninguém entrega o próprio produto para uma live sem antes imaginar o cenário, a luz, o apresentador e a marca dele na parede.

O caminho comum é esperar a obra, fotografar e só então vender. Isso custa meses. O outro caminho é mostrar o projeto com tanta clareza que a conversa comercial começa no dia um.

Escolhi o segundo. Ele tem um risco sério: imagem de projeto parece foto. Volto a isso mais abaixo, porque foi a decisão mais importante do trabalho.

## A marca nasceu em código

O nome tem uma ideia só. ON é a luz de "no ar" do estúdio. Quando a live começa, o ON acende. Por isso ele vive dentro de uma placa vermelha, e o resto da marca é preto de galpão, concreto e a fita amarela do chão.

Não abri programa de desenho. A marca inteira sai de um script. Ele carrega os arquivos de fonte, calcula o espaço entre cada par de letras e transforma o texto em desenho. O resultado não depende de fonte instalada em máquina nenhuma.

| Cor | Código | Onde entra |
|---|---|---|
| Preto de galpão | `#121417` | fundo de tudo |
| Vermelho ON | `#D92330` | a placa acesa |
| Concreto | `#ECEDEA` | texto e superfícies claras |
| Âmbar | `#F2B21B` | a fita do chão, só em destaque pequeno |
| Aço | `#5A6069` | texto de apoio |

O vermelho não foi escolhido no olho. Texto branco em cima dele passa de 4,5 para 1 de contraste, que é o mínimo para leitura confortável. Placa que ninguém lê não serve de placa.

O mesmo script gera o logo, o símbolo, o kit das redes, o fundo e a placa da cabine, o crachá, os uniformes, o boné, a fita e o adesivo das caixas. Mudou a cor? Roda de novo e todas as peças saem atualizadas juntas. É a diferença entre ter um logo e ter um sistema.

![Imagem de projeto: fachada do galpão ao anoitecer, com o letreiro GalpON Live e o ON aceso em vermelho](/assets/media/galpon-case-fachada.webp)

## Mostrar o galpão antes do galpão

Com a marca fechada, gerei por IA as imagens do estúdio do jeito que ele vai ficar: as cabines por categoria de produto, o corredor, a placa da porta, a fachada, a equipe de uniforme, a caixa saindo para o cliente.

A IA não inventou a identidade. Ela recebeu a marca pronta e aplicou. Essa ordem importa: quando a imagem vem antes da marca, cada foto sai com uma cara e nada conversa com nada.

Depois vieram duas peças que ninguém pede e todo mundo usa:

- **O projeto das cabines.** As plantas também saem de script. Mudou a medida do salão, a planta se refaz e mostra quantas cabines cabem.
- **O tour virtual.** Uma página em que você clica na sala e entra nela. Serve para o lojista, e serviu primeiro para nós mesmos enxergarmos o fluxo: por onde o produto entra, onde fica o estoque, de onde sai a caixa.

![Imagem de projeto: equipe com o uniforme preto da GalpON Live, com a placa ON nas costas da camiseta](/assets/media/galpon-case-uniforme.webp)

## Um site que abre com a placa acendendo

O site precisava fazer o que a marca promete. Ele abre com o logo sendo desenhado e o ON piscando como neon até firmar. Dura uns quatro segundos e acontece toda vez, de propósito. É a vinheta do estúdio.

A primeira tela é uma caminhada da porta até a live. São 121 quadros desenhados em canvas, e quem anda é a rolagem: você desce a página e a câmera avança. O primeiro quadro carrega como imagem comum, então a página aparece na hora e o resto chega depois.

A segunda parte conta a história num celular: a conversa no WhatsApp, a live no ar e o relatório que chega de manhã. Em vez de explicar o serviço, o site mostra o serviço acontecendo.

Tudo isso roda sem biblioteca de animação. É HTML, CSS e JavaScript escritos para esta página. Menos peso, menos coisa para quebrar, e quem prefere menos movimento no aparelho recebe a versão parada.

## A linha que eu não cruzo

Imagem gerada por IA engana fácil, e estúdio é negócio de confiança. Então o projeto tem três regras, e elas estão no site para qualquer um conferir.

1. **Toda imagem de projeto vem marcada.** Está escrito em cima dela. Na primeira tela o site avisa: imagens do projeto, o galpão está sendo montado.
2. **Todo número de exemplo leva o selo "exemplo".** A live do celular mostra preço e quantidade vendida para explicar como funciona. São ilustração, e o selo diz isso.
3. **Logo de plataforma só com parceria certificada.** O nome aparece no texto, porque é onde a live acontece. O logo oficial fica de fora até a parceria existir de verdade.

> Mostrar o futuro não é o problema. O problema é deixar o visitante achar que o futuro já chegou.

Essa linha custa conversão no curto prazo. Foto "real" de estúdio cheio vende mais que imagem marcada como projeto. Só que a primeira visita de um lojista ao galpão desfaz qualquer exagero, e aí o que se perde não é uma venda, é o cliente.

## A máquina por trás das lives

Live é a parte que aparece. O que sustenta a operação é o que acontece antes e depois dela.

A GalpON roda sobre a mesma máquina que construí para o Achei Bella. A Bella atende no WhatsApp, ajuda a preparar o roteiro de venda e manda o relatório às 8h, com o que a live de ontem vendeu. Ela não apresenta live. Trabalha nos bastidores, que é onde uma IA rende mais.

## O que isso ensina para qualquer negócio

Nada aqui depende de ser estúdio. Troque "galpão" por loja, clínica ou escritório e o método é o mesmo.

1. **Marca primeiro, imagem depois.** Sem identidade fechada, cada peça sai com uma cara.
2. **Sistema no lugar de arquivo solto.** O que sai de script se refaz em minutos quando algo muda.
3. **Mostre acontecendo.** Uma conversa no celular explica mais que três parágrafos.
4. **Marque o que é projeto.** Confiança perdida na primeira visita não volta.
5. **A parte visível é a menor.** O atendimento e o relatório é que fazem o cliente ficar.

---

O estúdio está sendo montado agora. O site já está no ar: **[galponlive.com.br](https://galponlive.com.br/)**

**Quer um projeto assim para o seu negócio?** Deixa seu contato no formulário abaixo que eu te chamo no WhatsApp.
