do $$
declare
  v_user_id uuid;
  v_month_nov_id uuid;
  v_month_dec_id uuid;
  v_month_jan_id uuid;
begin
  select id into v_user_id
  from auth.users
  where email = 'estasicki@dev.com';

  if v_user_id is null then
    raise exception 'User estasicki@dev.com not found. Please create the user first.';
  end if;

  insert into public.months (id, user_id, date, notes)
  values
    (gen_random_uuid(), v_user_id, '2024-11-01'::date, 'Listopad 2024'),
    (gen_random_uuid(), v_user_id, '2024-12-01'::date, 'Grudzień 2024'),
    (gen_random_uuid(), v_user_id, '2025-01-01'::date, 'Styczeń 2025')
  on conflict (user_id, date) do nothing
  returning id into v_month_nov_id;

  select id into v_month_nov_id from public.months where user_id = v_user_id and date = '2024-11-01'::date;
  select id into v_month_dec_id from public.months where user_id = v_user_id and date = '2024-12-01'::date;
  select id into v_month_jan_id from public.months where user_id = v_user_id and date = '2025-01-01'::date;

  if v_month_nov_id is not null then
    insert into public.bills (month_id, name, amount, category_id, comment)
    values
      (v_month_nov_id, 'Prąd', 250.00, 'electricity', 'Rachunek za listopad'),
      (v_month_nov_id, 'Woda', 120.50, 'water', null),
      (v_month_nov_id, 'Gaz', 180.00, 'gas', null),
      (v_month_nov_id, 'Internet', 79.99, 'internet', 'Abonament miesięczny'),
      (v_month_nov_id, 'Śmieci', 45.00, 'trash', null)
    on conflict do nothing;
  end if;

  if v_month_dec_id is not null then
    insert into public.bills (month_id, name, amount, category_id, comment)
    values
      (v_month_dec_id, 'Prąd', 280.00, 'electricity', 'Rachunek za grudzień'),
      (v_month_dec_id, 'Woda', 125.00, 'water', null),
      (v_month_dec_id, 'Gaz', 195.50, 'gas', null),
      (v_month_dec_id, 'Internet', 79.99, 'internet', 'Abonament miesięczny'),
      (v_month_dec_id, 'Ogrzewanie', 350.00, 'heating', 'Sezon grzewczy'),
      (v_month_dec_id, 'Ubezpieczenie', 150.00, 'insurance', 'Miesięczna rata')
    on conflict do nothing;
  end if;

  if v_month_jan_id is not null then
    insert into public.bills (month_id, name, amount, category_id, comment)
    values
      (v_month_jan_id, 'Prąd', 265.00, 'electricity', 'Rachunek za styczeń'),
      (v_month_jan_id, 'Woda', 118.00, 'water', null),
      (v_month_jan_id, 'Gaz', 175.00, 'gas', null),
      (v_month_jan_id, 'Internet', 79.99, 'internet', 'Abonament miesięczny'),
      (v_month_jan_id, 'Ogrzewanie', 320.00, 'heating', 'Sezon grzewczy')
    on conflict do nothing;
  end if;

  raise notice 'Demo data inserted successfully for user estasicki@dev.com';
end $$;

