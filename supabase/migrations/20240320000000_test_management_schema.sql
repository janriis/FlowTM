-- Drop existing tables if they exist
drop table if exists public.test_steps;
drop table if exists public.suite_test_cases;
drop table if exists public.test_cases;
drop table if exists public.test_suites;

-- Create test suites table
create table public.test_suites (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    user_id uuid references auth.users not null,
    labels text[] default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create test cases table
create table public.test_cases (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    status text check (status in ('no_run', 'pending', 'passed', 'failed')) default 'no_run',
    priority text check (priority in ('high', 'medium', 'low')) default 'medium',
    due_date date,
    labels text[] default array[]::text[],
    user_id uuid references auth.users not null,
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

-- Create indexes
create index idx_test_suites_user_id on public.test_suites(user_id);
create index idx_test_cases_user_id on public.test_cases(user_id);
create index idx_suite_test_cases_suite_id on public.suite_test_cases(suite_id);
create index idx_suite_test_cases_test_case_id on public.suite_test_cases(test_case_id);
create index idx_test_steps_test_case_id on public.test_steps(test_case_id);

-- Add RLS policies
alter table public.test_suites enable row level security;
alter table public.test_cases enable row level security;
alter table public.suite_test_cases enable row level security;
alter table public.test_steps enable row level security;

-- Policies for test suites
create policy "Users can view their own test suites"
    on public.test_suites for select
    using (auth.uid() = user_id);

create policy "Users can create their own test suites"
    on public.test_suites for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own test suites"
    on public.test_suites for update
    using (auth.uid() = user_id);

create policy "Users can delete their own test suites"
    on public.test_suites for delete
    using (auth.uid() = user_id);

-- Policies for test cases
create policy "Users can view their own test cases"
    on public.test_cases for select
    using (auth.uid() = user_id);

create policy "Users can create their own test cases"
    on public.test_cases for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own test cases"
    on public.test_cases for update
    using (auth.uid() = user_id);

create policy "Users can delete their own test cases"
    on public.test_cases for delete
    using (auth.uid() = user_id);

-- Policies for suite test cases
create policy "Users can view suite test cases for their suites"
    on public.suite_test_cases for select
    using (exists (
        select 1 from public.test_suites
        where id = suite_test_cases.suite_id
        and user_id = auth.uid()
    ));

create policy "Users can manage suite test cases for their suites"
    on public.suite_test_cases for all
    using (exists (
        select 1 from public.test_suites
        where id = suite_test_cases.suite_id
        and user_id = auth.uid()
    ));

-- Policies for test steps
create policy "Users can view test steps for their test cases"
    on public.test_steps for select
    using (exists (
        select 1 from public.test_cases
        where id = test_steps.test_case_id
        and user_id = auth.uid()
    ));

create policy "Users can manage test steps for their test cases"
    on public.test_steps for all
    using (exists (
        select 1 from public.test_cases
        where id = test_steps.test_case_id
        and user_id = auth.uid()
    ));

-- Create functions for updating timestamps
create or replace function public.handle_updated_at()
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
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.test_cases
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.test_steps
    for each row
    execute function public.handle_updated_at();