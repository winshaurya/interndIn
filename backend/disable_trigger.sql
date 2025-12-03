-- Temporarily disable the trigger to test registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
