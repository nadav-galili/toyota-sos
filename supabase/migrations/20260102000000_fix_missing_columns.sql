-- Migration: Add missing columns and updated_at triggers identified during infrastructure transfer
-- These columns and triggers were missing from the initial schema but are required by the application code or for consistency.

-- 1. Fix 'tasks' table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS advisor_color public.advisor_color,
ADD COLUMN IF NOT EXISTS distance_from_garage NUMERIC;

-- 2. Fix 'task_stops' table
ALTER TABLE public.task_stops 
ADD COLUMN IF NOT EXISTS advisor_color public.advisor_color;

-- 3. Fix 'vehicles' table
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS unavailability_reason TEXT;

-- 4. Fix 'clients' table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Fix 'notifications' table
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. Add triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vehicles trigger
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Clients trigger
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tasks trigger
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profiles trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notifications trigger
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Add an index for performance on soft-deleted queries
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON public.tasks (deleted_at) WHERE deleted_at IS NULL;
