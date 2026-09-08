-- 1. Create members table
create table if not exists public.members (
  line_uid text primary key,
  display_name text,
  picture_url text,
  preferences jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Set permissions (Row Level Security - optional but good practice)
-- If you want anyone to insert (from your API) but not read, or you just manage via Service Key
alter table public.members enable row level security;

create policy "Enable insert for all users" on public.members
  for insert with check (true);

create policy "Enable select for all users" on public.members
  for select using (true);
  
create policy "Enable update for all users" on public.members
  for update using (true);
