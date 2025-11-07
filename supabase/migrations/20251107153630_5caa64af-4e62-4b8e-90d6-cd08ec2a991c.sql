-- Create trigger for new user signup (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS policies are correct for daily_menus
-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can insert menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can update menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can delete menus" ON public.daily_menus;

-- Recreate with proper policies
CREATE POLICY "Admins can insert menus"
  ON public.daily_menus
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update menus"
  ON public.daily_menus
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete menus"
  ON public.daily_menus
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Ensure RLS policies are correct for tokens table
DROP POLICY IF EXISTS "Admins can update all tokens" ON public.tokens;

CREATE POLICY "Admins can update all tokens"
  ON public.tokens
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));