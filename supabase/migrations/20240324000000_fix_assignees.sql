-- Drop existing foreign key constraints if they exist
alter table if exists public.test_cases
  drop constraint if exists test_cases_assignee_id_fkey;

alter table if exists public.test_suites
  drop constraint if exists test_suites_assignee_id_fkey;

alter table if exists public.flow_runs
  drop constraint if exists flow_runs_assignee_id_fkey;

-- Drop existing columns
alter table public.test_cases drop column if exists assignee_id;
alter table public.test_suites drop column if exists assignee_id;
alter table public.flow_runs drop column if exists assignee_id;

-- Add assignee columns with proper foreign key references
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

-- Update RLS policies to include assignee access
create policy "Assigned users can view test cases"
    on public.test_cases for select
    using (
        auth.uid() = user_id or 
        auth.uid() = assignee_id
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

-- Create or update the user profiles view
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