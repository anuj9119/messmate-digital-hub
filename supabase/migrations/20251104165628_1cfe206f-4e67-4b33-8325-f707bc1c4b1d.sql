-- Add college field to profiles table
ALTER TABLE public.profiles ADD COLUMN college TEXT NOT NULL DEFAULT 'default_college';

-- Add college field to daily_menus table
ALTER TABLE public.daily_menus ADD COLUMN college TEXT NOT NULL DEFAULT 'default_college';

-- Add college field to tokens table (to track which college the token belongs to)
ALTER TABLE public.tokens ADD COLUMN college TEXT;

-- Update the handle_new_user function to include college
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_role text;
  user_college text;
BEGIN
  -- Get college and role from metadata
  user_college := COALESCE(NEW.raw_user_meta_data->>'college', 'default_college');
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  
  -- Insert profile with college
  INSERT INTO public.profiles (id, full_name, college)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', user_college);
  
  -- Assign the appropriate role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role::app_role);
  
  RETURN NEW;
END;
$function$;

-- Update RLS policies for daily_menus to filter by college

-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can view menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can insert menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can update menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can delete menus" ON public.daily_menus;

-- Create new college-aware policies for daily_menus
CREATE POLICY "Users can view menus from their college"
ON public.daily_menus
FOR SELECT
USING (
  college = (SELECT college FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can insert menus for their college"
ON public.daily_menus
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND
  college = (SELECT college FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can update menus for their college"
ON public.daily_menus
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  college = (SELECT college FROM public.profiles WHERE id = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND
  college = (SELECT college FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can delete menus for their college"
ON public.daily_menus
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  college = (SELECT college FROM public.profiles WHERE id = auth.uid())
);

-- Update RLS policies for tokens to include college filtering

-- Drop existing policies
DROP POLICY IF EXISTS "Students can view their own tokens" ON public.tokens;
DROP POLICY IF EXISTS "Students can create their own tokens" ON public.tokens;
DROP POLICY IF EXISTS "Admins can view all tokens" ON public.tokens;
DROP POLICY IF EXISTS "Admins can update tokens" ON public.tokens;

-- Create new college-aware policies for tokens
CREATE POLICY "Students can view their own tokens"
ON public.tokens
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own tokens"
ON public.tokens
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  college = (SELECT college FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can view tokens from their college"
ON public.tokens
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  college = (SELECT college FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can update tokens from their college"
ON public.tokens
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  college = (SELECT college FROM public.profiles WHERE id = auth.uid())
);