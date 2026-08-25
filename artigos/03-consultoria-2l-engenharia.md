---
slug: ia-numa-construtora-o-erro-de-1-por-cento-que-ninguem-via
titulo: "Levei IA para uma construtora e ela achou um erro de 1% que ninguém via há anos"
descricao: "Três horas de consultoria numa construtora de São José do Rio Preto, gravadas sem edição. O que a IA encontrou nas planilhas oficiais não era erro de conta: era arredondamento, e em licitação pública isso desclassifica."
data: 2026-08-25
hora: 09:20
leitura: 8 min de leitura
tipo: noticia
tema: negocios
rotulo: Como eu construí
capa: assets/media/nota-ia-numa-construtora-o-erro-de-1-por-cento-que-ninguem-via.webp
capa_alt: "Pilha alta de planilhas de papel com um fio de moedas escorrendo pela base, formando uma poça no chão sem ninguém perceber"
---

A 2L Engenharia é uma construtora de São José do Rio Preto credenciada pela Caixa Econômica Federal. Faz obra pública, obra privada e manutenção predial. Do outro lado da mesa estavam Marcos Leandro, diretor com quinze anos de canteiro, e Wilder, engenheiro peruano formado em Lima, coordenador de projetos e execução.

Passei três horas com eles montando um ambiente de IA do zero. A consultoria inteira foi gravada e publicada, sem corte de vitrine: com as travadas, as dúvidas básicas e as decisões tomadas ao vivo.

O momento que justifica assistir às três horas acontece na segunda metade, e não estava no roteiro.

## O incômodo que ele carregava havia anos

Marcos trouxe uma queixa antiga. As planilhas oficiais da empresa, as mesmas que iam para licitação, fechavam com uma **diferença teimosa de cerca de 1%** entre o orçamento analítico e o sintético.

Ninguém sabia de onde vinha. Já tinham procurado. Convivia-se com ela, como se convive com uma goteira que não se acha.

Troquei para o modelo mais potente disponível e pedi uma auditoria linha a linha das quatro planilhas oficiais. O diagnóstico veio em minutos.

**Não era erro de cálculo. Era truncamento.**

As fórmulas cortavam casas decimais em vez de arredondar. Cada corte descartava alguns centavos. Item por item, ao longo de mais de mil linhas de composição, os centavos viravam o tal 1%.

## Por que 1% não é pouco

Numa obra de R$ 250 mil, o valor absoluto é pequeno o bastante para a obra absorver. O problema nunca foi o valor.

> "Eu vou aplicando desconto, um por cento, dois por cento... e essa conta não pode ter diferença de nenhum centavo. Se tiver, você é desclassificado por erro."
>
> Marcos Leandro, sobre orçamento em licitação pública

Em processo licitatório, coerência aritmética não é preciosismo. É critério de habilitação. Uma planilha que não fecha consigo mesma reprova antes de alguém olhar o preço.

A IA não substituiu o orçamentista. Ela fez o que nenhum orçamentista faz: conferiu mil linhas sem cansar e sem pular nenhuma. As quatro planilhas saíram recalibradas na mesma sessão.

## A lição que vale para qualquer empresa

Toda empresa tem o seu déficit de 1%: o erro pequeno, antigo e já normalizado que ninguém tem tempo de caçar.

**Auditar o que já existe costuma dar mais retorno do que automatizar o que ainda não existe.** É menos vistoso, não rende post bonito, e paga mais rápido.

## O setor que mais resiste é o que mais tem a ganhar

A construção civil vive uma contradição curiosa. É um setor obcecado por precisão: norma técnica, memorial, composição de custo, cronograma físico-financeiro. E é dos que menos usa tecnologia no trabalho que sustenta tudo isso.

O resultado é engenheiro sênior gastando a tarde formatando planilha em vez de resolver obra.

## Por que a consultoria não começou pelo resultado bonito

Engenheiro entende de fundação, então estruturei a conversa na linguagem deles.

Nenhuma empresa vira "orientada a IA" ligando um chat e pedindo um texto. A ordem é a mesma de uma obra:

1. **Alicerce.** Ambiente configurado: IDE instalada, Git, Python, contas conectadas, um workspace onde a empresa vive.
2. **Pilares.** Estrutura de pastas, padrões mestres e a memória técnica do sistema: identidade visual, bases de preço, etapas construtivas.
3. **Lajes.** Os fluxos de trabalho: orçamento, memorial, comunicação, cronograma.
4. **Acabamento.** A automação de verdade: comandos por WhatsApp, agentes rodando sozinhos.

O erro número um de quem tenta IA na empresa é começar pelo resultado bonito, um post ou uma imagem, em vez de começar pela base que a IA vai ler todos os dias. **Sem contexto estruturado, a IA acerta uma vez e erra as outras cinquenta.**

## A diferença entre conversar com IA e trabalhar com IA

Essa foi a virada de chave da consultoria, e vale para qualquer setor. A diferença não está no modelo. Está em onde ele roda.

| Chat no navegador | IA dentro do ambiente |
|---|---|
| Devolve texto, você copia, cola e formata na mão | Cria as pastas, escreve o memorial, gera o Excel pronto |
| Esquece o contexto da empresa a cada conversa nova | Lê a memória técnica antes de responder |
| Não abre a sua planilha, não gera arquivo | Abre os arquivos reais e devolve a versão corrigida |
| Um agente por vez, uma resposta por vez | Vários agentes em paralelo no mesmo projeto |

