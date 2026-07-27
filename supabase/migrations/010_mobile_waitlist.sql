-- Lista pública de personas que desean recibir el aviso de lanzamiento móvil.
-- Solo permite inserciones anónimas; la lista no puede leerse desde el frontend.

CREATE TABLE IF NOT EXISTS public.mobile_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'landing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  CONSTRAINT mobile_waitlist_email_normalized
    CHECK (email = lower(trim(email))),
  CONSTRAINT mobile_waitlist_email_length
    CHECK (char_length(email) BETWEEN 3 AND 320),
  CONSTRAINT mobile_waitlist_email_unique UNIQUE (email)
);

ALTER TABLE public.mobile_waitlist ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.mobile_waitlist FROM anon, authenticated;
GRANT INSERT ON TABLE public.mobile_waitlist TO anon, authenticated;

DROP POLICY IF EXISTS "Cualquiera puede registrarse para el lanzamiento"
  ON public.mobile_waitlist;

CREATE POLICY "Cualquiera puede registrarse para el lanzamiento"
  ON public.mobile_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    source = 'landing'
    AND email = lower(trim(email))
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  );

COMMENT ON TABLE public.mobile_waitlist IS
  'Correos que solicitaron recibir el aviso de lanzamiento de FriendIA móvil.';

NOTIFY pgrst, 'reload schema';
