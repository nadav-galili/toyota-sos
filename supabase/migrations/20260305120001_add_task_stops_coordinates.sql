
-- Migration: Add coordinates and distance to task_stops
ALTER TABLE task_stops
ADD COLUMN IF NOT EXISTS lat float,
ADD COLUMN IF NOT EXISTS lng float,
ADD COLUMN IF NOT EXISTS distance_from_garage float;

