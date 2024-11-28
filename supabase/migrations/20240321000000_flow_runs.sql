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

-- Create indexes
create index idx_flow_runs_user_id on public.flow_runs(user_id);
create index idx_flow_run_test_cases_flow_run_id on public.flow_run_test_cases(flow_run_id);
create index idx_flow_run_test_cases_test_case_id on public.flow_run_test_cases(test_case_id);

-- Add RLS policies
alter table public.flow_runs enable row level security;
alter table public.flow_run_test_cases enable row level security;

-- Policies for flow runs
create policy "Users can view their own flow runs"
    on public.flow_runs for select
    using (auth.uid() = user_id);

create policy "Users can create their own flow runs"
    on public.flow_runs for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own flow runs"
    on public.flow_runs for update
    using (auth.uid() = user_id);

create policy "Users can delete their own flow runs"
    on public.flow_runs for delete
    using (auth.uid() = user_id);

-- Policies for flow run test cases
create policy "Users can view test cases for their flow runs"
    on public.flow_run_test_cases for select
    using (exists (
        select 1 from public.flow_runs
        where id = flow_run_test_cases.flow_run_id
        and user_id = auth.uid()
    ));

create policy "Users can manage test cases for their flow runs"
    on public.flow_run_test_cases for all
    using (exists (
        select 1 from public.flow_runs
        where id = flow_run_test_cases.flow_run_id
        and user_id = auth.uid()
    ));

-- Add triggers for updating timestamps
create trigger handle_updated_at
    before update on public.flow_runs
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.flow_run_test_cases
    for each row
    execute function public.handle_updated_at();