-- Migration: Sync vehicle availability based on task lifecycle
-- Automates setting vehicles as 'At Customer' when picked up and 'Available' when returned.

CREATE OR REPLACE FUNCTION public.sync_vehicle_availability()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- 1. Handle NEW task assignment (Insert or Update)
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        -- If it's a Pickup task and has a vehicle, mark vehicle as unavailable
        IF (NEW.type = 'איסוף רכב/שינוע' AND NEW.vehicle_id IS NOT NULL AND NEW.deleted_at IS NULL AND NEW.status != 'הושלמה') THEN
            UPDATE public.vehicles
            SET is_available = false,
                unavailability_reason = 'אצל לקוח',
                updated_at = now()
            WHERE id = NEW.vehicle_id;
        END IF;

        -- If it's a Return task and it's COMPLETED, mark vehicle as available
        IF (NEW.type = 'החזרת רכב/שינוע' AND NEW.vehicle_id IS NOT NULL AND NEW.status = 'הושלמה' AND NEW.deleted_at IS NULL) THEN
            UPDATE public.vehicles
            SET is_available = true,
                unavailability_reason = NULL,
                updated_at = now()
            WHERE id = NEW.vehicle_id;
        END IF;
    END IF;

    -- 2. Handle status changes or deletions that might release a vehicle
    IF (TG_OP = 'UPDATE') THEN
        -- If a task was 'איסוף רכב/שינוע' but is now deleted or type changed or cancelled
        IF (OLD.type = 'איסוף רכב/שינוע' AND OLD.vehicle_id IS NOT NULL AND 
            (NEW.deleted_at IS NOT NULL OR NEW.type != 'איסוף רכב/שינוע' OR NEW.status = 'הושלמה')) THEN
            
            -- Only release if no other active 'איסוף רכב/שינוע' tasks exist for this vehicle
            IF NOT EXISTS (
                SELECT 1 FROM public.tasks 
                WHERE vehicle_id = OLD.vehicle_id 
                AND type = 'איסוף רכב/שינוע' 
                AND status != 'הושלמה' 
                AND deleted_at IS NULL 
                AND id != NEW.id
            ) THEN
                UPDATE public.vehicles
                SET is_available = true,
                    unavailability_reason = NULL,
                    updated_at = now()
                WHERE id = OLD.vehicle_id
                AND unavailability_reason = 'אצל לקוח'; -- Only if we were the ones who set it
            END IF;
        END IF;
        
        -- Handle vehicle reassignment
        IF (OLD.vehicle_id IS NOT NULL AND OLD.vehicle_id != COALESCE(NEW.vehicle_id, '00000000-0000-0000-0000-000000000000'::uuid) AND OLD.type = 'איסוף רכב/שינוע') THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.tasks 
                WHERE vehicle_id = OLD.vehicle_id 
                AND type = 'איסוף רכב/שינוע' 
                AND status != 'הושלמה' 
                AND deleted_at IS NULL 
                AND id != NEW.id
            ) THEN
                UPDATE public.vehicles
                SET is_available = true,
                    unavailability_reason = NULL,
                    updated_at = now()
                WHERE id = OLD.vehicle_id
                AND unavailability_reason = 'אצל לקוח';
            END IF;
        END IF;
    END IF;

    -- 3. Handle Deletions (if hard delete was used, though app uses soft delete)
    IF (TG_OP = 'DELETE') THEN
        IF (OLD.type = 'איסוף רכב/שינוע' AND OLD.vehicle_id IS NOT NULL) THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.tasks 
                WHERE vehicle_id = OLD.vehicle_id 
                AND type = 'איסוף רכב/שינוע' 
                AND status != 'הושלמה' 
                AND deleted_at IS NULL
            ) THEN
                UPDATE public.vehicles
                SET is_available = true,
                    unavailability_reason = NULL,
                    updated_at = now()
                WHERE id = OLD.vehicle_id
                AND unavailability_reason = 'אצל לקוח';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_sync_vehicle_availability ON public.tasks;
CREATE TRIGGER trg_sync_vehicle_availability
AFTER INSERT OR UPDATE OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.sync_vehicle_availability();
