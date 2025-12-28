-- Migration: Add phone column to tasks table
-- This allows storing phone number per task for regular (non-multi-stop) tasks

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS phone text;

COMMENT ON COLUMN public.tasks.phone IS 'Phone number for regular (non-multi-stop) tasks. Can be different from the client''s phone.';