-- Remove college-based isolation and fix RLS policies

-- First, update the handle_new_user function to not use college
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
BEGIN
  -- Get role from metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  
  -- Insert profile without college
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign the appropriate role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role::app_role);
  
  RETURN NEW;
END;
$function$;

-- Drop existing policies on daily_menus
DROP POLICY IF EXISTS "Users can view menus from their college" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can insert menus for their college" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can update menus for their college" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can delete menus for their college" ON public.daily_menus;

-- Create new policies for daily_menus without college
CREATE POLICY "All authenticated users can view menus"
ON public.daily_menus
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert menus"
ON public.daily_menus
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update menus"
ON public.daily_menus
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete menus"
ON public.daily_menus
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop existing policies on tokens
DROP POLICY IF EXISTS "Students can view their own tokens" ON public.tokens;
DROP POLICY IF EXISTS "Students can create their own tokens" ON public.tokens;
DROP POLICY IF EXISTS "Admins can view tokens from their college" ON public.tokens;
DROP POLICY IF EXISTS "Admins can update tokens from their college" ON public.tokens;

-- Create new policies for tokens without college
CREATE POLICY "Students can view their own tokens"
ON public.tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own tokens"
ON public.tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tokens"
ON public.tokens
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all tokens"
ON public.tokens
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Remove college columns (nullable first to avoid issues)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS college;
ALTER TABLE public.daily_menus DROP COLUMN IF EXISTS college;
ALTER TABLE public.tokens DROP COLUMN IF EXISTS college;