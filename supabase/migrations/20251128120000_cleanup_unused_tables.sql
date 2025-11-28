-- Drop images table
DROP POLICY IF EXISTS images_select_role_based ON public.images;
DROP POLICY IF EXISTS images_driver_insert_own ON public.images;
DROP POLICY IF EXISTS images_driver_update_own ON public.images;
DROP TABLE IF EXISTS public.images;

-- Drop notification_preferences table
DROP POLICY IF EXISTS notification_preferences_select_own ON public.notification_preferences;
DROP POLICY IF EXISTS notification_preferences_insert_own ON public.notification_preferences;
DROP TABLE IF EXISTS public.notification_preferences;

-- Drop vin column from vehicles
ALTER TABLE public.vehicles DROP COLUMN IF EXISTS vin;

