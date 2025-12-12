create table public.months (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

create table public.bills (
  id uuid primary key default gen_random_uuid(),
  month_id uuid references public.months on delete cascade not null,
  name text not null,
  amount numeric(10, 2),
  category_id text,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.months enable row level security;
alter table public.bills enable row level security;

create policy "Users can view own months"
  on public.months
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own months"
  on public.months
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own months"
  on public.months
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own months"
  on public.months
  for delete
  using (auth.uid() = user_id);

create policy "Users can view own bills"
  on public.bills
  for select
  using (
    exists (
      select 1 from public.months
      where months.id = bills.month_id
      and months.user_id = auth.uid()
    )
  );

create policy "Users can insert own bills"
  on public.bills
  for insert
  with check (
    exists (
      select 1 from public.months
      where months.id = bills.month_id
      and months.user_id = auth.uid()
    )
  );

create policy "Users can update own bills"
  on public.bills
  for update
  using (
    exists (
      select 1 from public.months
      where months.id = bills.month_id
      and months.user_id = auth.uid()
    )
  );

create policy "Users can delete own bills"
  on public.bills
  for delete
  using (
    exists (
      select 1 from public.months
      where months.id = bills.month_id
      and months.user_id = auth.uid()
    )
  );

create trigger set_months_updated_at
  before update on public.months
  for each row execute procedure public.handle_updated_at();

create trigger set_bills_updated_at
  before update on public.bills
  for each row execute procedure public.handle_updated_at();

create index months_user_id_idx on public.months(user_id);
create index months_date_idx on public.months(date);
create index bills_month_id_idx on public.bills(month_id);
create index bills_category_id_idx on public.bills(category_id);

