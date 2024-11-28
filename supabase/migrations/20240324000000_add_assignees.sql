-- Drop existing policies first to avoid conflicts
drop policy if exists "Assigned users can view test cases" on public.test_cases;
drop policy if exists "Assigned users can update test cases" on public.test_cases;
drop policy if exists "Assigned users can view test suites" on public.test_suites;
drop policy if exists "Assigned users can update test suites" on public.test_suites;
drop policy if exists "Assigned users can view flow runs" on public.flow_runs;
drop policy if exists "Assigned users can update flow runs" on public.flow_runs;

-- Drop existing columns if they exist
alter table public.test_cases drop column if exists assignee_id;
alter table public.test_suites drop column if exists assignee_id;
alter table public.flow_runs drop column if exists assignee_id;

-- Add assignee columns to existing tables with proper foreign key references
alter table public.test_cases
add column assignee_id uuid references auth.users(id) on delete set null;

alter table public.test_suites 
add column assignee_id uuid references auth.users(id) on delete set null;

alter table public.flow_runs
add column assignee_id uuid references auth.users(id) on delete set null;

-- Create indexes for better query performance
create index if not exists idx_test_cases_assignee_id on public.test_cases(assignee_id);
create index if not exists idx_test_suites_assignee_id on public.test_suites(assignee_id);
create index if not exists idx_flow_runs_assignee_id on public.flow_runs(assignee_id);

-- Update RLS policies to allow assigned users to view and update
create policy "Assigned users can view test cases"
    on public.test_cases for select
    using (
        auth.uid() = user_id or 
        auth.uid() = assignee_id or
        exists (
            select 1 from public.test_suites ts
            inner join public.suite_test_cases stc on ts.id = stc.suite_id
            where stc.test_case_id = test_cases.id
            and (ts.user_id = auth.uid() or ts.assignee_id = auth.uid())
        )
    );

create policy "Assigned users can update test cases"
    on public.test_cases for update
    using (auth.uid() = user_id or auth.uid() = assignee_id);

create policy "Assigned users can view test suites"
    on public.test_suites for select
    using (auth.uid() = user_id or auth.uid() = assignee_id);

create policy "Assigned users can update test suites"
    on public.test_suites for update
    using (auth.uid() = user_id or auth.uid() = assignee_id);

create policy "Assigned users can view flow runs"
    on public.flow_runs for select
    using (auth.uid() = user_id or auth.uid() = assignee_id);

create policy "Assigned users can update flow runs"
    on public.flow_runs for update
    using (auth.uid() = user_id or auth.uid() = assignee_id);

-- Create a view for user profiles to get basic user info
drop view if exists public.user_profiles;
create view public.user_profiles as
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