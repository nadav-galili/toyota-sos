-- Migration: Add phone column to task_stops table
-- This allows storing phone number per stop, which can be different from the client's phone

ALTER TABLE public.task_stops
ADD COLUMN IF NOT EXISTS phone text;

-- Add comment to document the column
COMMENT ON COLUMN public.task_stops.phone IS 'Phone number for this stop. Can be different from the client''s phone. Required for multi-stop tasks.';

