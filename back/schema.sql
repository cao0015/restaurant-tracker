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

-- 任何人可删除（可按需改为仅限认证用户）
create policy "public delete"
  on restaurants for delete
  using (true);
