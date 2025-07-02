CREATE TABLE
  IF NOT EXISTS public.customers (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    name text NOT NULL,
    vrc_id text NULL,
    note text NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT customers_cid_key UNIQUE (id),
    CONSTRAINT customers_pkey PRIMARY KEY (id)
  )
WITH
  (OIDS = FALSE);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;