drop policy if exists "Users can delete own bills" on public.bills;

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

