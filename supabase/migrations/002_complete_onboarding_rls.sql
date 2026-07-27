-- FriendIA: onboarding defaults and RLS hardening
-- Run after 001_initial_schema.sql.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.default_preferred_name(
  user_email TEXT,
  metadata JSONB
)
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(metadata->>'full_name', ''),
    NULLIF(metadata->>'name', ''),
    NULLIF(split_part(user_email, '@', 1), ''),
    'Usuario'
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

UPDATE public.user_profiles
SET
  concerns = COALESCE(concerns, '{}'::TEXT[]),
  survey_completed = COALESCE(survey_completed, FALSE),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW());

ALTER TABLE public.user_profiles
  ALTER COLUMN concerns SET DEFAULT '{}'::TEXT[],
  ALTER COLUMN concerns SET NOT NULL,
  ALTER COLUMN survey_completed SET DEFAULT FALSE,
  ALTER COLUMN survey_completed SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL;

UPDATE public.user_settings
SET
  dark_mode = COALESCE(dark_mode, TRUE),
  font_size = COALESCE(font_size, 'Normal'),
  daily_checkin = COALESCE(daily_checkin, TRUE),
  reminder_time = COALESCE(reminder_time, '20:00'),
  save_chat_history = COALESCE(save_chat_history, TRUE),
  updated_at = COALESCE(updated_at, NOW());

ALTER TABLE public.user_settings
  ALTER COLUMN dark_mode SET DEFAULT TRUE,
  ALTER COLUMN dark_mode SET NOT NULL,
  ALTER COLUMN font_size SET DEFAULT 'Normal',
  ALTER COLUMN font_size SET NOT NULL,
  ALTER COLUMN daily_checkin SET DEFAULT TRUE,
  ALTER COLUMN daily_checkin SET NOT NULL,
  ALTER COLUMN reminder_time SET DEFAULT '20:00',
  ALTER COLUMN reminder_time SET NOT NULL,
  ALTER COLUMN save_chat_history SET DEFAULT TRUE,
  ALTER COLUMN save_chat_history SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.diary_entries
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.chat_messages
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL;

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, preferred_name, survey_completed)
  VALUES (
    NEW.id,
    public.default_preferred_name(NEW.email, NEW.raw_user_meta_data),
    FALSE
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    preferred_name = COALESCE(public.user_profiles.preferred_name, EXCLUDED.preferred_name),
    updated_at = NOW();

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.user_profiles (user_id, preferred_name, survey_completed)
SELECT
  id,
  public.default_preferred_name(email, raw_user_meta_data),
  FALSE
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_settings (user_id)
SELECT id
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;
REVOKE ALL ON TABLE
  public.user_profiles,
  public.diary_entries,
  public.user_settings,
  public.chat_messages
FROM anon;

GRANT SELECT, INSERT, UPDATE ON TABLE
  public.user_profiles,
  public.user_settings
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.diary_entries
TO authenticated;

GRANT SELECT, INSERT, DELETE ON TABLE
  public.chat_messages
TO authenticated;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_select_own_profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_profile" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_select_own_diary" ON public.diary_entries;
DROP POLICY IF EXISTS "users_insert_own_diary" ON public.diary_entries;
DROP POLICY IF EXISTS "users_update_own_diary" ON public.diary_entries;
DROP POLICY IF EXISTS "users_delete_own_diary" ON public.diary_entries;
CREATE POLICY "users_select_own_diary" ON public.diary_entries
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_diary" ON public.diary_entries
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_diary" ON public.diary_entries
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_diary" ON public.diary_entries
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_select_own_settings" ON public.user_settings;
DROP POLICY IF EXISTS "users_insert_own_settings" ON public.user_settings;
DROP POLICY IF EXISTS "users_update_own_settings" ON public.user_settings;
CREATE POLICY "users_select_own_settings" ON public.user_settings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_settings" ON public.user_settings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_settings" ON public.user_settings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_select_own_chat" ON public.chat_messages;
DROP POLICY IF EXISTS "users_insert_own_chat" ON public.chat_messages;
DROP POLICY IF EXISTS "users_delete_own_chat" ON public.chat_messages;
CREATE POLICY "users_select_own_chat" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_chat" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_chat" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
