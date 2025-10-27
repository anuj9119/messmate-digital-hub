-- Fix any existing test@gmail.com user to have admin role
-- and create the user in the profiles table if signup was attempted

-- First, remove any student role for test@gmail.com user
DELETE FROM public.user_roles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@gmail.com')
  AND role = 'student';

-- Then ensure admin role exists for test@gmail.com user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'test@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;