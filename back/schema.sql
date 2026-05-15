-- 餐厅记录表
create table if not exists restaurants (
  id           bigserial primary key,
  name         text        not null,
  city         text        not null,
  address      text        default '',
  cuisine_type text        not null,
  rating       smallint    not null check (rating between 1 and 5),
  visited_date date        not null,
  notes        text        default '',
  avg_cost     integer     default null,
  poi_id       text        default null,
  created_at   timestamptz default now()
);

-- 开启行级安全策略
alter table restaurants enable row level security;

-- 任何人可读
create policy "public read"
  on restaurants for select
  using (true);

-- 任何人可写（匿名上传）
create policy "public insert"
  on restaurants for insert
  with check (true);

-- 任何人可更新
create policy "public update"
  on restaurants for update
  using (true)
  with check (true);

-- 任何人可删除（可按需改为仅限认证用户）
create policy "public delete"
  on restaurants for delete
  using (true);

-- restaurant messages board (one-to-many: restaurant -> messages)
create table if not exists restaurant_messages (
  id            bigserial primary key,
  restaurant_id bigint      not null references restaurants(id) on delete cascade,
  author        text        not null check (length(trim(author)) > 0),
  content       text        not null check (length(trim(content)) > 0),
  created_at    timestamptz default now()
);

create index if not exists idx_restaurant_messages_restaurant_id_created_at
  on restaurant_messages (restaurant_id, created_at desc);

alter table restaurant_messages enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'restaurant_messages'
      and policyname = 'public read messages'
  ) then
    create policy "public read messages"
      on restaurant_messages for select
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'restaurant_messages'
      and policyname = 'public insert messages'
  ) then
    create policy "public insert messages"
      on restaurant_messages for insert
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'restaurant_messages'
      and policyname = 'public delete messages'
  ) then
    create policy "public delete messages"
      on restaurant_messages for delete
      using (true);
  end if;
end
$$;
