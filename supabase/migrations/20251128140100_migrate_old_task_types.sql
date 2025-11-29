-- Migrate existing tasks from old 'pickup_or_dropoff_car' (Hebrew label) to new 'vehicle_pickup_transport' (Hebrew label)
-- This runs in a separate migration to ensure the new enum values are committed and available.

UPDATE public.tasks
SET type = 'איסוף רכב/שינוע'
WHERE type::text = 'איסוף/הורדת רכב';

