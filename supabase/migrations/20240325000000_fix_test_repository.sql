-- Drop and recreate the test_cases table with proper structure
drop table if exists public.test_cases cascade;

create table public.test_cases (
    id uuid default gen_random_uuid() primary key,
    display_id text unique,
    title text not null,
    description text,
    status text check (status in ('no_run', 'pending', 'passed', 'failed')) default 'no_run',
    priority text check (priority in ('high', 'medium', 'low')) default 'medium',
    labels text[] default array[]::text[],
    user_id uuid references auth.users not null,
    assignee_id uuid references auth.users,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recreate indexes
create index idx_test_cases_user_id on public.test_cases(user_id);
create index idx_test_cases_assignee_id on public.test_cases(assignee_id);

-- Update RLS policies
drop policy if exists "Users can view their own test cases" on public.test_cases;
drop policy if exists "Users can create their own test cases" on public.test_cases;
drop policy if exists "Users can update their own test cases" on public.test_cases;
drop policy if exists "Users can delete their own test cases" on public.test_cases;
drop policy if exists "Assigned users can view test cases" on public.test_cases;
drop policy if exists "Assigned users can update test cases" on public.test_cases;

create policy "Users can view test cases"
    on public.test_cases for select
    using (auth.uid() = user_id or auth.uid() = assignee_id);

create policy "Users can create test cases"
    on public.test_cases for insert
    with check (auth.uid() = user_id);

create policy "Users can update test cases"
    on public.test_cases for update
    using (auth.uid() = user_id or auth.uid() = assignee_id);

create policy "Users can delete test cases"
    on public.test_cases for delete
    using (auth.uid() = user_id);

-- Recreate the display_id trigger
create or replace function generate_test_case_id()
returns trigger as $$
begin
    new.display_id := 'TC-' || lpad(nextval('test_case_id_seq')::text, 3, '0');
    return new;
end;
$$ language plpgsql;

create trigger set_test_case_display_id
    before insert on public.test_cases
    for each row
    execute function generate_test_case_id();

-- Create updated_at trigger
create trigger handle_updated_at
    before update on public.test_cases
    for each row
    execute function handle_updated_at();