É a diferença entre um consultor que manda um parecer por e-mail e um que senta na sua cadeira e faz o serviço com você. Foi por rodar dentro do ambiente que a auditoria das planilhas foi possível: um chat comum não abre o arquivo.

## Skill: transformar o que está na cabeça em processo

O conceito mais importante da consultoria também é o mais fácil de explicar. **Skill é o passo a passo de um processo, escrito uma única vez, para que a IA execute sempre do mesmo jeito.**

A analogia que usei ao vivo foi de propósito longe da engenharia: uma faxineira profissional. Ela não "limpa a casa". Ela abre a porta, avalia o ambiente, separa o material, segue uma ordem, confere no fim. O que parece talento é procedimento.

Na engenharia é idêntico. Fazer um memorial descritivo padrão Caixa não é "escrever um texto": é uma sequência de verificações, referências normativas e blocos obrigatórios numa ordem exigida pelo agente financiador.

Uma skill de memorial tem contexto (tipo de obra, órgão financiador), fontes (SINAPI, CDHU, normas aplicáveis), estrutura (blocos obrigatórios na ordem certa), padrão visual, checklist de verificação e formato de saída.

Existe uma pergunta que revela as skills da sua empresa:

> Se o funcionário mais experiente saísse amanhã, o que sairia junto com ele?

A resposta é a sua primeira skill.

## Os cinco fluxos que estruturamos

Com a base pronta, mapeamos a operação da 2L nos cinco documentos que consomem a maior parte do tempo técnico de qualquer construtora:

- **Padrões mestres:** estrutura de pastas, paleta corporativa, tipografia e etapas construtivas. A identidade que todo documento gerado herda automaticamente.
- **Orçamento:** composições com base SINAPI e CDHU, aplicação de BDI, planilhas analítica e sintética prontas para licitação.
- **Comunicação:** modelos de proposta comercial, boletim de medição, encaminhamento de nota fiscal e recurso administrativo.
- **Memorial descritivo:** versões para residencial padrão, padrão Caixa e obra pública, cada uma com o próprio checklist técnico.
- **Cronograma físico-financeiro:** abas integradas de orçamento, curva S e avanço mensal. O documento que amarra prazo e desembolso.

## O custo do ecossistema: zero

Uma decisão foi tomada logo no começo: nada de ferramenta cara para provar valor. Todo o ambiente foi montado na camada gratuita.

Isso importa porque a objeção mais comum de empresa pequena é orçamento, e ela quase nunca é o obstáculo real. O obstáculo é não saber por onde começar.

## O resumo em áudio que virou ativo comercial

A última parte saiu do operacional e foi para o comercial. Alimentamos um caderno no NotebookLM com as fontes reais da empresa e ele gerou, sozinho, um **resumo em áudio de cerca de 25 minutos no formato de podcast**, com dois apresentadores discutindo o conteúdo técnico.

Para uma construtora o uso é imediato: transformar a ata de uma reunião em áudio para o cliente que não lê relatório, estudar norma e edital perguntando direto à fonte, e preparar o time novo com o conhecimento da casa sem tirar o engenheiro sênior da obra.

Um resumo em áudio de 25 minutos, gerado automaticamente, pode ser exatamente o que faz o cliente entender o valor da sua proposta.

## O que vem depois

A consultoria foi desenhada em quatro etapas. Esta primeira entregou o ambiente instalado, os cinco fluxos criados e as planilhas oficiais recalibradas. A seguinte entra na camada mais crítica: banco de dados, conectores e integração com o ambiente de projeto. Depois vêm os comandos por WhatsApp e os agentes autônomos.

Entre uma e outra tem tarefa de casa, e isso não é detalhe. **Consultoria sem lição de casa vira palestra.**

## Cinco lições que servem para qualquer empresa

Nada do que foi feito aqui é exclusivo da construção civil. Troque "memorial descritivo" por "contrato", "proposta", "laudo" ou "relatório" e o método é o mesmo.

1. **Comece pela base, não pelo brilho.** Ambiente e memória primeiro, automação depois.
2. **Escreva o que só existe na cabeça das pessoas.** Todo processo repetido é uma skill esperando ser documentada.
3. **Execução vale mais que conversa.** IA que devolve texto economiza minutos. IA que executa devolve dias.
4. **Audite antes de automatizar.** O erro antigo e silencioso custa mais caro que a tarefa que você ainda não automatizou.
5. **Ferramenta cara não é pré-requisito.** Todo este ecossistema foi montado na camada gratuita.

---

Em três horas, uma construtora saiu de um workspace vazio para um ambiente com memória própria, cinco fluxos estruturados e quatro planilhas oficiais auditadas.

A tecnologia não veio para substituir o engenheiro. Veio para devolver o tempo que ele nunca teve.

## Assista à consultoria inteira

As três horas estão publicadas na íntegra, sem edição de vitrine:

**[Ver a consultoria completa no YouTube](https://youtu.be/_GJYOxupAl0)**

A Parte 2 já está sendo gravada. Ela entra na camada mais crítica: banco de dados, conectores e comandos por WhatsApp.

**Quer esse sistema rodando na sua empresa?** Deixa seu contato no formulário abaixo que eu te chamo no WhatsApp.
