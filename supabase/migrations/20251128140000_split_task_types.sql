-- Migration to split 'איסוף/הורדת רכב' into 'איסוף רכב/שינוע' and 'החזרת רכב/שינוע'

-- Add new values to enum (Hebrew)
-- Note: These must be committed before they can be used in an UPDATE statement in a subsequent migration.
ALTER TYPE task_type ADD VALUE IF NOT EXISTS 'איסוף רכב/שינוע';
ALTER TYPE task_type ADD VALUE IF NOT EXISTS 'החזרת רכב/שינוע';
