
-- =========================================================
-- Tipos
-- =========================================================
create type public.app_role as enum ('administrador', 'gestor_comercial', 'analista');
create type public.tipo_codigo as enum ('pai', 'filho');
create type public.nivel_margem as enum ('produto', 'linha', 'familia', 'geral');
create type public.tipo_regua as enum ('cor', 'dimensional', 'familia');
create type public.escopo_regra as enum ('geral', 'familia', 'linha', 'grupo_dimensional', 'produto');
create type public.modo_formacao as enum ('automatico', 'manual');

-- =========================================================
-- Funções utilitárias
-- =========================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- Perfis e papéis
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.tem_acesso(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles r
    join public.profiles p on p.id = r.user_id
    where r.user_id = _user_id and p.ativo
  )
$$;

create or replace function public.pode_gerenciar_regras(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id, 'administrador') or public.has_role(_user_id, 'gestor_comercial')
$$;

create policy "Perfil próprio ou administrador"
on public.profiles for select to authenticated
using (id = auth.uid() or public.has_role(auth.uid(), 'administrador'));

create policy "Atualizar próprio perfil ou administrador"
on public.profiles for update to authenticated
using (id = auth.uid() or public.has_role(auth.uid(), 'administrador'))
with check (id = auth.uid() or public.has_role(auth.uid(), 'administrador'));

create policy "Ver próprios papéis ou administrador"
on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'administrador'));

create policy "Administrador concede papéis"
on public.user_roles for insert to authenticated
with check (public.has_role(auth.uid(), 'administrador'));

create policy "Administrador remove papéis"
on public.user_roles for delete to authenticated
using (public.has_role(auth.uid(), 'administrador'));

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Impede que um usuário comum altere o próprio status "ativo"
create or replace function public.proteger_status_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.ativo is distinct from old.ativo and not public.has_role(auth.uid(), 'administrador') then
    raise exception 'Somente administradores podem ativar ou desativar usuários';
  end if;
  return new;
end;
$$;
create trigger profiles_proteger_status before update on public.profiles
for each row execute function public.proteger_status_perfil();

-- Novo usuário: cria perfil; o primeiro usuário do sistema vira administrador, os demais analistas.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  );
  if not exists (select 1 from public.user_roles where role = 'administrador') then
    insert into public.user_roles (user_id, role) values (new.id, 'administrador');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'analista');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- Auditoria
-- =========================================================
create table public.log_auditoria (
  id bigint generated always as identity primary key,
  tabela text not null,
  registro_id text,
  acao text not null,
  dados_anteriores jsonb,
  dados_novos jsonb,
  usuario_id uuid,
  created_at timestamptz not null default now()
);
grant select on public.log_auditoria to authenticated;
grant all on public.log_auditoria to service_role;
alter table public.log_auditoria enable row level security;
create policy "Administrador consulta auditoria"
on public.log_auditoria for select to authenticated
using (public.has_role(auth.uid(), 'administrador'));
create index log_auditoria_tabela_idx on public.log_auditoria (tabela, created_at desc);

