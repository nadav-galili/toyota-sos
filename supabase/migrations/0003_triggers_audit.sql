-- Task 3.3: Audit logging trigger for task changes
-- Creates a SECURITY DEFINER trigger function and AFTER triggers on tasks

create or replace function public.log_task_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_action text;
begin
  if TG_OP = 'INSERT' then
    v_action := 'created';
    insert into public.task_audit_log(task_id, actor_id, action, before_data, after_data)
    values (NEW.id, v_actor, v_action, null, to_jsonb(NEW));
    return NEW;
  elsif TG_OP = 'UPDATE' then
    if NEW.status is distinct from OLD.status then
      v_action := 'status_changed';
    else
      v_action := 'updated';
    end if;
    insert into public.task_audit_log(task_id, actor_id, action, before_data, after_data)
    values (NEW.id, v_actor, v_action, to_jsonb(OLD), to_jsonb(NEW));
    return NEW;
  elsif TG_OP = 'DELETE' then
    v_action := 'deleted';
    insert into public.task_audit_log(task_id, actor_id, action, before_data, after_data)
    values (OLD.id, v_actor, v_action, to_jsonb(OLD), null);
    return OLD;
  end if;
  return null;
end;
$$;

-- Drop existing triggers if re-running
drop trigger if exists tasks_audit_insert on public.tasks;
drop trigger if exists tasks_audit_update on public.tasks;
drop trigger if exists tasks_audit_delete on public.tasks;

create trigger tasks_audit_insert
after insert on public.tasks
for each row execute function public.log_task_audit();

create trigger tasks_audit_update
after update on public.tasks
for each row execute function public.log_task_audit();

create trigger tasks_audit_delete
after delete on public.tasks
for each row execute function public.log_task_audit();


