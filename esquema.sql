-- Banco dos contatos que chegam pelo formulário do site.
--
-- POR QUE ELE PASSOU A EXISTIR
-- O desenho antigo assumia que a entrega no WhatsApp ERA o armazenamento. Isso
-- vale enquanto a entrega funciona. Em 25/08 a API oficial ficou instável e
-- ficou claro o custo da aposta: mensagem que não chega é lead que não existiu.
-- Agora grava primeiro, entrega depois. A ordem é a regra.

create table if not exists leads (
  id          integer primary key autoincrement,
  criado_em   text    not null,          -- ISO 8601 em UTC; a exibição converte
  nome        text    not null,
  telefone    text    not null,          -- só dígitos, com DDI: 55DDXXXXXXXXX
  contexto    text,                      -- o que a pessoa escreveu
  pagina      text,                      -- de qual nota ela veio
  origem      text,                      -- host do referer
  ip_hash     text,                      -- para achar abuso sem guardar o IP

  -- Estado da entrega. `entregue` diz que a API da Meta ACEITOU, não que
  -- chegou: entrega de verdade só o webhook confirma. Ainda assim separa o
  -- caso "nem tentou" do "tentou e falhou", que é o que interessa quando
  -- alguém pergunta por que não recebeu aviso.
  entregue    integer not null default 0,
  erro        text,

  lido        integer not null default 0,
  teste       integer not null default 0
);

-- A listagem do painel é sempre "mais recentes primeiro".
create index if not exists idx_leads_recentes on leads (criado_em desc);

-- Telefone repetido significa a mesma pessoa voltando, e isso muda a conversa:
-- quem insiste merece resposta antes de quem chegou agora.
create index if not exists idx_leads_telefone on leads (telefone);

-- Tentativas de login no painel. Sem isto, senha única vira alvo de força
-- bruta e ninguém fica sabendo.
create table if not exists tentativas (
  id        integer primary key autoincrement,
  quando    text    not null,
  ip_hash   text    not null,
  ok        integer not null default 0
);

create index if not exists idx_tentativas_ip on tentativas (ip_hash, quando desc);