create or replace function public.registrar_auditoria()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.log_auditoria (tabela, registro_id, acao, dados_anteriores, dados_novos, usuario_id)
  values (
    tg_table_name,
    coalesce((case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'id', null),
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end,
    auth.uid()
  );
  return coalesce(new, old);
end;
$$;

-- =========================================================
-- Cadastros auxiliares
-- =========================================================
create table public.familias (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  descricao text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.linhas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  familia_id uuid not null references public.familias(id) on delete restrict,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index linhas_familia_idx on public.linhas (familia_id);

create table public.cores (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tipos_dimensao (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  unidade text not null,
  descricao text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.grupos_dimensionais (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  tipo_dimensao_id uuid not null references public.tipos_dimensao(id) on delete restrict,
  escopo public.escopo_regra not null default 'geral',
  familia_id uuid references public.familias(id) on delete restrict,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grupos_escopo_ck check (escopo in ('geral', 'familia') and (escopo <> 'familia' or familia_id is not null))
);
create index grupos_tipo_idx on public.grupos_dimensionais (tipo_dimensao_id);

-- Sequência comercial das dimensões de cada grupo
create table public.regras_dimensionais (
  id uuid primary key default gen_random_uuid(),
  grupo_dimensional_id uuid not null references public.grupos_dimensionais(id) on delete cascade,
  valor_dimensao numeric(14,4) not null,
  ordem integer not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (grupo_dimensional_id, valor_dimensao),
  unique (grupo_dimensional_id, ordem)
);

-- =========================================================
-- Produtos e hierarquia
-- =========================================================
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  descricao text not null,
  tipo_codigo public.tipo_codigo not null,
  familia_id uuid not null references public.familias(id) on delete restrict,
  linha_id uuid not null references public.linhas(id) on delete restrict,
  cor_id uuid references public.cores(id) on delete restrict,
  tipo_dimensao_id uuid references public.tipos_dimensao(id) on delete restrict,
  valor_dimensao numeric(14,4),
  unidade text,
  grupo_dimensional_id uuid references public.grupos_dimensionais(id) on delete restrict,
  ordem_dimensional integer,
  custo_completo numeric(18,4),
  custo_atualizado_em timestamptz,
  preco_mercado numeric(18,4),
  mercado_atualizado_em timestamptz,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index produtos_familia_idx on public.produtos (familia_id);
create index produtos_linha_idx on public.produtos (linha_id);
create index produtos_tipo_idx on public.produtos (tipo_codigo);
create index produtos_descricao_idx on public.produtos (lower(descricao));

create table public.hierarquia_produtos (
  id uuid primary key default gen_random_uuid(),
  pai_id uuid not null references public.produtos(id) on delete restrict,
  filho_id uuid not null unique references public.produtos(id) on delete restrict,
  created_by uuid,
  created_at timestamptz not null default now(),
  constraint hierarquia_nao_proprio_pai check (pai_id <> filho_id)
);
create index hierarquia_pai_idx on public.hierarquia_produtos (pai_id);

create table public.historico_hierarquia (
  id bigint generated always as identity primary key,
  pai_id uuid not null,
  filho_id uuid not null,
  acao text not null check (acao in ('vinculo', 'desvinculo')),
  usuario_id uuid,
  created_at timestamptz not null default now()
);
create index historico_hierarquia_filho_idx on public.historico_hierarquia (filho_id, created_at desc);

create table public.historico_custos_mercado (
  id bigint generated always as identity primary key,
  produto_id uuid not null references public.produtos(id) on delete cascade,
  campo text not null check (campo in ('custo', 'mercado')),
  valor_anterior numeric(18,4),
  valor_novo numeric(18,4),
  origem text not null default 'manual',
  importacao_id uuid,
  usuario_id uuid,
  created_at timestamptz not null default now()
);
create index historico_cm_produto_idx on public.historico_custos_mercado (produto_id, created_at desc);

-- Validações da hierarquia: pai válido, filho válido, mesma linha
create or replace function public.validar_hierarquia()
returns trigger language plpgsql set search_path = public as $$
declare
  v_pai public.produtos;
  v_filho public.produtos;
begin
  select * into v_pai from public.produtos where id = new.pai_id;
  select * into v_filho from public.produtos where id = new.filho_id;
  if v_pai.tipo_codigo <> 'pai' then
    raise exception 'O código % não é do tipo pai', v_pai.codigo;
  end if;
  if v_filho.tipo_codigo <> 'filho' then
    raise exception 'O código % não é do tipo filho', v_filho.codigo;
  end if;
  if v_pai.linha_id <> v_filho.linha_id then
    raise exception 'Pai (%) e filho (%) pertencem a linhas diferentes', v_pai.codigo, v_filho.codigo;
  end if;
  new.created_by = coalesce(new.created_by, auth.uid());
  return new;
end;
$$;
create trigger hierarquia_validar before insert or update on public.hierarquia_produtos
for each row execute function public.validar_hierarquia();

create or replace function public.registrar_historico_hierarquia()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    insert into public.historico_hierarquia (pai_id, filho_id, acao, usuario_id)
    values (old.pai_id, old.filho_id, 'desvinculo', auth.uid());
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    insert into public.historico_hierarquia (pai_id, filho_id, acao, usuario_id)
    values (new.pai_id, new.filho_id, 'vinculo', auth.uid());
  end if;
  return coalesce(new, old);
end;
$$;
create trigger hierarquia_historico after insert or update or delete on public.hierarquia_produtos
for each row execute function public.registrar_historico_hierarquia();

-- Produtos: impedir mudanças que quebrem a hierarquia e registrar histórico de custo/mercado
create or replace function public.validar_produto()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if new.linha_id <> old.linha_id and exists (
      select 1 from public.hierarquia_produtos h
      where h.pai_id = new.id or h.filho_id = new.id
    ) then
      raise exception 'O produto % possui vínculo pai/filho: remova o vínculo antes de alterar a linha', new.codigo;
    end if;
    if new.tipo_codigo <> old.tipo_codigo and exists (
      select 1 from public.hierarquia_produtos h
      where h.pai_id = new.id or h.filho_id = new.id
    ) then
      raise exception 'O produto % possui vínculo pai/filho: remova o vínculo antes de alterar o tipo', new.codigo;
    end if;
    if new.custo_completo is distinct from old.custo_completo then
      new.custo_atualizado_em = now();
    end if;
    if new.preco_mercado is distinct from old.preco_mercado then
      new.mercado_atualizado_em = now();
    end if;
  else
    if new.custo_completo is not null then new.custo_atualizado_em = now(); end if;
    if new.preco_mercado is not null then new.mercado_atualizado_em = now(); end if;
  end if;
  return new;
end;
$$;
create trigger produtos_validar before insert or update on public.produtos
for each row execute function public.validar_produto();

create or replace function public.registrar_historico_custos()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.custo_completo is distinct from old.custo_completo then
    if tg_op = 'INSERT' and new.custo_completo is null then
      null;
    else
      insert into public.historico_custos_mercado (produto_id, campo, valor_anterior, valor_novo, usuario_id)
      values (new.id, 'custo', case when tg_op = 'UPDATE' then old.custo_completo end, new.custo_completo, auth.uid());
    end if;
  end if;
  if tg_op = 'INSERT' or new.preco_mercado is distinct from old.preco_mercado then
    if tg_op = 'INSERT' and new.preco_mercado is null then
      null;
    else
      insert into public.historico_custos_mercado (produto_id, campo, valor_anterior, valor_novo, usuario_id)
      values (new.id, 'mercado', case when tg_op = 'UPDATE' then old.preco_mercado end, new.preco_mercado, auth.uid());
    end if;
  end if;
  return new;
end;
$$;
create trigger produtos_historico_custos after insert or update on public.produtos
for each row execute function public.registrar_historico_custos();

-- =========================================================
-- Regras comerciais
-- =========================================================
create table public.margens (
  id uuid primary key default gen_random_uuid(),
  nivel public.nivel_margem not null,
  familia_id uuid references public.familias(id) on delete restrict,
  linha_id uuid references public.linhas(id) on delete restrict,
  produto_id uuid references public.produtos(id) on delete restrict,
  percentual numeric(9,6) not null check (percentual >= 0 and percentual < 1),
  vigencia_inicio date not null default current_date,
  vigencia_fim date,
  ativo boolean not null default true,
  substitui_id uuid references public.margens(id) on delete set null,
  observacao text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint margens_vigencia_ck check (vigencia_fim is null or vigencia_fim >= vigencia_inicio),
  constraint margens_nivel_ck check (
    (nivel = 'geral' and familia_id is null and linha_id is null and produto_id is null) or
    (nivel = 'familia' and familia_id is not null and linha_id is null and produto_id is null) or
    (nivel = 'linha' and linha_id is not null and familia_id is null and produto_id is null) or
    (nivel = 'produto' and produto_id is not null and familia_id is null and linha_id is null)
  )
);
create index margens_nivel_idx on public.margens (nivel, ativo);

create table public.reguas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  tipo public.tipo_regua not null,
  escopo public.escopo_regra not null default 'geral',
  familia_id uuid references public.familias(id) on delete restrict,
  linha_id uuid references public.linhas(id) on delete restrict,
  grupo_dimensional_id uuid references public.grupos_dimensionais(id) on delete restrict,
  percentual numeric(9,6) check (percentual is null or percentual > -1),
  prioridade integer not null default 0,
  vigencia_inicio date not null default current_date,
  vigencia_fim date,
  ativo boolean not null default true,
  substitui_id uuid references public.reguas(id) on delete set null,
  descricao text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reguas_vigencia_ck check (vigencia_fim is null or vigencia_fim >= vigencia_inicio),
  constraint reguas_escopo_ck check (
    escopo <> 'produto' and
    (escopo <> 'familia' or familia_id is not null) and
    (escopo <> 'linha' or linha_id is not null) and
    (escopo <> 'grupo_dimensional' or grupo_dimensional_id is not null)
  )
);
create index reguas_tipo_idx on public.reguas (tipo, ativo);

-- Percentual por cor dentro de uma régua de cores
create table public.regras_regua (
  id uuid primary key default gen_random_uuid(),
  regua_id uuid not null references public.reguas(id) on delete cascade,
  cor_id uuid not null references public.cores(id) on delete restrict,
  percentual numeric(9,6) not null check (percentual > -1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (regua_id, cor_id)
);

-- Taxa por incremento por grupo dimensional
create table public.reguas_dimensionais (
  id uuid primary key default gen_random_uuid(),
  regua_id uuid not null references public.reguas(id) on delete cascade,
  grupo_dimensional_id uuid not null references public.grupos_dimensionais(id) on delete restrict,
  taxa_por_incremento numeric(9,6) not null check (taxa_por_incremento > -1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (regua_id, grupo_dimensional_id)
);

create table public.excecoes (
  id uuid primary key default gen_random_uuid(),
  tipo_ajuste text not null check (tipo_ajuste in ('cor', 'dimensional', 'familia')),
  escopo public.escopo_regra not null default 'produto',
  produto_id uuid references public.produtos(id) on delete restrict,
  familia_id uuid references public.familias(id) on delete restrict,
  linha_id uuid references public.linhas(id) on delete restrict,
  grupo_dimensional_id uuid references public.grupos_dimensionais(id) on delete restrict,
  cor_id uuid references public.cores(id) on delete restrict,
  percentual numeric(9,6) not null check (percentual > -1),
  prioridade integer not null default 0,
  vigencia_inicio date not null default current_date,
  vigencia_fim date,
  ativo boolean not null default true,
  substitui_regua_id uuid references public.reguas(id) on delete set null,
  substitui_id uuid references public.excecoes(id) on delete set null,
  motivo text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint excecoes_vigencia_ck check (vigencia_fim is null or vigencia_fim >= vigencia_inicio),
  constraint excecoes_escopo_ck check (
    (escopo <> 'produto' or produto_id is not null) and
    (escopo <> 'familia' or familia_id is not null) and
    (escopo <> 'linha' or linha_id is not null) and
    (escopo <> 'grupo_dimensional' or grupo_dimensional_id is not null) and
    (tipo_ajuste <> 'cor' or cor_id is not null)
  )
);
create index excecoes_tipo_idx on public.excecoes (tipo_ajuste, ativo);

-- Parâmetros dos pontos pendentes de validação comercial
create table public.configuracoes (
  chave text primary key,
  valor jsonb not null,
  opcoes jsonb not null default '[]'::jsonb,
  descricao text not null,
  status text not null default 'pendente_validacao' check (status in ('pendente_validacao', 'validado')),
  updated_by uuid,
  updated_at timestamptz not null default now()
);

insert into public.configuracoes (chave, valor, opcoes, descricao) values
  ('modo_dimensional', '"linear"', '["linear","composto"]',
   'Aplicação da taxa dimensional por incremento: linear (r × n) ou composta ((1 + r)^n − 1).'),
  ('fonte_posicao_dimensional', '"sequencia_grupo"', '["sequencia_grupo","ordem_produto"]',
   'Origem da posição dimensional: sequência cadastrada no grupo ou campo "ordem dimensional" do produto.'),
  ('referencia_cor', '"absoluta"', '["absoluta","relativa_ao_pai"]',
   'Ajuste de cor do filho: percentual da cor do filho (absoluta) ou diferença em relação à cor do pai.'),
  ('aplicacao_ajuste_familia', '"nao_aplicar"', '["nao_aplicar","filhos","pai_e_filhos"]',
   'Aplicação do ajuste de preço da família, combinado de forma multiplicativa com cor e dimensão.'),
  ('arredondar_pai_automatico', 'true', '[true,false]',
   'Arredondar para R$ 0,10 o preço do pai formado no modo automático (o preço manual nunca é alterado).'),
  ('desempate_arredondamento', '"pendente"', '["pendente","para_cima","para_baixo","par"]',
   'Critério quando o preço fica exatamente no meio de dois múltiplos de R$ 0,10. "Pendente" bloqueia o item até definição.'),
  ('ordem_especificidade', '["produto","grupo_dimensional","linha","familia","geral"]', '[]',
   'Ordem de precedência entre escopos de réguas e exceções (do mais específico para o mais genérico).');

-- =========================================================
-- Importações, simulações e snapshots
-- =========================================================
create table public.importacoes (
  id uuid primary key default gen_random_uuid(),
  arquivo_nome text not null,
  tipo text not null,
  status text not null default 'em_validacao' check (status in ('em_validacao', 'confirmada', 'cancelada', 'falhou')),
  mapeamento jsonb,
  total_novos integer not null default 0,
  total_atualizados integer not null default 0,
  total_rejeitados integer not null default 0,
  rejeicoes jsonb not null default '[]'::jsonb,
  usuario_id uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  concluida_em timestamptz
);
create index importacoes_usuario_idx on public.importacoes (usuario_id, created_at desc);

create table public.simulacoes (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  produto_pai_id uuid references public.produtos(id) on delete set null,
  codigo_pai text not null,
  descricao_pai text not null,
  modo public.modo_formacao not null,
  preco_pai numeric(18,4),
  preco_pai_informado numeric(18,4),
  margem_objetiva_pai numeric(9,6),
  origem_margem_pai text,
  data_referencia date not null,
  versao_motor text not null,
  parametros jsonb not null default '{}'::jsonb,
  resumo jsonb not null default '{}'::jsonb,
  observacao text,
  usuario_id uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);
create index simulacoes_usuario_idx on public.simulacoes (usuario_id, created_at desc);
create index simulacoes_pai_idx on public.simulacoes (codigo_pai);

create table public.itens_simulacao (
  id uuid primary key default gen_random_uuid(),
  simulacao_id uuid not null references public.simulacoes(id) on delete cascade,
  ordem integer not null default 0,
  produto_id uuid,
  codigo text not null,
  descricao text not null,
  tipo_codigo public.tipo_codigo not null,
  familia text,
  linha text,
  cor text,
  dimensao text,
  custo_completo numeric(18,4),
  preco_mercado numeric(18,4),
  ajuste_cor numeric(12,8),
  ajuste_dimensional numeric(12,8),
  ajuste_familia numeric(12,8),
  margem_objetiva numeric(9,6),
  origem_margem text,
  preco_bruto numeric(20,8),
  preco_calculado numeric(18,4),
  preco_manual numeric(18,4),
  preco_final numeric(18,4),
  margem_alcancada numeric(14,8),
  diferenca_margem_pp numeric(14,8),
  diferenca_mercado_reais numeric(18,4),
  diferenca_mercado_pct numeric(14,8),
  status text not null,
  alertas jsonb not null default '[]'::jsonb,
  memoria_calculo jsonb not null default '[]'::jsonb
);
create index itens_simulacao_sim_idx on public.itens_simulacao (simulacao_id, ordem);

create table public.snapshot_regras (
  id uuid primary key default gen_random_uuid(),
  simulacao_id uuid not null references public.simulacoes(id) on delete cascade,
  tipo text not null,
  regra_id uuid,
  dados jsonb not null
);
create index snapshot_regras_sim_idx on public.snapshot_regras (simulacao_id);

-- =========================================================
-- Gatilhos de updated_at e auditoria
-- =========================================================
do $$
declare t text;
begin
  foreach t in array array['familias','linhas','cores','tipos_dimensao','grupos_dimensionais','regras_dimensionais',
                           'produtos','margens','reguas','regras_regua','reguas_dimensionais','excecoes','configuracoes']
  loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
    execute format('create trigger %I_auditoria after insert or update or delete on public.%I for each row execute function public.registrar_auditoria()', t, t);
  end loop;
end $$;

create trigger user_roles_auditoria after insert or update or delete on public.user_roles
for each row execute function public.registrar_auditoria();

-- =========================================================
-- Permissões (GRANT + RLS)
-- =========================================================
-- Cadastros: leitura para usuários com acesso; escrita para administrador
do $$
declare t text;
begin
  foreach t in array array['familias','linhas','cores','tipos_dimensao','grupos_dimensionais','regras_dimensionais',
                           'produtos','hierarquia_produtos']
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Leitura para usuários com acesso" on public.%I for select to authenticated using (public.tem_acesso(auth.uid()))', t);
    execute format('create policy "Administrador inclui" on public.%I for insert to authenticated with check (public.has_role(auth.uid(), ''administrador''))', t);
    execute format('create policy "Administrador altera" on public.%I for update to authenticated using (public.has_role(auth.uid(), ''administrador'')) with check (public.has_role(auth.uid(), ''administrador''))', t);
    execute format('create policy "Administrador exclui" on public.%I for delete to authenticated using (public.has_role(auth.uid(), ''administrador''))', t);
  end loop;
end $$;

-- Regras comerciais: leitura para usuários com acesso; escrita para administrador e gestor comercial
do $$
declare t text;
begin
  foreach t in array array['margens','reguas','regras_regua','reguas_dimensionais','excecoes']
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Leitura para usuários com acesso" on public.%I for select to authenticated using (public.tem_acesso(auth.uid()))', t);
    execute format('create policy "Gestão de regras inclui" on public.%I for insert to authenticated with check (public.pode_gerenciar_regras(auth.uid()))', t);
    execute format('create policy "Gestão de regras altera" on public.%I for update to authenticated using (public.pode_gerenciar_regras(auth.uid())) with check (public.pode_gerenciar_regras(auth.uid()))', t);
    execute format('create policy "Gestão de regras exclui" on public.%I for delete to authenticated using (public.pode_gerenciar_regras(auth.uid()))', t);
  end loop;
end $$;

-- Históricos: somente leitura (gravados por gatilhos)
grant select on public.historico_hierarquia to authenticated;
grant all on public.historico_hierarquia to service_role;
alter table public.historico_hierarquia enable row level security;
create policy "Leitura para usuários com acesso" on public.historico_hierarquia
for select to authenticated using (public.tem_acesso(auth.uid()));

grant select on public.historico_custos_mercado to authenticated;
grant all on public.historico_custos_mercado to service_role;
alter table public.historico_custos_mercado enable row level security;
create policy "Leitura para usuários com acesso" on public.historico_custos_mercado
for select to authenticated using (public.tem_acesso(auth.uid()));

-- Configurações: leitura para usuários com acesso; alteração pelo administrador
grant select, update on public.configuracoes to authenticated;
grant all on public.configuracoes to service_role;
alter table public.configuracoes enable row level security;
create policy "Leitura para usuários com acesso" on public.configuracoes
for select to authenticated using (public.tem_acesso(auth.uid()));
create policy "Administrador altera" on public.configuracoes
for update to authenticated
using (public.has_role(auth.uid(), 'administrador'))
with check (public.has_role(auth.uid(), 'administrador'));

-- Importações: cada usuário registra as próprias; administrador e gestor consultam todas
grant select, insert, update on public.importacoes to authenticated;
grant all on public.importacoes to service_role;
alter table public.importacoes enable row level security;
create policy "Consulta de importações" on public.importacoes
for select to authenticated
using (usuario_id = auth.uid() or public.pode_gerenciar_regras(auth.uid()));
create policy "Registrar importação própria" on public.importacoes
for insert to authenticated
with check (usuario_id = auth.uid() and public.tem_acesso(auth.uid()));
create policy "Atualizar importação própria" on public.importacoes
for update to authenticated
using (usuario_id = auth.uid())
with check (usuario_id = auth.uid());

-- Simulações: imutáveis depois de gravadas (sem update/delete)
grant select, insert on public.simulacoes to authenticated;
grant all on public.simulacoes to service_role;
alter table public.simulacoes enable row level security;
create policy "Consulta de simulações" on public.simulacoes
for select to authenticated
using (usuario_id = auth.uid() or public.pode_gerenciar_regras(auth.uid()));
create policy "Gravar simulação própria" on public.simulacoes
for insert to authenticated
with check (usuario_id = auth.uid() and public.tem_acesso(auth.uid()));

grant select, insert on public.itens_simulacao to authenticated;
grant all on public.itens_simulacao to service_role;
alter table public.itens_simulacao enable row level security;
create policy "Consulta de itens" on public.itens_simulacao
for select to authenticated
using (exists (select 1 from public.simulacoes s where s.id = simulacao_id
               and (s.usuario_id = auth.uid() or public.pode_gerenciar_regras(auth.uid()))));
create policy "Gravar itens da própria simulação" on public.itens_simulacao
for insert to authenticated
with check (exists (select 1 from public.simulacoes s where s.id = simulacao_id and s.usuario_id = auth.uid()));

grant select, insert on public.snapshot_regras to authenticated;
grant all on public.snapshot_regras to service_role;
alter table public.snapshot_regras enable row level security;
create policy "Consulta de snapshots" on public.snapshot_regras
for select to authenticated
using (exists (select 1 from public.simulacoes s where s.id = simulacao_id
               and (s.usuario_id = auth.uid() or public.pode_gerenciar_regras(auth.uid()))));
create policy "Gravar snapshot da própria simulação" on public.snapshot_regras
for insert to authenticated
with check (exists (select 1 from public.simulacoes s where s.id = simulacao_id and s.usuario_id = auth.uid()));
