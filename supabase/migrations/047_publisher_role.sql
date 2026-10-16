-- ============================================================
-- 047_publisher_role.sql — Publisher role for centralized user creation
--
-- 1. Adds `publisher BOOLEAN NOT NULL DEFAULT false` to `public.profiles`.
-- 2. Grants `publisher = true` to `hola@growthmachine.lat`.
-- 3. Updates `public.handle_new_user()` so newly created users retain the
--    account/profile bootstrap from 017_account_sharing.sql while automatically
--    setting `publisher = true` when `lower(NEW.email) = 'hola@growthmachine.lat'`.
-- 4. Updates `public.enforce_profile_privilege_columns()` from
--    034_fix_profiles_update_rls.sql so browser clients (`authenticated`)
--    cannot self-promote `publisher`.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS publisher BOOLEAN NOT NULL DEFAULT false;

UPDATE public.profiles
SET publisher = true
WHERE lower(email) = 'hola@growthmachine.lat';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_account_id UUID;
  v_is_publisher BOOLEAN;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  v_is_publisher := (lower(COALESCE(NEW.email, '')) = 'hola@growthmachine.lat');

  INSERT INTO public.accounts (name, owner_user_id)
  VALUES (COALESCE(NULLIF(v_full_name, ''), NEW.email, 'My account'), NEW.id)
  RETURNING id INTO v_account_id;

  INSERT INTO public.profiles (user_id, full_name, email, account_id, account_role, publisher)
  VALUES (NEW.id, v_full_name, NEW.email, v_account_id, 'owner', v_is_publisher);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to bootstrap account/profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.enforce_profile_privilege_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.account_role IS DISTINCT FROM OLD.account_role
      OR NEW.account_id IS DISTINCT FROM OLD.account_id
      OR NEW.publisher IS DISTINCT FROM OLD.publisher)
     AND current_user = 'authenticated'
  THEN
    RAISE EXCEPTION
      'account_role, account_id, and publisher cannot be changed directly; use the account member/invitation RPCs'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.enforce_profile_privilege_columns() OWNER TO postgres;

DROP TRIGGER IF EXISTS enforce_profile_privilege_columns ON public.profiles;
CREATE TRIGGER enforce_profile_privilege_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_privilege_columns();
