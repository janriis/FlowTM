-- Drop existing tables if they exist
drop table if exists public.flow_run_test_cases;
drop table if exists public.flow_runs;
drop table if exists public.test_steps;
drop table if exists public.suite_test_cases;
drop table if exists public.test_cases;
drop table if exists public.test_suites;

-- Create test suites table
create table public.test_suites (
    id uuid default gen_random_uuid() primary key,
    display_id text unique,
    name text not null,
    user_id uuid references auth.users not null,
    assignee_id uuid references auth.users,
    labels text[] default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create test cases table
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

-- Create junction table for test suites and test cases
create table public.suite_test_cases (
    id uuid default gen_random_uuid() primary key,
    suite_id uuid references public.test_suites on delete cascade not null,
    test_case_id uuid references public.test_cases on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(suite_id, test_case_id)
);

-- Create test steps table
create table public.test_steps (
    id uuid default gen_random_uuid() primary key,
    description text not null,
    expected_result text not null,
    actual_result text,
    status text check (status in ('pending', 'passed', 'failed')) default 'pending',
    test_case_id uuid references public.test_cases on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create flow runs table
create table public.flow_runs (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text not null,
    status text check (status in ('draft', 'in_progress', 'completed', 'archived')) default 'draft',
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    labels text[] default array[]::text[],
    user_id uuid references auth.users not null,
    assignee_id uuid references auth.users,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create flow run test cases table
create table public.flow_run_test_cases (
    id uuid default gen_random_uuid() primary key,
    flow_run_id uuid references public.flow_runs on delete cascade not null,
    test_case_id uuid references public.test_cases on delete cascade not null,
    status text check (status in ('no_run', 'pending', 'passed', 'failed')) default 'no_run',
    notes text default '',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(flow_run_id, test_case_id)
);

-- Create sequences for display IDs
create sequence if not exists test_suite_id_seq;
create sequence if not exists test_case_id_seq;

-- Create functions for generating display IDs
create or replace function generate_test_suite_id()
returns trigger as $$
begin
    new.display_id := 'TS-' || lpad(nextval('test_suite_id_seq')::text, 3, '0');
    return new;
end;
$$ language plpgsql;

create or replace function generate_test_case_id()
returns trigger as $$
begin
    new.display_id := 'TC-' || lpad(nextval('test_case_id_seq')::text, 3, '0');
    return new;
end;
$$ language plpgsql;

-- Create triggers for automatic display ID generation
create trigger set_test_suite_display_id
    before insert on public.test_suites
    for each row
    execute function generate_test_suite_id();

create trigger set_test_case_display_id
    before insert on public.test_cases
    for each row
    execute function generate_test_case_id();

-- Create function for updating timestamps
create or replace function handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updating timestamps
create trigger handle_updated_at
    before update on public.test_suites
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at
    before update on public.test_cases
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at
    before update on public.test_steps
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at
    before update on public.flow_runs
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at
    before update on public.flow_run_test_cases
    for each row
    execute function handle_updated_at();

-- Create indexes
create index idx_test_suites_user_id on public.test_suites(user_id);
create index idx_test_suites_assignee_id on public.test_suites(assignee_id);
create index idx_test_cases_user_id on public.test_cases(user_id);
create index idx_test_cases_assignee_id on public.test_cases(assignee_id);
create index idx_flow_runs_user_id on public.flow_runs(user_id);
create index idx_flow_runs_assignee_id on public.flow_runs(assignee_id);
create index idx_suite_test_cases_suite_id on public.suite_test_cases(suite_id);
create index idx_suite_test_cases_test_case_id on public.suite_test_cases(test_case_id);
create index idx_test_steps_test_case_id on public.test_steps(test_case_id);
create index idx_flow_run_test_cases_flow_run_id on public.flow_run_test_cases(flow_run_id);
create index idx_flow_run_test_cases_test_case_id on public.flow_run_test_cases(test_case_id);

-- Add RLS policies
alter table public.test_suites enable row level security;
alter table public.test_cases enable row level security;
alter table public.suite_test_cases enable row level security;
alter table public.test_steps enable row level security;
alter table public.flow_runs enable row level security;
alter table public.flow_run_test_cases enable row level security;

-- Policies for test suites
create policy "Users can view test suites"
    on public.test_suites for select
    using (auth.uid() = user_id or auth.uid() = assignee_id);

create policy "Users can create test suites"
    on public.test_suites for insert
    with check (auth.uid() = user_id);

create policy "Users can update test suites"
    on public.test_suites for update
    using (auth.uid() = user_id or auth.uid() = assignee_id);

create policy "Users can delete test suites"
    on public.test_suites for delete
    using (auth.uid() = user_id);

-- Policies for test cases
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

-- Policies for suite test cases
create policy "Users can view suite test cases"
    on public.suite_test_cases for select
    using (exists (
        select 1 from public.test_suites
        where id = suite_test_cases.suite_id
        and (user_id = auth.uid() or assignee_id = auth.uid())
    ));

create policy "Users can manage suite test cases"
    on public.suite_test_cases for all
    using (exists (
        select 1 from public.test_suites
        where id = suite_test_cases.suite_id
        and (user_id = auth.uid() or assignee_id = auth.uid())
    ));

-- Policies for test steps
create policy "Users can view test steps"
    on public.test_steps for select
    using (exists (
        select 1 from public.test_cases
        where id = test_steps.test_case_id
        and (user_id = auth.uid() or assignee_id = auth.uid())
    ));

create policy "Users can manage test steps"
    on public.test_steps for all
    using (exists (
        select 1 from public.test_cases
        where id = test_steps.test_case_id
        and (user_id = auth.uid() or assignee_id = auth.uid())
    ));

-- Policies for flow runs
create policy "Users can view flow runs"
    on public.flow_runs for select
    using (auth.uid() = user_id or auth.uid() = assignee_id);

create policy "Users can create flow runs"
    on public.flow_runs for insert
    with check (auth.uid() = user_id);

create policy "Users can update flow runs"
    on public.flow_runs for update
    using (auth.uid() = user_id or auth.uid() = assignee_id);

create policy "Users can delete flow runs"
    on public.flow_runs for delete
    using (auth.uid() = user_id);

-- Policies for flow run test cases
create policy "Users can view flow run test cases"
    on public.flow_run_test_cases for select
    using (exists (
        select 1 from public.flow_runs
        where id = flow_run_test_cases.flow_run_id
        and (user_id = auth.uid() or assignee_id = auth.uid())
    ));

create policy "Users can manage flow run test cases"
    on public.flow_run_test_cases for all
    using (exists (
        select 1 from public.flow_runs
        where id = flow_run_test_cases.flow_run_id
        and (user_id = auth.uid() or assignee_id = auth.uid())
    ));

-- Create user profiles view
create or replace view public.user_profiles as
select 
    id,
    email,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'avatar_url' as avatar_url
from auth.users;

-- Grant access to the view
grant select on public.user_profiles to authenticated;

-- Add comment to explain the view
comment on view public.user_profiles is 'Public view of user profiles with basic information';