ALTER TABLE public.roster_students ADD COLUMN IF NOT EXISTS pin text;
UPDATE public.roster_students SET pin = lpad((floor(random()*10000))::int::text, 4, '0') WHERE pin IS NULL;
ALTER TABLE public.roster_students ALTER COLUMN pin SET NOT NULL;