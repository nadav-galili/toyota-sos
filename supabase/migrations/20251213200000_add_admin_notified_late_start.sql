-- Add column to track if admin was notified about late start
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS admin_notified_late_start BOOLEAN NOT NULL DEFAULT FALSE;

