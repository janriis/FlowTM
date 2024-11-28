-- Add display_id columns
alter table public.test_suites 
add column display_id text unique;

alter table public.test_cases 
add column display_id text unique;

-- Create sequence for test suite IDs
create sequence test_suite_id_seq;

-- Create sequence for test case IDs
create sequence test_case_id_seq;

-- Create function to generate test suite ID
create or replace function generate_test_suite_id()
returns trigger as $$
begin
  new.display_id := 'TS-' || lpad(nextval('test_suite_id_seq')::text, 3, '0');
  return new;
end;
$$ language plpgsql;

-- Create function to generate test case ID
create or replace function generate_test_case_id()
returns trigger as $$
begin
  new.display_id := 'TC-' || lpad(nextval('test_case_id_seq')::text, 3, '0');
  return new;
end;
$$ language plpgsql;

-- Create triggers to automatically generate IDs
create trigger set_test_suite_id
  before insert on public.test_suites
  for each row
  execute function generate_test_suite_id();

create trigger set_test_case_id
  before insert on public.test_cases
  for each row
  execute function generate_test_case_id();