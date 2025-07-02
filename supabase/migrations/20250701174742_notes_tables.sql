CREATE TABLE
  IF NOT EXISTS notes (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    author text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT notes_pkey PRIMARY KEY (id)
  )
WITH
  (OIDS = FALSE);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;