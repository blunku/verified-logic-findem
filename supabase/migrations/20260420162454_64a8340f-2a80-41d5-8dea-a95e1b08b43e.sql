ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS about text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS years_experience integer;