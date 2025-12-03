-- Fix the database trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  determined_role user_role;
  user_full_name TEXT;
  role_text TEXT;
BEGIN
  -- Determine role from metadata
  role_text := COALESCE(
    new.raw_user_meta_data->>'role',
    new.user_metadata->>'role',
    'student'
  );

  -- Safely cast role to enum
  IF role_text = 'alumni' THEN
    determined_role := 'alumni'::user_role;
  ELSE
    determined_role := 'student'::user_role;
  END IF;

  -- Build full name from available data
  user_full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    TRIM(CONCAT(
      COALESCE(new.raw_user_meta_data->>'first_name', ''),
      ' ',
      COALESCE(new.raw_user_meta_data->>'last_name', '')
    )),
    new.email
  );

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (new.id, new.email, user_full_name,
          COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
          determined_role);

  -- Insert role-specific details
  IF determined_role = 'student' THEN
    INSERT INTO public.student_details (id) VALUES (new.id);
  ELSIF determined_role = 'alumni' THEN
    INSERT INTO public.alumni_details (id) VALUES (new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
