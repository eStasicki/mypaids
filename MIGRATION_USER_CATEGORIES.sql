create table public.user_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  icon text not null,
  color text not null default '#6b7280',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name)
);

alter table public.user_categories enable row level security;

create policy "Users can view own categories"
  on public.user_categories
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.user_categories
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.user_categories
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.user_categories
  for delete
  using (auth.uid() = user_id);

create trigger set_user_categories_updated_at
  before update on public.user_categories
  for each row execute procedure public.handle_updated_at();

create index user_categories_user_id_idx on public.user_categories(user_id);
create index user_categories_name_idx on public.user_categories(name);

